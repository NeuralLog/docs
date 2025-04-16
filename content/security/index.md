---
sidebar_position: 1
---

# Security

Security is at the core of NeuralLog's design. This section provides comprehensive documentation on NeuralLog's security architecture, focusing on its zero-knowledge approach to data protection.

## Zero-Knowledge Architecture

NeuralLog employs a zero-knowledge architecture, meaning that sensitive data is encrypted on the client side before it ever leaves your application. The server components never have access to unencrypted data or encryption keys, ensuring that even if the server is compromised, your data remains secure.

### Key Features

- **Client-Side Encryption**: All sensitive data is encrypted in your application before being sent to NeuralLog servers
- **Deterministic Key Hierarchy**: A carefully designed key hierarchy ensures that authorized users can access logs while maintaining security
- **No Server-Side Secrets**: NeuralLog servers never store or have access to encryption keys or unencrypted data
- **End-to-End Encryption**: Data remains encrypted throughout its lifecycle, from creation to storage to retrieval

## Key Hierarchy and Management

NeuralLog uses a sophisticated key hierarchy to manage encryption and access control:

1. **Master Secret**: Derived from tenant ID and recovery phrase, this is the root of the key hierarchy
2. **Key Encryption Keys (KEKs)**: Derived from the master secret, these keys encrypt log-specific keys
3. **Log Encryption Keys**: Unique keys for each log, encrypted by KEKs and stored securely
4. **KEK Versioning**: Support for key rotation while maintaining access to historical data

## Authentication and Authorization

NeuralLog provides robust authentication and authorization mechanisms:

- **Multi-Tenant Support**: Secure isolation between different organizations
- **Role-Based Access Control**: Fine-grained permissions using OpenFGA
- **API Key Management**: Secure generation and validation of API keys
- **Admin Management**: Secure processes for promoting and demoting administrators

## Documentation

### [Authentication Implementation](./authentication-implementation.md)

Detailed guide on implementing authentication in the NeuralLog ecosystem, including token exchange, verification, and best practices.

### [Zero-Knowledge Architecture](./zero-knowledge-architecture.md)

In-depth explanation of NeuralLog's zero-knowledge approach, including the encryption processes, key derivation, and security guarantees.

### [Key Management](./key-management.md)

Comprehensive documentation on NeuralLog's key hierarchy, key rotation procedures, and disaster recovery options.

### [TypeScript Client SDK: The Cornerstone of Zero-Knowledge Security](../architecture/typescript-client-sdk-cornerstone.md)

Exploration of how the TypeScript Client SDK implements the zero-knowledge architecture, ensuring that sensitive data never leaves the client unencrypted.