# NeuralLog: Zero-Knowledge RBAC Implementation

## Overview

NeuralLog implements a novel Role-Based Access Control (RBAC) system that operates entirely at the metadata level, maintaining zero-knowledge principles while providing powerful access control capabilities.

## Metadata-Level RBAC

### Core Concept

RBAC is implemented purely through metadata, without requiring the server to have access to encryption keys:

1. **Role Definitions**: Stored as metadata in Redis
2. **Permission Checks**: Performed against metadata
3. **Revocation**: Implemented as entries in revocation lists
4. **Audit Trail**: Complete history of all RBAC changes

### Redis Data Structure

The Redis instance for each tenant stores RBAC metadata:

```
tenant:{tenantId}:user:{userId} -> {
  "roles": ["developer", "viewer"],
  "permissions": ["logs:write", "logs:read"],
  "apiKeyVerifications": ["hash1", "hash2"]
}

tenant:{tenantId}:role:developer -> {
  "permissions": ["logs:write", "logs:read"]
}

tenant:{tenantId}:permission:{userId}:logs:write -> 1 (exists if granted)
```

## Role Management

### Role Definition

```javascript
// Client-side
async function defineRole(roleName, permissions, tenantId, masterSecret) {
  // Generate role verification material
  const keyHierarchy = new RBACKeyHierarchy(masterSecret);
  const roleVerification = await generateVerificationHash(
    keyHierarchy.getRoleKey(tenantId, roleName)
  );
  
  // Send role definition to server
  await fetch(`/api/roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({
      name: roleName,
      permissions,
      verification: roleVerification
    })
  });
}

// Server-side
async function handleRoleDefinition(req, res) {
  const { name, permissions, verification } = req.body;
  const { tenantId } = req.headers;
  
  const redis = getRedisForTenant(tenantId);
  
  // Store role definition
  await redis.hset(
    `tenant:${tenantId}:role:${name}`,
    {
      permissions: JSON.stringify(permissions),
      verification,
      createdAt: Date.now(),
      createdBy: req.user.id
    }
  );
  
  res.json({ success: true });
}
```

### Role Assignment

```javascript
// Client-side
async function assignRoleToUser(userId, roleName, tenantId, masterSecret) {
  // Generate user-role verification material
  const keyHierarchy = new RBACKeyHierarchy(masterSecret);
  const userRoleVerification = await generateVerificationHash(
    keyHierarchy.getUserRoleKey(tenantId, userId, roleName)
  );
  
  // Send role assignment to server
  await fetch(`/api/users/${userId}/roles`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({
      role: roleName,
      verification: userRoleVerification
    })
  });
}

// Server-side
async function handleRoleAssignment(req, res) {
  const { userId } = req.params;
  const { role, verification } = req.body;
  const { tenantId } = req.headers;
  
  const redis = getRedisForTenant(tenantId);
  
  // Store role assignment
  await redis.sadd(`tenant:${tenantId}:user:${userId}:roles`, role);
  
  // Store verification
  await redis.hset(
    `tenant:${tenantId}:user:${userId}:role:${role}`,
    {
      verification,
      assignedAt: Date.now(),
      assignedBy: req.user.id
    }
  );
  
  // Get role permissions
  const roleData = await redis.hgetall(`tenant:${tenantId}:role:${role}`);
  const permissions = JSON.parse(roleData.permissions || '[]');
  
  // Grant permissions
  for (const permission of permissions) {
    await redis.set(
      `tenant:${tenantId}:permission:${userId}:${permission}`,
      1
    );
  }
  
  res.json({ success: true });
}
```

## Permission Checking

```javascript
// Server-side
async function checkPermission(redis, userId, permission, tenantId) {
  // Check direct permission
  const hasDirectPermission = await redis.exists(
    `tenant:${tenantId}:permission:${userId}:${permission}`
  );
  
  if (hasDirectPermission) {
    return true;
  }
  
  // Check wildcard permission
  const hasWildcardPermission = await redis.exists(
    `tenant:${tenantId}:permission:${userId}:*`
  );
  
  if (hasWildcardPermission) {
    return true;
  }
  
  // Check resource wildcard
  const [resource] = permission.split(':');
  const hasResourceWildcard = await redis.exists(
    `tenant:${tenantId}:permission:${userId}:${resource}:*`
  );
  
  return hasResourceWildcard;
}
```

## Role Revocation

```javascript
// Client-side
async function revokeRoleFromUser(userId, roleName, tenantId, masterSecret) {
  // Generate revocation signature
  const keyHierarchy = new RBACKeyHierarchy(masterSecret);
  const revocationSignature = await signRevocation(
    keyHierarchy.deriveKey('master/revocation'),
    `tenant/${tenantId}/user/${userId}/role/${roleName}`
  );
  
  // Send revocation to server
  await fetch(`/api/users/${userId}/roles/${roleName}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({
      revocationSignature
    })
  });
}

// Server-side
async function handleRoleRevocation(req, res) {
  const { userId, roleName } = req.params;
  const { revocationSignature } = req.body;
  const { tenantId } = req.headers;
  
  const redis = getRedisForTenant(tenantId);
  
  // Store revocation
  await redis.hset(
    `tenant:${tenantId}:revoked:user:${userId}:role:${roleName}`,
    {
      revokedAt: Date.now(),
      revokedBy: req.user.id,
      signature: revocationSignature
    }
  );
  
  // Remove role assignment
  await redis.srem(`tenant:${tenantId}:user:${userId}:roles`, roleName);
  
  // Get role permissions
  const roleData = await redis.hgetall(`tenant:${tenantId}:role:${roleName}`);
  const permissions = JSON.parse(roleData.permissions || '[]');
  
  // Revoke permissions
  for (const permission of permissions) {
    await redis.del(`tenant:${tenantId}:permission:${userId}:${permission}`);
  }
  
  res.json({ success: true });
}
```

## Resource-Level RBAC

```javascript
// Client-side
async function setResourcePermissions(resourceType, resourceId, permissions, tenantId, masterSecret) {
  // Generate resource permission verification
  const keyHierarchy = new RBACKeyHierarchy(masterSecret);
  const resourceVerification = await generateVerificationHash(
    keyHierarchy.getResourceKey(tenantId, resourceType, resourceId)
  );
  
  // Send resource permissions to server
  await fetch(`/api/resources/${resourceType}/${resourceId}/permissions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({
      permissions,
      verification: resourceVerification
    })
  });
}

// Server-side
async function handleResourcePermissions(req, res) {
  const { resourceType, resourceId } = req.params;
  const { permissions, verification } = req.body;
  const { tenantId } = req.headers;
  
  const redis = getRedisForTenant(tenantId);
  
  // Store resource permissions
  await redis.hset(
    `tenant:${tenantId}:resource:${resourceType}:${resourceId}`,
    {
      permissions: JSON.stringify(permissions),
      verification,
      updatedAt: Date.now(),
      updatedBy: req.user.id
    }
  );
  
  res.json({ success: true });
}
```

## API Key RBAC

```javascript
// Client-side
async function createApiKeyWithPermissions(name, permissions, tenantId, userId, password) {
  // Recreate the key hierarchy
  const userKeyHierarchy = new UserKeyHierarchy(password, userId);
  
  // Generate a unique key ID
  const keyId = generateId();
  
  // Generate the API key
  const apiKey = userKeyHierarchy.getApiKey(tenantId, keyId);
  
  // Generate verification hash
  const apiKeyVerification = await generateVerificationHash(apiKey);
  
  // Get auth token from browser
  const authToken = localStorage.getItem('auth_token');
  
  // Send API key creation request
  await fetch(`/api/apikeys`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({
      name,
      keyId,
      verification: apiKeyVerification,
      permissions
    })
  });
  
  return { apiKey, keyId };
}

// Server-side
async function handleApiKeyCreation(req, res) {
  const { name, keyId, verification, permissions } = req.body;
  const { tenantId } = req.headers;
  const userId = req.user.id;
  
  const redis = getRedisForTenant(tenantId);
  
  // Store API key metadata
  await redis.hset(
    `tenant:${tenantId}:apikey:${keyId}`,
    {
      name,
      userId,
      verification,
      permissions: JSON.stringify(permissions),
      createdAt: Date.now()
    }
  );
  
  // Add to user's API keys
  await redis.sadd(`tenant:${tenantId}:user:${userId}:apikeys`, keyId);
  
  res.json({ success: true, keyId });
}
```

## Audit Trail

```javascript
// Server-side
async function logRbacChange(redis, tenantId, changeType, details, userId) {
  const changeId = generateId();
  
  await redis.hset(
    `tenant:${tenantId}:rbac:audit:${changeId}`,
    {
      type: changeType,
      details: JSON.stringify(details),
      timestamp: Date.now(),
      userId
    }
  );
  
  await redis.zadd(
    `tenant:${tenantId}:rbac:audit:timeline`,
    Date.now(),
    changeId
  );
}
```

## Security Properties

NeuralLog's RBAC implementation provides:

1. **Zero Knowledge**: Server never possesses keys or plaintext
2. **Flexible Access Control**: Full RBAC capabilities
3. **Efficient Revocation**: Immediate through metadata updates
4. **Audit Trail**: Complete history of all RBAC changes
5. **Hierarchical Control**: RBAC at any level of the key hierarchy

## Implementation Guidelines

1. **Verification Strength**: Use strong verification algorithms
2. **Metadata Protection**: Protect metadata from unauthorized access
3. **Consistent Checks**: Apply RBAC checks consistently across all endpoints
4. **Principle of Least Privilege**: Grant minimal necessary permissions
5. **Regular Audits**: Review RBAC configurations and audit logs regularly
