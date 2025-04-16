---
sidebar_position: 1
---

# auth Overview

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

## Quick Start



## Documentation

For detailed documentation, see:

- [API Reference](./api.md)
- [Configuration](./configuration.md)
- [Architecture](./architecture.md)
- [Examples](./examples)

For the source code and component-specific documentation, visit the [NeuralLog auth Repository](https://github.com/NeuralLog/auth).
