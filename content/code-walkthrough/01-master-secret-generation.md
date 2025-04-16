# Master Secret Generation

The master secret is the root of the key hierarchy in NeuralLog's zero-knowledge architecture. It is derived from the tenant ID and a recovery phrase, and is never stored anywhere. This document walks through the code that generates and uses the master secret.

## Overview

1. The user provides a recovery phrase (or a mnemonic phrase is generated)
2. The master secret is derived from the tenant ID and recovery phrase
3. The master KEK is derived from the master secret
4. The master KEK is used to derive operational KEKs

## Code Walkthrough

### Generating or Validating a Mnemonic Phrase

The process often begins with generating a BIP-39 mnemonic phrase, which is a human-readable representation of entropy that can be used to derive cryptographic keys:

```typescript
// In the web application, during first-time setup
import { NeuralLogClient } from '@neurallog/typescript-client-sdk';

// Create client
const client = new NeuralLogClient({
  tenantId: 'acme-corp',
  authUrl: 'https://auth.neurallog.com',
  logsUrl: 'https://logs.neurallog.com'
});

// Generate a recovery phrase (or use a provided one)
const recoveryPhrase = client.generateMnemonic(); // Generates a BIP-39 mnemonic
console.log('Recovery Phrase:', recoveryPhrase);
// Example: "abandon ability able about above absent absorb abstract absurd abuse access accident"
```

The `generateMnemonic` method uses the `MnemonicService` to generate a BIP-39 mnemonic phrase:

```typescript
public generateMnemonic(strength: number = 128): string {
  return this.cryptoService.getMnemonicService().generateMnemonic(strength);
}
```

### Initializing the Key Hierarchy

Once a recovery phrase is available, the client initializes the key hierarchy:

```typescript
// Initialize the key hierarchy with the recovery phrase
await client.initializeWithRecoveryPhrase(recoveryPhrase);
```

This calls the `KeyHierarchyManager.initializeWithRecoveryPhrase` method:

```typescript
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

Which in turn calls the `CryptoService.initializeKeyHierarchy` method:

```typescript
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

### Deriving the Master Secret

The master secret is derived from the tenant ID and recovery phrase using PBKDF2:

```typescript
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

The `KeyDerivation.deriveKeyWithPBKDF2` method uses the Web Crypto API to derive a key using PBKDF2:

```typescript
public static async deriveKeyWithPBKDF2(
  password: string,
  options: KeyDerivationOptions
): Promise<Uint8Array> {
  // Convert password to bytes
  const passwordBytes = new TextEncoder().encode(password);

  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBytes,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  // Convert salt to bytes if it's a string
  const saltBytes = typeof options.salt === 'string'
    ? new TextEncoder().encode(options.salt)
    : options.salt;

  // Derive bits using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: options.iterations || 100000,
      hash: options.hash || 'SHA-256'
    },
    keyMaterial,
    options.keyLength || 256
  );

  return new Uint8Array(derivedBits);
}
```

### Deriving the Master KEK

The master KEK is derived from the master secret using HKDF:

```typescript
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

The `KeyDerivation.deriveKeyWithHKDF` method uses the Web Crypto API to derive a key using HKDF:

```typescript
public static async deriveKeyWithHKDF(
  keyMaterial: Uint8Array,
  options: KeyDerivationOptions
): Promise<Uint8Array> {
  // Import key material
  const baseKey = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HKDF' },
    false,
    ['deriveBits']
  );

  // Convert salt and info to bytes if they're strings
  const saltBytes = typeof options.salt === 'string'
    ? new TextEncoder().encode(options.salt)
    : options.salt;

  const infoBytes = typeof options.info === 'string'
    ? new TextEncoder().encode(options.info)
    : options.info;

  // Derive bits using HKDF
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      salt: saltBytes,
      info: infoBytes,
      hash: options.hash || 'SHA-256'
    },
    baseKey,
    options.keyLength || 256
  );

  return new Uint8Array(derivedBits);
}
```

### Deriving Operational KEKs

Operational KEKs are derived from the master KEK using HKDF, with a version identifier included in the salt:

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

## Security Considerations

- The master secret is never stored anywhere, not even in memory for longer than necessary.
- The recovery phrase must be securely stored by the user, as it is the only way to recover the master secret.
- The tenant ID is included in the salt for the master secret derivation, ensuring that different tenants have different master secrets even if they use the same recovery phrase.
- The key derivation functions use strong cryptographic algorithms (PBKDF2 and HKDF) with appropriate parameters.

## Related Files

- [CryptoService.ts](../code-snippets/typescript-client-sdk/src/crypto/CryptoService.md) - Contains the methods for deriving the master secret, master KEK, and operational KEKs.
- [KeyDerivation.ts](../code-snippets/typescript-client-sdk/src/crypto/KeyDerivation.md) - Contains the key derivation functions.
- [MnemonicService.ts](../code-snippets/typescript-client-sdk/src/crypto/MnemonicService.md) - Contains the methods for generating and validating mnemonic phrases.
- [KeyHierarchyManager.ts](../code-snippets/typescript-client-sdk/src/managers/KeyHierarchyManager.md) - Contains the methods for initializing the key hierarchy.

## Next Steps

Once the master secret and key hierarchy are initialized, the next step is to [create a KEK version](./02-kek-version-creation.md) that can be used for encryption and decryption.
