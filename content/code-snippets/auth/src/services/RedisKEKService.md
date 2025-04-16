# RedisKEKService.ts

This file contains the service for storing and retrieving KEK-related data in Redis.

## Getting KEK Versions

```typescript
/**
 * Get KEK versions
 * 
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the KEK versions
 */
public async getKEKVersions(tenantId: string): Promise<KEKVersion[]> {
  try {
    // Get all KEK versions for the tenant
    const key = `${this.keyPrefix}:${tenantId}:kek:versions`;
    const result = await this.redisClient.hGetAll(key);
    
    // Convert to KEK versions
    const kekVersions: KEKVersion[] = [];
    for (const [id, data] of Object.entries(result)) {
      try {
        const kekVersion = JSON.parse(data) as KEKVersion;
        kekVersions.push(kekVersion);
      } catch (error) {
        logger.error(`Failed to parse KEK version data: ${error}`);
      }
    }
    
    // Sort by creation date
    kekVersions.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    return kekVersions;
  } catch (error) {
    logger.error(`Failed to get KEK versions for tenant ${tenantId}:`, error);
    throw new Error(`Failed to get KEK versions: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Getting Active KEK Version

```typescript
/**
 * Get active KEK version
 * 
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the active KEK version
 */
public async getActiveKEKVersion(tenantId: string): Promise<KEKVersion> {
  try {
    // Get all KEK versions
    const kekVersions = await this.getKEKVersions(tenantId);
    
    // Find the active version
    const activeVersion = kekVersions.find(v => v.status === 'active');
    if (!activeVersion) {
      throw new Error('No active KEK version found');
    }
    
    return activeVersion;
  } catch (error) {
    logger.error(`Failed to get active KEK version for tenant ${tenantId}:`, error);
    throw new Error(`Failed to get active KEK version: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Creating KEK Version

```typescript
/**
 * Create a KEK version
 * 
 * @param tenantId Tenant ID
 * @param id Version ID
 * @param status Version status
 * @param createdAt Creation timestamp
 * @returns Promise that resolves to the created KEK version
 */
public async createKEKVersion(
  tenantId: string,
  id: string,
  status: 'active' | 'deprecated' | 'revoked',
  createdAt: string
): Promise<KEKVersion> {
  try {
    // Create the KEK version
    const kekVersion: KEKVersion = {
      id,
      status,
      createdAt,
      updatedAt: createdAt
    };
    
    // Store in Redis
    const key = `${this.keyPrefix}:${tenantId}:kek:versions`;
    await this.redisClient.hSet(key, id, JSON.stringify(kekVersion));
    
    // If this is the first version, set it as active
    const kekVersions = await this.getKEKVersions(tenantId);
    if (kekVersions.length === 1) {
      await this.updateKEKVersionStatus(tenantId, id, 'active');
      kekVersion.status = 'active';
    }
    
    return kekVersion;
  } catch (error) {
    logger.error(`Failed to create KEK version for tenant ${tenantId}:`, error);
    throw new Error(`Failed to create KEK version: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Updating KEK Version Status

```typescript
/**
 * Update KEK version status
 * 
 * @param tenantId Tenant ID
 * @param id Version ID
 * @param status New status
 * @returns Promise that resolves to the updated KEK version
 */
public async updateKEKVersionStatus(
  tenantId: string,
  id: string,
  status: 'active' | 'deprecated' | 'revoked'
): Promise<KEKVersion> {
  try {
    // Get the KEK version
    const key = `${this.keyPrefix}:${tenantId}:kek:versions`;
    const data = await this.redisClient.hGet(key, id);
    if (!data) {
      throw new Error(`KEK version ${id} not found`);
    }
    
    // Parse the KEK version
    const kekVersion = JSON.parse(data) as KEKVersion;
    
    // If setting to active, set all other versions to deprecated
    if (status === 'active') {
      const kekVersions = await this.getKEKVersions(tenantId);
      for (const version of kekVersions) {
        if (version.id !== id && version.status === 'active') {
          version.status = 'deprecated';
          version.updatedAt = new Date().toISOString();
          await this.redisClient.hSet(key, version.id, JSON.stringify(version));
        }
      }
    }
    
    // Update the KEK version
    kekVersion.status = status;
    kekVersion.updatedAt = new Date().toISOString();
    await this.redisClient.hSet(key, id, JSON.stringify(kekVersion));
    
    return kekVersion;
  } catch (error) {
    logger.error(`Failed to update KEK version status for tenant ${tenantId}:`, error);
    throw new Error(`Failed to update KEK version status: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Getting KEK Blobs

```typescript
/**
 * Get KEK blobs for a user
 * 
 * @param tenantId Tenant ID
 * @param userId User ID
 * @returns Promise that resolves to the KEK blobs
 */
public async getKEKBlobs(tenantId: string, userId: string): Promise<KEKBlob[]> {
  try {
    // Get all KEK blobs for the user
    const key = `${this.keyPrefix}:${tenantId}:kek:blobs:user:${userId}`;
    const result = await this.redisClient.hGetAll(key);
    
    // Convert to KEK blobs
    const kekBlobs: KEKBlob[] = [];
    for (const [id, data] of Object.entries(result)) {
      try {
        const kekBlob = JSON.parse(data) as KEKBlob;
        kekBlobs.push(kekBlob);
      } catch (error) {
        logger.error(`Failed to parse KEK blob data: ${error}`);
      }
    }
    
    // Sort by creation date
    kekBlobs.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });
    
    return kekBlobs;
  } catch (error) {
    logger.error(`Failed to get KEK blobs for tenant ${tenantId} and user ${userId}:`, error);
    throw new Error(`Failed to get KEK blobs: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Provisioning KEK Blob

```typescript
/**
 * Provision a KEK blob for a user
 * 
 * @param tenantId Tenant ID
 * @param userId User ID
 * @param kekVersion KEK version
 * @param encryptedKEK Encrypted KEK
 * @returns Promise that resolves to the provisioned KEK blob
 */
public async provisionKEKBlob(
  tenantId: string,
  userId: string,
  kekVersion: string,
  encryptedKEK: string
): Promise<KEKBlob> {
  try {
    // Create the KEK blob
    const id = uuidv4();
    const kekBlob: KEKBlob = {
      id,
      userId,
      kekVersion,
      encryptedKEK,
      createdAt: new Date().toISOString()
    };
    
    // Store in Redis
    const key = `${this.keyPrefix}:${tenantId}:kek:blobs:user:${userId}`;
    await this.redisClient.hSet(key, id, JSON.stringify(kekBlob));
    
    // Store in the blobs index
    const blobsKey = `${this.keyPrefix}:${tenantId}:kek:blobs`;
    await this.redisClient.hSet(blobsKey, id, JSON.stringify(kekBlob));
    
    return kekBlob;
  } catch (error) {
    logger.error(`Failed to provision KEK blob for tenant ${tenantId} and user ${userId}:`, error);
    throw new Error(`Failed to provision KEK blob: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Revoking KEK Blob

```typescript
/**
 * Revoke a KEK blob
 * 
 * @param tenantId Tenant ID
 * @param blobId Blob ID
 * @returns Promise that resolves when the blob is revoked
 */
public async revokeKEKBlob(tenantId: string, blobId: string): Promise<void> {
  try {
    // Get the KEK blob
    const blobsKey = `${this.keyPrefix}:${tenantId}:kek:blobs`;
    const data = await this.redisClient.hGet(blobsKey, blobId);
    if (!data) {
      throw new Error(`KEK blob ${blobId} not found`);
    }
    
    // Parse the KEK blob
    const kekBlob = JSON.parse(data) as KEKBlob;
    
    // Remove from the user's blobs
    const userKey = `${this.keyPrefix}:${tenantId}:kek:blobs:user:${kekBlob.userId}`;
    await this.redisClient.hDel(userKey, blobId);
    
    // Remove from the blobs index
    await this.redisClient.hDel(blobsKey, blobId);
  } catch (error) {
    logger.error(`Failed to revoke KEK blob ${blobId} for tenant ${tenantId}:`, error);
    throw new Error(`Failed to revoke KEK blob: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```
