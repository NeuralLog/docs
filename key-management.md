# Key Management in NeuralLog

NeuralLog uses a sophisticated key management system to ensure that all data is encrypted on the client side before being sent to the server. This document describes the key management system and how it works.

## Key Encryption Keys (KEK)

NeuralLog uses a hierarchical key management system based on Key Encryption Keys (KEKs). A KEK is a master key that is used to encrypt other keys, which are then used to encrypt data.

### KEK Versions

KEKs are versioned to allow for key rotation. When a new KEK version is created, all data encrypted with the old KEK version is re-encrypted with the new KEK version.

### KEK Blobs

KEK blobs are encrypted containers that store the actual encryption keys. Each user has their own KEK blob, which is encrypted with their password-derived key.

## Public Key Management

NeuralLog supports public key cryptography for secure key exchange and recovery operations.

### Registering a Public Key

Users can register a public key for various purposes, such as key recovery or admin promotion. The public key is stored on the server, but the private key never leaves the client.

```typescript
// Register a public key
const publicKey = await keyPairService.generateKeyPair();
await authService.registerPublicKey(
  authToken,
  publicKey.publicKey,
  'admin-promotion',
  { description: 'Admin promotion key' }
);
```

### Verifying a Public Key

Public keys can be verified to ensure that the user owns the corresponding private key. This is done by signing a challenge with the private key and verifying the signature with the public key.

```typescript
// Verify a public key
const challenge = 'random-challenge';
const signature = await keyPairService.sign(privateKey, challenge);
const result = await authService.verifyPublicKey(
  authToken,
  keyId,
  challenge,
  signature
);
```

## KEK Recovery

NeuralLog supports a secure KEK recovery process that allows users to recover their KEK in case they lose their password. This process uses Shamir's Secret Sharing to split the KEK into multiple shares, which can be distributed to trusted users.

### Initiating KEK Recovery

To initiate KEK recovery, a user must specify the KEK version to recover, the threshold number of shares required for recovery, and a reason for the recovery.

```typescript
// Initiate KEK recovery
const recoverySession = await authService.initiateKEKRecovery(
  authToken,
  kekVersionId,
  3, // Threshold
  'Lost password',
  86400 // Expires in 24 hours
);
```

### Submitting Recovery Shares

Trusted users can submit their recovery shares to help recover the KEK. The shares are encrypted with the public key of the user who initiated the recovery.

```typescript
// Submit a recovery share
await authService.submitRecoveryShare(
  authToken,
  sessionId,
  share,
  userId
);
```

### Completing KEK Recovery

Once enough shares have been submitted, the user can complete the recovery process by combining the shares to recover the KEK. The recovered KEK is then used to create a new KEK version.

```typescript
// Complete KEK recovery
const result = await authService.completeKEKRecovery(
  authToken,
  sessionId,
  recoveredKEK,
  {
    id: newKEKVersionId,
    reason: 'Recovered from lost password'
  }
);
```

## Security Considerations

- All encryption and decryption operations happen on the client side.
- Private keys never leave the client.
- KEKs are never stored in plaintext on the server.
- Recovery shares are encrypted with the public key of the recipient.
- The server never has access to the plaintext KEK or any other encryption keys.

## Best Practices

- Rotate KEKs regularly.
- Use a strong password to protect your KEK.
- Distribute recovery shares to trusted users.
- Set a reasonable threshold for recovery (e.g., 3 out of 5 shares).
- Verify public keys before using them for encryption.
- Store private keys securely.
