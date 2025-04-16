# KekService.ts

This file contains the service for interacting with the KEK-related endpoints of the auth service.

## Getting KEK Versions

```typescript
/**
 * Get KEK versions
 * 
 * @param authToken Authentication token
 * @returns Promise that resolves to the KEK versions
 */
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

## Getting Active KEK Version

```typescript
/**
 * Get active KEK version
 * 
 * @param authToken Authentication token
 * @returns Promise that resolves to the active KEK version
 */
public async getActiveKEKVersion(authToken: string): Promise<KEKVersion> {
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

## Creating KEK Version

```typescript
/**
 * Create a KEK version
 * 
 * @param authToken Authentication token
 * @param kekVersion KEK version
 * @returns Promise that resolves to the created KEK version
 */
public async createKEKVersion(
  authToken: string,
  kekVersion: KEKVersionCreateRequest
): Promise<KEKVersion> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/kek/versions`,
      kekVersion,
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

## Updating KEK Version Status

```typescript
/**
 * Update KEK version status
 * 
 * @param authToken Authentication token
 * @param versionId Version ID
 * @param status New status
 * @returns Promise that resolves to the updated KEK version
 */
public async updateKEKVersionStatus(
  authToken: string,
  versionId: string,
  status: 'active' | 'deprecated' | 'revoked'
): Promise<KEKVersion> {
  try {
    const response = await this.apiClient.patch(
      `${this.baseUrl}/kek/versions/${versionId}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to update KEK version status: ${error instanceof Error ? error.message : String(error)}`,
      'update_kek_version_status_failed'
    );
  }
}
```

## Getting KEK Blobs

```typescript
/**
 * Get KEK blobs for the current user
 * 
 * @param authToken Authentication token
 * @returns Promise that resolves to the KEK blobs
 */
public async getKEKBlobs(authToken: string): Promise<KEKBlob[]> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/kek/blobs`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to get KEK blobs: ${error instanceof Error ? error.message : String(error)}`,
      'get_kek_blobs_failed'
    );
  }
}
```

## Provisioning KEK Blob

```typescript
/**
 * Provision a KEK blob for a user
 * 
 * @param authToken Authentication token
 * @param userId User ID
 * @param kekVersion KEK version
 * @param encryptedKEK Encrypted KEK
 * @returns Promise that resolves to the provisioned KEK blob
 */
public async provisionKEKBlob(
  authToken: string,
  userId: string,
  kekVersion: string,
  encryptedKEK: string
): Promise<KEKBlob> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/kek/blobs`,
      {
        userId,
        kekVersion,
        encryptedKEK
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
      `Failed to provision KEK blob: ${error instanceof Error ? error.message : String(error)}`,
      'provision_kek_blob_failed'
    );
  }
}
```

## Checking KEK Version Status

```typescript
/**
 * Check if a KEK version is active
 * 
 * @param versionId Version ID
 * @param authToken Authentication token
 * @returns Promise that resolves to true if the KEK version is active
 */
public async isKEKVersionActive(
  versionId: string,
  authToken: string
): Promise<boolean> {
  try {
    const kekVersions = await this.getKEKVersions(authToken);
    const kekVersion = kekVersions.find(v => v.id === versionId);
    
    return kekVersion?.status === 'active';
  } catch (error) {
    throw new LogError(
      `Failed to check if KEK version is active: ${error instanceof Error ? error.message : String(error)}`,
      'check_kek_version_active_failed'
    );
  }
}
```
