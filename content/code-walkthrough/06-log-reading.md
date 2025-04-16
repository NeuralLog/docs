# Log Reading

After provisioning users with KEKs and granting them permissions, they can read logs that they have permission to access. This document walks through the code that retrieves, decrypts, and displays logs in the zero-knowledge architecture.

## Overview

1. The user requests logs with a specific name
2. The client encrypts the log name to query the server
3. The server returns the encrypted logs that the user has permission to access
4. The client decrypts the logs using keys derived from the operational KEK

## Code Walkthrough

### Requesting Logs

A user with read permission can request logs:

```typescript
// User reads logs
const logs = await client.getLogs('system-events', { limit: 10 });
console.log('Logs:', logs);
```

This calls the `NeuralLogClient.getLogs` method:

```typescript
public async getLogs(
  logName: string,
  options: { limit?: number } = {}
): Promise<Record<string, any>[]> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Get logs
    return await this.logManager.getLogs(
      logName,
      options,
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to get logs: ${error instanceof Error ? error.message : String(error)}`,
      'get_logs_failed'
    );
  }
}
```

Which calls the `LogManager.getLogs` method:

```typescript
public async getLogs(
  logName: string,
  options: { limit?: number } = {},
  authCredential: string
): Promise<Record<string, any>[]> {
  try {
    // Encrypt the log name
    const encryptedLogName = await this.cryptoService.encryptLogName(logName);

    // Get a resource token for the log
    const resourceToken = await this.authService.getResourceToken(
      `logs/${encryptedLogName}`,
      authCredential
    );

    // Get the logs
    const encryptedLogs = await this.logsService.getLogs(
      encryptedLogName,
      options.limit || 100,
      resourceToken
    );

    // Decrypt the logs
    const decryptedLogs = await Promise.all(
      encryptedLogs.map(async (log) => {
        try {
          const decryptedData = await this.cryptoService.decryptLogData(log.data);
          return {
            id: log.id,
            timestamp: log.timestamp,
            data: decryptedData
          };
        } catch (error) {
          console.error(`Failed to decrypt log ${log.id}:`, error);
          return {
            id: log.id,
            timestamp: log.timestamp,
            data: { error: 'Failed to decrypt log data' }
          };
        }
      })
    );

    return decryptedLogs;
  } catch (error) {
    throw new LogError(
      `Failed to get logs: ${error instanceof Error ? error.message : String(error)}`,
      'get_logs_failed'
    );
  }
}
```

### Getting a Resource Token

The `AuthService.getResourceToken` method gets a resource token for the log:

```typescript
public async getResourceToken(resource: string, authToken: string): Promise<string> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/resource-tokens`,
      { resource },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );

    return response.data.token;
  } catch (error) {
    throw new LogError(
      `Failed to get resource token: ${error instanceof Error ? error.message : String(error)}`,
      'get_resource_token_failed'
    );
  }
}
```

### Retrieving Encrypted Logs

The `LogsService.getLogs` method retrieves the encrypted logs from the server:

```typescript
public async getLogs(
  logName: string,
  limit: number,
  resourceToken: string
): Promise<any[]> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/logs/${logName}`,
      {
        params: { limit },
        headers: {
          Authorization: `Bearer ${resourceToken}`
        }
      }
    );

    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to get logs: ${error instanceof Error ? error.message : String(error)}`,
      'get_logs_failed'
    );
  }
}
```

### Server-Side Log Retrieval

On the server side, the `LogController.getLogs` method handles the request:

```typescript
public async getLogs(req: Request, res: Response): Promise<void> {
  try {
    const { logName } = req.params;
    const { limit } = req.query;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID is required' });
      return;
    }

    // Get logs
    const logs = await this.logService.getLogs(
      tenantId,
      logName,
      parseInt(limit as string) || 100
    );

    res.json(logs);
  } catch (error) {
    console.error('Error getting logs:', error);
    res.status(500).json({ error: 'Failed to get logs' });
  }
}
```

The `LogService.getLogs` method retrieves the logs from the database:

```typescript
public async getLogs(tenantId: string, logName: string, limit: number): Promise<any[]> {
  try {
    // Get logs from the repository
    const logs = await this.logRepository.find({
      where: { tenantId, logName },
      order: { timestamp: 'DESC' },
      take: limit
    });

    return logs.map(log => ({
      id: log.id,
      timestamp: log.timestamp,
      data: log.data
    }));
  } catch (error) {
    console.error('Failed to get logs:', error);
    throw new LogError('Failed to get logs', 'get_logs_failed');
  }
}
```

### Decrypting Log Data

The `CryptoService.decryptLogData` method decrypts the log data:

```typescript
public async decryptLogData(encryptedData: Record<string, any>): Promise<any> {
  try {
    // Get the KEK version from the encrypted data
    const kekVersion = encryptedData.kekVersion || this.getCurrentKEKVersion();

    // Get the operational KEK for this version
    const operationalKEK = this.getOperationalKEK(kekVersion);

    if (!operationalKEK) {
      throw new Error(`Operational KEK not found for version ${kekVersion}`);
    }

    // Derive the log key
    const logKey = await this.deriveLogKey(kekVersion);

    // Import the key for AES-GCM
    const key = await crypto.subtle.importKey(
      'raw',
      logKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Get the IV and encrypted data
    const iv = this.base64ToArrayBuffer(encryptedData.iv);
    const data = this.base64ToArrayBuffer(encryptedData.data);

    // Decrypt the data
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      data
    );

    // Convert to string
    const decryptedString = new TextDecoder().decode(decryptedData);

    // Parse JSON if possible
    try {
      return JSON.parse(decryptedString);
    } catch {
      return decryptedString;
    }
  } catch (error) {
    throw new LogError(
      `Failed to decrypt log data: ${error instanceof Error ? error.message : String(error)}`,
      'decrypt_log_data_failed'
    );
  }
}
```

## Security Considerations

- The log name is encrypted when querying the server to prevent information leakage.
- The server never has access to the unencrypted log name or data.
- Resource tokens are used to authorize access to specific logs.
- The client can only decrypt logs that were encrypted with KEK versions it has access to.
- If a log was encrypted with a KEK version that the client doesn't have access to, the decryption will fail.

## Related Files

- [NeuralLogClient.ts](../code-snippets/typescript-client-sdk/src/client/NeuralLogClient.md) - Contains the client-side methods for retrieving logs.
- [LogManager.ts](../code-snippets/typescript-client-sdk/src/logs/LogManager.md) - Contains the methods for managing logs.
- [CryptoService.ts](../code-snippets/typescript-client-sdk/src/crypto/CryptoService.md) - Contains the methods for encrypting and decrypting log names and data.
- [LogsService.ts](../code-snippets/typescript-client-sdk/src/logs/LogsService.md) - Contains the methods for communicating with the logs service.
- [AuthService.ts](../code-snippets/typescript-client-sdk/src/auth/AuthService.md) - Contains the methods for getting resource tokens.
- [LogController.ts](../code-snippets/log-server/src/controllers/LogController.md) - Contains the server-side methods for handling log requests.
- [LogService.ts](../code-snippets/log-server/src/services/LogService.md) - Contains the methods for retrieving logs from the database.

## Next Steps

As the system evolves, it may be necessary to [rotate KEKs](./07-key-rotation.md) to enhance security or remove access for specific users.
