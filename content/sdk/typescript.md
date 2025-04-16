---
sidebar_position: 2
---

# TypeScript SDK

The TypeScript SDK (`@neurallog/sdk`) provides a client library for interacting with the NeuralLog server from TypeScript and JavaScript applications. It uses the shared types from the `@neurallog/shared` package for consistency across the codebase.

## Overview

The SDK provides:
- A simple API for logging messages at different levels
- Methods for retrieving and searching logs
- Adapters for popular logging libraries (Console, Bunyan, Pino, Winston, Loglevel)

## Installation

```bash
# Configure npm to use the private registry for @neurallog scope
npm config set @neurallog:registry http://localhost:4873

# Install the SDK
npm install @neurallog/sdk --registry http://localhost:4873
```

## Basic Usage

```typescript
import { NeuralLog, LogLevel } from '@neurallog/sdk';

// Create a logger
const logger = NeuralLog.Log('my-app');

// Log messages at different levels
logger.debug('Debug message');
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', { error: 'Error details' });
logger.fatal('Fatal message');

// Get log entries
const entries = await logger.get();
console.log(entries);

// Search logs
const results = await logger.search({
  query: 'error',
  startTime: '2023-01-01T00:00:00.000Z',
  endTime: '2023-12-31T23:59:59.999Z',
  fieldFilters: { level: 'error' },
  limit: 10
});
console.log(results);

// Clear the log
await logger.clear();
```

## Configuration

You can configure the SDK globally:

```typescript
import { NeuralLog } from '@neurallog/sdk';

// Configure global options
NeuralLog.configure({
  serverUrl: 'http://logs-server:3030',
  defaultNamespace: 'production'
});
```

Or per logger:

```typescript
import { NeuralLog, LogLevel } from '@neurallog/sdk';

// Create a logger with custom options
const logger = NeuralLog.Log('my-app', {
  defaultLevel: LogLevel.INFO,
  includeTimestamps: true
});
```

## Adapters

The SDK provides adapters for popular logging libraries:

### Console Adapter

```typescript
import { ConsoleAdapter } from '@neurallog/sdk/adapters';

// Create adapter
const logger = new ConsoleAdapter({
  logName: 'my-app'
});

// Use the logger
logger.info('Hello, world!');
logger.error('Something went wrong', { error: 'Error details' });
```

### Bunyan Adapter

```typescript
import bunyan from 'bunyan';
import { BunyanAdapter } from '@neurallog/sdk/adapters';

// Create Bunyan logger
const bunyanLogger = bunyan.createLogger({
  name: 'my-app'
});

// Create adapter
const logger = new BunyanAdapter({
  logger: bunyanLogger,
  logName: 'my-app'
});

// Use the logger
logger.info('Hello, world!');
logger.error('Something went wrong', { error: 'Error details' });
```

### Pino Adapter

```typescript
import pino from 'pino';
import { PinoAdapter } from '@neurallog/sdk/adapters';

// Create Pino logger
const pinoLogger = pino();

// Create adapter
const logger = new PinoAdapter({
  logger: pinoLogger,
  logName: 'my-app'
});

// Use the logger
logger.info('Hello, world!');
logger.error('Something went wrong', { error: 'Error details' });
```

### Winston Adapter

```typescript
import winston from 'winston';
import { WinstonAdapter } from '@neurallog/sdk/adapters';

// Create Winston logger
const winstonLogger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

// Create adapter
const logger = new WinstonAdapter({
  logger: winstonLogger,
  logName: 'my-app'
});

// Use the logger
logger.info('Hello, world!');
logger.error('Something went wrong', { error: 'Error details' });
```

### Loglevel Adapter

```typescript
import loglevel from 'loglevel';
import { LoglevelAdapter } from '@neurallog/sdk/adapters';

// Create Loglevel logger
const loglevelLogger = loglevel.getLogger('my-app');

// Create adapter
const logger = new LoglevelAdapter({
  logger: loglevelLogger,
  logName: 'my-app'
});

// Use the logger
logger.info('Hello, world!');
logger.error('Something went wrong', { error: 'Error details' });
```

## API Reference

### NeuralLog

#### Static Methods

- `configure(options: GlobalOptions): void` - Configure global options
- `Log(name: string, options?: LoggerOptions): Logger` - Create a new logger
- `search(criteria?: SearchCriteria): Promise<LogEntry[]>` - Search logs
- `getLogs(limit?: number, serverUrl?: string): Promise<string[]>` - Get all log names

### Logger

#### Methods

- `log(level: LogLevel, message: string, data?: Record<string, any>): Promise<Logger>` - Log a message at the specified level
- `debug(message: string, data?: Record<string, any>): Promise<Logger>` - Log a debug message
- `info(message: string, data?: Record<string, any>): Promise<Logger>` - Log an info message
- `warn(message: string, data?: Record<string, any>): Promise<Logger>` - Log a warning message
- `error(message: string, data?: Record<string, any>): Promise<Logger>` - Log an error message
- `fatal(message: string, data?: Record<string, any>): Promise<Logger>` - Log a fatal message
- `clear(): Promise<Logger>` - Clear the log
- `get(limit?: number): Promise<LogEntry[]>` - Get log entries
- `search(criteria?: SearchCriteria): Promise<LogEntry[]>` - Search this log
- `getName(): string` - Get the log name

### Shared Types

The SDK uses the following types from the `@neurallog/shared` package:

```typescript
/**
 * Log levels
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Log entry interface
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  data: Record<string, any>;
}

/**
 * Log response interface
 */
export interface LogResponse {
  status: string;
  name: string;
  namespace: string;
  entries: LogEntry[];
}
```

## Publishing the SDK

To publish the SDK to the private registry:

```powershell
# Windows (PowerShell)
cd infra
./scripts/Publish-SDK.ps1
```

This script will:
1. Start Verdaccio if it's not already running
2. Configure npm to use the private registry for the @neurallog scope
3. Build the SDK
4. Publish the SDK to the private registry

## Source Code

The source code for the NeuralLog TypeScript SDK is available in the main NeuralLog repository.
