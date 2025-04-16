# NeuralLog: Zero-Knowledge Telemetry and Logging Service

## Overview

NeuralLog is a zero-knowledge telemetry and logging service that provides powerful logging, search, and analysis capabilities while maintaining complete data privacy. The system is designed so that the server never has access to encryption keys or plaintext data, ensuring that even in the event of a server breach, user data remains secure.

## Core Principles

1. **Zero Server Knowledge**: The server never possesses encryption keys or plaintext data
2. **Deterministic Key Hierarchy**: All keys are derived from a master secret using deterministic paths
3. **Metadata-Level RBAC**: Access control implemented purely through metadata
4. **Client-Side Encryption**: All encryption and decryption happens on the client
5. **Searchable Encryption**: Enables searching encrypted logs without decryption
6. **Tenant Isolation**: Complete cryptographic separation between tenants

## System Architecture

### Components

1. **Auth Service**: Manages authentication, authorization, and API key verification
   - Uses Redis for fast access to verification hashes and RBAC metadata
   - Never stores actual keys, only verification hashes

2. **Web Application**: Stateless Next.js application
   - All cryptographic operations happen in the browser
   - No server-side sessions or state

3. **Logs Service**: Stores and indexes encrypted logs
   - Handles search queries using searchable encryption tokens
   - Performs analysis on encrypted data without decryption

4. **Redis**: Tenant-specific Redis instance shared between auth and logs services
   - Stores verification hashes, RBAC metadata, and search indices
   - Maintains strict tenant isolation

5. **Client SDKs**: Libraries for various programming languages
   - Handle client-side encryption and token generation
   - Derive encryption keys from API keys

### Key Hierarchy

The system uses a deterministic hierarchical key derivation system:

```
master_secret
├── tenant/{tenantId}/encryption
├── tenant/{tenantId}/search
├── tenant/{tenantId}/user/{userId}/api-key
├── tenant/{tenantId}/user/{userId}/auth
├── tenant/{tenantId}/log/{logId}/encryption
└── tenant/{tenantId}/log/{logId}/search
```

### Zero-Knowledge Search

NeuralLog implements a novel approach to searchable encryption:

1. **Token Generation**: Search tokens are generated client-side using HMAC with tenant-specific keys
2. **Token Indexing**: Tokens are indexed on the server without revealing the underlying terms
3. **Search Process**: Searches match tokens without decrypting log content
4. **Result Decryption**: Only the client can decrypt the returned log entries

### RBAC at Metadata Level

Access control is implemented purely at the metadata level:

1. **Role Definitions**: Stored as metadata in Redis
2. **Permission Checks**: Performed against metadata without revealing keys
3. **Revocation**: Implemented as entries in revocation lists
4. **Audit Trail**: Complete history of all RBAC changes

## Security Properties

1. **Breach Resistance**: Server compromise reveals no useful information
2. **Forward Secrecy**: Compromise of one key doesn't compromise past data
3. **Tenant Isolation**: Cryptographic separation between tenants
4. **Zero Trust**: Users don't need to trust the server with sensitive data
5. **Verifiable Security**: Security properties are mathematically verifiable

## User Flows

### Developer Onboarding

1. Admin invites developer via email
2. Developer creates account with password
3. Developer generates API key in web interface
4. Developer adds API key to environment variables
5. Developer starts logging with SDK

### Log Access Control

1. Admin assigns roles to users via web interface
2. Roles determine which logs users can access
3. Access control is enforced through metadata checks
4. Revocation is immediate through metadata updates

### Secure Analysis

1. Users can search encrypted logs without server decryption
2. Analysis is performed on encrypted data using token patterns
3. Results are decrypted client-side
4. Zero-knowledge reports can be generated and shared

## Implementation Details

For detailed implementation information, see:
- [Key Management](./key-management.md)
- [Searchable Encryption](./searchable-encryption.md)
- [RBAC Implementation](./rbac-implementation.md)
- [Client SDK Architecture](../architecture/client-sdk-architecture.md)
