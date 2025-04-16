# LogController.ts

This file contains the controller for log operations in the log server.

## Creating a Log

```typescript
/**
 * Create a new log
 * 
 * @param req Express request
 * @param res Express response
 */
public createLog = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const schema = z.object({
      name: z.string(),
      description: z.string().optional(),
      retentionDays: z.number().positive().optional(),
      encryptionEnabled: z.boolean().optional()
    });

    const validatedData = validateRequest(req.body, schema);
    
    // Get tenant ID from request
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing tenant ID',
        code: 'missing_tenant_id'
      });
      return;
    }
    
    // Verify the user has permission to create logs
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        code: 'unauthorized'
      });
      return;
    }
    
    const userInfo = await this.authService.validateToken(token);
    if (!userInfo) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'invalid_token'
      });
      return;
    }
    
    // Check if the user has permission to create logs
    const hasPermission = await this.authService.checkPermission(
      token,
      'create',
      `logs`
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Create the log
    const log = await this.logService.createLog(
      tenantId,
      validatedData.name,
      {
        description: validatedData.description,
        retentionDays: validatedData.retentionDays,
        encryptionEnabled: validatedData.encryptionEnabled
      }
    );
    
    res.status(201).json({
      status: 'success',
      log
    });
  } catch (error) {
    logger.error('Error creating log:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'create_log_failed'
    });
  }
};
```

## Getting Logs

```typescript
/**
 * Get logs
 * 
 * @param req Express request
 * @param res Express response
 */
public getLogs = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get tenant ID from request
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing tenant ID',
        code: 'missing_tenant_id'
      });
      return;
    }
    
    // Verify the user has permission to get logs
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        code: 'unauthorized'
      });
      return;
    }
    
    const userInfo = await this.authService.validateToken(token);
    if (!userInfo) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'invalid_token'
      });
      return;
    }
    
    // Check if the user has permission to get logs
    const hasPermission = await this.authService.checkPermission(
      token,
      'read',
      `logs`
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Get the logs
    const logs = await this.logService.getLogs(tenantId);
    
    res.status(200).json({
      status: 'success',
      logs
    });
  } catch (error) {
    logger.error('Error getting logs:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'get_logs_failed'
    });
  }
};
```

## Appending a Log Entry

```typescript
/**
 * Append a log entry
 * 
 * @param req Express request
 * @param res Express response
 */
public appendLogEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get log name from request
    const logName = req.params.logName;
    if (!logName) {
      res.status(400).json({
        status: 'error',
        message: 'Missing log name',
        code: 'missing_log_name'
      });
      return;
    }
    
    // Validate request
    const schema = z.object({
      data: z.any(),
      searchTokens: z.array(z.string()).optional(),
      encryptionInfo: z.object({
        version: z.string(),
        algorithm: z.string()
      }).optional()
    });

    const validatedData = validateRequest(req.body, schema);
    
    // Get tenant ID from request
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing tenant ID',
        code: 'missing_tenant_id'
      });
      return;
    }
    
    // Verify the user has permission to append to the log
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        code: 'unauthorized'
      });
      return;
    }
    
    const userInfo = await this.authService.validateToken(token);
    if (!userInfo) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'invalid_token'
      });
      return;
    }
    
    // Check if the user has permission to append to the log
    const hasPermission = await this.authService.checkPermission(
      token,
      'append',
      `logs/${logName}`
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Append the log entry
    const result = await this.logService.appendLogEntry(
      tenantId,
      logName,
      validatedData.data,
      {
        searchTokens: validatedData.searchTokens,
        encryptionInfo: validatedData.encryptionInfo
      }
    );
    
    res.status(201).json({
      status: 'success',
      id: result.id,
      timestamp: result.timestamp
    });
  } catch (error) {
    logger.error('Error appending log entry:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'append_log_entry_failed'
    });
  }
};
```

## Getting Log Entries

```typescript
/**
 * Get log entries
 * 
 * @param req Express request
 * @param res Express response
 */
public getLogEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get log name from request
    const logName = req.params.logName;
    if (!logName) {
      res.status(400).json({
        status: 'error',
        message: 'Missing log name',
        code: 'missing_log_name'
      });
      return;
    }
    
    // Validate query parameters
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Get tenant ID from request
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing tenant ID',
        code: 'missing_tenant_id'
      });
      return;
    }
    
    // Verify the user has permission to read the log
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        code: 'unauthorized'
      });
      return;
    }
    
    const userInfo = await this.authService.validateToken(token);
    if (!userInfo) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'invalid_token'
      });
      return;
    }
    
    // Check if the user has permission to read the log
    const hasPermission = await this.authService.checkPermission(
      token,
      'read',
      `logs/${logName}`
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Get the log entries
    const result = await this.logService.getLogEntries(
      tenantId,
      logName,
      limit,
      offset
    );
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    logger.error('Error getting log entries:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'get_log_entries_failed'
    });
  }
};
```

## Searching Log Entries

```typescript
/**
 * Search log entries
 * 
 * @param req Express request
 * @param res Express response
 */
public searchLogEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get log name from request
    const logName = req.params.logName;
    if (!logName) {
      res.status(400).json({
        status: 'error',
        message: 'Missing log name',
        code: 'missing_log_name'
      });
      return;
    }
    
    // Validate request
    const schema = z.object({
      query: z.string().optional(),
      searchTokens: z.array(z.string()).optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      limit: z.number().positive().optional(),
      offset: z.number().nonnegative().optional()
    });

    const validatedData = validateRequest(req.body, schema);
    
    // Get tenant ID from request
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing tenant ID',
        code: 'missing_tenant_id'
      });
      return;
    }
    
    // Verify the user has permission to search the log
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({
        status: 'error',
        message: 'Unauthorized',
        code: 'unauthorized'
      });
      return;
    }
    
    const userInfo = await this.authService.validateToken(token);
    if (!userInfo) {
      res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        code: 'invalid_token'
      });
      return;
    }
    
    // Check if the user has permission to search the log
    const hasPermission = await this.authService.checkPermission(
      token,
      'search',
      `logs/${logName}`
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Search the log entries
    const result = await this.logService.searchLogEntries(
      tenantId,
      logName,
      {
        query: validatedData.query,
        searchTokens: validatedData.searchTokens,
        startTime: validatedData.startTime,
        endTime: validatedData.endTime,
        limit: validatedData.limit || 10,
        offset: validatedData.offset || 0
      }
    );
    
    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    logger.error('Error searching log entries:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'search_log_entries_failed'
    });
  }
};
```
