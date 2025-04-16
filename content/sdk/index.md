---
sidebar_position: 1
---

# SDK Documentation

NeuralLog provides SDKs for various programming languages to make it easy to integrate with your applications. All SDKs are built on the principles of the TypeScript Client SDK, which is the cornerstone of NeuralLog's zero-knowledge architecture.

## The TypeScript Client SDK: The Cornerstone

The [TypeScript Client SDK](../security/typescript-client-sdk-cornerstone.md) is the cornerstone of NeuralLog's zero-knowledge architecture. It implements all cryptographic operations client-side, ensuring that sensitive data never leaves the client unencrypted. This approach provides unprecedented security and privacy while still enabling powerful features like searchable encryption.

All other SDKs are built on the same principles as the TypeScript Client SDK, ensuring a consistent zero-knowledge approach across all client implementations.

## Available SDKs

- [TypeScript/JavaScript SDK](./typescript.md) - For Node.js and browser applications, built directly on the TypeScript Client SDK
- [Java SDK](./java.md) - For Java applications with adapters for Log4j, SLF4J, and more, implementing the same zero-knowledge principles
- [C# SDK](./csharp.md) - For .NET applications with adapters for Microsoft.Extensions.Logging, Serilog, and NLog, implementing the same zero-knowledge principles
- [Python SDK](./python.md) - For Python applications with adapters for the standard logging module and Loguru, implementing the same zero-knowledge principles
- [Go SDK](./go.md) - For Go applications with adapters for the standard log package, logrus, and zap, implementing the same zero-knowledge principles

## Common Features

All NeuralLog SDKs share the following features:

- **Zero-Knowledge Architecture**: All cryptographic operations happen client-side
- **Client-Side Encryption**: All data is encrypted before transmission
- **Client-Side Decryption**: Data is only decrypted on authorized clients
- **Searchable Encryption**: Search capabilities without compromising the zero-knowledge model
- Simple API for logging messages at different levels (debug, info, warning, error, fatal)
- Support for structured data in log entries
- Support for exception/error information
- Context support for adding common data to all log entries
- Asynchronous logging with batching for improved performance
- Adapters for popular logging libraries in each language
- Configurable retry logic for handling network issues
- Authentication support via API keys or JWT tokens
- Multi-tenancy support through tenant ID configuration

## Choosing an SDK

Choose the SDK that matches your programming language and environment:

| SDK | Language | Platforms | Adapters |
|-----|----------|-----------|----------|
| [TypeScript](./typescript.md) | TypeScript/JavaScript | Node.js, Browsers | Console, Bunyan, Pino, Winston, Loglevel |
| [Java](./java.md) | Java | JVM (Java 22+) | Log4j 2, SLF4J/Logback, JUL, Commons Logging |
| [C#](./csharp.md) | C# | .NET 6.0+ | Microsoft.Extensions.Logging, Serilog, NLog |
| [Python](./python.md) | Python | Python 3.8+ | Standard logging, Loguru |
| [Go](./go.md) | Go | Go 1.18+ | Standard log, logrus, zap |

## Zero-Knowledge Authentication

All NeuralLog SDKs implement zero-knowledge authentication, where passwords and master secrets never leave the client. The authentication process is handled by the TypeScript Client SDK, which is the cornerstone of NeuralLog's security architecture.

### API Key Authentication

API keys are the recommended authentication method for server-side applications. These keys contain cryptographic material needed to derive encryption keys:

```typescript
// TypeScript example
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id'
});

await client.authenticateWithApiKey('your-api-key');

const logger = client.createLogger('my-log');
```

### Password Authentication

Password authentication is recommended for browser-based applications. The password is used to derive a master secret, which is then used to derive encryption keys:

```typescript
// TypeScript example
const client = new NeuralLogClient({
  tenantId: 'your-tenant-id'
});

await client.authenticateWithPassword('username', 'password');

const logger = client.createLogger('my-log');
```

### Multi-tenancy Support

All SDKs support specifying a tenant ID for multi-tenant environments. Each tenant has its own encryption keys, providing strong isolation:

```typescript
// TypeScript example
const client = new NeuralLogClient({
  tenantId: 'tenant-id'
});

await client.authenticateWithApiKey('your-api-key');

const logger = client.createLogger('my-log');
```

For more details on authentication, see the [Authentication Architecture](../overview/authentication-architecture.md) and [TypeScript Client SDK: The Cornerstone of Zero-Knowledge Security](../security/typescript-client-sdk-cornerstone.md) pages.

## Getting Started

To get started with NeuralLog, choose the SDK for your programming language and follow the installation and usage instructions. Each SDK page includes:

1. Installation instructions
2. Basic usage examples
3. Configuration options
4. Authentication setup
5. Framework adapter examples
6. Advanced features
7. Troubleshooting tips

## Source Code

All NeuralLog SDKs are open source and available on GitHub:

- [TypeScript Client SDK](https://github.com/NeuralLog/typescript-client-sdk) - The cornerstone of NeuralLog's zero-knowledge architecture
- [TypeScript SDK](https://github.com/NeuralLog/typescript-sdk) - Built on the TypeScript Client SDK
- [Java SDK](https://github.com/NeuralLog/java-sdk) - Implements the same zero-knowledge principles as the TypeScript Client SDK
- [C# SDK](https://github.com/NeuralLog/csharp-sdk) - Implements the same zero-knowledge principles as the TypeScript Client SDK
- [Python SDK](https://github.com/NeuralLog/python-sdk) - Implements the same zero-knowledge principles as the TypeScript Client SDK
- [Go SDK](https://github.com/NeuralLog/go-sdk) - Implements the same zero-knowledge principles as the TypeScript Client SDK
