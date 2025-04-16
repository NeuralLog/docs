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

### Zero-Knowledge Architecture

#### [Zero-Knowledge Architecture Overview](./zero-knowledge-architecture.md)
Concise explanation of NeuralLog's zero-knowledge approach, including the encryption processes, key derivation, and security guarantees.

#### [Comprehensive Zero-Knowledge Architecture](./zero-knowledge-architecture-comprehensive.md)
In-depth exploration of NeuralLog's zero-knowledge architecture, including detailed implementation aspects and security properties.

### Key Management

#### [Key Management Overview](./key-management.md)
Comprehensive documentation on NeuralLog's key hierarchy, key rotation procedures, and disaster recovery options.

#### [KEK Management](./kek-management.md)
Detailed explanation of the Key Encryption Key (KEK) management system, including versioning, provisioning, and security considerations.

#### [KEK and Encryption Policies](../architecture/kek-encryption-policies.md)
Comprehensive overview of NeuralLog's Key Encryption Key (KEK) system and encryption policies that ensure data security and privacy throughout the platform.

### Data Protection

#### [Encrypted Data at Rest](./encrypted-data-at-rest.md)
Explanation of how NeuralLog ensures data remains encrypted at rest, including storage mechanisms and encryption algorithms.

#### [Encrypted Log Names](./encrypted-log-names.md)
Details on how log names are encrypted to protect metadata and ensure complete privacy.

#### [Searchable Encryption](./searchable-encryption.md)
Explanation of NeuralLog's approach to searchable encryption, enabling search capabilities without compromising security.

### Access Control

#### [RBAC Implementation](./rbac-implementation.md)
Detailed guide on NeuralLog's Role-Based Access Control implementation, including permission models and enforcement mechanisms.

#### [Tenant Isolation and RBAC](./tenant-isolation-rbac.md)
Explanation of how NeuralLog ensures complete isolation between tenants while implementing robust access controls.

#### [Comprehensive Authentication and Authorization Guide](./comprehensive-auth-guide.md)
Detailed overview of NeuralLog's authentication and authorization system, including architecture, implementation details, best practices, and integration patterns.

#### [Authentication Implementation](./authentication-implementation.md)
Practical guide on implementing authentication in the NeuralLog ecosystem, including token exchange, verification, and best practices.

### Client-Side Security

#### [TypeScript Client SDK: The Cornerstone of Zero-Knowledge Security](../architecture/typescript-client-sdk-cornerstone.md)
Exploration of how the TypeScript Client SDK implements the zero-knowledge architecture, ensuring that sensitive data never leaves the client unencrypted.