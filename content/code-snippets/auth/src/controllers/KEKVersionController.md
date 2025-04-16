# KEKVersionController.ts

This file contains the controller for KEK version operations in the auth service.

## Getting KEK Versions

```typescript
/**
 * Get KEK versions
 * 
 * @param req Express request
 * @param res Express response
 */
public getKEKVersions = async (req: Request, res: Response): Promise<void> => {
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
    
    // Verify the user has permission to get KEK versions
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
    
    // Check if the user has permission to get KEK versions
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_read',
      'kek:versions'
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Get the KEK versions
    const kekVersions = await this.kekService.getKEKVersions(tenantId);
    
    res.status(200).json(kekVersions);
  } catch (error) {
    logger.error('Error getting KEK versions:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'get_kek_versions_failed'
    });
  }
};
```

## Getting Active KEK Version

```typescript
/**
 * Get active KEK version
 * 
 * @param req Express request
 * @param res Express response
 */
public getActiveKEKVersion = async (req: Request, res: Response): Promise<void> => {
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
    
    // Verify the user has permission to get the active KEK version
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
    
    // Check if the user has permission to get the active KEK version
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_read',
      'kek:versions'
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Get the active KEK version
    const activeKEKVersion = await this.kekService.getActiveKEKVersion(tenantId);
    
    res.status(200).json(activeKEKVersion);
  } catch (error) {
    logger.error('Error getting active KEK version:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'get_active_kek_version_failed'
    });
  }
};
```

## Creating KEK Version

```typescript
/**
 * Create KEK version
 * 
 * @param req Express request
 * @param res Express response
 */
public createKEKVersion = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const schema = z.object({
      id: z.string(),
      status: z.enum(['active', 'deprecated', 'revoked']),
      createdAt: z.string().optional()
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
    
    // Verify the user has permission to create a KEK version
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
    
    // Check if the user has permission to create a KEK version
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_create',
      'kek:versions'
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Create the KEK version
    const kekVersion = await this.kekService.createKEKVersion(
      tenantId,
      validatedData.id,
      validatedData.status,
      validatedData.createdAt || new Date().toISOString()
    );
    
    res.status(201).json(kekVersion);
  } catch (error) {
    logger.error('Error creating KEK version:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'create_kek_version_failed'
    });
  }
};
```

## Updating KEK Version Status

```typescript
/**
 * Update KEK version status
 * 
 * @param req Express request
 * @param res Express response
 */
public updateKEKVersionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get version ID from request
    const versionId = req.params.versionId;
    if (!versionId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing version ID',
        code: 'missing_version_id'
      });
      return;
    }
    
    // Validate request
    const schema = z.object({
      status: z.enum(['active', 'deprecated', 'revoked'])
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
    
    // Verify the user has permission to update a KEK version
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
    
    // Check if the user has permission to update a KEK version
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_update',
      'kek:versions'
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Update the KEK version status
    const kekVersion = await this.kekService.updateKEKVersionStatus(
      tenantId,
      versionId,
      validatedData.status
    );
    
    res.status(200).json(kekVersion);
  } catch (error) {
    logger.error('Error updating KEK version status:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'update_kek_version_status_failed'
    });
  }
};
```
