---
sidebar_position: 3
---

# Unified Authentication Architecture

NeuralLog implements a centralized authentication and authorization architecture where all components interact with a dedicated auth service. This document explains the design, implementation, and integration of this unified approach.

## Architecture Overview

The unified authentication architecture centralizes all authentication and authorization logic in the `auth/` directory, with all other components (web, server, MCP client, SDKs) communicating with this service:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    Web      │     │    Logs     │     │    MCP      │     │    SDKs     │
│  Application│     │   Server    │     │   Client    │     │             │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│                         Auth Service (auth/)                            │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                           Auth0 Integration                             │
│                                                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│                          OpenFGA Integration                            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Principles

1. **Single Source of Truth**: All authentication and authorization logic resides in the auth service
2. **Tenant-Aware Authentication**: All clients provide both user and tenant information
3. **Clear Separation of Concerns**: 
   - Auth0 handles identity verification (authentication)
   - OpenFGA handles permission checks (authorization)
4. **Consistent Client Interface**: All components use the same patterns to interact with auth

## Auth Service Responsibilities

The auth service handles:

1. **User Authentication**: Verifying user identity via Auth0
2. **Machine-to-Machine Authentication**: Authenticating services via Auth0 client credentials
3. **Permission Management**: Managing and checking permissions via OpenFGA
4. **Tenant Management**: Handling multi-tenancy and tenant-specific permissions
5. **Token Validation**: Validating JWT tokens from Auth0
6. **Client Libraries**: Providing client libraries for other components

## Multi-Tenancy Model

The auth service implements multi-tenancy through:

1. **Tenant-Specific Authentication**: Each authentication request includes tenant information
2. **Tenant-Aware Authorization**: Permissions are evaluated in the context of a specific tenant
3. **Tenant Isolation**: Data and permissions are isolated by tenant

Example flow:

```
Client: "Is user X allowed to read log Y in tenant Z?"
Auth Service: 
  1. Verifies user X's identity
  2. Checks if user X has access to tenant Z
  3. Checks if user X has permission to read log Y in tenant Z
  4. Returns authorization decision
```

## Integration Points

### Web Application

The web application integrates with the auth service through a React context provider:

```tsx
// Web application using auth provider
import { AuthProvider, useAuth } from '@neurallog/auth-client/web';

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

function Dashboard() {
  const { user, hasPermission } = useAuth();
  const [canViewLogs, setCanViewLogs] = useState(false);
  
  useEffect(() => {
    async function checkPermission() {
      const allowed = await hasPermission('read', 'logs:all');
      setCanViewLogs(allowed);
    }
    
    checkPermission();
  }, [hasPermission]);
  
  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {canViewLogs ? <LogsList /> : <AccessDenied />}
    </div>
  );
}
```

### Logs Server

The logs server uses middleware provided by the auth service:

```typescript
// Logs server using auth middleware
import { authMiddleware, requirePermission } from '@neurallog/auth-client/node';

// Apply authentication middleware to all routes
app.use(authMiddleware);

// Apply permission checks to specific routes
app.get('/logs', 
  requirePermission('read', req => 'logs:all'),
  logsController.getAllLogs
);

app.get('/logs/:logName', 
  requirePermission('read', req => `log:${req.params.logName}`),
  logsController.getLogByName
);

app.post('/logs/:logName', 
  requirePermission('write', req => `log:${req.params.logName}`),
  logsController.createOrUpdateLog
);
```

### MCP Client

The MCP client authenticates with the auth service:

```typescript
// MCP client using auth client
import { AuthClient } from '@neurallog/auth-client/node';

const authClient = new AuthClient({
  authServiceUrl: process.env.AUTH_SERVICE_URL,
  clientId: process.env.AUTH_CLIENT_ID,
  clientSecret: process.env.AUTH_CLIENT_SECRET,
  tenantId: process.env.TENANT_ID || 'default'
});

// Get authentication token
async function getAuthToken() {
  return authClient.getToken();
}

// Create authenticated API client
async function createApiClient() {
  const token = await getAuthToken();
  
  return axios.create({
    baseURL: webServerUrl,
    headers: {
      "Authorization": `Bearer ${token}`,
      "x-tenant-id": authClient.tenantId
    }
  });
}

// Use in MCP tools
server.tool(
  "get_logs",
  { limit: z.number().optional() },
  async (args) => {
    try {
      const api = await createApiClient();
      const response = await api.get(`/logs`, {
        params: { limit: args.limit || 1000 }
      });
      
      // Return response
    } catch (error) {
      // Handle error
    }
  }
);
```

### SDKs

The SDKs integrate with the auth service:

```typescript
// SDK using auth client
import { AuthClient } from '@neurallog/auth-client/node';

export class NeuralLogger {
  private authClient: AuthClient;
  private logName: string;
  
  constructor(config: {
    authServiceUrl: string;
    clientId: string;
    clientSecret: string;
    tenantId?: string;
    logName: string;
  }) {
    this.authClient = new AuthClient({
      authServiceUrl: config.authServiceUrl,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      tenantId: config.tenantId || 'default'
    });
    
    this.logName = config.logName;
  }
  
  async log(data: any): Promise<void> {
    const api = await this.authClient.createApiClient();
    
    await api.post(`/logs/${this.logName}`, {
      data
    });
  }
}
```

## Auth Client Libraries

The auth service provides client libraries for different environments:

### Web Client

```typescript
// @neurallog/auth-client/web
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext<any>(null);

export const AuthProvider = ({ children, authServiceUrl }) => {
  // Authentication state and methods
  // ...
  
  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
```

### Node.js Client

```typescript
// @neurallog/auth-client/node
export class AuthClient {
  constructor(options) {
    // Initialize with auth service URL, client ID, client secret, tenant ID
    // ...
  }
  
  async getToken() {
    // Get authentication token
    // ...
  }
  
  async checkPermission(userId, action, resource) {
    // Check permission
    // ...
  }
  
  async createApiClient() {
    // Create authenticated API client
    // ...
  }
}

export const authMiddleware = (req, res, next) => {
  // Authentication middleware
  // ...
};

export const requirePermission = (action, getResource) => {
  // Permission middleware
  // ...
};
```

## Authentication Flow

1. **User Authentication**:
   ```
   ┌─────────┐                 ┌─────────────┐                 ┌─────────┐
   │         │  1. Login       │             │  2. Authenticate │         │
   │  Web    │ ────────────────▶  Auth       │ ────────────────▶  Auth0  │
   │  App    │                 │  Service    │                 │         │
   │         │  4. User + Token│             │  3. Token       │         │
   │         │ ◀────────────────  (auth/)    │ ◀────────────────         │
   └─────────┘                 └─────────────┘                 └─────────┘
   ```

2. **Machine-to-Machine Authentication**:
   ```
   ┌─────────┐                 ┌─────────────┐                 ┌─────────┐
   │         │  1. Auth Request│             │  2. Client Creds│         │
   │  MCP    │ ────────────────▶  Auth       │ ────────────────▶  Auth0  │
   │ Client  │                 │  Service    │                 │         │
   │         │  4. Token       │             │  3. Token       │         │
   │         │ ◀────────────────  (auth/)    │ ◀────────────────         │
   └─────────┘                 └─────────────┘                 └─────────┘
   ```

3. **Permission Check**:
   ```
   ┌─────────┐                 ┌─────────────┐                 ┌─────────┐
   │         │  1. Check Perm  │             │  2. Check Tuple │         │
   │  Logs   │ ────────────────▶  Auth       │ ────────────────▶ OpenFGA │
   │ Server  │                 │  Service    │                 │         │
   │         │  4. Decision    │             │  3. Decision    │         │
   │         │ ◀────────────────  (auth/)    │ ◀────────────────         │
   └─────────┘                 └─────────────┘                 └─────────┘
   ```

## Implementation Details

### Auth Service API

The auth service exposes a RESTful API:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user with username/password |
| `/api/auth/m2m` | POST | Machine-to-machine authentication |
| `/api/auth/validate` | POST | Validate authentication token |
| `/api/auth/check` | POST | Check permission |
| `/api/tenants` | GET | List tenants |
| `/api/tenants` | POST | Create tenant |
| `/api/tenants/:id` | DELETE | Delete tenant |

### Auth0 Configuration

The auth service configures Auth0 with:

1. **Applications**:
   - Single Page Application for web
   - Machine-to-Machine Application for server components

2. **APIs**:
   - NeuralLog API with appropriate scopes

3. **Rules**:
   - Add tenant information to tokens
   - Sync user data with OpenFGA

### OpenFGA Authorization Model

```
type tenant {
  relation admin: user
  relation member: user
}

type user {
  relation self: user
}

type log {
  relation owner: user
  relation reader: user
  relation writer: user
  relation parent: tenant
}

type log_entry {
  relation owner: user
  relation reader: user
  relation writer: user
  relation parent: log
}
```

## Security Considerations

1. **Token Security**:
   - Short-lived tokens
   - Secure storage
   - HTTPS for all communication

2. **API Key Security**:
   - Secure storage
   - Regular rotation
   - Principle of least privilege

3. **Multi-Tenancy Security**:
   - Strict tenant isolation
   - Tenant validation on all requests
   - Prevention of tenant enumeration attacks

## Conclusion

The unified authentication architecture provides a clean, maintainable, and secure approach to authentication and authorization in NeuralLog. By centralizing all auth code in the `auth/` directory and providing consistent client libraries, we ensure that all components interact with authentication in a consistent way.

This architecture supports the key requirement that all clients supply both tenant and user information to the auth service, which then determines "Who is this person according to this tenant? What access to this tenant do they have?" This centralized approach simplifies the codebase, improves security, and makes the system more maintainable.
