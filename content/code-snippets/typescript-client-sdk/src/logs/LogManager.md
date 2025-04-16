# LogManager.ts

This file contains the log management functionality for NeuralLog.

## Creating a Log

```typescript
/**
 * Create a log
 * 
 * @param name Log name
 * @param options Log creation options
 * @returns Promise that resolves to the created log
 */
public async createLog(
  name: string,
  options: LogCreateOptions = {}
): Promise<Log> {
  try {
    // Get auth token
    const authToken = await this.authManager.getAuthToken();
    
    // Encrypt the log name
    const encryptedName = await this.cryptoService.encryptLogName(name);
    
    // Create the log
    const log = await this.logsService.createLog(
      authToken,
      encryptedName,
      options
    );
    
    // Decrypt the log name
    log.name = name;
    
    return log;
  } catch (error) {
    throw new LogError(
      `Failed to create log: ${error instanceof Error ? error.message : String(error)}`,
      'create_log_failed'
    );
  }
}
```

## Getting Logs

```typescript
/**
 * Get logs
 * 
 * @returns Promise that resolves to the logs
 */
public async getLogs(): Promise<Log[]> {
  try {
    // Get auth token
    const authToken = await this.authManager.getAuthToken();
    
    // Get the logs
    const logs = await this.logsService.getLogs(authToken);
    
    // Decrypt the log names
    for (const log of logs) {
      log.name = await this.cryptoService.decryptLogName(log.name);
    }
    
    return logs;
  } catch (error) {
    throw new LogError(
      `Failed to get logs: ${error instanceof Error ? error.message : String(error)}`,
      'get_logs_failed'
    );
  }
}
```

## Appending a Log Entry

```typescript
/**
 * Append a log entry
 * 
 * @param logName Log name
 * @param data Log entry data
 * @param options Log entry options
 * @returns Promise that resolves to the log entry ID
 */
public async appendLogEntry(
  logName: string,
  data: any,
  options: LogEntryOptions = {}
): Promise<string> {
  try {
    // Get auth token
    const authToken = await this.authManager.getAuthToken();
    
    // Encrypt the log name
    const encryptedName = await this.cryptoService.encryptLogName(logName);
    
    // Encrypt the log data
    const encryptedData = await this.cryptoService.encryptLogData(data);
    
    // Generate search tokens if needed
    const searchTokens = options.searchTokens || [];
    
    // Append the log entry
    const result = await this.logsService.appendLogEntry(
      authToken,
      encryptedName,
      encryptedData,
      {
        searchTokens,
        encryptionInfo: {
          version: this.cryptoService.getEncryptionVersion(),
          algorithm: this.cryptoService.getEncryptionAlgorithm()
        }
      }
    );
    
    return result.id;
  } catch (error) {
    throw new LogError(
      `Failed to append log entry: ${error instanceof Error ? error.message : String(error)}`,
      'append_log_entry_failed'
    );
  }
}
```

## Getting Log Entries

```typescript
/**
 * Get log entries
 * 
 * @param logName Log name
 * @param limit Maximum number of entries to return
 * @param offset Offset for pagination
 * @returns Promise that resolves to the log entries
 */
public async getLogEntries(
  logName: string,
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedResult<LogEntry>> {
  try {
    // Get auth token
    const authToken = await this.authManager.getAuthToken();
    
    // Encrypt the log name
    const encryptedName = await this.cryptoService.encryptLogName(logName);
    
    // Get the log entries
    const result = await this.logsService.getLogEntries(
      authToken,
      encryptedName,
      limit,
      offset
    );
    
    // Decrypt the log entries
    for (const entry of result.entries) {
      entry.data = await this.cryptoService.decryptLogData(entry.data, entry.encryptionInfo);
    }
    
    return result;
  } catch (error) {
    throw new LogError(
      `Failed to get log entries: ${error instanceof Error ? error.message : String(error)}`,
      'get_log_entries_failed'
    );
  }
}
```

## Searching Log Entries

```typescript
/**
 * Search log entries
 * 
 * @param logName Log name
 * @param options Search options
 * @returns Promise that resolves to the search results
 */
public async searchLogEntries(
  logName: string,
  options: LogSearchOptions
): Promise<PaginatedResult<LogEntry>> {
  try {
    // Get auth token
    const authToken = await this.authManager.getAuthToken();
    
    // Encrypt the log name
    const encryptedName = await this.cryptoService.encryptLogName(logName);
    
    // Search the log entries
    const result = await this.logsService.searchLogEntries(
      authToken,
      encryptedName,
      options
    );
    
    // Decrypt the log entries
    for (const entry of result.entries) {
      entry.data = await this.cryptoService.decryptLogData(entry.data, entry.encryptionInfo);
    }
    
    return result;
  } catch (error) {
    throw new LogError(
      `Failed to search log entries: ${error instanceof Error ? error.message : String(error)}`,
      'search_log_entries_failed'
    );
  }
}
```
