# Encrypted Log Names

## Overview

To enhance the zero-knowledge architecture of NeuralLog, log names are encrypted before being sent to the server. This ensures that the server has no knowledge of the actual names of logs, providing complete privacy for both log content and metadata.

## Design Goals

1. **Complete Metadata Privacy**: The server should learn nothing about the purpose or content of logs
2. **Consistent User Experience**: Users should still be able to work with plaintext log names in the UI
3. **Searchability**: Users should be able to find their logs by name
4. **Performance**: The encryption/decryption process should be efficient

## Implementation Details

### Key Derivation

A specific key for encrypting log names is derived from the master key:

```
LogNameKey = HKDF(MasterKey, "log_name_encryption", 32)
```

This ensures that the log name encryption key is:
- Unique to each user/tenant
- Different from keys used for log content
- Deterministically derivable from the master key

### Encryption Algorithm

Log names are encrypted using AES-GCM with the following parameters:
- 256-bit key (derived from the master key)
- 96-bit random IV (12 bytes)
- No additional authenticated data (AAD)

The encrypted format is:
```
Base64(IV || Ciphertext || AuthTag)
```

### Server Storage

The server stores only the encrypted log names, with no knowledge of the plaintext names. The database schema uses `encryptedLogName` instead of `logName`.

### API Interaction

All API endpoints that work with log names accept and return encrypted log names. The client-sdk handles the encryption and decryption transparently, so the application code can continue to work with plaintext log names.

## Security Considerations

### Deterministic vs. Randomized Encryption

We use randomized encryption (with a random IV) rather than deterministic encryption to prevent the server from identifying when the same log name is used multiple times. This provides stronger privacy but means that the same log name will encrypt to different ciphertexts each time.

### Length Information

The length of the encrypted log name reveals approximate information about the plaintext length. To mitigate this, we could pad log names to standard lengths, but this is not implemented in the initial version.

### Search Implications

With encrypted log names, server-side search by log name is not possible. All filtering and searching of log names must happen client-side after decryption.

## User Experience

From the user's perspective, log names function exactly as before. The encryption and decryption happen transparently in the client-sdk, so users continue to see and work with plaintext log names in the UI.

## Migration

For existing logs with unencrypted names, a migration process is provided:

1. The client retrieves all logs for the user
2. For each log, it encrypts the name
3. It updates the server with the encrypted name

This migration is performed client-side to ensure the plaintext log names never leave the client.
