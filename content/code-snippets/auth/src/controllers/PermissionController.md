# PermissionController.ts

This file contains the controller for permission operations in the auth service.

## Checking Permission

```typescript
/**
 * Check if a user has permission to perform an action on a resource
 * 
 * @param req Express request
 * @param res Express response
 */
public checkPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const schema = z.object({
      action: z.string(),
      resource: z.string()
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
    
    // Verify the user is authenticated
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
    
    // Check if the user has permission
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      validatedData.action,
      validatedData.resource
    );
    
    res.status(200).json({
      status: 'success',
      allowed: hasPermission
    });
  } catch (error) {
    logger.error('Error checking permission:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'check_permission_failed'
    });
  }
};
```

## Granting Permission

```typescript
/**
 * Grant permission to a user
 * 
 * @param req Express request
 * @param res Express response
 */
public grantPermission = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const schema = z.object({
      userId: z.string(),
      action: z.string(),
      resource: z.string()
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
    
    // Verify the user has permission to grant permissions
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
    
    // Check if the user has permission to grant permissions
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_grant',
      'permissions'
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Grant the permission
    await this.openFGAService.grant(
      tenantId,
      `user:${validatedData.userId}`,
      validatedData.action,
      validatedData.resource
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Permission granted successfully'
    });
  } catch (error) {
    logger.error('Error granting permission:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'grant_permission_failed'
    });
  }
};
```

## Revoking Permission

```typescript
/**
 * Revoke permission from a user
 * 
 * @param req Express request
 * @param res Express response
 */
public revokePermission = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const schema = z.object({
      userId: z.string(),
      action: z.string(),
      resource: z.string()
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
    
    // Verify the user has permission to revoke permissions
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
    
    // Check if the user has permission to revoke permissions
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_revoke',
      'permissions'
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Revoke the permission
    await this.openFGAService.revoke(
      tenantId,
      `user:${validatedData.userId}`,
      validatedData.action,
      validatedData.resource
    );
    
    res.status(200).json({
      status: 'success',
      message: 'Permission revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking permission:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'revoke_permission_failed'
    });
  }
};
```

## Getting User Permissions

```typescript
/**
 * Get permissions for a user
 * 
 * @param req Express request
 * @param res Express response
 */
public getUserPermissions = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get user ID from request
    const userId = req.params.userId;
    if (!userId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing user ID',
        code: 'missing_user_id'
      });
      return;
    }
    
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
    
    // Verify the user has permission to get permissions
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
    
    // Check if the user has permission to get permissions
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_read',
      'permissions'
    );
    
    if (!hasPermission && userInfo.id !== userId) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Get the permissions
    const permissions = await this.openFGAService.getUserPermissions(
      tenantId,
      `user:${userId}`
    );
    
    res.status(200).json({
      status: 'success',
      permissions
    });
  } catch (error) {
    logger.error('Error getting user permissions:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'get_user_permissions_failed'
    });
  }
};
```
