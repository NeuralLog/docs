# CryptoService.ts

This file contains the core cryptographic functionality for NeuralLog.

## Master Secret Derivation

```typescript
/**
 * Derive the master secret from a tenant ID and recovery phrase
 * 
 * @param tenantId Tenant ID
 * @param recoveryPhrase Recovery phrase
 * @returns Promise that resolves to the master secret
 */
public async deriveMasterSecret(tenantId: string, recoveryPhrase: string): Promise<Uint8Array> {
  try {
    // Create salt from tenant ID
    const salt = `NeuralLog-${tenantId}-MasterSecret`;

    // Derive key using PBKDF2
    return await KeyDerivation.deriveKeyWithPBKDF2(recoveryPhrase, {
      salt,
      iterations: 100000,
      hash: 'SHA-256',
      keyLength: 256 // 32 bytes
    });
  } catch (error) {
    throw new LogError(
      `Failed to derive master secret: ${error instanceof Error ? error.message : String(error)}`,
      'derive_master_secret_failed'
    );
  }
}
```

## Master KEK Derivation

```typescript
/**
 * Derive the master KEK from the master secret
 * 
 * @param masterSecret Master secret
 * @returns Promise that resolves to the master KEK
 */
public async deriveMasterKEK(masterSecret: Uint8Array): Promise<Uint8Array> {
  try {
    // Derive bits using HKDF
    const derivedKey = await KeyDerivation.deriveKeyWithHKDF(masterSecret, {
      salt: 'NeuralLog-MasterKEK',
      info: 'master-key-encryption-key',
      hash: 'SHA-256',
      keyLength: 256 // 32 bytes
    });

    // Store the master KEK
    this.masterKEK = derivedKey;

    return this.masterKEK;
  } catch (error) {
    throw new LogError(
      `Failed to derive master KEK: ${error instanceof Error ? error.message : String(error)}`,
      'derive_master_kek_failed'
    );
  }
}
```

## Operational KEK Derivation

```typescript
/**
 * Derive an operational KEK for a specific version
 * 
 * @param version KEK version
 * @returns Promise that resolves to the operational KEK
 */
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

## Key Hierarchy Initialization

```typescript
/**
 * Initialize the key hierarchy
 * 
 * @param tenantId Tenant ID
 * @param recoveryPhrase Recovery phrase
 * @param versions KEK versions to derive
 * @returns Promise that resolves when initialization is complete
 */
public async initializeKeyHierarchy(
  tenantId: string,
  recoveryPhrase: string,
  versions?: string[]
): Promise<void> {
  try {
    // Derive the master secret
    const masterSecret = await this.deriveMasterSecret(tenantId, recoveryPhrase);

    // Derive the master KEK
    await this.deriveMasterKEK(masterSecret);

    // If versions are provided, derive those specific operational KEKs
    if (versions && versions.length > 0) {
      for (const version of versions) {
        await this.deriveOperationalKEK(version);
      }

      // Set the current KEK version to the latest one
      const latestVersion = versions.sort().pop();
      if (latestVersion) {
        this.setCurrentKEKVersion(latestVersion);
      }
    } else {
      // Otherwise, derive the default operational KEK
      await this.deriveOperationalKEK('v1');
      this.setCurrentKEKVersion('v1');
    }
  } catch (error) {
    throw new LogError(
      `Failed to initialize key hierarchy: ${error instanceof Error ? error.message : String(error)}`,
      'initialize_key_hierarchy_failed'
    );
  }
}
```

## Log Name Encryption

```typescript
/**
 * Encrypt a log name
 * 
 * @param logName Log name
 * @returns Promise that resolves to the encrypted log name
 */
public async encryptLogName(logName: string): Promise<string> {
  try {
    // Get the current operational KEK
    const kek = this.getOperationalKEK(this.currentKEKVersion);
    if (!kek) {
      throw new Error('No operational KEK available');
    }

    // Derive a log-specific encryption key
    const logKey = await KeyDerivation.deriveKeyWithHMAC(
      kek,
      'log-name-encryption-key',
      { hash: 'SHA-256' }
    );

    // Convert log name to bytes
    const logNameBytes = new TextEncoder().encode(logName);

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      logKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Encrypt the log name
    const encryptedBytes = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      logNameBytes
    );

    // Combine IV and encrypted bytes
    const result = new Uint8Array(iv.length + encryptedBytes.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedBytes), iv.length);

    // Encode as base64
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    throw new LogError(
      `Failed to encrypt log name: ${error instanceof Error ? error.message : String(error)}`,
      'encrypt_log_name_failed'
    );
  }
}
```

## Log Data Encryption

```typescript
/**
 * Encrypt log data
 * 
 * @param data Log data
 * @returns Promise that resolves to the encrypted log data
 */
public async encryptLogData(data: any): Promise<string> {
  try {
    // Get the current operational KEK
    const kek = this.getOperationalKEK(this.currentKEKVersion);
    if (!kek) {
      throw new Error('No operational KEK available');
    }

    // Derive a log-specific encryption key
    const logKey = await KeyDerivation.deriveKeyWithHMAC(
      kek,
      'log-data-encryption-key',
      { hash: 'SHA-256' }
    );

    // Convert data to JSON string and then to bytes
    const dataString = JSON.stringify(data);
    const dataBytes = new TextEncoder().encode(dataString);

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Import the key
    const key = await crypto.subtle.importKey(
      'raw',
      logKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Encrypt the data
    const encryptedBytes = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      dataBytes
    );

    // Combine IV and encrypted bytes
    const result = new Uint8Array(iv.length + encryptedBytes.byteLength);
    result.set(iv);
    result.set(new Uint8Array(encryptedBytes), iv.length);

    // Encode as base64
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    throw new LogError(
      `Failed to encrypt log data: ${error instanceof Error ? error.message : String(error)}`,
      'encrypt_log_data_failed'
    );
  }
}
```
