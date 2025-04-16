---
sidebar_position: 1
---

# log-server Overview

NeuralLog is an intelligent logging system with automated action capabilities. It captures log events from various sources, analyzes patterns in those logs, and triggers configurable actions when specific conditions are met. The server component is responsible for:

- Receiving and storing logs from various clients
- Providing APIs for log retrieval and management
- Supporting the storage layer of the NeuralLog architecture
- Enabling integration with the MCP (Model Context Protocol) ecosystem

## Features

- RESTful API for log management
- Support for multiple storage adapters (Memory, NeDB, Redis)
- Namespace support for logical isolation of data
- Persistent storage with Docker volumes
- Comprehensive search capabilities
- Statistics tracking and reporting
- Configurable data retention policies
- Integration with MCP clients
- Multi-tenant support through namespaces
- Kubernetes deployment support

## Quick Start



## Documentation

For detailed documentation, see:

- [API Reference](./api.md)
- [Configuration](./configuration.md)
- [Architecture](./architecture.md)
- [Data Retention](./data-retention.md)
- [Examples](./examples)

For the source code and component-specific documentation, visit the [NeuralLog log-server Repository](https://github.com/NeuralLog/log-server).
