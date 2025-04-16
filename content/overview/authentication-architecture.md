---
sidebar_position: 2
---

# Authentication Architecture

This document provides a detailed overview of NeuralLog's authentication architecture, explaining how the auth service, web application, server, and SDKs interact with each other.

> **Note**: This document describes the current authentication architecture. For the target unified authentication architecture that centralizes all auth code in the `auth/` directory, see [Unified Authentication Architecture](./unified-auth-architecture.md).

## Overview

NeuralLog uses a multi-layered authentication and authorization system:

1. **Authentication**: Handled by Clerk for the web application and API keys for server-to-server communication
2. **Authorization**: Managed by OpenFGA for fine-grained access control
3. **Multi-tenancy**: Supported through tenant-specific namespaces

## Components

### Auth Service

The auth service is a standalone microservice that:

- Manages authorization using OpenFGA
- Handles API key validation
- Provides tenant management
- Enforces access control policies

The auth service exposes the following endpoints:

- `POST /api/auth/check`: Check if a user has permission to access a resource
- `POST /api/auth/grant`: Grant a permission to a user
- `POST /api/auth/revoke`: Revoke a permission from a user
- `GET /api/tenants`: List all tenants
- `POST /api/tenants`: Create a new tenant
- `DELETE /api/tenants/:tenantId`: Delete a tenant

### Web Application

The web application uses:

- **Clerk** for user authentication
- **Auth Service** for authorization
- **Middleware** for tenant identification and routing

The authentication flow in the web application is:

1. User logs in via Clerk
2. Clerk provides a JWT token
3. The token is sent to the auth service to check permissions
4. The web application uses the permissions to control access to resources

### Logs Server

The logs server:

- Accepts API key authentication for server-to-server communication
- Uses tenant namespacing for multi-tenancy
- Enforces access control based on the auth service

The logs server does not directly handle user authentication but relies on the auth service to validate permissions.

## Authorization Model

NeuralLog uses OpenFGA for authorization with the following model:

```
type tenant {
  relation admin: this
  relation member: this
  relation exists: this
}

type user {
  relation self: this
}

type log {
  relation owner: this
  relation reader: this
  relation writer: this
  relation parent: tenant
}

type log_entry {
  relation owner: this
  relation reader: this
  relation writer: this
  relation parent: log
}

type system {
  relation admin: this
}
```

This model allows for:

- Tenant-level access control
- Log-level permissions (read/write)
- Log entry-level permissions
- System-wide administration

## Multi-tenancy

NeuralLog supports multi-tenancy through:

1. **Hostname-based tenant identification**: Each tenant can have a subdomain (e.g., `tenant.neurallog.app`)
2. **Header-based tenant identification**: The `x-tenant-id` header is used to identify the tenant
3. **Namespace-based isolation**: Each tenant's data is isolated in a separate namespace

The tenant identification flow is:

1. The middleware extracts the tenant ID from the hostname or defaults to "default"
2. The tenant ID is added to the request headers
3. The logs server and auth service use the tenant ID to isolate data

## SDK Authentication

SDKs should support the following authentication methods:

### 1. API Key Authentication

```typescript
// TypeScript example
const logger = new NeuralLogger({
  apiKey: 'your-api-key',
  logName: 'my-log'
});
```

```java
// Java example
NeuralLogger logger = NeuralLogger.builder()
    .apiKey("your-api-key")
    .logName("my-log")
    .build();
```

```csharp
// C# example
var logger = new NeuralLogger(
    apiKey: "your-api-key",
    logName: "my-log"
);
```

```python
# Python example
logger = NeuralLogger(
    api_key="your-api-key",
    log_name="my-log"
)
```

```go
// Go example
logger, err := neurallog.NewLogger(neurallog.Config{
    APIKey:  "your-api-key",
    LogName: "my-log",
})
```

### 2. JWT Token Authentication

```typescript
// TypeScript example
const logger = new NeuralLogger({
  jwtToken: 'your-jwt-token',
  logName: 'my-log'
});
```

### 3. Tenant-specific Configuration

```typescript
// TypeScript example
const logger = new NeuralLogger({
  apiKey: 'your-api-key',
  logName: 'my-log',
  tenantId: 'tenant-id'
});
```

## API Key Management

API keys are managed through the auth service and have the following properties:

- **Key Prefix**: First 8 characters of the key, used for lookup
- **Scopes**: Permissions granted to the key (e.g., `logs:read`, `logs:write`)
- **Expiration**: Optional expiration date
- **Last Used**: Timestamp of last usage

API keys can be created, listed, and revoked through the auth service.

## Security Considerations

### API Key Security

- API keys should be kept secure and not exposed in client-side code
- For browser-based applications, use JWT tokens instead of API keys
- API keys should have limited scopes based on the principle of least privilege

### JWT Token Security

- JWT tokens should have a short expiration time
- Tokens should be refreshed regularly
- Token validation should include signature verification and expiration check

### Known Security Issues

> ⚠️ **Important Security Notice** ⚠️
>
> The current implementation has three critical security vulnerabilities that need to be addressed:
>
> 1. **Logs Server Authentication**: The logs server currently lacks proper authentication middleware, making it vulnerable to unauthorized access. Anyone with the server URL can access logs without authentication.
>
> 2. **Web Application Registration**: The web application currently allows anyone to register and gain access to the system. This should be restricted to invited users only.
>
> 3. **MCP Client Authentication**: The MCP client does not include authentication when communicating with the logs server, allowing unauthorized access to logs through the MCP interface.
>
> See the [Authentication Implementation Guide](../security/authentication-implementation.md) for detailed instructions on how to fix these issues.

### Zero-Knowledge Proofs (Optional)

For enhanced security, NeuralLog supports zero-knowledge proofs for API key verification:

```typescript
// TypeScript example
const result = await verifyApiKey(apiKey, ['logs:write'], {
  useZkp: true,
  proof: generatedProof
});
```

## Docker Deployment

In the Docker Compose setup:

1. **Auth Service** depends on OpenFGA and PostgreSQL
2. **Logs Server** depends on Redis
3. **Web Application** depends on both Auth Service and Logs Server

```yaml
# Docker Compose example
services:
  # Auth service
  auth:
    image: neurallog/auth:latest
    environment:
      OPENFGA_API_URL: http://openfga:8080
      DEFAULT_TENANT_ID: default
    depends_on:
      - openfga

  # Logs server
  server:
    image: neurallog/server:latest
    environment:
      STORAGE_TYPE: redis
      REDIS_HOST: neurallog-redis
      DEFAULT_NAMESPACE: default
    depends_on:
      - redis

  # Web application
  web:
    image: neurallog/web:latest
    environment:
      NEXT_PUBLIC_AUTH_SERVICE_API_URL: http://auth-service:3040
      LOGS_API_URL: http://neurallog-server:3030
    depends_on:
      - server
      - auth
```

## Kubernetes Deployment

In Kubernetes, the components are deployed as separate services with appropriate dependencies:

```yaml
# Auth Service Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: auth
spec:
  template:
    spec:
      containers:
      - name: auth
        image: neurallog/auth:latest
        env:
        - name: OPENFGA_API_URL
          value: "http://openfga:8080"
```

## SDK Integration with Authentication

When implementing SDKs, consider the following:

1. **API Key Storage**: Provide secure methods for storing and retrieving API keys
2. **Token Refresh**: Implement automatic token refresh for JWT authentication
3. **Error Handling**: Provide clear error messages for authentication failures
4. **Tenant Support**: Allow specifying the tenant ID in the configuration
5. **Scopes**: Support requesting specific scopes for API keys

## Example SDK Authentication Implementation

```typescript
// TypeScript SDK example
export class NeuralLogger {
  private apiKey?: string;
  private jwtToken?: string;
  private tenantId: string;

  constructor(config: {
    apiKey?: string;
    jwtToken?: string;
    tenantId?: string;
    logName: string;
  }) {
    this.apiKey = config.apiKey;
    this.jwtToken = config.jwtToken;
    this.tenantId = config.tenantId || 'default';

    if (!this.apiKey && !this.jwtToken) {
      throw new Error('Either apiKey or jwtToken must be provided');
    }
  }

  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'x-tenant-id': this.tenantId
    };

    if (this.apiKey) {
      headers['x-api-key'] = this.apiKey;
    } else if (this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }

    return headers;
  }

  async log(data: any): Promise<void> {
    const headers = await this.getAuthHeaders();

    // Make API request with headers
    // ...
  }
}
```

## Conclusion

NeuralLog's authentication architecture provides a flexible and secure way to manage access to logs and log entries. By understanding this architecture, SDK developers can implement authentication in a way that is consistent with the overall system design.

When implementing SDKs, ensure that:

1. Authentication is handled securely
2. Multi-tenancy is supported
3. Error handling is robust
4. The API follows the same patterns as the server API
