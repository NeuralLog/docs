# NeuralLogClient.ts

This file contains the main client interface for NeuralLog.

## Client Initialization

```typescript
/**
 * Create a new NeuralLogClient
 * 
 * @param options Client options
 */
constructor(options: NeuralLogClientOptions) {
  this.options = {
    ...DEFAULT_OPTIONS,
    ...options
  };
  
  // Create managers and services
  this.cryptoService = new CryptoService();
  this.authService = new AuthService(this.options.authUrl);
  this.logsService = new LogsService(this.options.logsUrl);
  this.kekService = new KekService(this.options.authUrl);
  
  this.authManager = new AuthManager(
    this.authService,
    this.cryptoService,
    this.kekService
  );
  
  this.keyHierarchyManager = new KeyHierarchyManager(
    this.cryptoService,
    this.kekService,
    this.authManager
  );
  
  this.logManager = new LogManager(
    this.logsService,
    this.cryptoService,
    this.authManager
  );
}
```

## Authentication

```typescript
/**
 * Authenticate with username and password
 * 
 * @param username Username
 * @param password Password
 * @returns Promise that resolves to the authentication response
 */
public async authenticateWithPassword(
  username: string,
  password: string
): Promise<AuthResponse> {
  try {
    // Authenticate with the auth service
    const response = await this.authManager.login(username, password);
    
    return response;
  } catch (error) {
    throw new LogError(
      `Authentication failed: ${error instanceof Error ? error.message : String(error)}`,
      'authentication_failed'
    );
  }
}
```

## Key Hierarchy Initialization

```typescript
/**
 * Initialize with recovery phrase
 * 
 * @param recoveryPhrase Recovery phrase
 * @returns Promise that resolves when initialization is complete
 */
public async initializeWithRecoveryPhrase(recoveryPhrase: string): Promise<void> {
  try {
    // Initialize the key hierarchy
    await this.keyHierarchyManager.initializeWithRecoveryPhrase(
      this.options.tenantId,
      recoveryPhrase
    );
  } catch (error) {
    throw new LogError(
      `Failed to initialize with recovery phrase: ${error instanceof Error ? error.message : String(error)}`,
      'initialize_with_recovery_phrase_failed'
    );
  }
}
```

## Logging

```typescript
/**
 * Log data
 * 
 * @param logName Log name
 * @param data Log data
 * @returns Promise that resolves to the log ID
 */
public async log(logName: string, data: any): Promise<string> {
  this.checkAuthentication();
  
  try {
    // Ensure endpoints are initialized
    await this.initialize();
    
    // Append log entry
    return await this.logManager.appendLogEntry(logName, data);
  } catch (error) {
    throw new LogError(
      `Failed to log data: ${error instanceof Error ? error.message : String(error)}`,
      'log_failed'
    );
  }
}
```

## Log Retrieval

```typescript
/**
 * Get logs
 * 
 * @param logName Log name
 * @param options Log retrieval options
 * @returns Promise that resolves to the logs
 */
public async getLogs(
  logName: string,
  options: LogRetrievalOptions = {}
): Promise<LogEntry[]> {
  this.checkAuthentication();
  
  try {
    // Ensure endpoints are initialized
    await this.initialize();
    
    // Get logs
    const result = await this.logManager.getLogEntries(
      logName,
      options.limit,
      options.offset
    );
    
    return result.entries;
  } catch (error) {
    throw new LogError(
      `Failed to get logs: ${error instanceof Error ? error.message : String(error)}`,
      'get_logs_failed'
    );
  }
}
```

## KEK Management

```typescript
/**
 * Create a new KEK version
 * 
 * @param version Version identifier
 * @returns Promise that resolves to the KEK version
 */
public async createKEKVersion(version: string): Promise<KEKVersion> {
  this.checkAuthentication();
  
  try {
    // Ensure endpoints are initialized
    await this.initialize();
    
    // Create KEK version
    return await this.keyHierarchyManager.createKEKVersion(version);
  } catch (error) {
    throw new LogError(
      `Failed to create KEK version: ${error instanceof Error ? error.message : String(error)}`,
      'create_kek_version_failed'
    );
  }
}
```

## User Provisioning

```typescript
/**
 * Provision KEK for a user
 * 
 * @param userId User ID
 * @param kekVersionId KEK version ID
 * @returns Promise that resolves when the KEK is provisioned
 */
public async provisionKEKForUser(
  userId: string,
  kekVersionId: string
): Promise<void> {
  this.checkAuthentication();
  
  try {
    // Ensure endpoints are initialized
    await this.initialize();
    
    // Provision KEK for user
    await this.keyHierarchyManager.provisionKEKForUser(
      userId,
      kekVersionId,
      this.authManager.getAuthToken()
    );
  } catch (error) {
    throw new LogError(
      `Failed to provision KEK for user: ${error instanceof Error ? error.message : String(error)}`,
      'provision_kek_failed'
    );
  }
}
```

## Permission Management

```typescript
/**
 * Grant permission to a user
 * 
 * @param userId User ID
 * @param permission Permission
 * @param resource Resource
 * @returns Promise that resolves when the permission is granted
 */
public async grantPermission(
  userId: string,
  permission: string,
  resource: string
): Promise<void> {
  this.checkAuthentication();
  
  try {
    // Ensure endpoints are initialized
    await this.initialize();
    
    // Grant permission
    await this.authManager.grantPermission(
      userId,
      permission,
      resource,
      this.authManager.getAuthToken()
    );
  } catch (error) {
    throw new LogError(
      `Failed to grant permission: ${error instanceof Error ? error.message : String(error)}`,
      'grant_permission_failed'
    );
  }
}
```
