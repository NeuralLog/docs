---
sidebar_position: 1
---

# Auth Overview

The NeuralLog Auth service provides centralized authentication and authorization for all NeuralLog services using Auth0 for authentication and OpenFGA for authorization.

## Features

- **Multi-tenancy**: Support for multiple tenants with isolated data and configurations
- **Fine-grained Authorization**: Detailed access control using OpenFGA
- **Secure Authentication**: Industry-standard authentication mechanisms
- **SDK Support**: Client libraries for various platforms

## Architecture

The Auth service is built with a modular architecture that allows for flexibility and scalability:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Auth API   │────▶│  Auth Core  │────▶│    Auth0    │     │   OpenFGA   │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │                   │
       │                   │                   │                   │
       ▼                   ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Auth SDK   │     │  Database   │     │  Identity   │     │ PostgreSQL  │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

## Key Components

### Auth API

The Auth API provides RESTful endpoints for authentication, user management, and authorization.

### Auth Core

The core business logic for the Auth service, handling authentication, authorization, and tenant management.

### Auth0

The authentication system that handles user identity, login, and token issuance.

### OpenFGA

The authorization system that provides fine-grained access control.

### Auth SDK

Client libraries for various platforms that simplify integration with the Auth service.

## Getting Started

### Auth0 Setup

The Auth service includes a script to automate the setup of Auth0:

```bash
# Navigate to the auth/scripts directory
cd auth/scripts

# Install dependencies
npm install

# Set environment variables
export AUTH0_DOMAIN=your-tenant.auth0.com
export AUTH0_CLIENT_ID=your-management-api-client-id
export AUTH0_CLIENT_SECRET=your-management-api-client-secret

# Run the setup script
npm run setup-auth0
```

This script creates all the necessary Auth0 resources and generates environment variable files for each service.

For more detailed instructions, see the [Auth0 Setup Guide](../deployment/auth0-setup.md).

### Auth Service Setup

To get started with the Auth service, see the documentation in the Auth repository.

## Security Considerations

The Auth service is designed with security as a top priority.
