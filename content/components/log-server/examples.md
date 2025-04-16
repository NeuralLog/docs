# Log Server Examples

This section provides examples of how to use the NeuralLog Log Server in various scenarios.

## Basic Usage

The [Basic Usage Example](./examples/basic-usage.md) demonstrates how to set up and use the Log Server for common tasks such as:

- Creating logs
- Appending log entries
- Retrieving logs
- Searching logs

## Advanced Examples

### Zero-Knowledge Logging

```typescript
// Import the log client and crypto service
import { LogServerClient } from '@neurallog/log-server-client';
import { CryptoService } from '@neurallog/typescript-client-sdk';

// Create a client instance
const logClient = new LogServerClient({
  baseUrl: 'http://localhost:3030',
  tenantId: 'acme-corp'
});

// Create a crypto service
const cryptoService = new CryptoService();

// Example: Zero-knowledge logging
async function zkLogging(authToken, logName, logData) {
  try {
    // Step 1: Initialize the crypto service with the auth token
    await cryptoService.initialize(authToken);

    // Step 2: Encrypt the log name
    const encryptedLogName = await cryptoService.encryptLogName(logName);

    // Step 3: Encrypt the log data
    const encryptedLogData = await cryptoService.encryptLogData(logData);

    // Step 4: Generate search tokens for the log data
    const searchTokens = await cryptoService.generateSearchTokens(logData);

    // Step 5: Append the encrypted log entry
    const result = await logClient.appendLog(authToken, {
      logName: encryptedLogName,
      data: encryptedLogData,
      searchTokens,
      timestamp: new Date().toISOString()
    });

    console.log(`Log entry appended with ID: ${result.id}`);
    return result.id;
  } catch (error) {
    console.error('Zero-knowledge logging failed:', error);
    throw error;
  }
}
```

### Retrieving and Decrypting Logs

```typescript
// Import the log client and crypto service
import { LogServerClient } from '@neurallog/log-server-client';
import { CryptoService } from '@neurallog/typescript-client-sdk';

// Create a client instance
const logClient = new LogServerClient({
  baseUrl: 'http://localhost:3030',
  tenantId: 'acme-corp'
});

// Create a crypto service
const cryptoService = new CryptoService();

// Example: Retrieve and decrypt logs
async function retrieveAndDecryptLogs(authToken, logName, limit = 10) {
  try {
    // Step 1: Initialize the crypto service with the auth token
    await cryptoService.initialize(authToken);

    // Step 2: Encrypt the log name for querying
    const encryptedLogName = await cryptoService.encryptLogName(logName);

    // Step 3: Retrieve the encrypted logs
    const encryptedLogs = await logClient.getLogs(authToken, {
      logName: encryptedLogName,
      limit
    });

    // Step 4: Decrypt the logs
    const decryptedLogs = await Promise.all(encryptedLogs.map(async (log) => {
      const decryptedData = await cryptoService.decryptLogData(log.data);
      return {
        id: log.id,
        timestamp: log.timestamp,
        data: decryptedData
      };
    }));

    console.log(`Retrieved and decrypted ${decryptedLogs.length} logs`);
    return decryptedLogs;
  } catch (error) {
    console.error('Log retrieval and decryption failed:', error);
    throw error;
  }
}
```

### Searching Encrypted Logs

```typescript
// Import the log client and crypto service
import { LogServerClient } from '@neurallog/log-server-client';
import { CryptoService } from '@neurallog/typescript-client-sdk';

// Create a client instance
const logClient = new LogServerClient({
  baseUrl: 'http://localhost:3030',
  tenantId: 'acme-corp'
});

// Create a crypto service
const cryptoService = new CryptoService();

// Example: Search encrypted logs
async function searchEncryptedLogs(authToken, logName, searchQuery, limit = 10) {
  try {
    // Step 1: Initialize the crypto service with the auth token
    await cryptoService.initialize(authToken);

    // Step 2: Encrypt the log name for querying
    const encryptedLogName = await cryptoService.encryptLogName(logName);

    // Step 3: Generate search tokens for the query
    const searchTokens = await cryptoService.generateSearchTokens(searchQuery);

    // Step 4: Search the logs
    const encryptedLogs = await logClient.searchLogs(authToken, {
      logName: encryptedLogName,
      searchTokens,
      limit
    });

    // Step 5: Decrypt the logs
    const decryptedLogs = await Promise.all(encryptedLogs.map(async (log) => {
      const decryptedData = await cryptoService.decryptLogData(log.data);
      return {
        id: log.id,
        timestamp: log.timestamp,
        data: decryptedData
      };
    }));

    console.log(`Found and decrypted ${decryptedLogs.length} logs matching the search query`);
    return decryptedLogs;
  } catch (error) {
    console.error('Log search failed:', error);
    throw error;
  }
}
```

### Using Different Storage Adapters

```typescript
// Import the log server
import { LogServer } from '@neurallog/log-server';

// Example: Configure the log server with different storage adapters
async function configureLogServer() {
  // In-memory storage (for development/testing)
  const memoryLogServer = new LogServer({
    storage: {
      type: 'memory',
      options: {
        maxEntries: 1000 // Limit the number of entries in memory
      }
    },
    port: 3030
  });

  // Redis storage
  const redisLogServer = new LogServer({
    storage: {
      type: 'redis',
      options: {
        host: 'localhost',
        port: 6379,
        password: 'your-redis-password',
        prefix: 'neurallog:logs:'
      }
    },
    port: 3030
  });

  // MongoDB storage
  const mongoLogServer = new LogServer({
    storage: {
      type: 'mongodb',
      options: {
        uri: 'mongodb://localhost:27017/neurallog',
        collection: 'logs'
      }
    },
    port: 3030
  });

  // PostgreSQL storage
  const postgresLogServer = new LogServer({
    storage: {
      type: 'postgres',
      options: {
        host: 'localhost',
        port: 5432,
        database: 'neurallog',
        user: 'postgres',
        password: 'your-postgres-password',
        schema: 'public',
        table: 'logs'
      }
    },
    port: 3030
  });

  // Start the server with your chosen adapter
  await redisLogServer.start();
  console.log('Log server started with Redis storage adapter');
}
```

## Next Steps

- Learn about [Storage Adapters](./storage-adapters.md)
- Explore the [API Reference](./api.md)
- Read about the [Architecture](./architecture.md)
