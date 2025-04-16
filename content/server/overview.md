---
sidebar_position: 1
---

# Server Overview

The NeuralLog Server is the core backend service that handles data storage, processing, and API endpoints for NeuralLog applications.

## Features

- **Multiple Storage Adapters**: Support for in-memory, NeDB, and Redis storage
- **RESTful API**: Comprehensive API for data management
- **Namespacing**: Key prefixing for multi-tenant support
- **Caching**: Built-in caching mechanisms for improved performance

## Architecture

The Server is built with a modular architecture that allows for flexibility and scalability:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│  Server API │────▶│ Server Core │────▶│   Storage   │
│             │     │             │     │  Adapters   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │
│ Client SDK  │     │   Caching   │     │ Memory/NeDB │
│             │     │             │     │    Redis    │
└─────────────┘     └─────────────┘     └─────────────┘
```

## Key Components

### Server API

The Server API provides RESTful endpoints for data management and processing.

### Server Core

The core business logic for the Server, handling data processing, validation, and business rules.

### Storage Adapters

Pluggable storage adapters that allow the Server to work with different storage backends:

- **Memory**: In-memory storage for development and testing
- **NeDB**: File-based storage for small deployments
- **Redis**: Scalable, high-performance storage for production deployments

### Client SDK

Client libraries for various platforms that simplify integration with the Server.

## Getting Started

To get started with the Server, see the documentation in the Server repository.
