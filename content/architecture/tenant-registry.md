# Tenant Registry: Service Discovery for NeuralLog

## Introduction

The Tenant Registry is a critical component in NeuralLog's multi-tenant architecture. It provides a standardized way for clients to discover service endpoints specific to their tenant, enabling seamless integration with NeuralLog's zero-knowledge architecture.

## Purpose

The Tenant Registry serves several key purposes:

1. **Service Discovery**: Provides a single endpoint for clients to discover all tenant-specific service URLs
2. **Tenant Isolation**: Ensures each tenant has its own isolated registry instance
3. **Standardized Endpoints**: Maintains consistent URL patterns across all tenants
4. **Zero-Knowledge Compatible**: Works with the zero-knowledge architecture by only providing endpoint URLs, not sensitive data

## Architecture

### Tenant-Isolated Service

Each tenant has its own isolated registry service, deployed by the NeuralLog Operator. This ensures complete tenant isolation and prevents any cross-tenant information leakage.

```
                  ┌─────────────────────┐
                  │                     │
                  │  NeuralLog Client   │
                  │                     │
                  └─────────────┬───────┘
                                │
                                ▼
                  ┌─────────────────────┐
                  │                     │
                  │  Tenant Registry    │
                  │                     │
                  └─────────────┬───────┘
                                │
                                ▼
          ┌───────────────────┬─┴──────────────────┐
          │                   │                    │
          ▼                   ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │
│  Auth Service   │  │  Logs Server    │  │  Web App        │
│                 │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### URL Patterns

The Tenant Registry uses standardized URL patterns for all services:

- **Registry**: `https://registry.{tenantId}.neurallog.app`
- **Auth Service**: `https://auth.{tenantId}.neurallog.app`
- **Logs Server**: `https://api.{tenantId}.neurallog.app`
- **Web App**: `https://{tenantId}.neurallog.app`

These patterns ensure consistency across all tenants and make it easy for clients to discover the correct endpoints.

## Integration with NeuralLogClient

The TypeScript Client SDK integrates with the Tenant Registry to automatically discover the correct endpoints for a tenant:

```typescript
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create client with tenant ID
const client = new NeuralLogClient({
  tenantId: 'tenant-name'
});

// Initialize client (this will fetch endpoints from the registry)
await client.initialize();

// Now the client has the correct endpoints for this tenant
await client.authenticateWithApiKey('your-api-key');
```

The client will automatically:

1. Construct the registry URL based on the tenant ID
2. Fetch the endpoints from the registry
3. Use the endpoints for all subsequent API calls

## Deployment

The Tenant Registry is deployed by the NeuralLog Operator as part of the tenant provisioning process. Each tenant gets its own registry instance with:

- Dedicated deployment
- Dedicated service
- Dedicated ingress
- Tenant-specific configuration

The registry is configured with the tenant ID and base domain, which it uses to construct the standardized endpoint URLs.

## API

### GET /endpoints

Returns the endpoints for the tenant.

**Response:**

```json
{
  "tenantId": "tenant-name",
  "authUrl": "https://auth.tenant-name.neurallog.app",
  "serverUrl": "https://api.tenant-name.neurallog.app",
  "webUrl": "https://tenant-name.neurallog.app",
  "apiVersion": "v1"
}
```

### GET /health

Returns the health status of the registry.

**Response:**

```json
{
  "status": "ok",
  "tenantId": "tenant-name"
}
```

## Configuration

The registry is configured using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| TENANT_ID | The tenant ID (required) | - |
| PORT | The port to listen on | 3031 |
| BASE_DOMAIN | The base domain for URLs | neurallog.app |
| API_VERSION | The API version | v1 |
| AUTH_URL | Override the auth service URL | - |
| SERVER_URL | Override the server URL | - |
| LOG_LEVEL | Logging level | info |

## Benefits

The Tenant Registry provides several key benefits:

1. **Simplified Client Configuration**: Clients only need to know their tenant ID, not all service URLs
2. **Centralized Service Discovery**: All endpoint information is available from a single source
3. **Consistent URL Patterns**: Standardized URL patterns make it easy to understand the system architecture
4. **Tenant Isolation**: Each tenant has its own isolated registry instance
5. **Zero-Knowledge Compatible**: Works seamlessly with NeuralLog's zero-knowledge architecture

## Conclusion

The Tenant Registry is a critical component in NeuralLog's multi-tenant architecture, providing a standardized way for clients to discover service endpoints specific to their tenant. It ensures tenant isolation, maintains consistent URL patterns, and works seamlessly with NeuralLog's zero-knowledge architecture.
