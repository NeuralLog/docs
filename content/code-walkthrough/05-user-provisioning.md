# User Provisioning

After setting up the admin and creating logs, the next step is to provision additional users who need access to the logs. This document walks through the code that provisions KEKs for regular users and grants them permissions to access logs.

## Overview

1. The admin provisions the KEK for a regular user
2. The admin grants permissions to the user to access specific logs
3. The regular user can now decrypt and read the logs they have permission to access

## Code Walkthrough

### Provisioning a KEK for a Regular User

The admin provisions the KEK for a regular user:

```typescript
// Admin provisions the KEK for a regular user
const regularUserId = 'user-123';
await client.provisionKEKForUser(regularUserId, firstKEKVersion.id);
```

This follows the same flow as when we provisioned the KEK for the admin, but with a different user ID. The `NeuralLogClient.provisionKEKForUser` method is called:

```typescript
public async provisionKEKForUser(userId: string, kekVersionId: string): Promise<void> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Provision KEK for user
    await this.keyHierarchyManager.provisionKEKForUser(
      userId,
      kekVersionId,
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to provision KEK for user: ${error instanceof Error ? error.message : String(error)}`,
      'provision_kek_failed'
    );
  }
}
```

### Granting Permissions to a User

The admin grants permissions to the user to access specific logs:

```typescript
// Admin grants permissions to the user
await client.grantPermission(regularUserId, 'read', 'logs/system-events');
await client.grantPermission(regularUserId, 'write', 'logs/user-activity');
```

This calls the `NeuralLogClient.grantPermission` method:

```typescript
public async grantPermission(userId: string, permission: string, resource: string): Promise<void> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Grant permission
    await this.authManager.grantPermission(
      userId,
      permission,
      resource,
      this.authManager.getAuthCredential()
    );
  } catch (error) {
    throw new LogError(
      `Failed to grant permission: ${error instanceof Error ? error.message : String(error)}`,
      'grant_permission_failed'
    );
  }
}
```

The `AuthManager.grantPermission` method makes an API call to the auth service:

```typescript
public async grantPermission(
  userId: string,
  permission: string,
  resource: string,
  authToken: string
): Promise<void> {
  try {
    await this.apiClient.post(
      `${this.baseUrl}/permissions`,
      {
        user_id: userId,
        permission,
        resource
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
  } catch (error) {
    throw new LogError(
      `Failed to grant permission: ${error instanceof Error ? error.message : String(error)}`,
      'grant_permission_failed'
    );
  }
}
```

### Regular User Authentication and Key Initialization

When a regular user logs in, they need to initialize their key hierarchy:

```typescript
// Regular user logs in
const userClient = new NeuralLogClient({
  tenantId: 'acme-corp',
  authUrl: 'https://auth.neurallog.com',
  logsUrl: 'https://logs.neurallog.com'
});

// Authenticate with username and password
await userClient.authenticateWithPassword('user@acme.com', 'user-password');

// Initialize the key hierarchy
await userClient.initializeKeyHierarchy();
```

The `NeuralLogClient.initializeKeyHierarchy` method initializes the key hierarchy:

```typescript
public async initializeKeyHierarchy(): Promise<void> {
  this.checkAuthentication();

  try {
    // Ensure endpoints are initialized
    await this.initialize();

    // Get KEK blobs for the current user
    const kekBlobs = await this.kekService.getUserKEKBlobs(
      this.authManager.getAuthCredential()
    );

    // Initialize the key hierarchy with the KEK blobs
    await this.keyHierarchyManager.initializeWithKEKBlobs(kekBlobs);
  } catch (error) {
    throw new LogError(
      `Failed to initialize key hierarchy: ${error instanceof Error ? error.message : String(error)}`,
      'initialize_key_hierarchy_failed'
    );
  }
}
```

The `KeyHierarchyManager.initializeWithKEKBlobs` method initializes the key hierarchy with the KEK blobs:

```typescript
public async initializeWithKEKBlobs(kekBlobs: any[]): Promise<void> {
  try {
    // Process each KEK blob
    for (const blob of kekBlobs) {
      try {
        // Parse the encrypted blob
        const parsedBlob = JSON.parse(blob.encryptedBlob);

        // Get the operational KEK
        const operationalKEK = this.cryptoService.base64ToArrayBuffer(parsedBlob.data);

        // Store the operational KEK
        this.cryptoService.setOperationalKEK(blob.kekVersionId, new Uint8Array(operationalKEK));

        // Set the current KEK version if not set or if this is a newer version
        if (!this.cryptoService.getCurrentKEKVersion() ||
            (blob.kekVersionId > this.cryptoService.getCurrentKEKVersion() &&
             await this.kekService.isKEKVersionActive(blob.kekVersionId, this.authManager.getAuthCredential()))) {
          this.cryptoService.setCurrentKEKVersion(blob.kekVersionId);
        }
      } catch (error) {
        console.error(`Failed to process KEK blob for version ${blob.kekVersionId}:`, error);
      }
    }

    if (!this.cryptoService.getCurrentKEKVersion()) {
      throw new Error('No valid KEK version found');
    }
  } catch (error) {
    throw new LogError(
      `Failed to initialize with KEK blobs: ${error instanceof Error ? error.message : String(error)}`,
      'initialize_with_kek_blobs_failed'
    );
  }
}
```

### Regular User Writing Logs

Once the regular user has initialized their key hierarchy, they can write logs:

```typescript
// User writes a log
const userLogData = {
  level: 'info',
  message: 'User logged in',
  timestamp: new Date().toISOString(),
  user: 'user@acme.com',
  action: 'login'
};

const userLogId = await userClient.log('user-activity', userLogData);
console.log('User Log ID:', userLogId);
```

This follows the same flow as when the admin created a log, but with a different log name and data.

## Security Considerations

- The operational KEK is encrypted before being stored on the server.
- The server never has access to the unencrypted operational KEK.
- Only administrators should be able to provision KEKs for users.
- Permissions are granted at the resource level, allowing fine-grained access control.
- Users can only access logs they have permission to access.

## Related Files

- [NeuralLogClient.ts](../code-snippets/typescript-client-sdk/src/client/NeuralLogClient.md) - Contains the client-side methods for provisioning KEKs and granting permissions.
- [KeyHierarchyManager.ts](../code-snippets/typescript-client-sdk/src/managers/KeyHierarchyManager.md) - Contains the methods for managing the key hierarchy.
- [AuthManager.ts](../code-snippets/typescript-client-sdk/src/auth/AuthManager.md) - Contains the methods for managing authentication and authorization.
- [KekService.ts](../code-snippets/typescript-client-sdk/src/auth/KekService.md) - Contains the methods for communicating with the auth service.
- [KEKBlobController.ts](../code-snippets/auth/src/controllers/KEKBlobController.md) - Contains the server-side methods for handling KEK blob requests.
- [PermissionController.ts](../code-snippets/auth/src/controllers/PermissionController.md) - Contains the server-side methods for handling permission requests.

## Next Steps

Once regular users are provisioned with KEKs and granted permissions, they can [read logs](./06-log-reading.md) that they have permission to access.
