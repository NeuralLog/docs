# KeyDerivation.ts

This file contains utility functions for key derivation in NeuralLog.

## Key Derivation with PBKDF2

```typescript
/**
 * Derive a key using PBKDF2
 *
 * @param password Password or key material
 * @param options Key derivation options
 * @returns Promise that resolves to the derived key
 */
public static async deriveKeyWithPBKDF2(
  password: string | Uint8Array,
  options: KeyDerivationOptions = {}
): Promise<Uint8Array> {
  try {
    // Set default options
    const salt = options.salt || new Uint8Array(0);
    const hash = options.hash || 'SHA-256';
    const iterations = options.iterations || 100000;
    const keyLength = options.keyLength || 256;

    // Convert string salt to Uint8Array
    const saltBytes = typeof salt === 'string'
      ? new TextEncoder().encode(salt)
      : salt;

    // Convert string password to Uint8Array
    const passwordBytes = typeof password === 'string'
      ? new TextEncoder().encode(password)
      : password;

    // Import the password as a key
    const importedKey = await crypto.subtle.importKey(
      'raw',
      passwordBytes,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    // Derive bits using PBKDF2
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations,
        hash
      },
      importedKey,
      keyLength
    );

    // Convert to Uint8Array
    return new Uint8Array(derivedBits);
  } catch (error) {
    throw new Error(`Failed to derive key with PBKDF2: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Key Derivation with HKDF

```typescript
/**
 * Derive a key using HKDF
 *
 * @param keyMaterial Key material
 * @param options Key derivation options
 * @returns Promise that resolves to the derived key
 */
public static async deriveKeyWithHKDF(
  keyMaterial: Uint8Array,
  options: KeyDerivationOptions = {}
): Promise<Uint8Array> {
  try {
    // Set default options
    const salt = options.salt || new Uint8Array(0);
    const info = options.info || new Uint8Array(0);
    const hash = options.hash || 'SHA-256';
    const keyLength = options.keyLength || 256;

    // Convert string salt to Uint8Array
    const saltBytes = typeof salt === 'string'
      ? new TextEncoder().encode(salt)
      : salt;

    // Convert string info to Uint8Array
    const infoBytes = typeof info === 'string'
      ? new TextEncoder().encode(info)
      : info;

    // Import the key material
    const importedKey = await crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'HKDF' },
      false,
      ['deriveBits']
    );

    // Derive bits using HKDF
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        salt: saltBytes,
        info: infoBytes,
        hash
      },
      importedKey,
      keyLength
    );

    // Convert to Uint8Array
    return new Uint8Array(derivedBits);
  } catch (error) {
    throw new Error(`Failed to derive key with HKDF: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Hierarchical Key Derivation

```typescript
/**
 * Derive a hierarchical key
 *
 * @param masterKey Master key
 * @param path Hierarchical path
 * @param options Key derivation options
 * @returns Promise that resolves to the derived key
 */
public static async deriveHierarchicalKey(
  masterKey: Uint8Array,
  path: string,
  options: KeyDerivationOptions = {}
): Promise<Uint8Array> {
  try {
    // Set default options
    const hash = options.hash || 'SHA-256';
    const keyLength = options.keyLength || 256;

    // Split the path into segments
    const segments = path.split('/').filter(segment => segment.length > 0);

    // Start with the master key
    let currentKey = masterKey;

    // Derive a key for each segment
    for (const segment of segments) {
      currentKey = await KeyDerivation.deriveKeyWithHKDF(
        currentKey,
        {
          salt: segment,
          info: 'neurallog-hierarchical-key',
          hash,
          keyLength
        }
      );
    }

    return currentKey;
  } catch (error) {
    throw new Error(`Failed to derive hierarchical key: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```
