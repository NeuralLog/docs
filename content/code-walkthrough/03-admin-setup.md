# Admin Setup

After creating a KEK version, the next step is to provision it for the first admin user. This document walks through the code that provisions a KEK for a user and sets up the first admin.

## Overview

1. The client provisions the KEK for the admin user
2. The server stores an encrypted KEK blob for the admin
3. The admin can now use the KEK to encrypt and decrypt data

## Code Walkthrough

### Provisioning a KEK for a User

After creating a KEK version, the client provisions it for the admin user:

```typescript
// Provision the KEK for the admin
const adminId = 'admin-user-id'; // This would be the ID of the admin user
await client.provisionKEKForUser(adminId, firstKEKVersion.id);
```

This calls the `NeuralLogClient.provisionKEKForUser` method:

```typescript
public async provisionKEKForUser(userId: string, kekVersionId: string): Promise<void> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Provision KEK for user
    await this.keyHierarchyManager.provisionKEKForUser(
      userId,
      kekVersionId,
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to provision KEK for user: ${error instanceof Error ? error.message : String(error)}`,
      'provision_kek_failed'
    );
  }
}
```

Which calls the `KeyHierarchyManager.provisionKEKForUser` method:

```typescript
public async provisionKEKForUser(userId: string, kekVersionId: string, authToken: string): Promise<void> {
  try {
    // Get the operational KEK for this version
    const operationalKEK = await this.cryptoService.getOperationalKEK(kekVersionId);

    if (!operationalKEK) {
      // If we don't have the operational KEK yet, derive it
      await this.cryptoService.deriveOperationalKEK(kekVersionId);
      operationalKEK = await this.cryptoService.getOperationalKEK(kekVersionId);
    }

    // Encrypt the KEK for the user
    // In a real implementation, this would use the user's public key
    // For simplicity, we're just JSON stringifying and base64 encoding
    const encryptedBlob = JSON.stringify({
      data: this.cryptoService.arrayBufferToBase64(operationalKEK),
      version: kekVersionId
    });

    // Store the encrypted KEK blob for the user
    await this.kekService.provisionKEKBlob(userId, kekVersionId, encryptedBlob, authToken);
  } catch (error) {
    throw new LogError(
      `Failed to provision KEK for user: ${error instanceof Error ? error.message : String(error)}`,
      'provision_kek_failed'
    );
  }
}
```

The `KekService.provisionKEKBlob` method makes an API call to the auth service:

```typescript
public async provisionKEKBlob(
  userId: string,
  kekVersionId: string,
  encryptedBlob: string,
  authToken: string
): Promise<void> {
  try {
    await this.apiClient.post(
      `${this.baseUrl}/kek/blobs`,
      {
        user_id: userId,
        kek_version_id: kekVersionId,
        encrypted_blob: encryptedBlob
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
  } catch (error) {
    throw new LogError(
      `Failed to provision KEK blob: ${error instanceof Error ? error.message : String(error)}`,
      'provision_kek_blob_failed'
    );
  }
}
```

### Server-Side KEK Blob Storage

On the server side, the `KEKBlobController.provisionKEKBlob` method handles the request:

```typescript
public async provisionKEKBlob(req: Request, res: Response): Promise<void> {
  try {
    const { user_id, kek_version_id, encrypted_blob } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID is required' });
      return;
    }

    if (!user_id || !kek_version_id || !encrypted_blob) {
      res.status(400).json({ error: 'User ID, KEK version ID, and encrypted blob are required' });
      return;
    }

    // Check if the KEK version exists
    const kekVersion = await this.kekService.getKEKVersion(tenantId, kek_version_id);

    if (!kekVersion) {
      res.status(404).json({ error: 'KEK version not found' });
      return;
    }

    // Create or update the KEK blob
    const kekBlob = await this.kekService.setKEKBlob(
      tenantId,
      user_id,
      kek_version_id,
      encrypted_blob
    );

    res.status(201).json({
      userId: kekBlob.userId,
      kekVersionId: kekBlob.kekVersionId,
      encryptedBlob: kekBlob.encryptedBlob
    });
  } catch (error) {
    console.error('Error provisioning KEK blob:', error);
    res.status(500).json({ error: 'Failed to provision KEK blob' });
  }
}
```

The `RedisKEKService.setKEKBlob` method stores the KEK blob in Redis:

```typescript
public async setKEKBlob(
  tenantId: string,
  userId: string,
  versionId: string,
  encryptedBlob: string
): Promise<KEKBlob> {
  try {
    // Check if the version exists
    const version = await this.getKEKVersion(tenantId, versionId);
    if (!version) {
      throw new LogError('KEK version not found', 'kek_version_not_found');
    }

    // Start a transaction
    const multi = this.client.multi();

    // Create or update the blob
    const blobKey = this.getKEKBlobKey(tenantId, userId, versionId);
    const now = new Date().toISOString();
    const existingBlob = await this.getKEKBlob(tenantId, userId, versionId);

    multi.hSet(blobKey, {
      encryptedBlob,
      createdAt: existingBlob?.createdAt || now,
      updatedAt: now
    });

    // Add to blobs index
    const blobsKey = this.getKEKBlobsIndexKey(tenantId, userId);
    multi.sAdd(blobsKey, versionId);

    // Execute transaction
    await multi.exec();

    // Return the blob
    return {
      userId,
      kekVersionId: versionId,
      encryptedBlob,
      tenantId,
      createdAt: existingBlob?.createdAt || now,
      updatedAt: now
    };
  } catch (error) {
    console.error('Failed to set KEK blob:', error);
    throw new LogError('Failed to set KEK blob', 'set_kek_blob_failed');
  }
}
```

### Admin Authentication and Key Initialization

When the admin logs in, they need to initialize their key hierarchy:

```typescript
// Admin logs in
const adminClient = new NeuralLogClient({
  tenantId: 'acme-corp',
  authUrl: 'https://auth.neurallog.com',
  logsUrl: 'https://logs.neurallog.com'
});

// Authenticate with username and password
await adminClient.authenticateWithPassword('admin@acme.com', 'admin-password');

// Initialize with recovery phrase
await adminClient.initializeWithRecoveryPhrase(recoveryPhrase);
```

The `NeuralLogClient.authenticateWithPassword` method authenticates the user:

```typescript
public async authenticateWithPassword(username: string, password: string): Promise<void> {
  try {
    // Authenticate with the auth service
    const authResponse = await this.authManager.authenticateWithPassword(username, password);

    // Store the auth token
    this.authManager.setAuthCredential(authResponse.token);

    // Initialize the client
    await this.initialize();
  } catch (error) {
    throw new LogError(
      `Failed to authenticate with password: ${error instanceof Error ? error.message : String(error)}`,
      'authenticate_with_password_failed'
    );
  }
}
```

The `NeuralLogClient.initializeWithRecoveryPhrase` method initializes the key hierarchy:

```typescript
public async initializeWithRecoveryPhrase(recoveryPhrase: string): Promise<void> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Initialize with recovery phrase
    await this.keyHierarchyManager.initializeWithRecoveryPhrase(
      this.tenantId,
      recoveryPhrase
    );
  } catch (error) {
    throw new LogError(
      `Failed to initialize with recovery phrase: ${error instanceof Error ? error.message : String(error)}`,
      'initialize_with_recovery_phrase_failed'
    );
  }
}
```

### Getting KEK Blobs for a User

The admin can also retrieve their KEK blobs:

```typescript
// Get KEK blobs for the admin
const adminKEKBlobs = await adminClient.getKEKBlobs();
console.log('Admin KEK Blobs:', adminKEKBlobs);
```

This calls the `NeuralLogClient.getKEKBlobs` method:

```typescript
public async getKEKBlobs(): Promise<any[]> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Get KEK blobs for the current user
    return await this.kekService.getUserKEKBlobs(
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to get KEK blobs: ${error instanceof Error ? error.message : String(error)}`,
      'get_kek_blobs_failed'
    );
  }
}
```

The `KekService.getUserKEKBlobs` method makes an API call to the auth service:

```typescript
public async getUserKEKBlobs(authToken: string): Promise<any[]> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/kek/blobs/me`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to get user KEK blobs: ${error instanceof Error ? error.message : String(error)}`,
      'get_user_kek_blobs_failed'
    );
  }
}
```

On the server side, the `KEKBlobController.getCurrentUserKEKBlobs` method handles the request:

```typescript
public async getCurrentUserKEKBlobs(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      res.status(400).json({ error: 'Tenant ID and User ID are required' });
      return;
    }

    // Get all KEK blobs for the current user
    const kekBlobs = await this.kekService.getUserKEKBlobs(tenantId, userId);

    res.json(kekBlobs.map(blob => ({
      userId: blob.userId,
      kekVersionId: blob.kekVersionId,
      encryptedBlob: blob.encryptedBlob
    })));
  } catch (error) {
    console.error('Error getting current user KEK blobs:', error);
    res.status(500).json({ error: 'Failed to get current user KEK blobs' });
  }
}
```

The `RedisKEKService.getUserKEKBlobs` method retrieves the KEK blobs from Redis:

```typescript
public async getUserKEKBlobs(tenantId: string, userId: string): Promise<KEKBlob[]> {
  try {
    // Get all version IDs for the user
    const blobsKey = this.getKEKBlobsIndexKey(tenantId, userId);
    const versionIds = await this.client.sMembers(blobsKey);

    if (!versionIds || versionIds.length === 0) {
      return [];
    }

    // Get all blobs
    const blobs: KEKBlob[] = [];
    for (const versionId of versionIds) {
      const blobKey = this.getKEKBlobKey(tenantId, userId, versionId);
      const blobData = await this.client.hGetAll(blobKey);

      if (blobData && Object.keys(blobData).length > 0) {
        blobs.push({
          userId,
          kekVersionId: versionId,
          encryptedBlob: blobData.encryptedBlob,
          tenantId,
          createdAt: blobData.createdAt,
          updatedAt: blobData.updatedAt
        });
      }
    }

    // Sort by update date (newest first)
    return blobs.sort((a, b) => {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  } catch (error) {
    console.error('Failed to get user KEK blobs:', error);
    throw new LogError('Failed to get user KEK blobs', 'get_user_kek_blobs_failed');
  }
}
```

## Security Considerations

- The operational KEK is encrypted before being stored on the server.
- In a real implementation, the operational KEK would be encrypted with the user's public key.
- The server never has access to the unencrypted operational KEK.
- Only administrators should be able to provision KEKs for users.
- The admin must have the recovery phrase to initialize their key hierarchy.

## Related Files

- [NeuralLogClient.ts](../code-snippets/typescript-client-sdk/src/client/NeuralLogClient.md) - Contains the client-side methods for provisioning KEKs and retrieving KEK blobs.
- [KeyHierarchyManager.ts](../code-snippets/typescript-client-sdk/src/managers/KeyHierarchyManager.md) - Contains the methods for managing the key hierarchy.
- [KekService.ts](../code-snippets/typescript-client-sdk/src/auth/KekService.md) - Contains the methods for communicating with the auth service.
- [KEKBlobController.ts](../code-snippets/auth/src/controllers/KEKBlobController.md) - Contains the server-side methods for handling KEK blob requests.
- [RedisKEKService.ts](../code-snippets/auth/src/services/RedisKEKService.md) - Contains the methods for storing and retrieving KEK blobs in Redis.

## Next Steps

Once the admin is set up with access to the KEK, they can [create and encrypt logs](./04-log-creation.md) using the zero-knowledge architecture.
