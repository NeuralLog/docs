---
sidebar_position: 1
---

# Logger Adapters Overview

NeuralLog Logger Adapters provide seamless integration with popular logging frameworks across different programming languages. These adapters make it easy to add secure, zero-knowledge logging to existing applications with minimal code changes.

## What are Logger Adapters?

Logger Adapters are components that bridge the gap between standard logging frameworks and NeuralLog's secure logging infrastructure. They:

1. **Intercept log messages** from your existing logging framework
2. **Encrypt sensitive data** using NeuralLog's client-side encryption
3. **Send encrypted logs** to NeuralLog's Log Server
4. **Maintain compatibility** with your existing logging patterns and configurations

## Benefits of Using Logger Adapters

- **Minimal Code Changes**: Add NeuralLog to existing applications without rewriting logging code
- **Familiar APIs**: Continue using the logging frameworks your team already knows
- **Dual Logging**: Optionally maintain local logs while also sending encrypted logs to NeuralLog
- **Configurable Behavior**: Control what gets logged to NeuralLog vs. local logs
- **Performance Optimized**: Designed for minimal performance impact

## Available Adapters

NeuralLog provides adapters for the most popular logging frameworks across multiple languages:

### JavaScript/TypeScript

- **Winston Adapter**: For Node.js applications using Winston
- **Pino Adapter**: For high-performance Node.js applications using Pino
- **Console Adapter**: Simple adapter for applications using console.log
- **Browser Adapter**: For capturing browser console logs

### Java

- **Log4j Adapter**: For applications using Apache Log4j
- **Logback Adapter**: For applications using Logback
- **JUL Adapter**: For applications using java.util.logging
- **SLF4J Adapter**: Generic adapter for SLF4J-compatible frameworks

### C#

- **Serilog Adapter**: For applications using Serilog
- **NLog Adapter**: For applications using NLog
- **Microsoft.Extensions.Logging Adapter**: For ASP.NET Core applications

### Python

- **Standard Logging Adapter**: For applications using Python's built-in logging module
- **Loguru Adapter**: For applications using Loguru
- **Django Adapter**: Specialized adapter for Django applications
- **Flask Adapter**: Specialized adapter for Flask applications

### Go

- **Standard Log Adapter**: For applications using Go's built-in log package
- **Zap Adapter**: For applications using Uber's Zap logger
- **Logrus Adapter**: For applications using Logrus
- **Zerolog Adapter**: For applications using Zerolog

## Common Usage Patterns

While the specific implementation details vary by language and framework, all NeuralLog Logger Adapters follow similar usage patterns:

### 1. Installation

Install both the NeuralLog Client SDK and the appropriate Logger Adapter for your framework.

```bash
# TypeScript/JavaScript example
npm install @neurallog/client-sdk @neurallog/winston-adapter
```

### 2. Configuration

Configure the adapter with your NeuralLog credentials and options.

```javascript
// TypeScript/JavaScript example with Winston
import { createLogger } from 'winston';
import { NeuralLogTransport } from '@neurallog/winston-adapter';
import { NeuralLogClient } from '@neurallog/client-sdk';

// Create NeuralLog client
const neuralLogClient = new NeuralLogClient({
  authUrl: 'https://auth.neurallog.com',
  logServerUrl: 'https://logs.neurallog.com',
  tenantId: 'your-tenant-id',
  apiKey: 'your-api-key'
});

// Create Winston logger with NeuralLog transport
const logger = createLogger({
  transports: [
    new NeuralLogTransport({
      client: neuralLogClient,
      logName: 'application-logs',
      level: 'info'
    })
  ]
});
```

### 3. Logging

Use your existing logging framework as usual. The adapter will handle the encryption and transmission to NeuralLog.

```javascript
// TypeScript/JavaScript example with Winston
logger.info('User logged in', { userId: '123', ipAddress: '192.168.1.1' });
logger.error('Failed to process payment', { orderId: '456', error: 'Insufficient funds' });
```

### 4. Advanced Configuration

Most adapters support advanced configuration options:

```javascript
// TypeScript/JavaScript example with Winston
const logger = createLogger({
  transports: [
    new NeuralLogTransport({
      client: neuralLogClient,
      logName: 'application-logs',
      level: 'info',
      // Advanced options
      batchSize: 10, // Send logs in batches of 10
      flushInterval: 5000, // Flush logs every 5 seconds
      sensitiveFields: ['password', 'creditCard'], // Fields to encrypt with extra protection
      contextProvider: () => ({ serviceVersion: '1.2.3' }) // Add context to all logs
    })
  ]
});
```

## Framework-Specific Features

Each adapter is tailored to the specific features and patterns of its target framework:

### Winston Adapter (JavaScript/TypeScript)

- **Transport Implementation**: Implements Winston's Transport interface
- **Metadata Support**: Full support for Winston's metadata objects
- **Formatting**: Compatible with Winston's formatters
- **Levels**: Maps Winston's log levels to NeuralLog levels

### Log4j Adapter (Java)

- **Appender Implementation**: Implements Log4j's Appender interface
- **Layout Support**: Compatible with Log4j's layouts
- **MDC Integration**: Captures Log4j's Mapped Diagnostic Context
- **Async Support**: Optional asynchronous logging for better performance

### Serilog Adapter (C#)

- **Sink Implementation**: Implements Serilog's Sink interface
- **Structured Logging**: Full support for Serilog's structured logging
- **Enrichers**: Compatible with Serilog's enrichers
- **Filtering**: Supports Serilog's filtering capabilities

## Best Practices

To get the most out of NeuralLog Logger Adapters:

1. **Configure Log Levels Appropriately**: Only send relevant logs to NeuralLog to optimize performance and storage
2. **Use Structured Logging**: Take advantage of structured logging to make logs more searchable
3. **Consider Batching**: For high-volume applications, use batching to reduce network overhead
4. **Add Context**: Include relevant context (service name, version, environment) in all logs
5. **Monitor Performance**: Keep an eye on the performance impact of logging
6. **Implement Fallback Logging**: Configure fallback logging in case of connectivity issues

## Next Steps

- [Client SDKs Overview](../client-sdks/overview.md)
- [Security Architecture](../../security/zero-knowledge-architecture.md)
