# Key Rotation

Over time, it's a good practice to rotate keys to enhance security or remove access for specific users. This document walks through the code that rotates KEKs in the zero-knowledge architecture.

## Overview

1. The admin rotates the KEK, creating a new KEK version
2. All existing active KEK versions are changed to "decrypt-only"
3. The admin provisions the new KEK version for authorized users
4. New logs are encrypted with the new KEK version
5. Old logs can still be decrypted using the appropriate KEK version

## Code Walkthrough

### Rotating the KEK

The admin rotates the KEK:

```typescript
// Admin rotates the KEK
const rotationReason = 'Quarterly key rotation';
const newKEKVersion = await client.rotateKEK(rotationReason);
console.log('New KEK Version:', newKEKVersion);
```

This calls the `NeuralLogClient.rotateKEK` method:

```typescript
public async rotateKEK(reason: string, removedUsers: string[] = []): Promise<any> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Rotate KEK
    return await this.keyHierarchyManager.rotateKEK(
      reason,
      removedUsers,
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to rotate KEK: ${error instanceof Error ? error.message : String(error)}`,
      'rotate_kek_failed'
    );
  }
}
```

Which calls the `KeyHierarchyManager.rotateKEK` method:

```typescript
public async rotateKEK(reason: string, removedUsers: string[], authToken: string): Promise<KEKVersion> {
  try {
    return await this.kekService.rotateKEK(reason, removedUsers, authToken);
  } catch (error) {
    throw new LogError(
      `Failed to rotate KEK: ${error instanceof Error ? error.message : String(error)}`,
      'rotate_kek_failed'
    );
  }
}
```

The `KekService.rotateKEK` method makes an API call to the auth service:

```typescript
public async rotateKEK(
  reason: string,
  removedUsers: string[],
  authToken: string
): Promise<KEKVersion> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/kek/rotate`,
      {
        reason,
        removed_users: removedUsers
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to rotate KEK: ${error instanceof Error ? error.message : String(error)}`,
      'rotate_kek_failed'
    );
  }
}
```

### Server-Side KEK Rotation

On the server side, the `KEKVersionController.rotateKEK` method handles the request:

```typescript
public async rotateKEK(req: Request, res: Response): Promise<void> {
  try {
    const { reason, removed_users } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID is required' });
      return;
    }

    if (!userId) {
      res.status(400).json({ error: 'User ID is required' });
      return;
    }

    if (!reason) {
      res.status(400).json({ error: 'Reason is required' });
      return;
    }

    // Create a new KEK version (rotation is just creating a new version)
    const kekVersion = await this.kekService.createKEKVersion(tenantId, userId, reason);

    // Handle removed users (e.g., revoke their access to the KEK)
    if (removed_users && Array.isArray(removed_users) && removed_users.length > 0) {
      // For each removed user, we would delete their KEK blobs for the new version
      // This is handled at the client level when provisioning KEKs for users
      console.log(`Users to remove from KEK access: ${removed_users.join(', ')}`);
    }

    res.status(201).json(kekVersion);
  } catch (error) {
    console.error('Error rotating KEK:', error);
    res.status(500).json({ error: 'Failed to rotate KEK' });
  }
}
```

### Provisioning the New KEK for Users

After rotating the KEK, the admin provisions the new KEK version for authorized users:

```typescript
// Admin provisions the new KEK for all users
await client.provisionKEKForUser(adminId, newKEKVersion.id);
await client.provisionKEKForUser(regularUserId, newKEKVersion.id);
await client.provisionKEKForUser(readOnlyUserId, newKEKVersion.id);
```

This follows the same flow as when we provisioned the KEK for users initially, but with the new KEK version ID.

### Deriving the New Operational KEK

When the client receives the new KEK version, it derives the operational KEK for that version:

```typescript
// After receiving the KEK version from the server
await client.cryptoService.deriveOperationalKEK(newKEKVersion.id);
client.cryptoService.setCurrentKEKVersion(newKEKVersion.id);
```

The `CryptoService.deriveOperationalKEK` method derives the operational KEK:

```typescript
public async deriveOperationalKEK(version: string): Promise<Uint8Array> {
  try {
    if (!this.masterKEK) {
      throw new Error('Master KEK not initialized');
    }

    // Derive bits using HKDF
    const operationalKEK = await KeyDerivation.deriveKeyWithHKDF(this.masterKEK, {
      salt: `NeuralLog-OpKEK-${version}`,
      info: 'operational-key-encryption-key',
      hash: 'SHA-256',
      keyLength: 256 // 32 bytes
    });

    // Store in the map
    this.operationalKEKs.set(version, operationalKEK);

    // Update current version if not set
    if (!this.currentKEKVersion) {
      this.currentKEKVersion = version;
    }

    return operationalKEK;
  } catch (error) {
    throw new LogError(
      `Failed to derive KEK: ${error instanceof Error ? error.message : String(error)}`,
      'derive_kek_failed'
    );
  }
}
```

### Creating Logs with the New KEK Version

After rotating the KEK, new logs are created with the new KEK version:

```typescript
// Create a log with the new KEK version
const newLogData = {
  level: 'info',
  message: 'Log with new KEK version',
  timestamp: new Date().toISOString(),
  user: 'admin',
  action: 'test'
};

const newLogId = await client.log('system-events', newLogData);
console.log('New Log ID:', newLogId);
```

This follows the same flow as when we created logs initially, but the `CryptoService.encryptLogData` method will use the new KEK version:

```typescript
public async encryptLogData(data: any, kekVersion?: string): Promise<Record<string, any>> {
  try {
    // Use specified KEK version or current one
    const version = kekVersion || this.getCurrentKEKVersion();

    // Derive the log key
    const logKey = await this.deriveLogKey(version);

    // ... rest of the method ...

    // Return encrypted data with version information
    return {
      encrypted: true,
      algorithm: 'aes-256-gcm',
      iv: ivBase64,
      data: encryptedDataBase64,
      kekVersion: version
    };
  } catch (error) {
    throw new LogError(
      `Failed to encrypt log data: ${error instanceof Error ? error.message : String(error)}`,
      'encrypt_log_data_failed'
    );
  }
}
```

### Reading Logs with Different KEK Versions

When reading logs, the client can decrypt logs encrypted with different KEK versions:

```typescript
// Read logs (will include logs encrypted with different KEK versions)
const allLogs = await client.getLogs('system-events', { limit: 100 });
console.log('All Logs:', allLogs);
```

The `CryptoService.decryptLogData` method handles decryption with different KEK versions:

```typescript
public async decryptLogData(encryptedData: Record<string, any>): Promise<any> {
  try {
    // Get the KEK version from the encrypted data
    const kekVersion = encryptedData.kekVersion || this.getCurrentKEKVersion();

    // Get the operational KEK for this version
    const operationalKEK = this.getOperationalKEK(kekVersion);

    if (!operationalKEK) {
      throw new Error(`Operational KEK not found for version ${kekVersion}`);
    }

    // Derive the log key
    const logKey = await this.deriveLogKey(kekVersion);

    // ... rest of the method ...
  } catch (error) {
    throw new LogError(
      `Failed to decrypt log data: ${error instanceof Error ? error.message : String(error)}`,
      'decrypt_log_data_failed'
    );
  }
}
```

## Security Considerations

- Key rotation should be performed regularly to limit the impact of potential key compromise.
- When a KEK is rotated, all existing active versions are changed to "decrypt-only" to ensure that new data is encrypted with the latest key.
- Users who should no longer have access to new data can be excluded from the provisioning of the new KEK version.
- The server never has access to the unencrypted KEKs, even during rotation.
- Logs encrypted with old KEK versions can still be decrypted as long as the client has access to those KEK versions.

## Related Files

- [NeuralLogClient.ts](../code-snippets/typescript-client-sdk/src/client/NeuralLogClient.md) - Contains the client-side methods for rotating KEKs.
- [KeyHierarchyManager.ts](../code-snippets/typescript-client-sdk/src/managers/KeyHierarchyManager.md) - Contains the methods for managing the key hierarchy.
- [KekService.ts](../code-snippets/typescript-client-sdk/src/auth/KekService.md) - Contains the methods for communicating with the auth service.
- [CryptoService.ts](../code-snippets/typescript-client-sdk/src/crypto/CryptoService.md) - Contains the methods for deriving and using operational KEKs.
- [KEKVersionController.ts](../code-snippets/auth/src/controllers/KEKVersionController.md) - Contains the server-side methods for handling KEK version requests.
- [RedisKEKService.ts](../code-snippets/auth/src/services/RedisKEKService.md) - Contains the methods for storing and retrieving KEK versions in Redis.

## Conclusion

This completes the walkthrough of the NeuralLog zero-knowledge architecture. We've covered:

1. [Master Secret Generation](./01-master-secret-generation.md) - How the master secret is generated and used to derive the master KEK
2. [KEK Version Creation](./02-kek-version-creation.md) - How KEK versions are created and stored
3. [Admin Setup](./03-admin-setup.md) - How the first admin is set up with access to the KEK
4. [Log Creation](./04-log-creation.md) - How logs are encrypted and stored
5. [User Provisioning](./05-user-provisioning.md) - How additional users are provisioned with access to KEKs
6. [Log Reading](./06-log-reading.md) - How logs are retrieved and decrypted
7. [Key Rotation](./07-key-rotation.md) - How KEKs are rotated for enhanced security

This architecture ensures that the server never has access to unencrypted data or encryption keys, providing a high level of security and privacy for sensitive log data.
