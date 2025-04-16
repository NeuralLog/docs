---
sidebar_position: 1
---

# Development Environment Setup

This guide will help you set up your development environment for working with NeuralLog.

## Prerequisites

- **Node.js**: Version 22 or later
- **Docker**: Latest version
- **Docker Compose**: Latest version
- **Git**: Latest version
- **PowerShell**: For Windows users

## Repository Setup

NeuralLog consists of multiple repositories that need to be set up individually. All repositories should use `main` as the default branch.

### Clone the Repositories

```powershell
# Create a directory for NeuralLog
mkdir NeuralLog
cd NeuralLog

# Clone the repositories
git clone https://github.com/NeuralLog/server.git server
git clone https://github.com/NeuralLog/web.git web
git clone https://github.com/NeuralLog/auth.git auth
git clone https://github.com/NeuralLog/shared.git shared
git clone https://github.com/NeuralLog/specs.git specs
git clone https://github.com/NeuralLog/docs.git docs
git clone https://github.com/NeuralLog/infra.git infra

# Clone SDK repositories
git clone https://github.com/NeuralLog/typescript-sdk.git typescript-sdk
git clone https://github.com/NeuralLog/java-sdk.git java-sdk
git clone https://github.com/NeuralLog/csharp-sdk.git csharp-sdk
git clone https://github.com/NeuralLog/python-sdk.git python-sdk
git clone https://github.com/NeuralLog/go-sdk.git go-sdk
```

### Initialize Git in the Specs Directory

```powershell
cd specs
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/NeuralLog/specs.git
git push -u origin main
cd ..
```

## Docker Environment Setup

NeuralLog uses Docker for development and deployment. The following steps will set up the Docker environment.

### Start the Private Registry

NeuralLog uses Verdaccio as a private npm registry for sharing packages between components.

```powershell
# Start the Verdaccio container
docker-compose -f docker-compose.web.yml up -d verdaccio

# Wait for Verdaccio to start
Start-Sleep -Seconds 5

# Configure npm to use the private registry for @neurallog scope
npm config set @neurallog:registry http://localhost:4873

# Create a user in Verdaccio (if not already created)
# Use username: admin, password: admin
npm adduser --registry http://localhost:4873 --auth-type=legacy
```

### Start the Infrastructure Components

```powershell
# Start Redis
docker-compose -f docker-compose.server.yml up -d redis

# Start PostgreSQL and OpenFGA
docker network create neurallog-network

docker run --name postgres -d --network neurallog-network -e POSTGRES_USER=openfga -e POSTGRES_PASSWORD=openfga -e POSTGRES_DB=openfga -p 5432:5432 postgres:14

docker run --name openfga-migrate -d --network neurallog-network -e OPENFGA_DATASTORE_ENGINE=postgres -e OPENFGA_DATASTORE_URI=postgresql://openfga:openfga@postgres:5432/openfga openfga/openfga:latest migrate

docker run --name openfga -d --network neurallog-network -e OPENFGA_DATASTORE_ENGINE=postgres -e OPENFGA_DATASTORE_URI=postgresql://openfga:openfga@postgres:5432/openfga -e OPENFGA_LOG_FORMAT=json -e OPENFGA_AUTHN_METHOD=none -e OPENFGA_PLAYGROUND_ENABLED=true -p 8080:8080 -p 8081:8081 openfga/openfga:latest run
```

### Start the Services

```powershell
# Start the auth service
docker run --name auth-service -d --network neurallog-network -v ${PWD}/auth:/app -e NODE_ENV=development -e PORT=3040 -e OPENFGA_API_URL=http://openfga:8080 -e DEFAULT_TENANT_ID=default -p 3040:3040 node:22-alpine sh -c "cd /app ; npm install ; npm run build ; npm start"

# Start the logs server
docker run --name neurallog-server -d --network neurallog-network -v ${PWD}/server:/app -e NODE_ENV=development -e PORT=3030 -e STORAGE_TYPE=redis -e REDIS_HOST=neurallog-redis -e REDIS_PORT=6379 -e DEFAULT_NAMESPACE=default -p 3030:3030 node:22-alpine sh -c "cd /app ; npm install ; npm run build ; npm start"
```

### Run the Web Application Locally

For development, it's often better to run the web application locally while connecting to the Docker services.

```powershell
cd web
npm install
npx next dev
```

This will start the web application on http://localhost:3000.

## Shared Package Development

The shared package contains common types and utilities used by other components. When making changes to the shared package:

```powershell
cd shared

# Make your changes

# Build the package
npm run build

# Publish to the private registry
npm publish --registry http://localhost:4873

# Update in dependent repositories
cd ../server
npm install @neurallog/shared@latest --registry http://localhost:4873
```

## SDK Development

Each SDK has its own repository and development workflow:

### TypeScript SDK

```powershell
cd typescript-sdk
npm install
npm run build
npm test
```

### Java SDK

```powershell
cd java-sdk
mvn clean install
```

### C# SDK

```powershell
cd csharp-sdk
dotnet build
dotnet test
```

### Python SDK

```powershell
cd python-sdk
pip install -e .
pytest
```

### Go SDK

```powershell
cd go-sdk
go test ./...
```

## Troubleshooting

### Redis Connection Issues

If the logs server can't connect to Redis, make sure the Redis container is running and on the same network:

```powershell
docker ps | Select-String redis
docker network inspect neurallog-network
```

### Shared Package Not Found

If you see errors about `@neurallog/shared` not being found, make sure it's published to the private registry:

```powershell
cd shared
npm run build
npm publish --registry http://localhost:4873
```

Then install it in the component that needs it:

```powershell
cd ../server
npm install @neurallog/shared --registry http://localhost:4873
```

### Docker Network Issues

If containers can't communicate with each other, make sure they're on the same network:

```powershell
# Create the network if it doesn't exist
docker network create neurallog-network

# Connect a container to the network
docker network connect neurallog-network container-name
```

### Port Conflicts

If you see errors about ports being in use, check what's using the port:

```powershell
# Windows
netstat -ano | findstr :3030

# Stop the process
taskkill /PID <PID> /F
```

### Node.js Version Issues

Make sure you're using Node.js 22 or later:

```powershell
node --version
```

If you need to switch Node.js versions, use a version manager like nvm or nvm-windows.
