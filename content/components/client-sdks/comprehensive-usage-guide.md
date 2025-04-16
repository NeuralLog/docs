---
sidebar_position: 3
---

# Comprehensive Client SDK Usage Guide

This guide provides detailed instructions and best practices for using the NeuralLog Client SDK in your applications. It covers initialization, authentication, key management, logging operations, and advanced features.

## Introduction

The NeuralLog Client SDK is the cornerstone of NeuralLog's zero-knowledge architecture. It handles client-side encryption, key management, authentication, and communication with NeuralLog services. This guide will help you understand how to use the SDK effectively in your applications.

## Installation

Install the SDK using npm or yarn:

```bash
# Using npm
npm install @neurallog/client-sdk

# Using yarn
yarn add @neurallog/client-sdk
```

## Initialization

### Basic Initialization

The most straightforward way to initialize the client is with a tenant ID and API key. The client SDK will automatically discover the appropriate services using the tenant's DNS namespace:

```typescript
import { NeuralLogClient } from '@neurallog/client-sdk';

// Initialize the client with tenant ID and API key
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // This forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key'
});

// Initialize the client (async)
await client.initialize();
```

Behind the scenes, the client SDK uses the Discovery service to locate the auth and logs servers for your tenant based on the tenant ID.

### Environment-based Initialization

For better security and flexibility, you can use environment variables:

```typescript
import { NeuralLogClient } from '@neurallog/client-sdk';

// Initialize the client with environment variables
const client = new NeuralLogClient({
  tenantId: process.env.NEURALLOG_TENANT_ID,
  apiKey: process.env.NEURALLOG_API_KEY
});

// Initialize the client (async)
await client.initialize();
```

### Custom Registry Configuration

For advanced scenarios, you can customize the registry configuration:

```typescript
import { NeuralLogClient } from '@neurallog/client-sdk';

// Initialize the client with custom registry configuration
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key',
  discovery: {
    // Optional custom registry URL if not using the default tenant-based discovery
    registryUrl: 'https://custom-registry.example.com',
    // Optional cache configuration for service discovery
    cache: {
      enabled: true,
      ttl: 3600 // seconds
    }
  }
});

// Initialize the client (async)
await client.initialize();
```

## Authentication

### API Key Authentication

API key authentication is the simplest method and is suitable for server-side applications:

```typescript
// Initialize with API key
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key'
});

// The client will automatically authenticate using the API key
await client.initialize();
```

### Interactive Authentication (Browser)

For browser applications, you can use interactive authentication:

```typescript
// Initialize for interactive authentication
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  auth: {
    type: 'interactive'
  }
});

// Authenticate the user
await client.auth.login();

// Check if the user is authenticated
const isAuthenticated = client.auth.isAuthenticated();
console.log(`User is authenticated: ${isAuthenticated}`);

// Get the current user
const user = await client.auth.getCurrentUser();
console.log(`Current user: ${user.id}`);

// Logout
await client.auth.logout();
```

### Auth0 Integration

If you're using Auth0 for authentication, you can integrate it with NeuralLog:

```typescript
// Initialize with Auth0
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  auth: {
    type: 'auth0',
    domain: 'your-auth0-domain.auth0.com',
    clientId: 'your-auth0-client-id',
    audience: 'https://api.neurallog.app'
  }
});

// Login with Auth0
await client.auth.login();

// The client will automatically handle token refresh
```

### Custom Authentication Provider

You can also implement a custom authentication provider:

```typescript
import { NeuralLogClient, AuthProvider } from '@neurallog/client-sdk';

// Implement a custom auth provider
class CustomAuthProvider implements AuthProvider {
  private token: string | null = null;

  async login(): Promise<string> {
    // Implement your custom login logic
    this.token = await yourCustomLoginFunction();
    return this.token;
  }

  async getToken(): Promise<string> {
    if (!this.token) {
      return this.login();
    }
    return this.token;
  }

  async logout(): Promise<void> {
    // Implement your custom logout logic
    this.token = null;
    await yourCustomLogoutFunction();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Initialize with custom auth provider
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  auth: {
    type: 'custom',
    provider: new CustomAuthProvider()
  }
});

// Login using the custom provider
await client.auth.login();
```

## Key Management

### Initializing with Recovery Phrase

For administrative operations, you can initialize the client with a recovery phrase:

```typescript
// Initialize with recovery phrase
await client.initializeWithRecoveryPhrase('your-recovery-phrase');

// Now you can perform administrative operations
const kekVersions = await client.getKEKVersions();
console.log('KEK versions:', kekVersions);
```

### Creating a KEK Version

Administrators can create new KEK versions:

```typescript
// Create a new KEK version
const newVersion = await client.createKEKVersion('Quarterly rotation');
console.log('New KEK version:', newVersion);

// Set the new version as the active version
client.cryptoService.setCurrentKEKVersion(newVersion.id);
```

### Rotating KEK Versions

Administrators can rotate KEK versions to enhance security:

```typescript
// Rotate KEK, creating a new version and optionally removing users
const rotatedVersion = await client.rotateKEK('Security incident', ['user-to-remove']);
console.log('Rotated KEK version:', rotatedVersion);
```

### Provisioning KEK for Users

Administrators can provision KEK versions for users:

```typescript
// Provision KEK for a user
await client.provisionKEKForUser('user-id', 'kek-version-id');
console.log('KEK provisioned for user');
```

### Managing KEK Blobs

Administrators can manage KEK blobs:

```typescript
// Get KEK blobs for a user
const kekBlobs = await client.getKEKBlobsForUser('user-id');
console.log('KEK blobs:', kekBlobs);

// Delete a KEK blob
await client.deleteKEKBlob('user-id', 'kek-version-id');
console.log('KEK blob deleted');
```

## Log Management

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

### Deleting Logs

```typescript
// Delete a log
await client.logs.deleteLog('application-logs');
console.log('Log deleted');

// Delete specific log entries
await client.logs.deleteLogEntries('application-logs', {
  before: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Delete entries older than 30 days
});
console.log('Old log entries deleted');
```

## Advanced Features

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
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key',
  encryption: {
    sensitiveFields: ['password', 'creditCard', 'ssn'], // Fields to encrypt with extra protection
    nonSearchableFields: ['privateNotes'], // Fields that should not be searchable
    algorithm: 'AES-GCM', // Encryption algorithm to use
  }
});
```

### Caching

You can configure caching to improve performance:

```typescript
// Create a client with caching options
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key',
  cache: {
    enabled: true,
    ttl: 3600, // Cache TTL in seconds
    maxSize: 1000 // Maximum number of items in the cache
  }
});
```

### Retry Logic

You can configure retry logic for network operations:

```typescript
// Create a client with retry options
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key',
  retry: {
    maxRetries: 3,
    initialDelayMs: 100,
    maxDelayMs: 1000,
    backoffFactor: 2
  }
});
```

### Logging and Debugging

You can enable debug logging to troubleshoot issues:

```typescript
// Create a client with debug logging
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key',
  debug: true
});

// You can also set a custom logger
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key',
  logger: {
    debug: (message) => console.debug(`[NeuralLog] ${message}`),
    info: (message) => console.info(`[NeuralLog] ${message}`),
    warn: (message) => console.warn(`[NeuralLog] ${message}`),
    error: (message) => console.error(`[NeuralLog] ${message}`)
  }
});
```

## Integration with Logging Frameworks

### Winston Integration

```typescript
import { createLogger } from 'winston';
import { NeuralLogTransport } from '@neurallog/winston-adapter';
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create NeuralLog client
const neuralLogClient = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
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
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
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

### Log4js Integration

```typescript
import log4js from 'log4js';
import { NeuralLogAppender } from '@neurallog/log4js-adapter';
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create NeuralLog client
const neuralLogClient = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key'
});

// Configure log4js with NeuralLog appender
log4js.configure({
  appenders: {
    neurallog: {
      type: NeuralLogAppender,
      client: neuralLogClient,
      logName: 'application-logs'
    },
    console: { type: 'console' }
  },
  categories: {
    default: { appenders: ['neurallog', 'console'], level: 'info' }
  }
});

// Get logger and use it
const logger = log4js.getLogger();
logger.info('User logged in', { userId: '123' });
```

## Error Handling

The SDK provides detailed error information:

```typescript
try {
  await client.logs.getLogEntries('non-existent-log', { limit: 10 });
} catch (error) {
  if (error.code === 'LOG_NOT_FOUND') {
    console.error('The specified log does not exist');
  } else if (error.code === 'UNAUTHORIZED') {
    console.error('Not authorized to access this log');
  } else if (error.code === 'NETWORK_ERROR') {
    console.error('Network error occurred, please check your connection');
  } else if (error.code === 'ENCRYPTION_ERROR') {
    console.error('Encryption error occurred, please check your keys');
  } else {
    console.error('An unexpected error occurred:', error);
  }
}
```

### Custom Error Handler

You can also set a global error handler:

```typescript
// Create a client with a custom error handler
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key',
  errorHandler: (error) => {
    // Log the error to your monitoring system
    yourMonitoringSystem.logError(error);

    // Return true to indicate that the error has been handled
    // Return false to let the error propagate
    return false;
  }
});
```

## Browser Usage

The SDK works in browser environments with a few considerations:

```typescript
// Import the browser-specific package
import { NeuralLogClient } from '@neurallog/client-sdk/browser';

// Create the client
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
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

### React Integration

For React applications, you can use the React hooks:

```typescript
import { useNeuralLog, NeuralLogProvider } from '@neurallog/react';

// Wrap your app with the provider
function App() {
  return (
    <NeuralLogProvider
      tenantId="your-tenant-id"  // Forms the DNS namespace: your-tenant-id.neurallog.app
      auth={{ type: 'interactive' }}
    >
      <YourApp />
    </NeuralLogProvider>
  );
}

// Use the hook in your components
function LogsComponent() {
  const { client, isAuthenticated, login, logout } = useNeuralLog();
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (isAuthenticated) {
      client.logs.getLogEntries('application-logs', { limit: 10 })
        .then(setLogs)
        .catch(console.error);
    }
  }, [isAuthenticated, client]);

  if (!isAuthenticated) {
    return <button onClick={login}>Login</button>;
  }

  return (
    <div>
      <button onClick={logout}>Logout</button>
      <h1>Logs</h1>
      <ul>
        {logs.map(log => (
          <li key={log.id}>{log.message}</li>
        ))}
      </ul>
    </div>
  );
}
```

## Best Practices

### Security Best Practices

1. **API Key Management**: Store API keys securely and never expose them in client-side code.
2. **Regular Key Rotation**: Rotate KEK versions regularly to enhance security.
3. **Least Privilege**: Use API keys with the minimum required permissions.
4. **Environment Variables**: Use environment variables for configuration instead of hardcoding values.
5. **HTTPS**: Always use HTTPS for communication with NeuralLog services.

### Performance Best Practices

1. **Batch Logging**: Use batch operations for high-volume logging.
2. **Caching**: Enable caching to improve performance.
3. **Connection Pooling**: Use connection pooling for server-side applications.
4. **Compression**: Enable compression for large payloads.
5. **Pagination**: Use pagination for retrieving large amounts of data.

### Error Handling Best Practices

1. **Graceful Degradation**: Handle errors gracefully and provide fallback mechanisms.
2. **Retry Logic**: Use retry logic for transient errors.
3. **Monitoring**: Monitor errors and performance metrics.
4. **Logging**: Log errors for troubleshooting.
5. **User Feedback**: Provide meaningful error messages to users.

## Troubleshooting

### Common Issues

1. **Authentication Failures**: Check your API key or authentication credentials.
2. **Network Errors**: Check your network connection and firewall settings.
3. **Permission Errors**: Check the permissions associated with your API key.
4. **Encryption Errors**: Check your KEK versions and initialization.
5. **Rate Limiting**: Check if you're hitting rate limits.

### Debugging

1. **Enable Debug Logging**: Set `debug: true` in the client options.
2. **Check Network Requests**: Use browser developer tools to inspect network requests.
3. **Check Console Errors**: Look for errors in the console.
4. **Check Server Logs**: Check the logs of the NeuralLog services.
5. **Contact Support**: If all else fails, contact NeuralLog support.

## API Reference

For a complete API reference, see the [TypeScript SDK API Reference](../../api-reference.md).

## Next Steps

- [Authentication Implementation](../../security/authentication-implementation.md)
- [Zero-Knowledge Architecture](../../security/zero-knowledge-architecture.md)
- [Key Management](../../security/key-management.md)
- [Logger Adapters](../logger-adapters/overview.md)
