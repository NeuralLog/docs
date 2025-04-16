# NeuralLog Specifications

This document provides an overview of the specifications and design principles for the NeuralLog system.

## Table of Contents

- [System Overview](#system-overview)
- [Core Components](#core-components)
- [Zero-Knowledge Architecture](#zero-knowledge-architecture)
- [Key Encryption Key (KEK) Management](#key-encryption-key-kek-management)
- [Authentication and Authorization](#authentication-and-authorization)
- [Storage and Persistence](#storage-and-persistence)
- [API Design](#api-design)
- [Client SDKs](#client-sdks)
- [Deployment Models](#deployment-models)

## System Overview

NeuralLog is a zero-knowledge telemetry and logging service designed to provide secure, encrypted logging capabilities for applications while ensuring that sensitive data never leaves the client unencrypted. The system is built with a multi-tenant architecture, allowing multiple organizations to use the service while maintaining strict data isolation.

### Design Goals

1. **Zero-Knowledge Security**: All sensitive data is encrypted on the client side before being sent to the server, ensuring that the server never has access to unencrypted data.
2. **Scalability**: The system is designed to handle high volumes of logs across multiple tenants.
3. **Flexibility**: Support for multiple storage backends and deployment models.
4. **Developer-Friendly**: Easy-to-use SDKs for multiple programming languages.
5. **Compliance**: Designed to help organizations meet regulatory requirements for data security and privacy.

## Core Components

NeuralLog consists of the following core components:

1. **Log Server**: The central service that receives, stores, and retrieves logs.
2. **Auth Service**: Handles authentication, authorization, and key management.
3. **Web Application**: A user interface for viewing and managing logs.
4. **Client SDKs**: Libraries for integrating NeuralLog into applications.
5. **MCP Client**: Model Context Protocol client for AI model integration.

### Component Interactions

```
+----------------+      +----------------+      +----------------+
|                |      |                |      |                |
|  Client App    +----->+  Auth Service  +<---->+  Log Server    |
|  (with SDK)    |      |                |      |                |
+----------------+      +----------------+      +----------------+
        ^                       ^                      ^
        |                       |                      |
        v                       v                      v
+----------------+      +----------------+      +----------------+
|                |      |                |      |                |
|  Web App       +----->+  OpenFGA       |      |  Storage       |
|                |      |                |      |  (Redis/DB)    |
+----------------+      +----------------+      +----------------+
```

## Zero-Knowledge Architecture

The zero-knowledge architecture ensures that sensitive data is encrypted on the client side before being sent to the server. This is achieved through a hierarchical key derivation system:

1. **Master Secret**: Derived from the tenant ID and a recovery phrase, never stored anywhere.
2. **Master KEK**: Derived from the master secret, used to derive operational KEKs.
3. **Operational KEKs**: Used for encrypting and decrypting data, versioned for key rotation.
4. **Log Encryption Keys**: Derived from operational KEKs, specific to each log.

### Key Derivation Flow

```
Recovery Phrase + Tenant ID
         |
         v
    Master Secret
         |
         v
     Master KEK
         |
         v
  Operational KEK (v1, v2, ...)
         |
         v
Log Encryption Keys (per log)
```

## Key Encryption Key (KEK) Management

KEK management is a critical aspect of the zero-knowledge architecture:

1. **KEK Versions**: KEKs are versioned to support key rotation.
2. **KEK Blobs**: Encrypted KEKs that can be shared with users.
3. **KEK Rotation**: Process of creating a new KEK version and re-encrypting data.

### Admin Promotion with Shamir's Secret Sharing

For admin promotion, NeuralLog uses Shamir's Secret Sharing (SSS) to split the KEK into shares:

1. The KEK is split into N shares, with a threshold of M shares required to reconstruct the KEK.
2. Each admin holds one or more shares.
3. To promote a new admin, M existing admins must provide their shares.

## Authentication and Authorization

NeuralLog uses a comprehensive authentication and authorization system:

1. **Authentication**: Supports multiple authentication methods, including username/password, API keys, and OAuth.
2. **Authorization**: Uses OpenFGA for fine-grained authorization.
3. **Multi-Tenancy**: Each tenant has its own isolated environment.
4. **API Keys**: Used for machine-to-machine authentication.

### Permission Model

The permission model is based on the following concepts:

1. **Tenants**: Top-level isolation units.
2. **Users**: Belong to tenants and have roles.
3. **Roles**: Define sets of permissions.
4. **Resources**: Logs, API keys, and other entities.
5. **Actions**: Operations that can be performed on resources.

## Storage and Persistence

NeuralLog supports multiple storage backends:

1. **Redis**: For high-performance, in-memory storage.
2. **PostgreSQL**: For durable, relational storage.
3. **MongoDB**: For document-based storage.
4. **Custom Adapters**: For integrating with other storage systems.

### Storage Adapter Interface

All storage adapters implement a common interface:

```typescript
interface StorageAdapter {
  // Log management
  createLog(log: LogDefinition): Promise<Log>;
  getLog(logName: string): Promise<Log>;
  getLogs(): Promise<Log[]>;
  updateLog(logName: string, updates: Partial<LogDefinition>): Promise<Log>;
  deleteLog(logName: string): Promise<boolean>;
  
  // Log entry management
  appendLogEntry(logName: string, entry: LogEntry): Promise<string>;
  getLogEntries(logName: string, options: GetLogEntriesOptions): Promise<LogEntryResult>;
  getLogEntry(logName: string, entryId: string): Promise<LogEntry>;
  
  // Search
  searchLogEntries(logName: string, options: SearchOptions): Promise<LogEntryResult>;
  
  // Statistics
  getLogStatistics(logName: string): Promise<LogStatistics>;
  getAggregatedStatistics(): Promise<AggregatedStatistics>;
}
```

## API Design

NeuralLog exposes RESTful APIs for all components:

1. **Log Server API**: For managing logs and log entries.
2. **Auth Service API**: For authentication, authorization, and key management.
3. **Web Application API**: For the web UI.

### API Versioning

APIs are versioned to ensure backward compatibility:

1. **URL-based Versioning**: `/api/v1/...`
2. **Header-based Versioning**: `X-API-Version: 1`

## Client SDKs

NeuralLog provides SDKs for multiple programming languages:

1. **TypeScript/JavaScript**: For web and Node.js applications.
2. **Java**: For Java applications.
3. **Python**: For Python applications.
4. **Go**: For Go applications.
5. **C#**: For .NET applications.

### SDK Features

All SDKs provide the following features:

1. **Zero-Knowledge Encryption**: Client-side encryption of log data.
2. **Authentication**: Secure authentication with the Auth Service.
3. **Log Management**: Creating, updating, and deleting logs.
4. **Log Entry Management**: Appending and retrieving log entries.
5. **Search**: Searching log entries.
6. **Statistics**: Retrieving log statistics.

## Deployment Models

NeuralLog supports multiple deployment models:

1. **Cloud-Hosted**: Managed service hosted by NeuralLog.
2. **Self-Hosted**: Deployed in the customer's infrastructure.
3. **Hybrid**: Combination of cloud-hosted and self-hosted components.

### Cloud-Hosted Deployment

In the cloud-hosted model, NeuralLog manages the infrastructure:

1. **Multi-Tenant**: Multiple tenants share the same infrastructure.
2. **Isolated**: Each tenant's data is isolated.
3. **Scalable**: Infrastructure scales automatically based on demand.
4. **Managed**: NeuralLog handles updates, backups, and monitoring.

### Self-Hosted Deployment

In the self-hosted model, the customer manages the infrastructure:

1. **Single-Tenant**: Dedicated infrastructure for a single tenant.
2. **On-Premises**: Deployed in the customer's data center.
3. **Private Cloud**: Deployed in the customer's cloud environment.
4. **Docker/Kubernetes**: Containerized deployment for easy management.

## Conclusion

NeuralLog is designed to provide secure, scalable, and flexible logging capabilities for applications. The zero-knowledge architecture ensures that sensitive data is protected, while the multi-tenant design allows for efficient resource utilization. The system is built with developer experience in mind, providing easy-to-use SDKs for multiple programming languages and deployment models to suit different needs.
