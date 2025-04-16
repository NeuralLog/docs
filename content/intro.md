---
sidebar_position: 1
---

# Introduction to NeuralLog

Welcome to the official documentation for NeuralLog, a zero-knowledge telemetry and logging service designed with security at its core.

## What is NeuralLog?

NeuralLog is a secure, privacy-focused logging platform that ensures your sensitive data never leaves your control. With client-side encryption and a zero-knowledge architecture, NeuralLog provides powerful logging capabilities without compromising on security. It's designed for organizations that need robust logging and telemetry while maintaining the highest standards of data protection and privacy.

## Key Components

NeuralLog consists of several key components:

### Auth Service

The authentication and authorization service that provides secure access to NeuralLog services. It uses OpenFGA for fine-grained authorization and supports multi-tenancy. The Auth Service manages Key Encryption Keys (KEKs) and implements the zero-knowledge security model.

### Log Server

The core backend service that handles encrypted log storage, processing, and API endpoints. It supports multiple storage adapters including in-memory, NeDB, and Redis, and never has access to unencrypted log data.

### Client SDKs

Client libraries available in multiple languages (TypeScript, Java, C#, Python, Go) that handle client-side encryption and communication with the Log Server. The SDKs are the cornerstone of NeuralLog's zero-knowledge architecture, ensuring sensitive data is encrypted before it leaves the client.

### Logger Adapters

Adapters for popular logging frameworks that make it easy to integrate NeuralLog into existing applications. These adapters transform logs from standard logging libraries into encrypted NeuralLog entries.

### Web Application

A secure web interface for viewing and managing logs, with all decryption happening client-side. The web application provides a user-friendly way to access logs while maintaining the zero-knowledge security model.

### MCP Client

The Model Context Protocol client that enables AI agents to securely access and process log data for insights and analysis.

### Infra

Infrastructure components and deployment configurations for running NeuralLog in various environments, including Docker containers and Kubernetes.

### Specs

Specifications and standards that define how NeuralLog components interact with each other, ensuring consistency and interoperability.

## Getting Started

To get started with NeuralLog, check out the [Quick Start Guide](getting-started/quick-start.md).

## Contributing

NeuralLog is an open-source project, and we welcome contributions from the community.

## License

NeuralLog is licensed under the MIT License. See the [LICENSE](https://github.com/NeuralLog/docs/blob/main/LICENSE) file for details.
