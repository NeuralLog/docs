---
sidebar_position: 2
---

# Quick Start Guide

This guide will help you get started with NeuralLog quickly. We'll set up a basic development environment with all the core components.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [Docker](https://www.docker.com/) (for running services in containers)
- [Git](https://git-scm.com/) (for cloning repositories)

## Step 1: Clone the Repositories

First, let's clone the main NeuralLog repositories:

```bash
# Create a directory for NeuralLog projects
mkdir NeuralLog
cd NeuralLog

# Clone the repositories
git clone https://github.com/NeuralLog/auth.git
git clone https://github.com/NeuralLog/server.git
git clone https://github.com/NeuralLog/web.git
git clone https://github.com/NeuralLog/specs.git
```

## Step 2: Set Up the Auth Service

```bash
# Navigate to the auth directory
cd auth

# Install dependencies
npm install

# Start the development server
npm run dev
```

The Auth service will be available at http://localhost:3000.

## Step 3: Set Up the Server

```bash
# Navigate to the server directory
cd ../server

# Install dependencies
npm install

# Start the development server with Memory storage
npm run dev:memory
```

The Server will be available at http://localhost:3032.

## Step 4: Set Up the Web Interface

```bash
# Navigate to the web directory
cd ../web

# Install dependencies
npm install

# Start the development server
npm run dev
```

The Web interface will be available at http://localhost:5173.

## Step 5: Configure the Services

Now that all services are running, you need to configure them to work together:

1. Create a tenant in the Auth service
2. Configure the Server to use the Auth service for authentication
3. Configure the Web interface to connect to both the Auth service and the Server

For detailed configuration instructions, see the documentation for each component.

## Using Docker Compose (Alternative)

Alternatively, you can use Docker Compose to start all services at once:

```bash
# Navigate to the root directory
cd ..

# Start all services using Docker Compose
docker-compose up
```

This will start all services with their default configurations.

## Next Steps

Now that you have a basic NeuralLog environment set up, you can:

- [Explore the Auth service](../components/auth/overview.md)
- [Explore the Server](../components/log-server/overview.md)

For more detailed information, see the documentation for each component.
