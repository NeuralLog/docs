# NeuralLog Web Architecture

This document describes the architecture of the NeuralLog Web application, focusing on its components, data flow, and zero-knowledge implementation.

## Overview

The NeuralLog Web application is a Next.js-based frontend for the NeuralLog zero-knowledge logging system. It provides a user interface for viewing and managing logs while ensuring that all sensitive data remains encrypted client-side.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         NeuralLog Web Application                        │
│                                                                         │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ UI Layer    │  │ Business Logic      │  │ Data Access             │  │
│  │             │  │                     │  │                         │  │
│  │ • Dashboard │◄─┤ • CryptoProvider   │◄─┤ • DirectLogsService     │  │
│  │ • LogViewer │  │ • KeyHierarchy     │  │ • TokenExchangeService  │  │
│  │ • LogSearch │  │ • MasterSecret     │  │ • NeuralLogClient       │  │
│  │ • Settings  │  │ • SearchTokens     │  │                         │  │
│  └─────────────┘  └─────────────────────┘  └─────────────────────────┘  │
│         │                    │                          │                │
│         ▼                    ▼                          ▼                │
│  ┌─────────────────────────────────────────────────────────────────────┐ │
│  │                      Client-Side SDK (@neurallog/client-sdk)        │ │
│  └─────────────────────────────────────────────────────────────────────┘ │
│                                    │                                     │
└────────────────────────────────────┼─────────────────────────────────────┘
                                     │
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          NeuralLog Backend                              │
│                                                                         │
│  ┌─────────────┐  ┌─────────────────────┐  ┌─────────────────────────┐  │
│  │ Auth Service│  │ Logs Service        │  │ Registry Service        │  │
│  │             │  │                     │  │                         │  │
│  │ • Auth API  │  │ • Logs API          │  │ • Registry API          │  │
│  │ • KEK API   │  │ • Search API        │  │                         │  │
│  │ • User API  │  │                     │  │                         │  │
│  └─────────────┘  └─────────────────────┘  └─────────────────────────┘  │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Key Components

### UI Layer

The UI layer consists of React components that provide the user interface for the application:

#### Dashboard Components

- **ZeroKnowledgeDashboard**: The main dashboard component that integrates log viewing and searching
- **RecentLogs**: Displays recent logs on the dashboard

#### Log Components

- **ClientSideLogViewer**: Displays logs with client-side decryption
- **ClientSideLogSearch**: Searches logs with client-side decryption
- **LogSelector**: Allows users to select a log to view or search

#### Crypto UI Components

- **MasterSecretInput**: Allows users to input their master secret for key hierarchy initialization

### Business Logic Layer

The business logic layer handles the application's core functionality:

#### Crypto Logic

- **CryptoProvider**: Provides the cryptographic context for the application
- **ClientCryptoProvider**: Client-side version of the CryptoProvider for use in client components
- **KeyHierarchy**: Manages the key hierarchy for encryption and decryption

#### Authentication Logic

- **AuthProvider**: Manages authentication state and provides authentication methods
- **TokenManager**: Manages authentication tokens and token refresh

### Data Access Layer

The data access layer handles communication with the backend services:

#### Services

- **DirectLogsService**: Service for direct communication with the Logs service
- **TokenExchangeService**: Service for exchanging authentication tokens for resource-specific tokens
- **NeuralLogClient**: Wrapper around the client SDK for easier integration

## Data Flow

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│ Login UI    │────▶│ AuthProvider│────▶│ Auth Service│────▶│ Token Store │
│             │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                                                            │
      │                                                            │
      │                                                            ▼
      │                                                      ┌─────────────┐
      │                                                      │             │
      └──────────────────────────────────────────────────────▶ Dashboard   │
                                                             │             │
                                                             └─────────────┘
```

1. User enters credentials in the Login UI
2. AuthProvider sends credentials to the Auth Service
3. Auth Service validates credentials and returns tokens
4. Tokens are stored in the Token Store (localStorage)
5. User is redirected to the Dashboard

### Key Initialization Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│ MasterSecret│────▶│CryptoProvider────▶│ KeyHierarchy│────▶│ LocalStorage│
│ Input       │     │             │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                          │                                        │
                          │                                        │
                          ▼                                        ▼
                    ┌─────────────┐                         ┌─────────────┐
                    │             │                         │             │
                    │ Log Viewer  │◄────────────────────────┤ Key Retrieval
                    │             │                         │             │
                    └─────────────┘                         └─────────────┘
```

1. User enters master secret in the MasterSecretInput component
2. CryptoProvider initializes the KeyHierarchy with the master secret
3. Master secret is stored in localStorage for persistence
4. Log Viewer components can now decrypt logs using the KeyHierarchy
5. On subsequent visits, the key is retrieved from localStorage

### Log Viewing Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│ LogSelector │────▶│ DirectLogs  │────▶│ Logs Service│────▶│ Encrypted   │
│             │     │ Service     │     │             │     │ Logs        │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│ Log Viewer  │◄────┤ Decrypted   │◄────┤ CryptoProvider◄───┤ KeyHierarchy│
│             │     │ Logs        │     │             │     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. User selects a log in the LogSelector component
2. DirectLogsService fetches encrypted logs from the Logs Service
3. CryptoProvider uses the KeyHierarchy to decrypt the logs
4. Decrypted logs are displayed in the Log Viewer component

### Log Search Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│ Search UI   │────▶│ CryptoProvider───▶│ Search Tokens────▶│ DirectLogs  │
│             │     │             │     │             │     │ Service     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                   │
                                                                   │
                                                                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│ Search      │◄────┤ Decrypted   │◄────┤ CryptoProvider◄───┤ Encrypted   │
│ Results     │     │ Results     │     │             │     │ Results     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
```

1. User enters a search query in the Search UI
2. CryptoProvider generates search tokens from the query
3. DirectLogsService sends search tokens to the Logs Service
4. Logs Service returns encrypted search results
5. CryptoProvider decrypts the search results
6. Decrypted results are displayed in the Search Results component

## Zero-Knowledge Implementation

The NeuralLog Web application implements a zero-knowledge architecture where the server never has access to unencrypted data or encryption keys.

### Key Hierarchy

The key hierarchy is implemented as follows:

```
Master Secret
    │
    ├── Tenant Key (derived from Master Secret + Tenant ID)
    │   │
    │   ├── Log Encryption Key (derived from Tenant Key + Log Name)
    │   │
    │   └── Log Search Key (derived from Tenant Key + Log Name)
    │
    └── User Key (derived from Master Secret + User ID)
        │
        └── API Key Encryption Key (derived from User Key + API Key ID)
```

### Client-Side Encryption

All sensitive data is encrypted client-side before being sent to the server:

1. **Log Data Encryption**: Log data is encrypted using the Log Encryption Key
2. **Log Name Encryption**: Log names are encrypted using the Tenant Key
3. **Search Token Generation**: Search tokens are generated using the Log Search Key

### Client-Side Decryption

All encrypted data is decrypted client-side after being retrieved from the server:

1. **Log Data Decryption**: Log data is decrypted using the Log Encryption Key
2. **Log Name Decryption**: Log names are decrypted using the Tenant Key

### Searchable Encryption

The application implements searchable encryption to enable searching encrypted logs:

1. **Token Generation**: Search tokens are generated from the search query using the Log Search Key
2. **Server-Side Matching**: The server matches search tokens against indexed tokens without decrypting the data
3. **Client-Side Decryption**: Search results are decrypted client-side using the Log Encryption Key

## Security Considerations

### Key Management

- **Master Secret Storage**: The master secret is stored in localStorage, which is accessible only to the same origin
- **No Server-Side Storage**: The master secret is never sent to the server
- **Key Derivation**: All encryption keys are derived from the master secret using secure key derivation functions

### Authentication

- **Token-Based Authentication**: The application uses JWT tokens for authentication
- **Token Exchange**: Resource-specific tokens are obtained through token exchange
- **Token Refresh**: Authentication tokens are refreshed automatically when they expire

### Data Protection

- **End-to-End Encryption**: All sensitive data is encrypted end-to-end
- **Zero-Knowledge Server**: The server never has access to unencrypted data or encryption keys
- **Secure Communication**: All communication with the server is over HTTPS

## Integration Points

### NeuralLog Client SDK

The web application integrates with the NeuralLog Client SDK (`@neurallog/client-sdk`) for:

- Authentication and token management
- Key hierarchy management
- Encryption and decryption
- Search token generation

### NeuralLog Auth Service

The web application integrates with the NeuralLog Auth Service for:

- User authentication
- Token exchange
- User management
- API key management

### NeuralLog Logs Service

The web application integrates with the NeuralLog Logs Service for:

- Log retrieval
- Log search
- Log statistics

## Performance Considerations

### Client-Side Encryption/Decryption

Client-side encryption and decryption can be computationally expensive. The application addresses this by:

- **Lazy Loading**: Cryptographic operations are performed only when needed
- **Caching**: Decrypted logs are cached to avoid repeated decryption
- **Pagination**: Logs are loaded and decrypted in batches to improve performance

### Search Performance

Searchable encryption can impact search performance. The application addresses this by:

- **Token Indexing**: Search tokens are indexed on the server for faster searching
- **Query Optimization**: Search queries are optimized to minimize the number of tokens
- **Result Limiting**: Search results are limited to improve performance

## Future Improvements

### WebAssembly for Cryptography

Implementing cryptographic operations in WebAssembly would improve performance:

- **Faster Encryption/Decryption**: WebAssembly can perform cryptographic operations faster than JavaScript
- **Reduced CPU Usage**: WebAssembly is more efficient than JavaScript for CPU-intensive operations
- **Better Mobile Performance**: WebAssembly would improve performance on mobile devices

### Offline Support

Adding offline support would improve the user experience:

- **Local Storage**: Store encrypted logs locally for offline access
- **Background Sync**: Sync logs when the connection is restored
- **Progressive Web App**: Implement as a Progressive Web App for better offline experience

### Enhanced Search

Improving search capabilities would enhance the user experience:

- **Advanced Filters**: Add support for advanced search filters
- **Faceted Search**: Implement faceted search for better navigation
- **Real-Time Search**: Implement real-time search as the user types
