---
sidebar_position: 1
---

# Client SDKs Overview

NeuralLog provides a suite of client SDKs that enable developers to integrate secure, zero-knowledge logging into their applications across multiple programming languages.

## Core Features

All NeuralLog Client SDKs share these core features:

- **Client-Side Encryption**: All sensitive data is encrypted before it leaves your application
- **Zero-Knowledge Architecture**: The server never has access to unencrypted data or encryption keys
- **Key Management**: Secure derivation and management of encryption keys
- **Log Creation and Retrieval**: Simple APIs for creating and retrieving logs
- **Search Capabilities**: Ability to search logs while maintaining zero-knowledge security

## Available SDKs

NeuralLog currently provides the following SDKs:

### TypeScript/JavaScript SDK

The TypeScript SDK is the cornerstone of NeuralLog's client libraries and serves as the reference implementation for all other SDKs.

- **Repository**: [NeuralLog/typescript-client-sdk](https://github.com/NeuralLog/typescript-client-sdk)
- **Package**: `@neurallog/client-sdk`
- **Platforms**: Node.js, Browser
- **Key Features**:
  - Complete implementation of the zero-knowledge architecture
  - Comprehensive key management
  - Support for both Node.js and browser environments

[Learn more about the TypeScript SDK](./typescript.md)

### Java SDK

The Java SDK provides NeuralLog integration for Java applications, with adapters for popular logging frameworks.

- **Repository**: [NeuralLog/java-client-sdk](https://github.com/NeuralLog/java-client-sdk)
- **Package**: `com.neurallog:client-sdk`
- **Platforms**: Java 8+
- **Key Features**:
  - Log4j and Logback adapters
  - Spring Boot integration
  - Android compatibility

[Learn more about the Java SDK](./java.md)

### C# SDK

The C# SDK enables .NET applications to use NeuralLog's secure logging capabilities.

- **Repository**: [NeuralLog/csharp-client-sdk](https://github.com/NeuralLog/csharp-client-sdk)
- **Package**: `NeuralLog.ClientSDK`
- **Platforms**: .NET Standard 2.0+
- **Key Features**:
  - Serilog integration
  - ASP.NET Core middleware
  - Unity game engine support

[Learn more about the C# SDK](./csharp.md)

### Python SDK

The Python SDK provides NeuralLog integration for Python applications.

- **Repository**: [NeuralLog/python-client-sdk](https://github.com/NeuralLog/python-client-sdk)
- **Package**: `neurallog-client-sdk`
- **Platforms**: Python 3.7+
- **Key Features**:
  - Integration with standard logging module
  - Django and Flask middleware
  - Jupyter Notebook support

[Learn more about the Python SDK](./python.md)

### Go SDK

The Go SDK enables Go applications to use NeuralLog's secure logging capabilities.

- **Repository**: [NeuralLog/go-client-sdk](https://github.com/NeuralLog/go-client-sdk)
- **Package**: `github.com/neurallog/client-sdk`
- **Platforms**: Go 1.13+
- **Key Features**:
  - Integration with standard log package
  - Gin and Echo middleware
  - Structured logging support

[Learn more about the Go SDK](./go.md)

## Common Usage Patterns

All NeuralLog SDKs follow similar usage patterns:

### 1. Initialization

```typescript
// TypeScript example
import { NeuralLogClient } from '@neurallog/client-sdk';

const client = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key'
});
```

### 2. Creating Logs

```typescript
// TypeScript example
await client.logs.createLog('application-logs', {
  description: 'Application logs for my service',
  retention: 30 // days
});
```

### 3. Logging Data

```typescript
// TypeScript example
await client.logs.appendToLog('application-logs', {
  level: 'info',
  message: 'User logged in',
  timestamp: new Date(),
  metadata: {
    userId: '123',
    ipAddress: '192.168.1.1'
  }
});
```

### 4. Retrieving Logs

```typescript
// TypeScript example
const logs = await client.logs.getLogEntries('application-logs', {
  limit: 100,
  offset: 0,
  startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  endTime: new Date()
});
```

### 5. Searching Logs

```typescript
// TypeScript example
const searchResults = await client.logs.searchLogs('application-logs', {
  query: 'level:error',
  limit: 100,
  offset: 0
});
```

## Integration with Logging Frameworks

Each SDK provides adapters for popular logging frameworks in their respective ecosystems:

- **TypeScript**: Winston, Pino
- **Java**: Log4j, Logback, JUL
- **C#**: Serilog, NLog
- **Python**: Standard logging, Loguru
- **Go**: Standard log, Zap, Logrus

These adapters make it easy to integrate NeuralLog into existing applications with minimal code changes.

## Security Considerations

When using NeuralLog SDKs, keep these security considerations in mind:

1. **API Key Protection**: Store API keys securely and never expose them in client-side code
2. **Environment Separation**: Use different API keys for development, staging, and production
3. **Sensitive Data**: Be mindful of what data you log, even with encryption
4. **Key Rotation**: Rotate API keys regularly
5. **Dependency Updates**: Keep SDKs updated to get the latest security patches

## Next Steps

- [TypeScript SDK Documentation](./typescript.md)
- [Comprehensive Client SDK Usage Guide](./comprehensive-usage-guide.md)
- [Java SDK Documentation](./java.md)
- [C# SDK Documentation](./csharp.md)
- [Python SDK Documentation](./python.md)
- [Go SDK Documentation](./go.md)
- [Logger Adapters](../logger-adapters/overview.md)
- [Security Architecture](../../security/zero-knowledge-architecture.md)
- [Authentication and Authorization Guide](../../security/comprehensive-auth-guide.md)
