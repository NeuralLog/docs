# Log Creation

After setting up the admin with access to the KEK, the next step is to create and encrypt logs. This document walks through the code that creates, encrypts, and stores logs in the zero-knowledge architecture.

## Overview

1. The client encrypts the log name using a key derived from the operational KEK
2. The client encrypts the log data using a key derived from the operational KEK
3. The client sends the encrypted log name and data to the server
4. The server stores the encrypted log without being able to decrypt it

## Code Walkthrough

### Creating a Log

After the admin has initialized their key hierarchy, they can create logs:

```typescript
// Admin creates a log
const logName = 'system-events';
const logData = {
  level: 'info',
  message: 'System initialized',
  timestamp: new Date().toISOString(),
  user: 'admin',
  action: 'init'
};

// Log the data
const logId = await client.log(logName, logData);
console.log('Log ID:', logId);
```

This calls the `NeuralLogClient.log` method:

```typescript
public async log(
  logName: string,
  data: Record<string, any>,
  options: { kekVersion?: string } = {}
): Promise<string> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Log data
    return await this.logManager.log(
      logName,
      data,
      options,
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to log data: ${error instanceof Error ? error.message : String(error)}`,
      'log_failed'
    );
  }
}
```

Which calls the `LogManager.log` method:

```typescript
public async log(
  logName: string,
  data: Record<string, any>,
  options: { kekVersion?: string } = {},
  authCredential: string
): Promise<string> {
  try {
    // Use specified KEK version or current one
    const kekVersion = options.kekVersion || this.cryptoService.getCurrentKEKVersion();

    // Encrypt the log name
    const encryptedLogName = await this.cryptoService.encryptLogName(logName, kekVersion);

    // Encrypt the log data
    const encryptedData = await this.cryptoService.encryptLogData(data, kekVersion);

    // Generate search tokens if needed
    let searchTokens: string[] | undefined;
    if (data.searchable) {
      const searchKey = await this.cryptoService.deriveSearchKey(kekVersion);
      searchTokens = await this.cryptoService.generateSearchTokens(data.searchable, searchKey);
    }

    // Get a resource token for the log
    const resourceToken = await this.authService.getResourceToken(
      `logs/${encryptedLogName}`,
      authCredential
    );

    // Append the log
    return await this.logsService.appendLog(
      encryptedLogName,
      encryptedData,
      resourceToken,
      searchTokens
    );
  } catch (error) {
    throw new LogError(
      `Failed to log data: ${error instanceof Error ? error.message : String(error)}`,
      'log_failed'
    );
  }
}
```

### Encrypting the Log Name

The `CryptoService.encryptLogName` method encrypts the log name:

```typescript
public async encryptLogName(logName: string, kekVersion?: string): Promise<string> {
  try {
    // Use specified KEK version or current one
    const version = kekVersion || this.getCurrentKEKVersion();

    // Derive the log name key
    const logNameKey = await this.deriveLogNameKey(version);

    // Import the key for AES-GCM
    const key = await crypto.subtle.importKey(
      'raw',
      logNameKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encode log name as UTF-8
    const logNameBytes = new TextEncoder().encode(logName);

    // Encrypt the log name
    const encryptedLogName = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      logNameBytes
    );

    // Combine IV and encrypted log name
    const combined = new Uint8Array(iv.length + new Uint8Array(encryptedLogName).length);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedLogName), iv.length);

    // Return as Base64
    return this.arrayBufferToBase64(combined);
  } catch (error) {
    throw new LogError(
      `Failed to encrypt log name: ${error instanceof Error ? error.message : String(error)}`,
      'encrypt_log_name_failed'
    );
  }
}
```

The log name key is derived from the operational KEK:

```typescript
public async deriveLogNameKey(kekVersion?: string): Promise<Uint8Array> {
  try {
    // Use specified KEK version or current one
    const version = kekVersion || this.getCurrentKEKVersion();

    // Get the operational KEK
    const operationalKEK = this.getOperationalKEK(version);

    if (!operationalKEK) {
      throw new Error(`Operational KEK not found for version ${version}`);
    }

    // Derive bits using HKDF
    return await KeyDerivation.deriveKeyWithHKDF(operationalKEK, {
      salt: 'NeuralLog-LogNameKey',
      info: 'log-names',
      hash: 'SHA-256',
      keyLength: 256 // 32 bytes
    });
  } catch (error) {
    throw new LogError(
      `Failed to derive log name key: ${error instanceof Error ? error.message : String(error)}`,
      'derive_log_name_key_failed'
    );
  }
}
```

### Encrypting the Log Data

The `CryptoService.encryptLogData` method encrypts the log data:

```typescript
public async encryptLogData(data: any, kekVersion?: string): Promise<Record<string, any>> {
  try {
    // Use specified KEK version or current one
    const version = kekVersion || this.getCurrentKEKVersion();

    // Derive the log key
    const logKey = await this.deriveLogKey(version);

    // Convert data to string
    const dataString = typeof data === 'string' ? data : JSON.stringify(data);
    const dataBuffer = new TextEncoder().encode(dataString);

    // Import log key
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      logKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    // Generate IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
        tagLength: 128
      },
      cryptoKey,
      dataBuffer
    );

    // Convert to Base64
    const encryptedDataBase64 = this.arrayBufferToBase64(encryptedData);
    const ivBase64 = this.arrayBufferToBase64(iv);

    // Return encrypted data with version information
    return {
      encrypted: true,
      algorithm: 'aes-256-gcm',
      iv: ivBase64,
      data: encryptedDataBase64,
      kekVersion: version
    };
  } catch (error) {
    throw new LogError(
      `Failed to encrypt log data: ${error instanceof Error ? error.message : String(error)}`,
      'encrypt_log_data_failed'
    );
  }
}
```

The log key is derived from the operational KEK:

```typescript
public async deriveLogKey(kekVersion?: string): Promise<Uint8Array> {
  try {
    // Use specified KEK version or current one
    const version = kekVersion || this.getCurrentKEKVersion();

    // Get the operational KEK
    const operationalKEK = this.getOperationalKEK(version);

    if (!operationalKEK) {
      throw new Error(`Operational KEK not found for version ${version}`);
    }

    // Derive bits using HKDF
    return await KeyDerivation.deriveKeyWithHKDF(operationalKEK, {
      salt: 'NeuralLog-LogKey',
      info: 'logs',
      hash: 'SHA-256',
      keyLength: 256 // 32 bytes
    });
  } catch (error) {
    throw new LogError(
      `Failed to derive log key: ${error instanceof Error ? error.message : String(error)}`,
      'derive_log_key_failed'
    );
  }
}
```

### Sending the Log to the Server

The `LogsService.appendLog` method sends the encrypted log to the server:

```typescript
public async appendLog(
  logName: string,
  encryptedData: Record<string, any>,
  resourceToken: string,
  searchTokens?: string[]
): Promise<string> {
  try {
    // Include search tokens in the request if provided
    const logEntry = searchTokens ? { ...encryptedData, searchTokens } : encryptedData;

    // Send the log to the server
    const response = await this.apiClient.post(
      `${this.baseUrl}/logs/${logName}`,
      logEntry,
      {
        headers: {
          Authorization: `Bearer ${resourceToken}`
        }
      }
    );

    return response.data.id;
  } catch (error) {
    throw new LogError(
      `Failed to append log: ${error instanceof Error ? error.message : String(error)}`,
      'append_log_failed'
    );
  }
}
```

### Server-Side Log Storage

On the server side, the `LogController.appendLog` method handles the request:

```typescript
public async appendLog(req: Request, res: Response): Promise<void> {
  try {
    const { logName } = req.params;
    const logData = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      res.status(400).json({ error: 'Tenant ID is required' });
      return;
    }

    // Store the log
    const logId = await this.logService.appendLog(tenantId, logName, logData);

    res.status(201).json({ id: logId });
  } catch (error) {
    console.error('Error appending log:', error);
    res.status(500).json({ error: 'Failed to append log' });
  }
}
```

The `LogService.appendLog` method stores the log in the database:

```typescript
public async appendLog(tenantId: string, logName: string, logData: any): Promise<string> {
  try {
    // Generate a unique ID for the log
    const logId = uuidv4();

    // Create a log entry
    const logEntry = {
      id: logId,
      tenantId,
      logName,
      data: logData,
      timestamp: new Date().toISOString()
    };

    // Store the log entry
    await this.logRepository.save(logEntry);

    return logId;
  } catch (error) {
    console.error('Failed to append log:', error);
    throw new LogError('Failed to append log', 'append_log_failed');
  }
}
```

## Security Considerations

- The log name is encrypted to prevent information leakage through log names.
- The log data is encrypted with a key derived from the operational KEK.
- The KEK version is included with the encrypted data to support key rotation.
- The server never has access to the unencrypted log name or data.
- Resource tokens are used to authorize access to specific logs.

## Related Files

- [NeuralLogClient.ts](../code-snippets/typescript-client-sdk/src/client/NeuralLogClient.md) - Contains the client-side methods for logging data.
- [LogManager.ts](../code-snippets/typescript-client-sdk/src/logs/LogManager.md) - Contains the methods for managing logs.
- [CryptoService.ts](../code-snippets/typescript-client-sdk/src/crypto/CryptoService.md) - Contains the methods for encrypting log names and data.
- [LogsService.ts](../code-snippets/typescript-client-sdk/src/logs/LogsService.md) - Contains the methods for communicating with the logs service.
- [LogController.ts](../code-snippets/log-server/src/controllers/LogController.md) - Contains the server-side methods for handling log requests.
- [LogService.ts](../code-snippets/log-server/src/services/LogService.md) - Contains the methods for storing logs in the database.

## Next Steps

Once logs are being created and stored, the next step is to [provision additional users](./05-user-provisioning.md) who need access to the logs.
