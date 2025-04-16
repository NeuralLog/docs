---
sidebar_position: 2
---

# TypeScript Client SDK

The TypeScript Client SDK is the cornerstone of NeuralLog's client libraries, providing a comprehensive implementation of NeuralLog's zero-knowledge architecture for JavaScript and TypeScript applications.

## Installation

Install the SDK using npm or yarn:

```bash
# Using npm
npm install @neurallog/client-sdk

# Using yarn
yarn add @neurallog/client-sdk
```

## Key Features

- **Zero-Knowledge Architecture**: Client-side encryption ensures sensitive data never leaves your application unencrypted
- **Key Management**: Comprehensive key derivation and management
- **Log Operations**: Create, read, update, and delete logs
- **Search Capabilities**: Search logs while maintaining zero-knowledge security
- **Authentication**: Secure authentication with the NeuralLog Auth Service
- **Cross-Platform**: Works in both Node.js and browser environments
- **TypeScript Support**: Full TypeScript type definitions for improved developer experience

## Basic Usage

### Initialization

```typescript
import { NeuralLogClient } from '@neurallog/client-sdk';

// Initialize the client
const client = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key'
});

// Initialize the client (async)
await client.initialize();
```

### Creating a Log

```typescript
// Create a new log
const log = await client.logs.createLog('application-logs', {
  description: 'Application logs for my service',
  retention: 30 // days
});

console.log(`Created log: ${log.id}`);
```

### Logging Data

```typescript
// Log a simple message
await client.logs.appendToLog('application-logs', {
  level: 'info',
  message: 'User logged in',
  timestamp: new Date(),
  metadata: {
    userId: '123',
    ipAddress: '192.168.1.1'
  }
});

// Log structured data
await client.logs.appendToLog('application-logs', {
  level: 'error',
  message: 'Payment processing failed',
  timestamp: new Date(),
  metadata: {
    orderId: '456',
    amount: 99.99,
    currency: 'USD',
    error: {
      code: 'INSUFFICIENT_FUNDS',
      message: 'The payment method has insufficient funds'
    }
  }
});
```

### Retrieving Logs

```typescript
// Get the most recent logs
const logs = await client.logs.getLogEntries('application-logs', {
  limit: 100,
  offset: 0
});

console.log(`Retrieved ${logs.length} logs`);

// Get logs from a specific time range
const yesterdayLogs = await client.logs.getLogEntries('application-logs', {
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
  endTime: new Date(),
  limit: 100
});

console.log(`Retrieved ${yesterdayLogs.length} logs from yesterday`);
```

### Searching Logs

```typescript
// Search for error logs
const errorLogs = await client.logs.searchLogs('application-logs', {
  query: 'level:error',
  limit: 100
});

console.log(`Found ${errorLogs.length} error logs`);

// Search for logs with specific metadata
const paymentLogs = await client.logs.searchLogs('application-logs', {
  query: 'metadata.orderId:456',
  limit: 100
});

console.log(`Found ${paymentLogs.length} logs for order 456`);
```

## Advanced Usage

### Batch Logging

For high-volume logging, use batch operations to improve performance:

```typescript
// Create a batch of logs
const batch = client.logs.createBatch('application-logs');

// Add logs to the batch
batch.add({
  level: 'info',
  message: 'User logged in',
  timestamp: new Date(),
  metadata: { userId: '123' }
});

batch.add({
  level: 'info',
  message: 'User viewed product',
  timestamp: new Date(),
  metadata: { userId: '123', productId: '789' }
});

// Send the batch
await batch.send();
```

### Custom Encryption

For advanced use cases, you can customize the encryption behavior:

```typescript
// Create a client with custom encryption options
const client = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key',
  encryption: {
    sensitiveFields: ['password', 'creditCard', 'ssn'], // Fields to encrypt with extra protection
    nonSearchableFields: ['privateNotes'], // Fields that should not be searchable
    algorithm: 'AES-GCM', // Encryption algorithm to use
  }
});
```

### Authentication with Auth0

If you're using Auth0 for authentication, you can integrate it with NeuralLog:

```typescript
// Create a client with Auth0 authentication
const client = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  auth: {
    type: 'auth0',
    domain: 'your-auth0-domain.auth0.com',
    clientId: 'your-auth0-client-id',
    audience: 'https://api.neurallog.com'
  }
});

// Login with Auth0
await client.auth.login();

// Now you can use the client as usual
const logs = await client.logs.getLogEntries('application-logs', { limit: 10 });
```

### Key Management

The SDK provides advanced key management capabilities:

```typescript
// Generate a new KEK version
const newKekVersion = await client.keys.createKekVersion();
console.log(`Created new KEK version: ${newKekVersion}`);

// Rotate log keys to use the new KEK version
await client.keys.rotateLogKeys('application-logs', newKekVersion);
console.log('Rotated log keys to use the new KEK version');

// List KEK versions
const kekVersions = await client.keys.listKekVersions();
console.log('KEK versions:', kekVersions);
```

### Error Handling

The SDK provides detailed error information:

```typescript
try {
  await client.logs.getLogEntries('non-existent-log', { limit: 10 });
} catch (error) {
  if (error.code === 'LOG_NOT_FOUND') {
    console.error('The specified log does not exist');
  } else if (error.code === 'UNAUTHORIZED') {
    console.error('Not authorized to access this log');
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
```

## Browser Usage

The SDK works in browser environments with a few considerations:

```typescript
// Import the browser-specific package
import { NeuralLogClient } from '@neurallog/client-sdk/browser';

// Create the client
const client = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  // In browser environments, use interactive authentication instead of API keys
  auth: {
    type: 'interactive'
  }
});

// Login (this will redirect to the auth provider if needed)
await client.auth.login();

// Now you can use the client as usual
const logs = await client.logs.getLogEntries('application-logs', { limit: 10 });
```

## Integration with Logging Frameworks

The SDK can be integrated with popular logging frameworks:

### Winston Integration

```typescript
import { createLogger } from 'winston';
import { NeuralLogTransport } from '@neurallog/winston-adapter';
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create NeuralLog client
const neuralLogClient = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key'
});

// Create Winston logger with NeuralLog transport
const logger = createLogger({
  transports: [
    new NeuralLogTransport({
      client: neuralLogClient,
      logName: 'application-logs',
      level: 'info'
    })
  ]
});

// Use the logger as usual
logger.info('User logged in', { userId: '123' });
```

### Pino Integration

```typescript
import pino from 'pino';
import { neuralLogTransport } from '@neurallog/pino-adapter';
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create NeuralLog client
const neuralLogClient = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key'
});

// Create Pino logger with NeuralLog transport
const logger = pino({
  transport: neuralLogTransport({
    client: neuralLogClient,
    logName: 'application-logs'
  })
});

// Use the logger as usual
logger.info({ userId: '123' }, 'User logged in');
```

## API Reference

### Generated API Types

The TypeScript Client SDK uses a set of shared types that are automatically generated from the OpenAPI schemas of the log-server and auth service. These types ensure consistency between the server and client implementations.

The generated types are located in `src/types/api.ts` and include:

- **Log**: Represents a log in the system
- **LogEntry**: Represents a single log entry
- **LogSearchOptions**: Options for searching logs
- **PaginatedResult**: Generic paginated result type
- **BatchAppendResult**: Result of a batch append operation
- **User**: User information
- **ApiKey**: API key information
- **KEKVersion**: Key Encryption Key version information
- **KEKBlob**: Encrypted KEK blob
- **EncryptedKEK**: Encrypted KEK data
- **EncryptedLogEntry**: Encrypted log entry data
- **SerializedSecretShare**: Serialized Shamir's Secret Share

These types are automatically generated during the build process of the log-server and auth service, ensuring that they always match the server-side API definitions.

### OpenAPI as Single Source of Truth

The TypeScript Client SDK uses the OpenAPI schemas from the log-server and auth service as the single source of truth for API types. This ensures that the client SDK always uses the same types as the server components.

For more information about the OpenAPI integration, see the [OpenAPI Integration](../../development/openapi-integration.md) guide.

For a complete API reference, see the TypeScript SDK API Reference in the repository.

## Next Steps

- [Comprehensive Client SDK Usage Guide](./comprehensive-usage-guide.md)
- [Logger Adapters](../logger-adapters/overview.md)
- [Security Architecture](../../security/zero-knowledge-architecture.md)
- [Authentication and Authorization Guide](../../security/comprehensive-auth-guide.md)
