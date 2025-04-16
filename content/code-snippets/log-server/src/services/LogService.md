# LogService.ts

This file contains the service for storing and retrieving logs in the database.

## Creating a Log

```typescript
/**
 * Create a log
 *
 * @param tenantId Tenant ID
 * @param name Log name
 * @param options Log creation options
 * @returns Promise that resolves to the created log
 */
public async createLog(
  tenantId: string,
  name: string,
  options: LogCreateOptions = {}
): Promise<Log> {
  try {
    // Set default options
    const description = options.description || '';
    const retentionDays = options.retentionDays || 30;
    const encryptionEnabled = options.encryptionEnabled !== false;

    // Create the log
    const log: Log = {
      id: uuidv4(),
      tenantId,
      name,
      description,
      retentionDays,
      encryptionEnabled,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Store in the database
    await this.storageAdapter.createLog(log);

    // Create statistics for the log
    await this.statisticsService.initializeLogStatistics(tenantId, name);

    return log;
  } catch (error) {
    logger.error(`Failed to create log for tenant ${tenantId}:`, error);
    throw new Error(`Failed to create log: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Getting Logs

```typescript
/**
 * Get logs
 *
 * @param tenantId Tenant ID
 * @returns Promise that resolves to the logs
 */
public async getLogs(tenantId: string): Promise<Log[]> {
  try {
    // Get the logs from the database
    const logs = await this.storageAdapter.getLogs(tenantId);

    return logs;
  } catch (error) {
    logger.error(`Failed to get logs for tenant ${tenantId}:`, error);
    throw new Error(`Failed to get logs: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Getting a Log

```typescript
/**
 * Get a log
 *
 * @param tenantId Tenant ID
 * @param name Log name
 * @returns Promise that resolves to the log
 */
public async getLog(tenantId: string, name: string): Promise<Log> {
  try {
    // Get the log from the database
    const log = await this.storageAdapter.getLog(tenantId, name);

    if (!log) {
      throw new Error(`Log ${name} not found`);
    }

    return log;
  } catch (error) {
    logger.error(`Failed to get log ${name} for tenant ${tenantId}:`, error);
    throw new Error(`Failed to get log: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Appending a Log Entry

```typescript
/**
 * Append a log entry
 *
 * @param tenantId Tenant ID
 * @param logName Log name
 * @param data Log entry data
 * @param options Log entry options
 * @returns Promise that resolves to the log entry ID and timestamp
 */
public async appendLogEntry(
  tenantId: string,
  logName: string,
  data: any,
  options: LogEntryOptions = {}
): Promise<{ id: string; timestamp: string }> {
  try {
    // Get the log
    const log = await this.getLog(tenantId, logName);

    // Create the log entry
    const timestamp = new Date().toISOString();
    const id = uuidv4();

    const logEntry: LogEntry = {
      id,
      logId: log.id,
      tenantId,
      data,
      timestamp,
      searchTokens: options.searchTokens || [],
      encryptionInfo: options.encryptionInfo
    };

    // Store in the database
    await this.storageAdapter.appendLogEntry(logEntry);

    // Update statistics
    await this.statisticsService.incrementLogEntryCount(tenantId, logName);

    return {
      id,
      timestamp
    };
  } catch (error) {
    logger.error(`Failed to append log entry to ${logName} for tenant ${tenantId}:`, error);
    throw new Error(`Failed to append log entry: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Getting Log Entries

```typescript
/**
 * Get log entries
 *
 * @param tenantId Tenant ID
 * @param logName Log name
 * @param limit Maximum number of entries to return
 * @param offset Offset for pagination
 * @returns Promise that resolves to the log entries
 */
public async getLogEntries(
  tenantId: string,
  logName: string,
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedResult<LogEntry>> {
  try {
    // Get the log
    const log = await this.getLog(tenantId, logName);

    // Get the log entries from the database
    const result = await this.storageAdapter.getLogEntries(
      tenantId,
      log.id,
      limit,
      offset
    );

    return result;
  } catch (error) {
    logger.error(`Failed to get log entries for ${logName} for tenant ${tenantId}:`, error);
    throw new Error(`Failed to get log entries: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

## Searching Log Entries

```typescript
/**
 * Search log entries
 *
 * @param tenantId Tenant ID
 * @param logName Log name
 * @param options Search options
 * @returns Promise that resolves to the search results
 */
public async searchLogEntries(
  tenantId: string,
  logName: string,
  options: LogSearchOptions
): Promise<PaginatedResult<LogEntry>> {
  try {
    // Get the log
    const log = await this.getLog(tenantId, logName);

    // Set default options
    const limit = options.limit || 10;
    const offset = options.offset || 0;

    // Search the log entries
    const result = await this.storageAdapter.searchLogEntries(
      tenantId,
      log.id,
      {
        query: options.query,
        searchTokens: options.searchTokens,
        startTime: options.startTime,
        endTime: options.endTime,
        limit,
        offset
      }
    );

    return result;
  } catch (error) {
    logger.error(`Failed to search log entries for ${logName} for tenant ${tenantId}:`, error);
    throw new Error(`Failed to search log entries: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```


