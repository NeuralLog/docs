---
sidebar_position: 1
---

# Docker Deployment

This guide explains how to deploy NeuralLog using Docker and Docker Compose.

## Prerequisites

- Docker
- Docker Compose
- Git

## Network Setup

First, create a Docker network for all NeuralLog components:

```powershell
docker network create neurallog-network
```

## Component Deployment

### Private Registry (Verdaccio)

```yaml
# docker-compose.web.yml
version: '3.8'

services:
  # Verdaccio private npm registry
  verdaccio:
    image: verdaccio/verdaccio:latest
    container_name: verdaccio
    ports:
      - "4873:4873"
    volumes:
      - verdaccio-storage:/verdaccio/storage
      - verdaccio-conf:/verdaccio/conf
      - verdaccio-plugins:/verdaccio/plugins
    networks:
      - neurallog-network
    restart: unless-stopped

volumes:
  verdaccio-storage:
  verdaccio-conf:
  verdaccio-plugins:

networks:
  neurallog-network:
    external: true
```

Start Verdaccio:

```powershell
docker-compose -f docker-compose.web.yml up -d verdaccio
```

### Database Components

```yaml
# docker-compose.server.yml
version: '3.8'

services:
  # Redis for logs storage
  redis:
    image: redis:7.0-alpine
    container_name: neurallog-redis
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - neurallog-network
    restart: unless-stopped

  # PostgreSQL for OpenFGA
  postgres:
    image: postgres:14
    container_name: postgres
    environment:
      POSTGRES_USER: openfga
      POSTGRES_PASSWORD: openfga
      POSTGRES_DB: openfga
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - neurallog-network
    restart: unless-stopped

volumes:
  redis-data:
  postgres-data:

networks:
  neurallog-network:
    external: true
```

Start the database components:

```powershell
docker-compose -f docker-compose.server.yml up -d redis postgres
```

### OpenFGA

```yaml
# docker-compose.auth.yml
version: '3.8'

services:
  # OpenFGA migrations
  openfga-migrate:
    image: openfga/openfga:latest
    container_name: openfga-migrate
    command: migrate
    environment:
      OPENFGA_DATASTORE_ENGINE: postgres
      OPENFGA_DATASTORE_URI: postgresql://openfga:openfga@postgres:5432/openfga
    networks:
      - neurallog-network
    depends_on:
      - postgres

  # OpenFGA server
  openfga:
    image: openfga/openfga:latest
    container_name: openfga
    command: run
    environment:
      OPENFGA_DATASTORE_ENGINE: postgres
      OPENFGA_DATASTORE_URI: postgresql://openfga:openfga@postgres:5432/openfga
      OPENFGA_LOG_FORMAT: json
      OPENFGA_AUTHN_METHOD: none
      OPENFGA_PLAYGROUND_ENABLED: "true"
    ports:
      - "8080:8080"
      - "8081:8081"
    networks:
      - neurallog-network
    depends_on:
      - openfga-migrate
    restart: unless-stopped

networks:
  neurallog-network:
    external: true
```

Start OpenFGA:

```powershell
docker-compose -f docker-compose.auth.yml up -d
```

### Logs Server

```yaml
# docker-compose.server.yml (continued)
services:
  # ...

  # Logs server
  server:
    image: node:22-alpine
    container_name: neurallog-server
    working_dir: /app
    volumes:
      - ./server:/app
    environment:
      NODE_ENV: development
      PORT: 3030
      STORAGE_TYPE: redis
      REDIS_HOST: neurallog-redis
      REDIS_PORT: 6379
      DEFAULT_NAMESPACE: default
    ports:
      - "3030:3030"
    command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npm run build ; npm start"
    networks:
      - neurallog-network
    depends_on:
      - redis
      - verdaccio
    restart: unless-stopped
```

Start the logs server:

```powershell
docker-compose -f docker-compose.server.yml up -d server
```

### Auth Service

```yaml
# docker-compose.auth.yml (continued)
services:
  # ...

  # Auth service
  auth:
    image: node:22-alpine
    container_name: auth-service
    working_dir: /app
    volumes:
      - ./auth:/app
    environment:
      NODE_ENV: development
      PORT: 3040
      OPENFGA_API_URL: http://openfga:8080
      DEFAULT_TENANT_ID: default
    ports:
      - "3040:3040"
    command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npm run build ; npm start"
    networks:
      - neurallog-network
    depends_on:
      - openfga
      - verdaccio
    restart: unless-stopped
```

Start the auth service:

```powershell
docker-compose -f docker-compose.auth.yml up -d auth
```

### Web Application

```yaml
# docker-compose.web.yml (continued)
services:
  # ...

  # Web application
  web:
    image: node:22-alpine
    container_name: neurallog-web
    working_dir: /app
    volumes:
      - ./web:/app
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_AUTH_SERVICE_API_URL: http://auth-service:3040
      NEXT_PUBLIC_AUTH_SERVICE_API_KEY: dev-api-key
      LOGS_API_URL: http://neurallog-server:3030
      NEXT_PUBLIC_LOGS_SERVICE_API_URL: http://localhost:3030
      REDIS_HOST: neurallog-redis
      REDIS_PORT: 6379
      TENANT_ID: default
    ports:
      - "3000:3000"
    command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npx next dev"
    networks:
      - neurallog-network
    depends_on:
      - verdaccio
    restart: unless-stopped
```

Start the web application:

```powershell
docker-compose -f docker-compose.web.yml up -d web
```

## Combined Deployment

For convenience, you can create a combined Docker Compose file:

```yaml
# docker-compose.combined.yml
version: '3.8'

services:
  # Verdaccio private npm registry
  verdaccio:
    image: verdaccio/verdaccio:latest
    container_name: verdaccio
    ports:
      - "4873:4873"
    volumes:
      - verdaccio-storage:/verdaccio/storage
      - verdaccio-conf:/verdaccio/conf
      - verdaccio-plugins:/verdaccio/plugins
    networks:
      - neurallog-network
    restart: unless-stopped

  # Redis for logs storage
  redis:
    image: redis:7.0-alpine
    container_name: neurallog-redis
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    networks:
      - neurallog-network
    restart: unless-stopped

  # PostgreSQL for OpenFGA
  postgres:
    image: postgres:14
    container_name: postgres
    environment:
      POSTGRES_USER: openfga
      POSTGRES_PASSWORD: openfga
      POSTGRES_DB: openfga
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - neurallog-network
    restart: unless-stopped

  # OpenFGA migrations
  openfga-migrate:
    image: openfga/openfga:latest
    container_name: openfga-migrate
    command: migrate
    environment:
      OPENFGA_DATASTORE_ENGINE: postgres
      OPENFGA_DATASTORE_URI: postgresql://openfga:openfga@postgres:5432/openfga
    networks:
      - neurallog-network
    depends_on:
      - postgres

  # OpenFGA server
  openfga:
    image: openfga/openfga:latest
    container_name: openfga
    command: run
    environment:
      OPENFGA_DATASTORE_ENGINE: postgres
      OPENFGA_DATASTORE_URI: postgresql://openfga:openfga@postgres:5432/openfga
      OPENFGA_LOG_FORMAT: json
      OPENFGA_AUTHN_METHOD: none
      OPENFGA_PLAYGROUND_ENABLED: "true"
    ports:
      - "8080:8080"
      - "8081:8081"
    networks:
      - neurallog-network
    depends_on:
      - openfga-migrate
    restart: unless-stopped

  # Auth service
  auth:
    image: node:22-alpine
    container_name: auth-service
    working_dir: /app
    volumes:
      - ./auth:/app
    environment:
      NODE_ENV: development
      PORT: 3040
      OPENFGA_API_URL: http://openfga:8080
      DEFAULT_TENANT_ID: default
    ports:
      - "3040:3040"
    command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npm run build ; npm start"
    networks:
      - neurallog-network
    depends_on:
      - openfga
      - verdaccio
    restart: unless-stopped

  # Logs server
  server:
    image: node:22-alpine
    container_name: neurallog-server
    working_dir: /app
    volumes:
      - ./server:/app
    environment:
      NODE_ENV: development
      PORT: 3030
      STORAGE_TYPE: redis
      REDIS_HOST: neurallog-redis
      REDIS_PORT: 6379
      DEFAULT_NAMESPACE: default
    ports:
      - "3030:3030"
    command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npm run build ; npm start"
    networks:
      - neurallog-network
    depends_on:
      - redis
      - verdaccio
    restart: unless-stopped

  # Web application
  web:
    image: node:22-alpine
    container_name: neurallog-web
    working_dir: /app
    volumes:
      - ./web:/app
    environment:
      NODE_ENV: development
      NEXT_PUBLIC_AUTH_SERVICE_API_URL: http://auth-service:3040
      NEXT_PUBLIC_AUTH_SERVICE_API_KEY: dev-api-key
      LOGS_API_URL: http://neurallog-server:3030
      NEXT_PUBLIC_LOGS_SERVICE_API_URL: http://localhost:3030
      REDIS_HOST: neurallog-redis
      REDIS_PORT: 6379
      TENANT_ID: default
    ports:
      - "3000:3000"
    command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npx next dev"
    networks:
      - neurallog-network
    depends_on:
      - verdaccio
      - server
      - auth
    restart: unless-stopped

volumes:
  verdaccio-storage:
  verdaccio-conf:
  verdaccio-plugins:
  redis-data:
  postgres-data:

networks:
  neurallog-network:
    external: true
```

Start all components:

```powershell
docker-compose -f docker-compose.combined.yml up -d
```

## Development Mode

For development, you might want to run some components in Docker and others locally:

### Run Infrastructure in Docker

```powershell
docker-compose -f docker-compose.combined.yml up -d verdaccio redis postgres openfga-migrate openfga
```

### Run Services Locally

```powershell
# Terminal 1: Auth Service
cd auth
npm install
npm run build
npm start

# Terminal 2: Logs Server
cd server
npm install
npm run build
npm start

# Terminal 3: Web Application
cd web
npm install
npx next dev
```

## Troubleshooting

### Network Issues

If containers can't communicate with each other, check the network:

```powershell
docker network inspect neurallog-network
```

### Volume Permissions

If you encounter permission issues with volumes, make sure the user inside the container has the necessary permissions:

```powershell
docker exec -it neurallog-server sh -c "chown -R node:node /app"
```

### Container Logs

To check container logs:

```powershell
docker logs neurallog-server
docker logs auth-service
docker logs neurallog-web
```

### Restart Containers

If a container is not working correctly, try restarting it:

```powershell
docker restart neurallog-server
```

### Rebuild Containers

If you need to rebuild a container:

```powershell
docker-compose -f docker-compose.combined.yml up -d --build server
```
