# Key Encryption Key (KEK) Management

This document describes the Key Encryption Key (KEK) management system in NeuralLog, which is a critical component of the zero-knowledge architecture.

## Key Concepts

### Zero-Knowledge Architecture

NeuralLog uses a zero-knowledge architecture, which means that the server never has access to unencrypted data or encryption keys. All encryption and decryption happens on the client side, and the server only stores encrypted data.

### Key Hierarchy

The key hierarchy in NeuralLog consists of three levels:

1. **Master Secret**: The root of the key hierarchy, derived from the tenant ID and recovery phrase. This is never stored anywhere and is only used to derive the Master KEK.

2. **Master KEK**: Derived from the Master Secret, this key is used to encrypt and decrypt Operational KEKs. It is never stored anywhere and is only held in memory during client operations.

3. **Operational KEKs**: Derived from the Master KEK, these keys are used for actual data encryption and decryption. They are versioned to support key rotation and are stored encrypted in the server for distribution to authorized users.

### KEK Versioning

KEK versions are used to support key rotation and access control. Each KEK version has a unique ID and a status:

- **Active**: The current version used for encryption and decryption.
- **Decrypt-Only**: A previous version that can be used for decryption but not for encryption.
- **Deprecated**: A version that is no longer used and should be phased out.

### KEK Blobs

KEK blobs are encrypted packages containing an Operational KEK. They are encrypted with a user-specific key and stored on the server. When a user needs to access data, they retrieve the appropriate KEK blob, decrypt it, and use the contained Operational KEK to decrypt the data.

## Operations

### Creating a KEK Version

When a new KEK version is created:

1. All existing active KEK versions are changed to decrypt-only.
2. A new KEK version is created with status "active".
3. The Master KEK is used to derive the new Operational KEK.
4. The new Operational KEK is encrypted and stored as KEK blobs for authorized users.

### Rotating a KEK

KEK rotation is the process of creating a new KEK version and optionally removing access for specific users:

1. A new KEK version is created (as described above).
2. KEK blobs are created for all authorized users except those being removed.
3. The new KEK version becomes the active version for all future encryption.

### Provisioning a KEK for a User

When a user needs access to a KEK version:

1. The Operational KEK for the specified version is retrieved from the client's key store.
2. The Operational KEK is encrypted with a key derived from the user's credentials.
3. The encrypted KEK blob is stored on the server, associated with the user and KEK version.

### Accessing Encrypted Data

When a user needs to access encrypted data:

1. The client retrieves the encrypted data from the server.
2. The client determines which KEK version was used to encrypt the data.
3. The client retrieves the appropriate KEK blob from the server.
4. The client decrypts the KEK blob to get the Operational KEK.
5. The client uses the Operational KEK to decrypt the data.

## Implementation

### Server-Side Components

- **KEK Version Controller**: Manages KEK versions, including creation, rotation, and status updates.
- **KEK Blob Controller**: Manages KEK blobs, including provisioning and retrieval.
- **Redis Storage**: Stores KEK versions and blobs with appropriate indexing for efficient retrieval.

### Client-Side Components

- **Key Hierarchy Manager**: Manages the key hierarchy, including derivation of keys and initialization from recovery phrases.
- **Crypto Service**: Provides cryptographic operations, including encryption, decryption, and key derivation.
- **KEK Service**: Communicates with the server to manage KEK versions and blobs.

## Security Considerations

### Recovery

The Master Secret is derived from the tenant ID and recovery phrase. If the recovery phrase is lost, all data becomes permanently inaccessible. It is critical to securely store the recovery phrase.

### Key Rotation

Regular key rotation is recommended to limit the impact of potential key compromise. When rotating keys, consider:

- How often to rotate keys (e.g., quarterly, annually)
- Which users should have access to the new key
- How to handle data encrypted with old keys

### Access Control

Access to KEK versions and blobs should be strictly controlled:

- Only administrators should be able to create and rotate KEK versions.
- Users should only be able to access KEK blobs for which they have been explicitly granted access.
- All access to KEK versions and blobs should be logged for audit purposes.

## Best Practices

1. **Regular Rotation**: Rotate KEKs on a regular schedule to limit the impact of potential key compromise.

2. **Secure Recovery Phrase**: Store the recovery phrase in a secure location, such as a password manager or hardware security module.

3. **Least Privilege**: Only provision KEKs to users who need them, and only for the versions they need.

4. **Monitoring**: Monitor KEK operations for suspicious activity, such as unexpected key rotations or provisioning.

5. **Testing**: Regularly test the recovery process to ensure that data can be recovered in case of emergency.

## Troubleshooting

### Cannot Decrypt Data

If a user cannot decrypt data, check:

1. Does the user have access to the KEK version used to encrypt the data?
2. Is the KEK blob for that version available and correctly encrypted?
3. Is the user using the correct credentials to decrypt the KEK blob?

### Cannot Create or Rotate KEK

If an administrator cannot create or rotate a KEK, check:

1. Does the administrator have the necessary permissions?
2. Is the recovery phrase correct?
3. Is the server responding correctly to KEK management requests?

## API Reference

### KEK Version Endpoints

- `GET /api/kek/versions`: Get all KEK versions for the tenant.
- `GET /api/kek/versions/active`: Get the active KEK version for the tenant.
- `POST /api/kek/versions`: Create a new KEK version.
- `PUT /api/kek/versions/:id/status`: Update the status of a KEK version.
- `POST /api/kek/rotate`: Rotate the KEK, creating a new version and optionally removing users.

### KEK Blob Endpoints

- `GET /api/kek/blobs/users/:userId/versions/:versionId`: Get a KEK blob for a user and version.
- `GET /api/kek/blobs/users/:userId`: Get all KEK blobs for a user.
- `GET /api/kek/blobs/me`: Get all KEK blobs for the current user.
- `POST /api/kek/blobs`: Provision a KEK blob for a user.
- `DELETE /api/kek/blobs/users/:userId/versions/:versionId`: Delete a KEK blob.

## Client SDK Reference

### Key Hierarchy Initialization

```typescript
// Initialize with recovery phrase
await client.initializeWithRecoveryPhrase('your-recovery-phrase', ['kek-version-id']);

// Initialize with mnemonic
await client.initializeWithMnemonic('your-mnemonic-phrase', ['kek-version-id']);

// Initialize with API key
await client.authenticateWithApiKey('your-api-key');
```

### KEK Management

```typescript
// Get KEK versions
const versions = await client.getKEKVersions();

// Create a new KEK version
const newVersion = await client.createKEKVersion('Quarterly rotation');

// Rotate KEK
const rotatedVersion = await client.rotateKEK('Security incident', ['user-to-remove']);

// Provision KEK for a user
await client.provisionKEKForUser('user-id', 'kek-version-id');
```

### Encryption and Decryption

```typescript
// Encrypt data
const encryptedData = await client.log('log-name', { message: 'Hello, world!' });

// Decrypt data
const logs = await client.getLogs('log-name');
```
