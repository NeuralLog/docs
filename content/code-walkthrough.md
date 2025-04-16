---
sidebar_position: 8
---

# Code Walkthrough

This page provides links to the detailed code walkthroughs for the NeuralLog zero-knowledge architecture.

## Overview

The code walkthroughs are designed to help developers understand the NeuralLog codebase and how the different components interact. Each walkthrough focuses on a specific aspect of the system, providing step-by-step explanations of the code.

## Available Walkthroughs

1. [Master Secret Generation](./code-walkthrough/01-master-secret-generation.md) - How the master secret is generated and used to derive the master KEK
2. [KEK Version Creation](./code-walkthrough/02-kek-version-creation.md) - How KEK versions are created and stored
3. [Admin Setup](./code-walkthrough/03-admin-setup.md) - How the first admin is set up with access to the KEK
4. [Log Creation](./code-walkthrough/04-log-creation.md) - How logs are encrypted and stored
5. [User Provisioning](./code-walkthrough/05-user-provisioning.md) - How additional users are provisioned with access to KEKs
6. [Log Reading](./code-walkthrough/06-log-reading.md) - How logs are retrieved and decrypted
7. [Key Rotation](./code-walkthrough/07-key-rotation.md) - How KEKs are rotated for enhanced security

## Key Concepts

### Zero-Knowledge Architecture

NeuralLog uses a zero-knowledge architecture, which means that the server never has access to unencrypted data or encryption keys. All encryption and decryption happens on the client side, and the server only stores encrypted data.

### Key Hierarchy

The key hierarchy in NeuralLog consists of three levels:

1. **Master Secret**: The root of the key hierarchy, derived from the tenant ID and recovery phrase. This is never stored anywhere and is only used to derive the Master KEK.

2. **Master KEK**: Derived from the Master Secret, this key is used to encrypt and decrypt Operational KEKs. It is never stored anywhere and is only held in memory during client operations.

3. **Operational KEKs**: Derived from the Master KEK, these keys are used for actual data encryption and decryption. They are versioned to support key rotation and are stored encrypted in the server for distribution to authorized users.

### KEK Versioning

KEK versions are used to support key rotation and access control. Each KEK version has a unique ID and a status:

- **Active**: The current version used for encryption and decryption.
- **Decrypt-Only**: A previous version that can be used for decryption but not for encryption.
- **Deprecated**: A version that is no longer used and should be phased out.

### KEK Blobs

KEK blobs are encrypted packages containing an Operational KEK. They are encrypted with a user-specific key and stored on the server. When a user needs to access data, they retrieve the appropriate KEK blob, decrypt it, and use the contained Operational KEK to decrypt the data.

## How to Use This Documentation

These walkthroughs are designed to be read in order, as each step builds on the previous ones. However, you can also jump to a specific section if you're interested in a particular aspect of the system.

Each document includes:
- A high-level overview of the process
- Detailed code examples with explanations
- Diagrams where appropriate
- Links to relevant source files
