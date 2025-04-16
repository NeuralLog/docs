---
sidebar_position: 1
---

# Auth Service Overview

NeuralLog Auth provides centralized authentication, authorization, and key management for all NeuralLog services. It uses OpenFGA (Fine-Grained Authorization) with PostgreSQL persistence to implement a robust authorization system that supports multi-tenancy. It also manages Key Encryption Keys (KEKs) for the zero-knowledge architecture, storing encrypted KEK blobs in Redis.

## Features

- **Multi-tenant Authorization**: Secure isolation between tenants with proper namespacing
- **Fine-grained Access Control**: Control access at the resource level
- **Centralized Auth Service**: Single source of truth for authorization decisions
- **Client SDKs**: Easy integration with other services
- **Scalable Architecture**: Designed for high performance and reliability
- **Zero-Knowledge Key Management**: Manages encrypted KEK blobs without access to the keys themselves
- **Key Rotation**: Supports key rotation for enhanced security
- **User-specific Key Provisioning**: Provisions keys to specific users with appropriate access controls
- **API Key Management**: Secure generation, verification, and revocation of API keys
- **JWT Authentication**: Support for JWT-based authentication
- **Auth0 Integration**: Seamless integration with Auth0 for enterprise authentication
- **Role-Based Access Control**: Flexible role-based access control using OpenFGA
- **Attribute-Based Access Control**: Support for attribute-based access control policies

## Architecture

The Auth Service consists of the following components:

1. **Authentication Service**: Handles user authentication, API key verification, and token issuance.
2. **Authorization Service**: Implements fine-grained authorization using OpenFGA.
3. **Key Management Service**: Manages Key Encryption Keys (KEKs) and KEK blobs.
4. **User Management Service**: Handles user registration, role assignment, and profile management.
5. **API Key Service**: Manages API key generation, verification, and revocation.
6. **Token Service**: Handles token issuance, verification, and revocation.

## Integration

The Auth Service integrates with other NeuralLog components through the following mechanisms:

1. **Client SDK**: The client SDK provides a unified interface for authentication and authorization.
2. **REST API**: The Auth Service exposes a REST API for direct integration.
3. **Middleware**: NeuralLog services use middleware to verify authentication and check permissions.
4. **Event System**: The Auth Service publishes events for important security operations.

## Quick Start

### Running the Auth Service

```bash
# Clone the repository
git clone https://github.com/NeuralLog/auth.git
cd auth

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the service
npm start
```

### Using the Auth Service

```typescript
// Initialize the client
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id',  // Forms the DNS namespace: your-tenant-id.neurallog.app
  apiKey: 'your-api-key'
});

// Authenticate
await client.initialize();

// Check permissions
const hasPermission = await client.auth.checkPermission('read', 'log:application-logs');
console.log(`Has permission: ${hasPermission}`);
```

## Documentation

For detailed documentation, see:

- [API Reference](./api.md)
- [Configuration](./configuration.md)
- [Architecture](./architecture.md)
- [Examples](./examples)
- [Comprehensive Authentication and Authorization Guide](../../security/comprehensive-auth-guide.md)
- [Authentication Implementation Guide](../../security/authentication-implementation.md)
- [Zero-Knowledge Architecture](../../security/zero-knowledge-architecture.md)
- [Key Management](../../security/key-management.md)
- [Client SDK Usage Guide](../client-sdks/comprehensive-usage-guide.md)

For the source code and component-specific documentation, visit the [NeuralLog auth Repository](https://github.com/NeuralLog/auth).
