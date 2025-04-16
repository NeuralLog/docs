---
sidebar_position: 1
---

# web Overview

NeuralLog Web is a Next.js application that serves as the frontend for the NeuralLog system. It provides a user interface for:

- Viewing and searching logs
- Managing API keys
- Configuring Key Encryption Keys (KEKs)
- User management and authentication

All cryptographic operations happen client-side, ensuring that sensitive data never leaves the user's browser.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Features

- **Zero-Knowledge Architecture**: All encryption/decryption happens client-side
- **Secure Logging**: End-to-end encrypted logs
- **Encrypted Log Names**: Log names are encrypted before being sent to the server
- **API Key Management**: Create and manage API keys
- **Key Encryption Key (KEK) Management**: Secure key management with KEKs
- **User Management**: Add, remove, and update users
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Mode**: Support for light and dark themes

## Quick Start



## Documentation

For detailed documentation, see:

- [API Reference](./api.md)
- [Configuration](./configuration.md)
- [Architecture](./architecture.md)
- [Examples](./examples)

For the source code and component-specific documentation, visit the [NeuralLog web Repository](https://github.com/NeuralLog/web).
