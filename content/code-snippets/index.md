# Code Snippets Overview

This section contains code snippets from the NeuralLog codebase to help you understand how the system works. The snippets are organized by component and functionality.

## TypeScript Client SDK

The TypeScript Client SDK is the cornerstone of NeuralLog's zero-knowledge architecture. It handles all client-side encryption and decryption, ensuring that sensitive data never leaves the client in plaintext.

### Key Components

- **NeuralLogClient**: The main client interface for interacting with NeuralLog.
- **CryptoService**: Handles encryption and decryption of log names and data.
- **KeyDerivation**: Provides utilities for deriving keys from passwords and other key material.
- **MnemonicService**: Generates and validates BIP-39 mnemonic phrases for recovery.
- **KeyHierarchyManager**: Manages the key hierarchy, including KEK versions and user provisioning.
- **AuthManager**: Handles authentication and authorization.
- **LogManager**: Manages logs, including creation, retrieval, and searching.

## Auth Service

The Auth Service handles authentication, authorization, and key management for NeuralLog.

### Key Components

- **KEKBlobController**: Handles KEK blob operations, including provisioning and retrieval.
- **KEKVersionController**: Manages KEK versions, including creation and status updates.
- **PermissionController**: Handles permission operations, including granting and checking permissions.
- **RedisKEKService**: Stores and retrieves KEK-related data in Redis.

## Log Server

The Log Server handles log storage and retrieval for NeuralLog.

### Key Components

- **LogController**: Handles log operations, including creation, retrieval, and searching.
- **LogService**: Stores and retrieves logs in the database.

## How to Use These Snippets

These code snippets are provided to help you understand how NeuralLog works. They are not meant to be copied and pasted directly into your code. Instead, use them as a reference to understand the architecture and implementation details.

For example, if you want to understand how log encryption works, you can look at the `CryptoService` snippets to see how log names and data are encrypted and decrypted.

If you want to understand how the key hierarchy is managed, you can look at the `KeyHierarchyManager` snippets to see how KEK versions are created and provisioned to users.

## Next Steps

After reviewing these code snippets, you may want to:

1. Read the [Code Walkthrough](../code-walkthrough/master-secret-generation) to understand the flow of operations in NeuralLog.
2. Check out the [API Reference](../api) for detailed information on the NeuralLog API.
3. Explore the [SDK Reference](../sdk/typescript) to learn how to use the NeuralLog SDKs in your applications.
