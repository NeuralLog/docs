# Encrypted Data at Rest in NeuralLog

This document explains how NeuralLog implements encrypted data at rest while maintaining the ability to analyze the data.

## Overview

NeuralLog uses a hybrid approach to encrypt log data at rest while still allowing for search and analysis capabilities. This approach balances security with functionality, ensuring that sensitive log data is protected while still being useful.

## Encryption Architecture

### Encryption Layers

NeuralLog implements multiple layers of encryption:

1. **Content Encryption**: Log content is encrypted using AES-256-GCM, a strong authenticated encryption algorithm
2. **Searchable Encryption**: A specialized technique that allows searching encrypted data without decrypting it
3. **Key Management**: Encryption keys are securely managed and rotated regularly

### Key Components

1. **Encryption Key**: Used to encrypt and decrypt log content
2. **Searchable Encryption Key**: Used to generate searchable tokens from log content
3. **HMAC Key**: Used for integrity verification

## How It Works

### Storing Encrypted Logs

When a log entry is stored:

1. The log content is serialized to JSON
2. The content is encrypted using AES-256-GCM with a random IV
3. Searchable tokens are generated from the content using HMAC-SHA256
4. The encrypted content is stored in Redis
5. The searchable tokens are indexed for later searching

```typescript
// Example of storing a log entry
const entryId = await secureStorageService.storeLogEntry(
  logSlug,
  {
    level: 'info',
    message: 'User logged in',
    content: { userId: '123', ip: '192.168.1.1' },
    timestamp: Date.now()
  },
  tenantId
);
```

### Retrieving Encrypted Logs

When a log entry is retrieved:

1. The encrypted content is fetched from Redis
2. The content is decrypted using the encryption key
3. The decrypted content is returned to the client

```typescript
// Example of retrieving a log entry
const entry = await secureStorageService.getLogEntry(
  logSlug,
  entryId,
  tenantId
);
```

### Searching Encrypted Logs

When searching for log entries:

1. Searchable tokens are generated from the search query using the same HMAC-SHA256 function
2. The tokens are used to find matching entries in the search index
3. The matching entries are decrypted and returned to the client

```typescript
// Example of searching for log entries
const entries = await secureStorageService.searchLogEntries(
  logSlug,
  'login failed',
  tenantId
);
```

### Analyzing Encrypted Logs

When analyzing log entries:

1. The relevant log entries are retrieved and decrypted
2. The analysis is performed on the decrypted data
3. Only the analysis results are returned to the client, not the raw data

```typescript
// Example of analyzing log entries
const results = await secureStorageService.analyzeLogEntries(
  logSlug,
  'frequency',
  startTime,
  endTime,
  tenantId
);
```

## Security Considerations

### Encryption Strength

- **AES-256-GCM**: Provides confidentiality, integrity, and authenticity
- **Random IV**: Ensures that identical plaintext encrypts to different ciphertext
- **Authentication Tag**: Verifies that the ciphertext has not been tampered with

### Searchable Encryption

The searchable encryption technique used in NeuralLog is a form of deterministic encryption that allows for equality searches while maintaining security:

1. **HMAC-SHA256**: Generates deterministic but secure tokens from words
2. **Separate Key**: Uses a different key from the content encryption key
3. **Limited Information Leakage**: Only reveals which entries contain the same words, not the words themselves

### Key Management

Proper key management is crucial for the security of encrypted data:

1. **Key Generation**: Keys are generated using a cryptographically secure random number generator
2. **Key Storage**: Keys are stored securely, separate from the encrypted data
3. **Key Rotation**: Keys are rotated regularly to limit the impact of a key compromise
4. **Tenant Isolation**: Each tenant has its own set of encryption keys

## Implementation Details

### SecureStorageService

The `SecureStorageService` class provides the core functionality for encrypted storage:

```typescript
class SecureStorageService {
  constructor(
    redis: Redis,
    encryptionKey: string,
    searchableEncryptionKey: string,
    hmacKey: string
  ) {
    // Initialize the service with the required keys
  }
  
  async storeLogEntry(logSlug: string, entry: LogEntry, tenantId: string): Promise<string> {
    // Encrypt and store a log entry
  }
  
  async getLogEntry(logSlug: string, entryId: string, tenantId: string): Promise<LogEntry | null> {
    // Retrieve and decrypt a log entry
  }
  
  async searchLogEntries(logSlug: string, query: string, tenantId: string): Promise<LogEntry[]> {
    // Search for log entries using searchable encryption
  }
  
  async analyzeLogEntries(logSlug: string, analysisType: string, startTime: number, endTime: number, tenantId: string): Promise<any> {
    // Analyze log entries while maintaining encryption
  }
}
```

### Redis Schema

The Redis schema is designed to support encrypted storage and efficient searching:

- `tenant:{tenantId}:log:{logSlug}:entry:{entryId}`: Stores the encrypted log entry
- `tenant:{tenantId}:log:{logSlug}:timeline`: Sorted set of entry IDs by timestamp
- `tenant:{tenantId}:log:{logSlug}:search:{token}`: Set of entry IDs that contain a specific token

## Best Practices

1. **Regular Key Rotation**: Rotate encryption keys regularly to limit the impact of a key compromise
2. **Secure Key Storage**: Store encryption keys securely, separate from the encrypted data
3. **Audit Logging**: Log all access to encrypted data for security auditing
4. **Minimal Decryption**: Decrypt only the data that is needed, when it is needed
5. **Transport Encryption**: Use TLS to encrypt data in transit

## Limitations

1. **Performance**: Encryption and decryption add computational overhead
2. **Search Capabilities**: Only equality searches are supported, not full-text search
3. **Analysis Complexity**: Complex analysis may require decrypting large amounts of data

## Future Improvements

1. **Homomorphic Encryption**: Perform analysis on encrypted data without decrypting it
2. **Attribute-Based Encryption**: Control access to encrypted data based on attributes
3. **Client-Side Encryption**: Allow clients to encrypt data before sending it to the server
