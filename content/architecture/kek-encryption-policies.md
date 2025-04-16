# NeuralLog: KEK and Encryption Policies

## Overview

NeuralLog's zero-knowledge architecture is built on a foundation of robust key management and encryption policies. This document provides a comprehensive overview of the Key Encryption Key (KEK) system and encryption policies that ensure data security and privacy throughout the platform.

## Key Encryption Key (KEK) System

### Key Hierarchy

NeuralLog implements a three-tier key hierarchy:

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

## Deterministic Hierarchical Key Derivation (DHKD)

All keys in the system are derived from master secrets using deterministic paths:

```
master_secret
├── tenant/{tenantId}/encryption
│   └── Used for encrypting tenant-wide data
├── tenant/{tenantId}/search
│   └── Used for generating search tokens
├── tenant/{tenantId}/user/{userId}/api-key
│   └── Used for generating API keys
├── tenant/{tenantId}/user/{userId}/auth
│   └── Used for user authentication
├── tenant/{tenantId}/log/{logId}/encryption
│   └── Used for encrypting log entries
└── tenant/{tenantId}/log/{logId}/search
    └── Used for generating log-specific search tokens
```

### Key Derivation Function

Keys are derived using HKDF (HMAC-based Key Derivation Function):

1. **Extract Phase**: Extracts entropy from the master secret and salt
2. **Expand Phase**: Expands the extracted key material to the desired length
3. **Path-Based Derivation**: Uses the hierarchical path as context for derivation
4. **Deterministic Output**: Same inputs always produce the same key

## Encryption Policies

### Data Encryption

All data in NeuralLog is encrypted using the following policies:

1. **Client-Side Encryption**: All encryption happens on the client side. The server never sees unencrypted data.

2. **Log Name Encryption**: Log names are encrypted using a key derived from the tenant's active KEK version.

3. **Log Data Encryption**: Log data is encrypted using AES-256-GCM with a key derived from the log name and the tenant's active KEK version.

4. **Metadata Encryption**: All metadata, including log names, timestamps, and tags, is encrypted to ensure complete privacy.

5. **Search Token Generation**: Search tokens are generated client-side using HMAC with tenant-specific keys.

### Key Rotation Policies

NeuralLog implements the following key rotation policies:

1. **Regular Rotation**: KEKs should be rotated on a regular schedule (e.g., quarterly) to limit the impact of potential key compromise.

2. **Incident-Driven Rotation**: KEKs should be rotated immediately in response to security incidents or when an administrator leaves the organization.

3. **Backward Compatibility**: When a KEK is rotated, existing data remains accessible using the previous KEK version (marked as "decrypt-only").

4. **Forward Security**: New data is always encrypted with the active KEK version, ensuring that revoked users cannot access new data.

## Access Control Policies

### Administrator Access

1. **M-of-N Key Sharing**: The master secret can be split using Shamir's Secret Sharing, requiring M of N administrators to reconstruct it.

2. **Administrator Promotion**: New administrators can be added by existing administrators using the M-of-N key sharing mechanism.

3. **Administrator Demotion**: Administrators can be removed by rotating the KEK and not provisioning the new KEK version for the demoted administrator.

### User Access

1. **KEK Provisioning**: Users are provisioned with encrypted KEK blobs for the KEK versions they need access to.

2. **Role-Based Access Control**: Access to logs is controlled through role-based permissions.

3. **Revocation**: Access can be revoked by removing a user's access to KEK versions.

## Implementation Guidelines

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

## Related Documentation

- [Zero-Knowledge Architecture](../security/zero-knowledge-architecture.md)
- [Key Management](../security/key-management.md)
- [Searchable Encryption](../security/searchable-encryption.md)
- [RBAC Implementation](../security/rbac-implementation.md)
- [Client SDK Architecture](../architecture/client-sdk-architecture.md)
- [KEK Version Creation](../code-walkthrough/02-kek-version-creation.md)
- [Admin Setup](../code-walkthrough/03-admin-setup.md)
- [Key Rotation](../code-walkthrough/07-key-rotation.md)
