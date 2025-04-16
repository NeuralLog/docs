# TypeScript Client SDK: The Cornerstone of Zero-Knowledge Security

## Introduction

The TypeScript Client SDK is the cornerstone of NeuralLog's zero-knowledge security architecture. This document explains how the SDK implements the zero-knowledge principles and why it's the foundation of NeuralLog's security model.

## What Makes It the Cornerstone?

The TypeScript Client SDK is the cornerstone of NeuralLog's security for several key reasons:

1. **All Cryptographic Operations Happen Client-Side**: The SDK handles all encryption, decryption, and key management operations exclusively on the client side. This ensures that sensitive data never leaves the client in plaintext form.

2. **No Server-Side Secrets**: The server never has access to encryption keys, passwords, or plaintext data. Even if the entire server infrastructure were compromised, an attacker would gain access to nothing of value - just encrypted data and meaningless tokens.

3. **Foundation for All SDKs**: All other language SDKs are built on the same principles as the TypeScript Client SDK, ensuring a consistent zero-knowledge approach across all client implementations.

4. **Enables True End-to-End Encryption**: By handling all cryptographic operations client-side, the SDK enables true end-to-end encryption for all log data.

## Key Components

### Key Hierarchy

The Key Hierarchy component manages the deterministic derivation of encryption keys:

```typescript
// Derive master encryption key from API key
const masterKey = await keyHierarchy.deriveMasterEncryptionKey(apiKey, tenantId);

// Derive log encryption key for a specific log
const logKey = await keyHierarchy.deriveLogEncryptionKey(apiKey, tenantId, logName);

// Derive log search key for a specific log
const searchKey = await keyHierarchy.deriveLogSearchKey(apiKey, tenantId, logName);
```

### Crypto Service

The Crypto Service handles all encryption and decryption operations:

```typescript
// Encrypt log data using a derived key
const encryptedData = await cryptoService.encryptLogData(data, logKey);

// Decrypt log data using a derived key
const decryptedData = await cryptoService.decryptLogData(encryptedData, logKey);

// Generate search tokens for searchable encryption
const searchTokens = await cryptoService.generateSearchTokens(JSON.stringify(data), searchKey);
```

### Auth Service

The Auth Service handles authentication and token management:

```typescript
// Authenticate with username and password
const token = await authService.authenticateWithPassword(username, password);

// Authenticate with API key
const token = await authService.authenticateWithApiKey(apiKey);

// Get resource token for accessing specific resources
const resourceToken = await authService.getResourceToken(apiKey, tenantId, resource);
```

## Zero-Knowledge Flows

### Authentication Flow

1. **Password-Based Authentication**:
   - The client derives a master secret from username and password
   - Only a verification hash is sent to the server
   - The server verifies the hash without knowing the password
   - The client receives a JWT token for subsequent requests

2. **API Key Authentication**:
   - API keys contain cryptographic material for deriving encryption keys
   - The server only stores verification hashes of API keys
   - API keys are used to derive log encryption keys client-side

### Log Encryption Flow

1. **Log Creation**:
   - The client encrypts log name and data using derived keys
   - The client generates search tokens for searchable encryption
   - Only encrypted data and search tokens are sent to the server
   - The server stores the encrypted data without knowing its contents

2. **Log Retrieval**:
   - The client requests encrypted logs from the server
   - The client derives the appropriate decryption keys
   - The client decrypts the logs locally
   - The server never sees the plaintext logs

### Search Flow

1. **Search Query**:
   - The client generates search tokens from the query
   - Only search tokens are sent to the server
   - The server matches tokens against stored tokens
   - The server returns matching encrypted logs
   - The client decrypts the logs locally

## Security Guarantees

The TypeScript Client SDK provides several critical security guarantees:

1. **Breach Immunity**: Even if the entire server infrastructure is compromised, attackers cannot access plaintext logs without API keys or master secrets.

2. **No Trust Required**: Users don't need to trust the service provider with their sensitive data.

3. **Cryptographic Isolation**: Each tenant's data is encrypted with different keys, providing strong isolation.

4. **Forward Secrecy**: Key rotation can provide forward secrecy without re-encrypting existing data.

5. **Verifiable Security**: The client-side nature of the SDK allows for independent security verification.

## Using the Client SDK

### Installation

```bash
npm install @neurallog/client-sdk
```

### Basic Usage

```typescript
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create a client
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id'
});

// Authenticate
await client.authenticateWithApiKey('your-api-key');

// Log encrypted data
await client.log('application-logs', {
  level: 'info',
  message: 'Hello, world!',
  timestamp: new Date().toISOString(),
  metadata: { user: 'user123' }
});

// Retrieve and decrypt logs
const logs = await client.getLogs('application-logs');
console.log(logs);
```

### Advanced Usage

```typescript
// Search logs using encrypted search tokens
const searchResults = await client.searchLogs('application-logs', 'error');

// Create a new API key
const { apiKey, keyId } = await client.createApiKey('Development Key');

// Revoke an API key
await client.revokeApiKey(keyId);

// Share a log with another user
await client.shareLog('application-logs', 'user123', 'read');
```

## Conclusion

The TypeScript Client SDK is the cornerstone of NeuralLog's zero-knowledge security architecture. By implementing all cryptographic operations client-side, it ensures that sensitive data never leaves the client unencrypted. This approach provides unprecedented security and privacy while still enabling powerful features like searchable encryption.

All other components of the NeuralLog system are built around this cornerstone, ensuring a consistent and secure zero-knowledge architecture throughout the platform.
