# KEK Version Creation

After initializing the key hierarchy with a master secret, the next step is to create a KEK version that can be used for encryption and decryption. This document walks through the code that creates and manages KEK versions.

## Overview

1. The client requests the creation of a new KEK version
2. The server creates a new KEK version with status "active"
3. Any existing active KEK versions are changed to "decrypt-only"
4. The client derives the operational KEK for the new version

## Code Walkthrough

### Creating a KEK Version

After initializing the key hierarchy, the client creates a KEK version:

```typescript
// Create the first KEK version
const firstKEKVersion = await client.createKEKVersion('Initial setup');
console.log('First KEK Version:', firstKEKVersion);
// Example: { id: 'v1', status: 'active', createdAt: '2023-06-01T12:00:00Z', ... }
```

This calls the `NeuralLogClient.createKEKVersion` method:

```typescript
public async createKEKVersion(reason: string): Promise<any> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Create KEK version
    return await this.keyHierarchyManager.createKEKVersion(
      reason,
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to create KEK version: ${error instanceof Error ? error.message : String(error)}`,
      'create_kek_version_failed'
    );
  }
}
```

Which calls the `KeyHierarchyManager.createKEKVersion` method:

```typescript
public async createKEKVersion(reason: string, authToken: string): Promise<KEKVersion> {
  try {
    return await this.kekService.createKEKVersion(reason, authToken);
  } catch (error) {
    throw new LogError(
      `Failed to create KEK version: ${error instanceof Error ? error.message : String(error)}`,
      'create_kek_version_failed'
    );
  }
}
```

The `KekService.createKEKVersion` method makes an API call to the auth service:

```typescript
public async createKEKVersion(reason: string, authToken: string): Promise<KEKVersion> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/kek/versions`,
      { reason },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to create KEK version: ${error instanceof Error ? error.message : String(error)}`,
      'create_kek_version_failed'
    );
  }
}
```

### Server-Side KEK Version Creation

On the server side, the `KEKVersionController.createKEKVersion` method handles the request:

```typescript
public async createKEKVersion(req: Request, res: Response): Promise<void> {
  try {
    const { reason } = req.body;
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

    // Create a new KEK version
    const kekVersion = await this.kekService.createKEKVersion(tenantId, userId, reason);

    res.status(201).json(kekVersion);
  } catch (error) {
    console.error('Error creating KEK version:', error);
    res.status(500).json({ error: 'Failed to create KEK version' });
  }
}
```

The `RedisKEKService.createKEKVersion` method creates the KEK version in Redis:

```typescript
public async createKEKVersion(tenantId: string, userId: string, reason: string): Promise<KEKVersion> {
  try {
    // Start a transaction
    const multi = this.client.multi();

    // Update all active versions to decrypt-only
    const versions = await this.getKEKVersions(tenantId);
    for (const version of versions) {
      if (version.status === 'active') {
        const versionKey = this.getKEKVersionKey(tenantId, version.id);
        multi.hSet(versionKey, 'status', 'decrypt-only');
      }
    }

    // Create a new version
    const versionId = uuidv4();
    const versionKey = this.getKEKVersionKey(tenantId, versionId);
    const now = new Date().toISOString();

    multi.hSet(versionKey, {
      createdAt: now,
      createdBy: userId,
      status: 'active',
      reason,
      tenantId
    });

    // Add to versions index
    const versionsKey = this.getKEKVersionsIndexKey(tenantId);
    multi.sAdd(versionsKey, versionId);

    // Execute transaction
    await multi.exec();

    // Return the new version
    return {
      id: versionId,
      createdAt: now,
      createdBy: userId,
      status: 'active',
      reason,
      tenantId
    };
  } catch (error) {
    console.error('Failed to create KEK version:', error);
    throw new LogError('Failed to create KEK version', 'create_kek_version_failed');
  }
}
```

### Deriving the Operational KEK

When the client receives the new KEK version, it derives the operational KEK for that version:

```typescript
// After receiving the KEK version from the server
await client.cryptoService.deriveOperationalKEK(firstKEKVersion.id);
client.cryptoService.setCurrentKEKVersion(firstKEKVersion.id);
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

### Getting KEK Versions

The client can also retrieve all KEK versions for a tenant:

```typescript
// Get all KEK versions
const kekVersions = await client.getKEKVersions();
console.log('KEK Versions:', kekVersions);
```

This calls the `NeuralLogClient.getKEKVersions` method:

```typescript
public async getKEKVersions(): Promise<any[]> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Get KEK versions
    return await this.kekService.getKEKVersions(
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to get KEK versions: ${error instanceof Error ? error.message : String(error)}`,
      'get_kek_versions_failed'
    );
  }
}
```

The `KekService.getKEKVersions` method makes an API call to the auth service:

```typescript
public async getKEKVersions(authToken: string): Promise<KEKVersion[]> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/kek/versions`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to get KEK versions: ${error instanceof Error ? error.message : String(error)}`,
      'get_kek_versions_failed'
    );
  }
}
```

On the server side, the `KEKVersionController.getKEKVersions` method handles the request:

```typescript
public async getKEKVersions(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID is required' });
      return;
    }

    // Get all KEK versions for the tenant
    const kekVersions = await this.kekService.getKEKVersions(tenantId);

    res.json(kekVersions);
  } catch (error) {
    console.error('Error getting KEK versions:', error);
    res.status(500).json({ error: 'Failed to get KEK versions' });
  }
}
```

The `RedisKEKService.getKEKVersions` method retrieves the KEK versions from Redis:

```typescript
public async getKEKVersions(tenantId: string): Promise<KEKVersion[]> {
  try {
    // Get all version IDs for the tenant
    const versionsKey = this.getKEKVersionsIndexKey(tenantId);
    const versionIds = await this.client.sMembers(versionsKey);

    if (!versionIds || versionIds.length === 0) {
      return [];
    }

    // Get all versions
    const versions: KEKVersion[] = [];
    for (const versionId of versionIds) {
      const versionKey = this.getKEKVersionKey(tenantId, versionId);
      const versionData = await this.client.hGetAll(versionKey);

      if (versionData && Object.keys(versionData).length > 0) {
        versions.push({
          id: versionId,
          createdAt: versionData.createdAt,
          createdBy: versionData.createdBy,
          status: versionData.status as KEKVersionStatus,
          reason: versionData.reason,
          tenantId: versionData.tenantId
        });
      }
    }

    // Sort by creation date (newest first)
    return versions.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  } catch (error) {
    console.error('Failed to get KEK versions:', error);
    throw new LogError('Failed to get KEK versions', 'get_kek_versions_failed');
  }
}
```

### Getting the Active KEK Version

The client can also retrieve the active KEK version for a tenant:

```typescript
// Get the active KEK version
const activeKEKVersion = await client.getActiveKEKVersion();
console.log('Active KEK Version:', activeKEKVersion);
```

This calls the `NeuralLogClient.getActiveKEKVersion` method:

```typescript
public async getActiveKEKVersion(): Promise<any> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Get active KEK version
    return await this.kekService.getActiveKEKVersion(
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to get active KEK version: ${error instanceof Error ? error.message : String(error)}`,
      'get_active_kek_version_failed'
    );
  }
}
```

The `KekService.getActiveKEKVersion` method makes an API call to the auth service:

```typescript
public async getActiveKEKVersion(authToken: string): Promise<KEKVersion | null> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/kek/versions/active`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to get active KEK version: ${error instanceof Error ? error.message : String(error)}`,
      'get_active_kek_version_failed'
    );
  }
}
```

On the server side, the `KEKVersionController.getActiveKEKVersion` method handles the request:

```typescript
public async getActiveKEKVersion(req: Request, res: Response): Promise<void> {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID is required' });
      return;
    }

    // Get active KEK version
    const kekVersion = await this.kekService.getActiveKEKVersion(tenantId);

    if (!kekVersion) {
      res.status(404).json({ error: 'No active KEK version found' });
      return;
    }

    res.json(kekVersion);
  } catch (error) {
    console.error('Error getting active KEK version:', error);
    res.status(500).json({ error: 'Failed to get active KEK version' });
  }
}
```

The `RedisKEKService.getActiveKEKVersion` method retrieves the active KEK version from Redis:

```typescript
public async getActiveKEKVersion(tenantId: string): Promise<KEKVersion | null> {
  try {
    // Get all versions
    const versions = await this.getKEKVersions(tenantId);

    // Find active version
    return versions.find(version => version.status === 'active') || null;
  } catch (error) {
    console.error('Failed to get active KEK version:', error);
    throw new LogError('Failed to get active KEK version', 'get_active_kek_version_failed');
  }
}
```

## Security Considerations

- Only administrators should be able to create KEK versions.
- When a new KEK version is created, all existing active versions are changed to "decrypt-only" to ensure that new data is encrypted with the latest key.
- The operational KEK is derived from the master KEK using a strong key derivation function (HKDF) with a unique salt for each version.
- The server never has access to the actual KEK, only to metadata about the KEK versions.

## Related Files

- [NeuralLogClient.ts](../code-snippets/typescript-client-sdk/src/client/NeuralLogClient.md) - Contains the client-side methods for creating and retrieving KEK versions.
- [KeyHierarchyManager.ts](../code-snippets/typescript-client-sdk/src/managers/KeyHierarchyManager.md) - Contains the methods for managing the key hierarchy.
- [KekService.ts](../code-snippets/typescript-client-sdk/src/auth/KekService.md) - Contains the methods for communicating with the auth service.
- [KEKVersionController.ts](../code-snippets/auth/src/controllers/KEKVersionController.md) - Contains the server-side methods for handling KEK version requests.
- [RedisKEKService.ts](../code-snippets/auth/src/services/RedisKEKService.md) - Contains the methods for storing and retrieving KEK versions in Redis.

## Next Steps

Once a KEK version is created, the next step is to [provision it for the first admin](./03-admin-setup.md) so they can use it for encryption and decryption.
