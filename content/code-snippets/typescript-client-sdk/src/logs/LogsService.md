# LogsService.ts

This file contains the service for interacting with the logs service.

## Creating a Log

```typescript
/**
 * Create a log
 * 
 * @param authToken Authentication token
 * @param name Log name
 * @param options Log creation options
 * @returns Promise that resolves to the created log
 */
public async createLog(
  authToken: string,
  name: string,
  options: LogCreateOptions = {}
): Promise<Log> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/logs`,
      {
        name,
        description: options.description,
        retentionDays: options.retentionDays,
        encryptionEnabled: options.encryptionEnabled
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data.log;
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
 * @param authToken Authentication token
 * @returns Promise that resolves to the logs
 */
public async getLogs(authToken: string): Promise<Log[]> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/logs`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data.logs;
  } catch (error) {
    throw new LogError(
      `Failed to get logs: ${error instanceof Error ? error.message : String(error)}`,
      'get_logs_failed'
    );
  }
}
```

## Getting a Log

```typescript
/**
 * Get a log
 * 
 * @param authToken Authentication token
 * @param name Log name
 * @returns Promise that resolves to the log
 */
public async getLog(authToken: string, name: string): Promise<Log> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/logs/${encodeURIComponent(name)}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data.log;
  } catch (error) {
    throw new LogError(
      `Failed to get log: ${error instanceof Error ? error.message : String(error)}`,
      'get_log_failed'
    );
  }
}
```

## Updating a Log

```typescript
/**
 * Update a log
 * 
 * @param authToken Authentication token
 * @param name Log name
 * @param options Log update options
 * @returns Promise that resolves to the updated log
 */
public async updateLog(
  authToken: string,
  name: string,
  options: LogUpdateOptions
): Promise<Log> {
  try {
    const response = await this.apiClient.put(
      `${this.baseUrl}/logs/${encodeURIComponent(name)}`,
      options,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data.log;
  } catch (error) {
    throw new LogError(
      `Failed to update log: ${error instanceof Error ? error.message : String(error)}`,
      'update_log_failed'
    );
  }
}
```

## Deleting a Log

```typescript
/**
 * Delete a log
 * 
 * @param authToken Authentication token
 * @param name Log name
 * @returns Promise that resolves when the log is deleted
 */
public async deleteLog(authToken: string, name: string): Promise<void> {
  try {
    await this.apiClient.delete(
      `${this.baseUrl}/logs/${encodeURIComponent(name)}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
  } catch (error) {
    throw new LogError(
      `Failed to delete log: ${error instanceof Error ? error.message : String(error)}`,
      'delete_log_failed'
    );
  }
}
```

## Appending a Log Entry

```typescript
/**
 * Append a log entry
 * 
 * @param authToken Authentication token
 * @param logName Log name
 * @param data Log entry data
 * @param options Log entry options
 * @returns Promise that resolves to the log entry ID
 */
public async appendLogEntry(
  authToken: string,
  logName: string,
  data: any,
  options: LogEntryOptions = {}
): Promise<{ id: string; timestamp: string }> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/logs/${encodeURIComponent(logName)}/entries`,
      {
        data,
        searchTokens: options.searchTokens,
        encryptionInfo: options.encryptionInfo
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return {
      id: response.data.id,
      timestamp: response.data.timestamp
    };
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
 * @param authToken Authentication token
 * @param logName Log name
 * @param limit Maximum number of entries to return
 * @param offset Offset for pagination
 * @returns Promise that resolves to the log entries
 */
public async getLogEntries(
  authToken: string,
  logName: string,
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedResult<LogEntry>> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/logs/${encodeURIComponent(logName)}/entries`,
      {
        params: {
          limit,
          offset
        },
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to get log entries: ${error instanceof Error ? error.message : String(error)}`,
      'get_log_entries_failed'
    );
  }
}
```

## Getting a Log Entry

```typescript
/**
 * Get a log entry
 * 
 * @param authToken Authentication token
 * @param logName Log name
 * @param entryId Log entry ID
 * @returns Promise that resolves to the log entry
 */
public async getLogEntry(
  authToken: string,
  logName: string,
  entryId: string
): Promise<LogEntry> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/logs/${encodeURIComponent(logName)}/entries/${entryId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data.entry;
  } catch (error) {
    throw new LogError(
      `Failed to get log entry: ${error instanceof Error ? error.message : String(error)}`,
      'get_log_entry_failed'
    );
  }
}
```

## Searching Log Entries

```typescript
/**
 * Search log entries
 * 
 * @param authToken Authentication token
 * @param logName Log name
 * @param options Search options
 * @returns Promise that resolves to the search results
 */
public async searchLogEntries(
  authToken: string,
  logName: string,
  options: LogSearchOptions
): Promise<PaginatedResult<LogEntry>> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/logs/${encodeURIComponent(logName)}/search`,
      options,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to search log entries: ${error instanceof Error ? error.message : String(error)}`,
      'search_log_entries_failed'
    );
  }
}
```

## Getting Log Statistics

```typescript
/**
 * Get log statistics
 * 
 * @param authToken Authentication token
 * @param logName Log name
 * @returns Promise that resolves to the log statistics
 */
public async getLogStatistics(
  authToken: string,
  logName: string
): Promise<LogStatistics> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/logs/${encodeURIComponent(logName)}/statistics`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data.statistics;
  } catch (error) {
    throw new LogError(
      `Failed to get log statistics: ${error instanceof Error ? error.message : String(error)}`,
      'get_log_statistics_failed'
    );
  }
}
```
