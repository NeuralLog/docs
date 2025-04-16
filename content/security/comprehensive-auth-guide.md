---
sidebar_position: 2
---

# Comprehensive Authentication and Authorization Guide

This guide provides a detailed overview of NeuralLog's authentication and authorization system, including architecture, implementation details, best practices, and integration patterns.

## Introduction

NeuralLog implements a robust, zero-knowledge authentication and authorization system that ensures secure access to resources while maintaining the privacy of sensitive data. This guide explains how the system works and how to integrate it into your applications.

## Architecture Overview

### Components

NeuralLog's authentication and authorization system consists of the following components:

1. **Auth Service**: A centralized service that handles authentication, authorization, and key management.
2. **Client SDK**: Client libraries that handle authentication, key derivation, and secure communication.
3. **OpenFGA**: A fine-grained authorization system that manages access control.
4. **Redis**: Stores authentication metadata, verification hashes, and encrypted KEK blobs.
5. **PostgreSQL**: Persistent storage for OpenFGA authorization models and relationships.

### Authentication Flow

The authentication flow in NeuralLog follows these steps:

1. **Client Authentication**: The client authenticates with the Auth Service using one of the supported methods (API key, JWT, interactive login).
2. **Token Issuance**: Upon successful authentication, the Auth Service issues a token that includes the user's identity and tenant information.
3. **Resource Access**: The client includes the token in requests to NeuralLog services.
4. **Token Verification**: NeuralLog services verify the token with the Auth Service.
5. **Authorization Check**: If the token is valid, the service checks if the user has the necessary permissions.
6. **Resource Delivery**: If authorized, the service delivers the requested resource.

### Authorization Model

NeuralLog uses OpenFGA for fine-grained authorization:

1. **Relationship-based**: Authorization is based on relationships between users and resources.
2. **Multi-tenant**: Each tenant has its own authorization model.
3. **Hierarchical**: Resources can have hierarchical relationships.
4. **Contextual**: Authorization decisions can consider context (e.g., time, location).

## Authentication Methods

### API Key Authentication

API key authentication is suitable for server-side applications and automated processes:

```typescript
// Client-side
const client = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key'
});

// Server-side verification
app.use(async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const tenantId = req.headers['x-tenant-id'];

  if (!apiKey || !tenantId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const isValid = await verifyApiKey(apiKey, tenantId);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Add user info to request
    req.user = {
      tenantId,
      authenticated: true,
      authMethod: 'apiKey'
    };

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication service unavailable' });
  }
});
```

### JWT Authentication

JWT authentication is suitable for web applications and services:

```typescript
// Client-side
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  auth: {
    type: 'jwt'
  }
});

await client.auth.login();

// Server-side verification
app.use(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = await verifyJwt(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Add user info to request
    req.user = {
      id: decoded.sub,
      tenantId: decoded.tenant_id,
      authenticated: true,
      authMethod: 'jwt'
    };

    next();
  } catch (error) {
    return res.status(500).json({ error: 'Authentication service unavailable' });
  }
});
```

### Interactive Authentication

Interactive authentication is suitable for web applications with user interaction:

```typescript
// Client-side
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  auth: {
    type: 'interactive'
  }
});

// Redirect to login page
await client.auth.login();

// After successful login, the user is redirected back to the application
// The client SDK automatically handles the token exchange
```

### Auth0 Integration

NeuralLog can be integrated with Auth0 for authentication:

```typescript
// Client-side
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  auth: {
    type: 'auth0',
    domain: 'your-auth0-domain.auth0.com',
    clientId: 'your-auth0-client-id',
    audience: 'https://api.neurallog.app'
  }
});

// Login with Auth0
await client.auth.login();
```

## Authorization Implementation

### OpenFGA Setup

NeuralLog uses OpenFGA for fine-grained authorization. Here's how to set it up:

```typescript
// Define the authorization model
const authorizationModel = {
  type_definitions: [
    {
      type: 'user',
      relations: {}
    },
    {
      type: 'tenant',
      relations: {
        admin: {
          this: {}
        },
        member: {
          this: {}
        }
      }
    },
    {
      type: 'log',
      relations: {
        reader: {
          this: {}
        },
        writer: {
          this: {}
        },
        admin: {
          this: {}
        }
      }
    }
  ]
};

// Create the model
await fgaClient.writeAuthorizationModel(authorizationModel);

// Add relationships
await fgaClient.write({
  writes: [
    {
      user: 'user:alice',
      relation: 'admin',
      object: 'tenant:acme'
    },
    {
      user: 'user:bob',
      relation: 'member',
      object: 'tenant:acme'
    },
    {
      user: 'user:alice',
      relation: 'admin',
      object: 'log:acme/application-logs'
    },
    {
      user: 'user:bob',
      relation: 'reader',
      object: 'log:acme/application-logs'
    }
  ]
});

// Check permissions
const check = await fgaClient.check({
  user: 'user:bob',
  relation: 'reader',
  object: 'log:acme/application-logs'
});

console.log(`Bob can read application logs: ${check.allowed}`);
```

### Role-Based Access Control

NeuralLog supports role-based access control (RBAC) through OpenFGA:

```typescript
// Define roles
const roles = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
  READONLY: 'readonly'
};

// Define permissions for each role
const rolePermissions = {
  [roles.ADMIN]: [
    'logs:read',
    'logs:write',
    'logs:delete',
    'users:read',
    'users:write',
    'users:delete',
    'settings:read',
    'settings:write',
    'invitations:create'
  ],
  [roles.MANAGER]: [
    'logs:read',
    'logs:write',
    'users:read',
    'settings:read',
    'invitations:create'
  ],
  [roles.USER]: [
    'logs:read',
    'logs:write'
  ],
  [roles.READONLY]: [
    'logs:read'
  ]
};

// Assign roles to users
await fgaClient.write({
  writes: [
    {
      user: 'user:alice',
      relation: roles.ADMIN,
      object: 'tenant:acme'
    },
    {
      user: 'user:bob',
      relation: roles.USER,
      object: 'tenant:acme'
    }
  ]
});

// Check if a user has a specific permission
async function hasPermission(userId, permission, tenantId) {
  // Get user's role
  const userRole = await getUserRole(userId, tenantId);

  // Check if the role has the permission
  return rolePermissions[userRole]?.includes(permission) || false;
}

// Example usage
const canBobWriteLogs = await hasPermission('bob', 'logs:write', 'acme');
console.log(`Bob can write logs: ${canBobWriteLogs}`);
```

### Attribute-Based Access Control

NeuralLog also supports attribute-based access control (ABAC) through OpenFGA:

```typescript
// Define attributes
const attributes = {
  LOG_LEVEL: 'log_level',
  LOG_SOURCE: 'log_source',
  LOG_ENVIRONMENT: 'log_environment'
};

// Define attribute-based policies
const policies = [
  {
    name: 'developers-can-read-dev-logs',
    condition: (user, resource) => {
      return user.role === 'developer' && resource.environment === 'development';
    },
    permission: 'read'
  },
  {
    name: 'ops-can-read-all-logs',
    condition: (user, resource) => {
      return user.role === 'ops';
    },
    permission: 'read'
  },
  {
    name: 'admins-can-do-everything',
    condition: (user, resource) => {
      return user.role === 'admin';
    },
    permission: 'read,write,delete'
  }
];

// Check if a user has permission based on attributes
async function checkAttributeBasedPermission(userId, permission, resourceId, context) {
  // Get user attributes
  const user = await getUserAttributes(userId);

  // Get resource attributes
  const resource = await getResourceAttributes(resourceId);

  // Check policies
  for (const policy of policies) {
    if (policy.condition(user, resource) && policy.permission.includes(permission)) {
      return true;
    }
  }

  return false;
}

// Example usage
const canAliceReadProdLogs = await checkAttributeBasedPermission(
  'alice',
  'read',
  'production-logs',
  { ip: '192.168.1.1', time: new Date() }
);
console.log(`Alice can read production logs: ${canAliceReadProdLogs}`);
```

## Multi-Tenant Authorization

NeuralLog implements multi-tenant authorization to ensure complete isolation between tenants:

```typescript
// Define tenant-specific authorization model
const tenantAuthorizationModel = {
  type_definitions: [
    {
      type: 'user',
      relations: {}
    },
    {
      type: 'log',
      relations: {
        reader: {
          this: {}
        },
        writer: {
          this: {}
        },
        admin: {
          this: {}
        }
      }
    }
  ]
};

// Create tenant-specific model
await fgaClient.writeAuthorizationModel(tenantAuthorizationModel, {
  storeId: `tenant-${tenantId}`
});

// Add tenant-specific relationships
await fgaClient.write({
  writes: [
    {
      user: `user:${userId}`,
      relation: 'reader',
      object: `log:${logId}`
    }
  ]
}, {
  storeId: `tenant-${tenantId}`
});

// Check tenant-specific permissions
const check = await fgaClient.check({
  user: `user:${userId}`,
  relation: 'reader',
  object: `log:${logId}`
}, {
  storeId: `tenant-${tenantId}`
});

console.log(`User can read log: ${check.allowed}`);
```

## Zero-Knowledge Authentication

NeuralLog implements zero-knowledge authentication to ensure that sensitive data is never exposed:

```typescript
// Client-side key derivation
async function deriveAuthenticationKey(password, salt) {
  // Use PBKDF2 to derive a key from the password
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  // Derive the authentication key
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(salt),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256', length: 256 },
    true,
    ['sign']
  );
}

// Client-side authentication
async function authenticateWithZeroKnowledge(username, password) {
  // Get salt for the user
  const response = await fetch(`/api/auth/salt?username=${encodeURIComponent(username)}`);
  const { salt, challenge } = await response.json();

  // Derive authentication key
  const authKey = await deriveAuthenticationKey(password, salt);

  // Sign the challenge
  const signature = await crypto.subtle.sign(
    'HMAC',
    authKey,
    new TextEncoder().encode(challenge)
  );

  // Convert signature to base64
  const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)));

  // Send the signature to the server
  const authResponse = await fetch('/api/auth/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      challenge,
      signature: signatureBase64
    })
  });

  // Get the authentication result
  const { token } = await authResponse.json();

  return token;
}
```

## API Key Management

API keys are a critical part of NeuralLog's authentication system, allowing secure programmatic access to NeuralLog services. The logs server, client SDK, and MCP client all use API keys for authentication.

### Creating API Keys

Administrators can create API keys for users:

```typescript
// Create an API key
async function createApiKey(userId, name, permissions) {
  // Generate a random API key
  const apiKey = generateRandomString(32);

  // Derive a verification hash from the API key
  const verificationHash = await deriveVerificationHash(apiKey);

  // Store the verification hash in the database
  await db.apiKeys.create({
    userId,
    name,
    verificationHash,
    permissions,
    createdAt: new Date()
  });

  // Return the API key (this is the only time it will be available)
  return apiKey;
}

// Generate a random string
function generateRandomString(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

// Derive a verification hash from an API key
async function deriveVerificationHash(apiKey) {
  // Use Argon2id with high work factor
  return argon2.hash({
    pass: apiKey,
    salt: generateRandomSalt(),
    type: argon2.ArgonType.Argon2id,
    time: 3,
    mem: 4096,
    hashLen: 32
  });
}
```

### Verifying API Keys

NeuralLog verifies API keys without storing the actual keys:

```typescript
// Verify an API key
async function verifyApiKey(apiKey, tenantId) {
  // Get the verification hash from the database
  const apiKeyRecord = await db.apiKeys.findFirst({
    where: {
      tenantId,
      revoked: false
    }
  });

  if (!apiKeyRecord) {
    return false;
  }

  // Verify the API key against the hash
  return await argon2.verify({
    pass: apiKey,
    hash: apiKeyRecord.verificationHash
  });
}
```

### Revoking API Keys

Administrators can revoke API keys:

```typescript
// Revoke an API key
async function revokeApiKey(apiKeyId, reason) {
  // Update the API key record
  await db.apiKeys.update({
    where: { id: apiKeyId },
    data: {
      revoked: true,
      revokedAt: new Date(),
      revocationReason: reason
    }
  });

  // Add to revocation list for immediate effect
  await redis.set(`revoked:apikey:${apiKeyId}`, '1');
}
```

## Token Management

### Token Issuance

The Auth Service issues tokens upon successful authentication:

```typescript
// Issue a token
async function issueToken(userId, tenantId, scope) {
  // Create token payload
  const payload = {
    sub: userId,
    tenant_id: tenantId,
    scope,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiration
  };

  // Sign the token
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    algorithm: 'RS256'
  });

  return token;
}
```

### Token Verification

NeuralLog services verify tokens with the Auth Service:

```typescript
// Verify a token
async function verifyToken(token) {
  try {
    // Verify the token signature
    const decoded = jwt.verify(token, process.env.JWT_PUBLIC_KEY, {
      algorithms: ['RS256']
    });

    // Check if the token is revoked
    const isRevoked = await redis.exists(`revoked:token:${decoded.jti}`);
    if (isRevoked) {
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
}
```

### Token Revocation

Administrators can revoke tokens:

```typescript
// Revoke a token
async function revokeToken(token, reason) {
  try {
    // Decode the token (without verification)
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.jti) {
      return false;
    }

    // Add to revocation list
    await redis.set(`revoked:token:${decoded.jti}`, '1');

    // Set expiration to match token expiration
    if (decoded.exp) {
      const ttl = decoded.exp - Math.floor(Date.now() / 1000);
      if (ttl > 0) {
        await redis.expire(`revoked:token:${decoded.jti}`, ttl);
      }
    }

    return true;
  } catch (error) {
    return false;
  }
}
```

## User Management

### User Registration

NeuralLog supports secure user registration:

```typescript
// Register a new user
async function registerUser(username, password, email, tenantId) {
  // Generate a salt
  const salt = generateRandomSalt();

  // Derive a verification hash from the password
  const verificationHash = await deriveVerificationHash(password, salt);

  // Create the user
  const user = await db.users.create({
    data: {
      username,
      email,
      verificationHash,
      salt,
      tenantId,
      createdAt: new Date()
    }
  });

  // Assign default role
  await assignRole(user.id, 'user', tenantId);

  return user;
}
```

### User Authentication

Users can authenticate with username and password:

```typescript
// Authenticate a user
async function authenticateUser(username, password) {
  // Get the user from the database
  const user = await db.users.findFirst({
    where: { username }
  });

  if (!user) {
    return null;
  }

  // Derive verification hash from the provided password
  const verificationHash = await deriveVerificationHash(password, user.salt);

  // Compare with stored hash
  if (verificationHash !== user.verificationHash) {
    return null;
  }

  // Issue a token
  const token = await issueToken(user.id, user.tenantId, 'user');

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      tenantId: user.tenantId
    },
    token
  };
}
```

### User Roles

Administrators can assign roles to users:

```typescript
// Assign a role to a user
async function assignRole(userId, role, tenantId) {
  // Add relationship in OpenFGA
  await fgaClient.write({
    writes: [
      {
        user: `user:${userId}`,
        relation: role,
        object: `tenant:${tenantId}`
      }
    ]
  });

  // Update user record
  await db.users.update({
    where: { id: userId },
    data: { role }
  });
}
```

## Service Discovery and Tenant Isolation

NeuralLog uses a tenant-based DNS namespace approach for service discovery, ensuring proper isolation between tenants:

### Tenant-Based DNS Namespaces

Each tenant in NeuralLog has its own DNS namespace in the format `tenant-id.neurallog.app`. This approach provides several benefits:

1. **Automatic Service Discovery**: The client SDK automatically discovers the appropriate services (auth, logs, etc.) based on the tenant ID.
2. **Tenant Isolation**: Each tenant's services are isolated from other tenants.
3. **Simplified Configuration**: Clients only need to specify the tenant ID, not individual service URLs.

```typescript
// Client initialization with tenant-based service discovery
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key'
});

// The client automatically discovers auth and logs services
await client.initialize();
```

### Registry Service

Behind the scenes, NeuralLog uses a registry service to manage service discovery:

1. The client SDK contacts the registry service at `registry.your-tenant-id.neurallog.app`.
2. The registry service returns the URLs for the auth service, logs server, and other services.
3. The client SDK caches these URLs for future requests.

For advanced scenarios, you can customize the registry configuration:

```typescript
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key',
  discovery: {
    // Optional custom registry URL
    registryUrl: 'https://custom-registry.example.com',
    // Optional cache configuration
    cache: {
      enabled: true,
      ttl: 3600 // seconds
    }
  }
});
```

### Fallback Mechanism

If the registry service is unavailable, the client SDK falls back to environment variables:

```typescript
// Environment variables for fallback
process.env.NEURALLOG_AUTH_URL = 'https://auth.your-tenant-id.neurallog.app';
process.env.NEURALLOG_LOG_SERVER_URL = 'https://logs.your-tenant-id.neurallog.app';
```

## Integration Patterns

### Middleware Integration

Integrate authentication and authorization into your Express application:

```typescript
// Authentication middleware
function authMiddleware(req, res, next) {
  // Get token from header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.substring(7);

  // Verify token
  verifyToken(token)
    .then(decoded => {
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      // Add user info to request
      req.user = {
        id: decoded.sub,
        tenantId: decoded.tenant_id,
        scope: decoded.scope,
        authenticated: true
      };

      next();
    })
    .catch(error => {
      return res.status(500).json({ error: 'Authentication service unavailable' });
    });
}

// Authorization middleware
function authorizeMiddleware(permission) {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user || !req.user.authenticated) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Check permission
    checkPermission(req.user.id, permission, req.params.resourceId, req.user.tenantId)
      .then(allowed => {
        if (!allowed) {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }

        next();
      })
      .catch(error => {
        return res.status(500).json({ error: 'Authorization service unavailable' });
      });
  };
}

// Example usage
app.get('/logs/:logId', authMiddleware, authorizeMiddleware('logs:read'), (req, res) => {
  // Handle the request
});
```

### React Integration

Integrate authentication and authorization into your React application:

```tsx
import { createContext, useContext, useState, useEffect } from 'react';
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create auth context
const AuthContext = createContext(null);

// Auth provider component
export function AuthProvider({ children }) {
  const [client, setClient] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize client
    const neuralLogClient = new NeuralLogClient({
      authUrl: process.env.REACT_APP_AUTH_URL,
      logServerUrl: process.env.REACT_APP_LOG_SERVER_URL,
      tenantId: process.env.REACT_APP_TENANT_ID,
      auth: {
        type: 'interactive'
      }
    });

    setClient(neuralLogClient);

    // Check if user is already authenticated
    neuralLogClient.auth.getCurrentUser()
      .then(currentUser => {
        setUser(currentUser);
      })
      .catch(error => {
        console.error('Error getting current user:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Login function
  const login = async () => {
    try {
      await client.auth.login();
      const currentUser = await client.auth.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await client.auth.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Check if user has permission
  const hasPermission = async (permission, resourceId) => {
    if (!user) {
      return false;
    }

    try {
      return await client.auth.checkPermission(permission, resourceId);
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    }
  };

  // Auth context value
  const value = {
    client,
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Auth hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Protected route component
export function ProtectedRoute({ children, permission, resourceId }) {
  const { isAuthenticated, hasPermission, loading } = useAuth();
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setChecking(false);
      return;
    }

    if (permission) {
      hasPermission(permission, resourceId)
        .then(result => {
          setAllowed(result);
        })
        .finally(() => {
          setChecking(false);
        });
    } else {
      setAllowed(true);
      setChecking(false);
    }
  }, [isAuthenticated, permission, resourceId, hasPermission]);

  if (loading || checking) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!allowed) {
    return <div>Access denied</div>;
  }

  return children;
}

// Example usage
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/logs/:logId" element={
            <ProtectedRoute permission="logs:read" resourceId={useParams().logId}>
              <LogDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
```

## Security Best Practices

### Password Security

1. **Strong Password Policies**: Enforce strong password policies (minimum length, complexity, etc.).
2. **Secure Password Storage**: Use strong key derivation functions (Argon2id) for password hashing.
3. **Password Rotation**: Encourage regular password rotation.
4. **Multi-Factor Authentication**: Implement MFA for enhanced security.
5. **Brute Force Protection**: Implement rate limiting and account lockout mechanisms.

### API Key Security

1. **Limited Scope**: Create API keys with the minimum required permissions.
2. **Regular Rotation**: Rotate API keys regularly.
3. **Secure Storage**: Store API keys securely (environment variables, secrets management).
4. **Revocation**: Implement immediate revocation mechanisms.
5. **Monitoring**: Monitor API key usage for suspicious activity.

### Token Security

1. **Short Expiration**: Use short expiration times for tokens.
2. **Secure Transmission**: Transmit tokens over HTTPS.
3. **Secure Storage**: Store tokens securely (HTTP-only cookies, secure storage).
4. **Revocation**: Implement token revocation mechanisms.
5. **Refresh Tokens**: Use refresh tokens for long-lived sessions.

### General Security

1. **HTTPS**: Use HTTPS for all communication.
2. **Rate Limiting**: Implement rate limiting to prevent abuse.
3. **Input Validation**: Validate all input to prevent injection attacks.
4. **Logging and Monitoring**: Log security events and monitor for suspicious activity.
5. **Regular Audits**: Conduct regular security audits.

## MCP Client Authentication

The Model Context Protocol (MCP) client is a critical component that allows AI models to interact with the logs server. Proper authentication is essential for secure AI model interactions.

### Configuring MCP Client Authentication

```typescript
// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Configuration
const webServerUrl = process.env.WEB_SERVER_URL || "http://localhost:3030";
const apiKey = process.env.API_KEY || ""; // API key for authentication
const tenantId = process.env.TENANT_ID || "default"; // Tenant ID for multi-tenancy

// Create axios instance with authentication headers
const api = axios.create({
  baseURL: webServerUrl,
  headers: {
    "x-api-key": apiKey,
    "x-tenant-id": tenantId
  }
});

// Create an MCP server
const server = new McpServer({
  name: "AI-MCP-Logger",
  version: "0.1.0"
});

// Add get_logs tool with authentication
server.tool(
  "get_logs",
  { limit: z.number().optional().describe("Maximum number of log names to return") },
  async (args) => {
    try {
      // Use the authenticated API instance
      const response = await api.get(`/logs`, {
        params: { limit: args.limit || 1000 }
      });

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      // Handle authentication errors
      if (error.response?.status === 401) {
        return {
          content: [{
            type: "text",
            text: JSON.stringify({
              error: true,
              message: `Authentication failed: Invalid API key or missing authentication.`
            }, null, 2)
          }],
          isError: true
        };
      }

      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error getting logs: ${error.message || String(error)}`
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);
```

### Running MCP Client with Authentication

When running the MCP client, you need to provide the API key and tenant ID:

```bash
# Run locally with authentication
API_KEY=your-api-key TENANT_ID=your-tenant-id npm start

# Run with Docker
docker run -i \
  -e WEB_SERVER_URL=http://localhost:3030 \
  -e API_KEY=your-api-key \
  -e TENANT_ID=your-tenant-id \
  ai-mcp-logger-mcp-client
```

## Troubleshooting

### Common Issues

1. **Authentication Failures**: Check your credentials and token expiration.
2. **Authorization Failures**: Check user permissions and roles.
3. **Token Expiration**: Implement token refresh mechanisms.
4. **Rate Limiting**: Handle rate limiting gracefully.
5. **Network Issues**: Implement retry logic for transient errors.

### Debugging

1. **Enable Debug Logging**: Set `debug: true` in the client options.
2. **Check Network Requests**: Use browser developer tools to inspect network requests.
3. **Check Console Errors**: Look for errors in the console.
4. **Check Server Logs**: Check the logs of the Auth Service.
5. **Contact Support**: If all else fails, contact NeuralLog support.

## API Reference

For a complete API reference, see the [Auth Service API Reference](../components/auth/api.md).

## Next Steps

- [Authentication Implementation Guide](./authentication-implementation.md) - Detailed instructions for implementing authentication in the NeuralLog ecosystem
- [Client SDK Usage Guide](../components/client-sdks/comprehensive-usage-guide.md) - Comprehensive guide for using the NeuralLog Client SDK
- [Zero-Knowledge Architecture](./zero-knowledge-architecture.md) - Overview of NeuralLog's zero-knowledge architecture
- [Key Management](./key-management.md) - Guide to managing encryption keys in NeuralLog
- [OpenFGA Documentation](https://openfga.dev/docs) - Documentation for the OpenFGA authorization system
