# NeuralLog: Zero-Knowledge Key Management

## Overview

NeuralLog implements a deterministic hierarchical key management system that enables powerful security features while maintaining zero server knowledge. This document details how keys are generated, managed, and used throughout the system.

## Deterministic Hierarchical Key Derivation (DHKD)

### Core Concept

All keys in the system are derived from a single master secret using deterministic paths. This approach provides several benefits:

1. **Simplicity**: One master secret generates the entire key hierarchy
2. **Regeneration**: Keys can be regenerated anytime with the master secret
3. **No Storage**: No need to store individual keys
4. **Revocation**: Individual keys can be revoked without affecting others

### Key Derivation Function

Keys are derived using HKDF (HMAC-based Key Derivation Function):

```javascript
async function deriveKey(masterSecret, path) {
  // Convert master secret to a seed
  const seed = await crypto.subtle.importKey(
    "raw",
    masterSecret,
    { name: "HKDF" },
    false,
    ["deriveBits"]
  );

  // Derive key using HKDF
  return crypto.subtle.deriveBits(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: new TextEncoder().encode(path),
      info: new TextEncoder().encode("neurallog-key")
    },
    seed,
    256
  );
}
```

### Key Hierarchy

The system uses a structured path hierarchy:

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

## Master Secret Management

The master secret can be managed in several ways:

### 1. Password-Based

For individual users or small teams:
- Master secret derived from a strong password
- Can be regenerated anytime with the same password
- Suitable for development environments

### 2. M-of-N Secret Sharing

For organizations with multiple administrators:
- Master secret split using Shamir's Secret Sharing
- Requires M of N shares to reconstruct
- Provides redundancy and security
- Suitable for production environments

#### Implementation Details

NeuralLog implements Shamir's Secret Sharing for secure key management:

```javascript
// Split a master secret into N shares, requiring M to reconstruct
function splitMasterSecret(masterSecret, threshold, totalShares) {
  // Convert master secret to bytes
  const secretBytes = new TextEncoder().encode(masterSecret);

  // Generate random polynomial coefficients
  const coefficients = [];
  coefficients[0] = secretBytes; // The secret is the constant term

  for (let i = 1; i < threshold; i++) {
    coefficients[i] = crypto.getRandomValues(new Uint8Array(secretBytes.length));
  }

  // Generate shares
  const shares = [];
  for (let x = 1; x <= totalShares; x++) {
    // Evaluate polynomial at point x
    const share = evaluatePolynomial(coefficients, x);
    shares.push({
      x,
      share: arrayBufferToBase64(share)
    });
  }

  return shares;
}

// Reconstruct the master secret from M shares
function reconstructMasterSecret(shares, threshold) {
  if (shares.length < threshold) {
    throw new Error(`Need at least ${threshold} shares to reconstruct the secret`);
  }

  // Use Lagrange interpolation to reconstruct the secret
  const secret = lagrangeInterpolation(shares, 0);
  return new TextDecoder().decode(secret);
}
```

### 3. Hardware Security Module (HSM)

For enterprise deployments:
- Master secret stored in hardware security modules
- Physical security for the most sensitive key
- Suitable for high-security environments

## End-to-End Encryption and M-of-N Key Sharing

NeuralLog implements end-to-end encryption with m-of-n key sharing to enable secure collaboration:

### Secure Query Retrieval

Users can submit queries to retrieve and decrypt logs made by other users:

```javascript
async function requestLogAccess(logId, reason) {
  // Create access request
  const requestId = await createAccessRequest(logId, reason);

  // Notify approvers
  await notifyApprovers(requestId);

  // Wait for approval
  return await waitForApproval(requestId);
}

async function approveLogAccess(requestId, approverKeyShare) {
  // Submit approver's key share
  await submitKeyShare(requestId, approverKeyShare);

  // Check if enough shares have been submitted
  const status = await checkApprovalStatus(requestId);

  return status.approved;
}

async function accessApprovedLog(requestId) {
  // Get the reconstructed decryption key
  const decryptionKey = await getApprovedDecryptionKey(requestId);

  // Get the encrypted log
  const encryptedLog = await getEncryptedLog(requestId);

  // Decrypt the log
  return await decryptLog(encryptedLog, decryptionKey);
}
```

### Zero-Knowledge to Full Knowledge Reports

NeuralLog enables transforming zero-knowledge reports into full knowledge reports while maintaining zero knowledge on the server side:

```javascript
async function transformToFullKnowledgeReport(reportId, approvers) {
  // Create transformation request
  const requestId = await createTransformationRequest(reportId);

  // Set required approvers (m-of-n)
  await setApprovers(requestId, approvers);

  // Wait for sufficient approvals
  const approved = await waitForApprovals(requestId);

  if (approved) {
    // Get the encrypted report data
    const encryptedData = await getEncryptedReportData(reportId);

    // Get the reconstructed decryption key
    const decryptionKey = await getApprovedDecryptionKey(requestId);

    // Decrypt the report data client-side
    return await decryptReportData(encryptedData, decryptionKey);
  }

  throw new Error('Transformation request was not approved');
}
```

### Web of Trust for Key Signing

NeuralLog implements a web of trust mechanism for key signing to enhance security:

```javascript
async function signUserKey(userId, signerPrivateKey) {
  // Get the user's public key
  const userPublicKey = await getUserPublicKey(userId);

  // Sign the user's public key
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    signerPrivateKey,
    new TextEncoder().encode(userPublicKey)
  );

  // Store the signature
  await storeKeySignature(userId, signature);

  return arrayBufferToBase64(signature);
}

async function verifyKeySignature(userId, signerId) {
  // Get the user's public key
  const userPublicKey = await getUserPublicKey(userId);

  // Get the signer's public key
  const signerPublicKey = await getUserPublicKey(signerId);

  // Get the signature
  const signature = await getKeySignature(userId, signerId);

  // Verify the signature
  return await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    signerPublicKey,
    base64ToArrayBuffer(signature),
    new TextEncoder().encode(userPublicKey)
  );
}
```

## Verification Without Knowledge

The server verifies keys without knowing them:

### API Key Verification

```javascript
// Client-side
function generateApiKeyVerification(apiKey) {
  // Use Argon2id with high work factor
  return argon2.hash({
    pass: apiKey,
    salt: generateRandomSalt(),
    type: argon2.ArgonType.Argon2id,
    time: 3,
    mem: 4096,
    hashLen: 32
  });
}

// Server-side
async function verifyApiKey(providedApiKey, storedVerificationHash) {
  return await argon2.verify({
    pass: providedApiKey,
    hash: storedVerificationHash
  });
}
```

## Key Revocation

Keys are revoked through metadata entries:

```javascript
// Server-side
async function revokeKey(keyPath, revocationMetadata) {
  await redis.set(
    `tenant:${tenantId}:revoked:${keyPath}`,
    JSON.stringify({
      revokedAt: Date.now(),
      revokedBy: revocationMetadata.userId,
      reason: revocationMetadata.reason
    })
  );
}

async function isKeyRevoked(keyPath) {
  return await redis.exists(`tenant:${tenantId}:revoked:${keyPath}`);
}
```

## Tenant Isolation

Each tenant has a completely separate key hierarchy:

1. **Different Master Secrets**: Each tenant has its own master secret
2. **Path Namespacing**: Key paths include tenant ID
3. **Redis Isolation**: Separate Redis instances per tenant
4. **Verification Isolation**: Verification hashes are tenant-specific

## Key Rotation

Keys can be rotated while maintaining backward compatibility:

### API Key Rotation

1. Generate a new API key using a new key ID
2. Store new verification hash
3. Both old and new keys work during transition period
4. Revoke old key after transition

### Master Secret Rotation

1. Reconstruct current master secret
2. Generate new master secret
3. Re-encrypt critical metadata with new keys
4. Update verification hashes
5. Revoke old master secret

## Security Considerations

1. **Master Secret Protection**: The master secret must be strongly protected
2. **Client Security**: Client-side key derivation requires secure client environments
3. **Verification Strength**: Verification hashes use strong algorithms (Argon2id)
4. **Metadata Protection**: Even metadata should be protected from unauthorized access

## Deterministic Hierarchical Key System for Tenant Administrators

NeuralLog implements a deterministic hierarchical key system that allows tenant administrators to change over time without compromising security:

```javascript
// Generate a deterministic key hierarchy for a tenant
async function generateTenantKeyHierarchy(masterSeed, tenantId) {
  // Derive the tenant root key
  const tenantRootKey = await deriveKey(masterSeed, `tenant:${tenantId}:root`);

  // Derive the tenant admin key
  const tenantAdminKey = await deriveKey(tenantRootKey, 'admin');

  // Derive the tenant encryption key
  const tenantEncryptionKey = await deriveKey(tenantRootKey, 'encryption');

  // Derive the tenant search key
  const tenantSearchKey = await deriveKey(tenantRootKey, 'search');

  return {
    tenantRootKey,
    tenantAdminKey,
    tenantEncryptionKey,
    tenantSearchKey
  };
}

// Add a new administrator to a tenant
async function addTenantAdministrator(tenantAdminKey, newAdminId, metadata) {
  // Derive an admin-specific key
  const adminKey = await deriveKey(tenantAdminKey, `admin:${newAdminId}`);

  // Store encrypted metadata about the admin
  const encryptedMetadata = await encryptMetadata(metadata, adminKey);

  // Store the admin verification hash
  await storeAdminVerificationHash(newAdminId, generateVerificationHash(adminKey));

  // Store the encrypted metadata
  await storeAdminMetadata(newAdminId, encryptedMetadata);

  return adminKey;
}

// Rotate tenant administrators without changing the key hierarchy
async function rotateTenantAdministrators(masterSeed, tenantId, newAdmins) {
  // Get the tenant key hierarchy
  const { tenantAdminKey } = await generateTenantKeyHierarchy(masterSeed, tenantId);

  // Revoke all existing admin keys
  await revokeAllTenantAdminKeys(tenantId);

  // Add new administrators
  for (const admin of newAdmins) {
    await addTenantAdministrator(tenantAdminKey, admin.id, admin.metadata);
  }
}
```

This approach allows tenant administrators to change over time without requiring re-encryption of data or redistribution of keys to all users. The deterministic nature of the key hierarchy ensures that authorized administrators can always derive the necessary keys, while revoked administrators lose access immediately.

## Implementation Guidelines

1. **Use Standard Libraries**: Rely on well-vetted cryptographic libraries
2. **Avoid Custom Crypto**: Don't implement custom cryptographic algorithms
3. **Regular Audits**: Conduct regular security audits of the key management system
4. **Defense in Depth**: Implement multiple layers of security
5. **Secure Defaults**: Provide secure default configurations
6. **Key Rotation**: Implement regular key rotation procedures
7. **Metadata Protection**: Encrypt all sensitive metadata
8. **Revocation Lists**: Maintain efficient revocation lists
9. **Audit Logging**: Log all key management operations
10. **Secure Recovery**: Implement secure key recovery mechanisms
