---
sidebar_position: 2
---

# Shared Package Management

The `@neurallog/shared` package contains common types and utilities used across all NeuralLog components, including the server, web application, and SDK. This guide explains how to manage, publish, and consume the shared package.

## Package Structure

The shared package is located in the `shared` directory and has the following structure:

```
shared/
├── types/             # Type definitions
│   ├── index.ts       # Main entry point for types
│   └── ...            # Other type files
├── dist/              # Compiled output
├── package.json       # Package configuration
└── tsconfig.json      # TypeScript configuration
```

## Key Types

The shared package includes several key types used throughout the NeuralLog system:

### LogLevel

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
```

### LogEntry

```typescript
/**
 * Log entry interface
 */
export interface LogEntry {
  id: string;
  timestamp: number;
  data: Record<string, any>;
}
```

### LogResponse

```typescript
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

## Building the Package

Before publishing, you need to build the package:

```powershell
cd shared
npm run build
```

This will compile the TypeScript code and generate the distribution files in the `dist` directory.

## Publishing to the Private Registry

NeuralLog uses Verdaccio as a private npm registry for sharing packages between components. To publish the shared package:

### 1. Start the Verdaccio Container

```powershell
docker-compose -f docker-compose.web.yml up -d verdaccio
```

### 2. Configure npm to Use the Private Registry

```powershell
npm config set @neurallog:registry http://localhost:4873
```

### 3. Create a User in Verdaccio (if not already created)

```powershell
# Use username: admin, password: admin
npm adduser --registry http://localhost:4873 --auth-type=legacy
```

### 4. Publish the Package

```powershell
cd shared
npm publish --registry http://localhost:4873
```

### 5. Verify the Package is Published

You can check if the package is published by visiting the Verdaccio web interface at http://localhost:4873.

## Installing the Shared Package

To install the shared package in another component:

### 1. Configure npm to Use the Private Registry

```powershell
npm config set @neurallog:registry http://localhost:4873
```

### 2. Install the Package

```powershell
npm install @neurallog/shared --registry http://localhost:4873
```

## Using the Shared Package in Docker

When using the shared package in a Docker container, you need to configure npm to use the private registry:

```dockerfile
# Configure npm to use the private registry
RUN npm config set @neurallog:registry http://verdaccio:4873

# Install dependencies
RUN npm install
```

In Docker Compose, you can use the following command:

```yaml
command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npm run build ; npm start"
```

## Updating the Shared Package

When you make changes to the shared package, you need to:

1. Update the version number in `package.json`
2. Build the package
3. Publish the new version
4. Update the package in all components that use it

### Example Workflow

```powershell
# Make changes to the shared package
cd shared

# Update the version number in package.json
# (Edit the file manually or use npm version)
npm version patch

# Build the package
npm run build

# Publish the new version
npm publish --registry http://localhost:4873

# Update the package in other components
cd ../server
npm install @neurallog/shared@latest --registry http://localhost:4873

cd ../web
npm install @neurallog/shared@latest --registry http://localhost:4873

cd ../auth
npm install @neurallog/shared@latest --registry http://localhost:4873

cd ../typescript
npm install @neurallog/shared@latest --registry http://localhost:4873
```

## Troubleshooting

### Package Not Found

If you get an error that the package cannot be found, make sure:

1. Verdaccio is running
2. You've published the package to Verdaccio
3. npm is configured to use the private registry for the @neurallog scope

### TypeScript Errors

If you get TypeScript errors about missing types, make sure:

1. The package is built correctly
2. The package is installed correctly
3. The `tsconfig.json` file in the consuming project is configured to use the types

### Docker Connection Issues

If Docker containers can't connect to Verdaccio, make sure:

1. All containers are on the same network
2. You're using the correct hostname (`verdaccio` inside Docker, `localhost` outside Docker)
3. The Verdaccio container is running
