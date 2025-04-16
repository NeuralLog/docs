# KeyHierarchyManager.ts

This file contains the key hierarchy management functionality for NeuralLog.

## Key Hierarchy Initialization

```typescript
/**
 * Initialize the key hierarchy with a recovery phrase
 * 
 * @param tenantId Tenant ID
 * @param recoveryPhrase Recovery phrase
 * @param versions KEK versions to derive
 * @returns Promise that resolves when initialization is complete
 */
public async initializeWithRecoveryPhrase(
  tenantId: string,
  recoveryPhrase: string,
  versions?: string[]
): Promise<void> {
  try {
    // Get available KEK versions if not provided
    if (!versions || versions.length === 0) {
      const kekVersionsResponse = await this.kekService.getKEKVersions(localStorage.getItem('authToken') || '');
      versions = kekVersionsResponse.map(v => v.id);
    }
    
    // Initialize the key hierarchy
    await this.cryptoService.initializeKeyHierarchy(tenantId, recoveryPhrase, versions);
  } catch (error) {
    throw new LogError(
      `Failed to initialize with recovery phrase: ${error instanceof Error ? error.message : String(error)}`,
      'initialize_with_recovery_phrase_failed'
    );
  }
}
```

## KEK Version Management

```typescript
/**
 * Create a new KEK version
 * 
 * @param version Version identifier
 * @returns Promise that resolves to the KEK version
 */
public async createKEKVersion(version: string): Promise<KEKVersion> {
  try {
    // Derive the operational KEK for this version
    await this.cryptoService.deriveOperationalKEK(version);
    
    // Set as current version
    this.cryptoService.setCurrentKEKVersion(version);
    
    // Create the KEK version on the server
    const token = localStorage.getItem('authToken') || '';
    const kekVersion = await this.kekService.createKEKVersion(token, {
      id: version,
      status: 'active',
      createdAt: new Date().toISOString()
    });
    
    return kekVersion;
  } catch (error) {
    throw new LogError(
      `Failed to create KEK version: ${error instanceof Error ? error.message : String(error)}`,
      'create_kek_version_failed'
    );
  }
}
```

## KEK Rotation

```typescript
/**
 * Rotate KEKs
 * 
 * @param tenantId Tenant ID
 * @param recoveryPhrase Recovery phrase
 * @param usersToRemove Users to exclude from the new KEK version
 * @returns Promise that resolves to the new KEK version
 */
public async rotateKEKs(
  tenantId: string,
  recoveryPhrase: string,
  usersToRemove: string[] = []
): Promise<KEKVersion> {
  try {
    // Initialize with recovery phrase
    await this.initializeWithRecoveryPhrase(tenantId, recoveryPhrase);
    
    // Get current KEK versions
    const token = localStorage.getItem('authToken') || '';
    const kekVersions = await this.kekService.getKEKVersions(token);
    
    // Create a new version
    const newVersionId = `v${kekVersions.length + 1}`;
    const newVersion = await this.createKEKVersion(newVersionId);
    
    // Get users
    const users = await this.userService.getUsers(token);
    
    // Provision the new KEK for all users except those being removed
    for (const user of users) {
      if (!usersToRemove.includes(user.id)) {
        // Get the user's public key
        const publicKey = await this.userService.getUserPublicKey(token, user.id);
        
        // Get the operational KEK
        const operationalKEK = this.cryptoService.getOperationalKEK(newVersionId);
        if (!operationalKEK) {
          throw new Error(`Operational KEK not found for version ${newVersionId}`);
        }
        
        // Encrypt the KEK with the user's public key
        const encryptedKEK = await this.cryptoService.encryptWithPublicKey(
          operationalKEK,
          publicKey
        );
        
        // Provision the KEK blob
        await this.kekService.provisionKEKBlob(token, {
          userId: user.id,
          kekVersion: newVersionId,
          encryptedKEK
        });
      }
    }
    
    // Mark the previous version as deprecated
    if (kekVersions.length > 0) {
      const previousVersion = kekVersions[kekVersions.length - 1];
      await this.kekService.updateKEKVersionStatus(token, previousVersion.id, 'deprecated');
    }
    
    return newVersion;
  } catch (error) {
    throw new LogError(
      `Failed to rotate KEKs: ${error instanceof Error ? error.message : String(error)}`,
      'rotate_keks_failed'
    );
  }
}
```

## Admin Promotion

```typescript
/**
 * Promote a user to admin using Shamir's Secret Sharing
 * 
 * @param userId User ID to promote
 * @param threshold Number of shares required to reconstruct the secret
 * @param totalShares Total number of shares to create
 * @returns Promise that resolves when the user is promoted
 */
public async promoteToAdmin(
  userId: string,
  threshold: number,
  totalShares: number
): Promise<void> {
  try {
    // Get the current KEK version
    const token = localStorage.getItem('authToken') || '';
    const kekVersions = await this.kekService.getKEKVersions(token);
    const currentVersion = kekVersions.find(v => v.status === 'active');
    if (!currentVersion) {
      throw new Error('No active KEK version found');
    }
    
    // Get the operational KEK
    const operationalKEK = this.cryptoService.getOperationalKEK(currentVersion.id);
    if (!operationalKEK) {
      throw new Error(`Operational KEK not found for version ${currentVersion.id}`);
    }
    
    // Create Shamir's Secret Sharing scheme
    const shares = this.cryptoService.splitSecret(operationalKEK, threshold, totalShares);
    
    // Get the user's public key
    const publicKey = await this.userService.getUserPublicKey(token, userId);
    
    // Encrypt one share for the new admin
    const encryptedShare = await this.cryptoService.encryptWithPublicKey(
      shares[0],
      publicKey
    );
    
    // Provision the admin share
    await this.kekService.provisionAdminShare(token, {
      userId,
      kekVersion: currentVersion.id,
      encryptedShare,
      threshold,
      shareIndex: 0
    });
  } catch (error) {
    throw new LogError(
      `Failed to promote user to admin: ${error instanceof Error ? error.message : String(error)}`,
      'promote_to_admin_failed'
    );
  }
}
```
