# KEKBlobController.ts

This file contains the controller for KEK blob operations in the auth service.

## Getting KEK Blobs

```typescript
/**
 * Get KEK blobs for the current user
 * 
 * @param req Express request
 * @param res Express response
 */
public getKEKBlobs = async (req: Request, res: Response): Promise<void> => {
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
    
    // Get the KEK blobs for the user
    const kekBlobs = await this.kekService.getKEKBlobs(
      tenantId,
      userInfo.id
    );
    
    res.status(200).json(kekBlobs);
  } catch (error) {
    logger.error('Error getting KEK blobs:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'get_kek_blobs_failed'
    });
  }
};
```

## Provisioning KEK Blob

```typescript
/**
 * Provision a KEK blob for a user
 * 
 * @param req Express request
 * @param res Express response
 */
public provisionKEKBlob = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request
    const schema = z.object({
      userId: z.string(),
      kekVersion: z.string(),
      encryptedKEK: z.string()
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
    
    // Verify the user has permission to provision a KEK blob
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
    
    // Check if the user has permission to provision a KEK blob
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_provision',
      'kek:blobs'
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Provision the KEK blob
    const kekBlob = await this.kekService.provisionKEKBlob(
      tenantId,
      validatedData.userId,
      validatedData.kekVersion,
      validatedData.encryptedKEK
    );
    
    res.status(201).json(kekBlob);
  } catch (error) {
    logger.error('Error provisioning KEK blob:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'provision_kek_blob_failed'
    });
  }
};
```

## Revoking KEK Blob

```typescript
/**
 * Revoke a KEK blob
 * 
 * @param req Express request
 * @param res Express response
 */
public revokeKEKBlob = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get blob ID from request
    const blobId = req.params.blobId;
    if (!blobId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing blob ID',
        code: 'missing_blob_id'
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
    
    // Verify the user has permission to revoke a KEK blob
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
    
    // Check if the user has permission to revoke a KEK blob
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_revoke',
      'kek:blobs'
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    // Revoke the KEK blob
    await this.kekService.revokeKEKBlob(
      tenantId,
      blobId
    );
    
    res.status(200).json({
      status: 'success',
      message: 'KEK blob revoked successfully'
    });
  } catch (error) {
    logger.error('Error revoking KEK blob:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'revoke_kek_blob_failed'
    });
  }
};
```

## Getting KEK Blob

```typescript
/**
 * Get a KEK blob
 * 
 * @param req Express request
 * @param res Express response
 */
public getKEKBlob = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get blob ID from request
    const blobId = req.params.blobId;
    if (!blobId) {
      res.status(400).json({
        status: 'error',
        message: 'Missing blob ID',
        code: 'missing_blob_id'
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
    
    // Verify the user has permission to get a KEK blob
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
    
    // Get the KEK blob
    const kekBlob = await this.kekService.getKEKBlob(
      tenantId,
      blobId
    );
    
    // Check if the user has permission to get this KEK blob
    const hasPermission = await this.openFGAService.check(
      tenantId,
      `user:${userInfo.id}`,
      'can_read',
      `kek:blobs/${kekBlob.id}`
    );
    
    if (!hasPermission) {
      res.status(403).json({
        status: 'error',
        message: 'Forbidden',
        code: 'forbidden'
      });
      return;
    }
    
    res.status(200).json(kekBlob);
  } catch (error) {
    logger.error('Error getting KEK blob:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      code: 'get_kek_blob_failed'
    });
  }
};
```
