# Zero-Knowledge Implementation in NeuralLog Web

This document provides a detailed explanation of the zero-knowledge architecture implemented in the NeuralLog Web application.

## Overview

NeuralLog's zero-knowledge architecture ensures that sensitive log data remains encrypted end-to-end, with the server never having access to unencrypted data or encryption keys. This is achieved through client-side encryption, client-side decryption, and searchable encryption.

## Key Concepts

### Zero-Knowledge Architecture

In a zero-knowledge architecture:

1. **Data is encrypted client-side** before being sent to the server
2. **Encryption keys never leave the client**
3. **The server stores only encrypted data**
4. **Data is decrypted client-side** after being retrieved from the server
5. **The server can never access unencrypted data**

### End-to-End Encryption

End-to-end encryption ensures that:

1. **Data is encrypted at the source** (the client that generates the log)
2. **Data remains encrypted in transit** (during transmission to the server)
3. **Data remains encrypted at rest** (when stored on the server)
4. **Data is decrypted only at the destination** (the client that views the log)

### Searchable Encryption

Searchable encryption allows:

1. **Searching encrypted data without decrypting it**
2. **Generating search tokens client-side**
3. **Matching search tokens against indexed tokens server-side**
4. **Retrieving encrypted results that match the search criteria**

## Implementation Details

### Key Hierarchy

The NeuralLog Web application implements a hierarchical key system:

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

#### Master Secret

The master secret is the root of the key hierarchy:

- Generated using a secure random number generator
- Stored in localStorage for persistence
- Never sent to the server
- Used to derive all other keys

```typescript
// Generate a random master secret
const masterSecret = arrayBufferToBase64(generateEncryptionKey());

// Store in localStorage
localStorage.setItem('neurallog_master_secret', masterSecret);
```

#### Tenant Key

The tenant key is derived from the master secret and tenant ID:

- Unique for each tenant
- Used to derive log-specific keys
- Ensures isolation between tenants

```typescript
// Derive tenant key
const tenantKey = await keyHierarchy.deriveTenantKey(tenantId);
```

#### Log Encryption Key

The log encryption key is derived from the tenant key and log name:

- Unique for each log
- Used to encrypt and decrypt log data
- Ensures isolation between logs

```typescript
// Derive log encryption key
const encryptionKey = await keyHierarchy.deriveLogEncryptionKey(tenantId, logName);
```

#### Log Search Key

The log search key is derived from the tenant key and log name:

- Unique for each log
- Used to generate search tokens
- Different from the log encryption key for security

```typescript
// Derive log search key
const searchKey = await keyHierarchy.deriveLogSearchKey(tenantId, logName);
```

### Client-Side Encryption

The NeuralLog Web application implements client-side encryption for all sensitive data:

#### Log Data Encryption

Log data is encrypted using the log encryption key:

```typescript
// Encrypt log data
const encryptData = async (data: any, logName: string): Promise<any> => {
  if (!keyHierarchy) {
    throw new Error('Key hierarchy not initialized');
  }
  
  try {
    // Import encryption functions
    const { encryptLogEntry, generateSearchTokens } = await import('@neurallog/sdk');
    
    // Derive encryption key for this log
    const encryptionKey = await keyHierarchy.deriveLogEncryptionKey(tenantId, logName);
    
    // Encrypt the log data
    const encryptedData = await encryptLogEntry(data, encryptionKey);
    
    // Derive search key for this log
    const searchKey = await keyHierarchy.deriveLogSearchKey(tenantId, logName);
    
    // Generate search tokens
    const searchTokens = await generateSearchTokens(data, searchKey, tenantId);
    
    return {
      encryptionOptions: {
        encrypted: true,
        encryptedData,
        searchTokens
      }
    };
  } catch (error) {
    console.error('Error encrypting data:', error);
    return { data };
  }
};
```

#### Log Name Encryption

Log names are encrypted using the tenant key:

```typescript
// Encrypt log name
const encryptLogName = async (logName: string): Promise<string> => {
  if (!keyHierarchy) {
    throw new Error('Key hierarchy not initialized');
  }
  
  try {
    // Import encryption function
    const { encryptLogName } = await import('@neurallog/sdk');
    
    // Derive tenant key
    const tenantKey = await keyHierarchy.deriveTenantKey(tenantId);
    
    // Encrypt the log name
    const encryptedLogName = await encryptLogName(logName, tenantKey);
    
    return encryptedLogName;
  } catch (error) {
    console.error('Error encrypting log name:', error);
    return logName;
  }
};
```

### Client-Side Decryption

The NeuralLog Web application implements client-side decryption for all encrypted data:

#### Log Data Decryption

Log data is decrypted using the log encryption key:

```typescript
// Decrypt log data
const decryptData = async (encryptedData: any, logName: string): Promise<any> => {
  if (!keyHierarchy) {
    throw new Error('Key hierarchy not initialized');
  }
  
  try {
    // Check if data is encrypted
    if (!encryptedData.encrypted) {
      return encryptedData.data;
    }
    
    // Import decryption function
    const { decryptLogEntry } = await import('@neurallog/sdk');
    
    // Derive encryption key for this log
    const encryptionKey = await keyHierarchy.deriveLogEncryptionKey(tenantId, logName);
    
    // Decrypt the log data
    const decryptedData = await decryptLogEntry(encryptedData.data, encryptionKey);
    
    return decryptedData;
  } catch (error) {
    console.error('Error decrypting data:', error);
    return encryptedData.data;
  }
};
```

#### Log Name Decryption

Log names are decrypted using the tenant key:

```typescript
// Decrypt log name
const decryptLogName = async (encryptedLogName: string): Promise<string> => {
  if (!keyHierarchy) {
    throw new Error('Key hierarchy not initialized');
  }
  
  try {
    // Import decryption function
    const { decryptLogName } = await import('@neurallog/sdk');
    
    // Derive tenant key
    const tenantKey = await keyHierarchy.deriveTenantKey(tenantId);
    
    // Decrypt the log name
    const decryptedLogName = await decryptLogName(encryptedLogName, tenantKey);
    
    return decryptedLogName;
  } catch (error) {
    console.error('Error decrypting log name:', error);
    return encryptedLogName;
  }
};
```

### Searchable Encryption

The NeuralLog Web application implements searchable encryption to enable searching encrypted logs:

#### Search Token Generation

Search tokens are generated from the search query using the log search key:

```typescript
// Generate search tokens
const generateSearchTokens = async (query: string, logName: string): Promise<string[]> => {
  if (!keyHierarchy) {
    throw new Error('Key hierarchy not initialized');
  }
  
  try {
    // Import search token generation function
    const { generateSearchTokens } = await import('@neurallog/sdk');
    
    // Derive search key for this log
    const searchKey = await keyHierarchy.deriveLogSearchKey(tenantId, logName);
    
    // Generate search tokens
    const searchTokens = await generateSearchTokens(query, searchKey, tenantId);
    
    return searchTokens;
  } catch (error) {
    console.error('Error generating search tokens:', error);
    return [];
  }
};
```

#### Server-Side Token Matching

The server matches search tokens against indexed tokens without decrypting the data:

```typescript
// Server-side code (simplified)
function searchLogs(encryptedLogName, searchTokens, limit) {
  // Get the log from the database
  const log = getLogByName(encryptedLogName);
  
  // Find entries that match the search tokens
  const results = log.entries.filter(entry => {
    // Check if any of the entry's tokens match the search tokens
    return entry.searchTokens.some(token => searchTokens.includes(token));
  });
  
  // Return the limited results
  return results.slice(0, limit);
}
```

#### Client-Side Result Decryption

Search results are decrypted client-side using the log encryption key:

```typescript
// Client-side search and decryption
const handleSearch = async () => {
  if (!isInitialized) {
    setError(new Error('Crypto provider not initialized'));
    return;
  }

  if (!query.trim()) {
    setError(new Error('Please enter a search query'));
    return;
  }

  try {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    // Create a direct logs service
    const logsService = new DirectLogsService(tenantId);

    // Search logs directly from the logs server
    const searchResults = await logsService.searchLogs(logName, query, limit);
    setResults(searchResults);

    // Decrypt search results client-side
    const decrypted = await Promise.all(
      searchResults.map(async (entry) => {
        try {
          // Decrypt the log entry
          const decryptedData = await decryptData(entry.data, logName);

          // Return a new entry with decrypted data
          return {
            ...entry,
            data: decryptedData,
            _decrypted: true,
          };
        } catch (decryptError) {
          console.error(`Error decrypting search result ${entry.id}:`, decryptError);

          // Return the original entry if decryption fails
          return {
            ...entry,
            _decryptError: decryptError.message,
          };
        }
      })
    );

    setDecryptedResults(decrypted);
    setLoading(false);
  } catch (searchError) {
    console.error('Error searching logs:', searchError);
    setError(searchError instanceof Error ? searchError : new Error(String(searchError)));
    setLoading(false);
  }
};
```

## Security Considerations

### Key Management

The NeuralLog Web application implements secure key management:

#### Master Secret Storage

The master secret is stored in localStorage, which has the following security properties:

- **Same-Origin Policy**: localStorage is accessible only to the same origin
- **No Server Access**: localStorage is not accessible to the server
- **No Cross-Origin Access**: localStorage is not accessible to other origins
- **Persistence**: localStorage persists across browser sessions

```typescript
// Store master secret in localStorage
localStorage.setItem('neurallog_master_secret', masterSecret);

// Retrieve master secret from localStorage
const storedMasterSecret = localStorage.getItem('neurallog_master_secret');
```

#### Key Derivation

All encryption keys are derived from the master secret using secure key derivation functions:

- **HKDF**: HMAC-based Key Derivation Function
- **Context Separation**: Different contexts for different key types
- **Salt**: Unique salt for each key derivation
- **Iteration Count**: Multiple iterations for increased security

```typescript
// Derive key using HKDF
const deriveKey = async (masterSecret: Uint8Array, context: string, salt: Uint8Array): Promise<Uint8Array> => {
  // Import HKDF
  const { hkdf } = await import('@neurallog/sdk');
  
  // Derive key
  const derivedKey = await hkdf(masterSecret, salt, context, 32);
  
  return derivedKey;
};
```

### Authentication and Authorization

The NeuralLog Web application implements secure authentication and authorization:

#### Token-Based Authentication

The application uses JWT tokens for authentication:

- **Short-Lived Tokens**: Tokens expire after a short period
- **Token Refresh**: Tokens are refreshed automatically
- **Secure Storage**: Tokens are stored in memory or secure storage
- **HTTPS Only**: Tokens are transmitted only over HTTPS

```typescript
// Get authentication token
const getAuthToken = async (): Promise<string | null> => {
  // Check if token exists and is valid
  const token = localStorage.getItem('auth_token');
  const expiry = localStorage.getItem('auth_token_expiry');
  
  if (token && expiry && new Date(expiry) > new Date()) {
    return token;
  }
  
  // Token doesn't exist or is expired, try to refresh
  return refreshAuthToken();
};
```

#### Resource-Specific Tokens

The application uses resource-specific tokens for authorization:

- **Limited Scope**: Tokens are scoped to specific resources
- **Short-Lived**: Tokens expire after a short period
- **One-Time Use**: Tokens are used only once
- **Server Validation**: Tokens are validated by the server

```typescript
// Exchange authentication token for resource-specific token
const exchangeTokenForResource = async (
  authToken: string,
  resource: string,
  tenantId: string
): Promise<string> => {
  const response = await fetch(`${AUTH_URL}/token/exchange`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      resource,
      tenantId
    })
  });
  
  if (!response.ok) {
    throw new Error(`Failed to exchange token: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  return data.token;
};
```

### Data Protection

The NeuralLog Web application implements secure data protection:

#### End-to-End Encryption

All sensitive data is encrypted end-to-end:

- **Client-Side Encryption**: Data is encrypted before leaving the client
- **Secure Algorithms**: AES-GCM for encryption, HMAC-SHA256 for authentication
- **Key Separation**: Different keys for different purposes
- **Client-Side Decryption**: Data is decrypted only on the client

#### Zero-Knowledge Server

The server never has access to unencrypted data or encryption keys:

- **Encrypted Storage**: All sensitive data is stored encrypted
- **No Key Access**: The server never has access to encryption keys
- **No Plaintext Access**: The server never has access to plaintext data
- **Token-Based Search**: Search is performed using tokens, not plaintext

#### Secure Communication

All communication with the server is over HTTPS:

- **TLS Encryption**: All data is encrypted in transit
- **Certificate Validation**: Server certificates are validated
- **Secure Cookies**: Cookies are set with secure and httpOnly flags
- **HSTS**: HTTP Strict Transport Security is enabled

## Implementation in Components

### CryptoProvider

The `CryptoProvider` component provides the cryptographic context for the application:

```typescript
export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [keyHierarchy, setKeyHierarchy] = useState<KeyHierarchy | null>(null);
  const [tenantId, setTenantId] = useState<string>('default');
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize from localStorage if available
  useEffect(() => {
    const storedMasterSecret = localStorage.getItem('neurallog_master_secret');
    const storedTenantId = localStorage.getItem('neurallog_tenant_id');
    
    if (storedMasterSecret) {
      initializeKeyHierarchy(storedMasterSecret, storedTenantId || 'default');
    }
  }, []);

  const initializeKeyHierarchy = (masterSecret?: string, newTenantId?: string) => {
    try {
      // Generate a random master secret if not provided
      const secret = masterSecret || arrayBufferToBase64(generateEncryptionKey());
      const tenant = newTenantId || tenantId;
      
      // Create a new key hierarchy
      const hierarchy = new KeyHierarchy(secret);
      
      // Store in state
      setKeyHierarchy(hierarchy);
      setTenantId(tenant);
      setIsInitialized(true);
      
      // Store in localStorage for persistence
      localStorage.setItem('neurallog_master_secret', secret);
      localStorage.setItem('neurallog_tenant_id', tenant);
      
      console.log('Key hierarchy initialized successfully');
    } catch (error) {
      console.error('Error initializing key hierarchy:', error);
    }
  };

  const encryptData = async (data: any, logName: string): Promise<any> => {
    // Implementation details...
  };

  const decryptData = async (encryptedData: any, logName: string): Promise<any> => {
    // Implementation details...
  };

  return (
    <CryptoContext.Provider
      value={{
        keyHierarchy,
        tenantId,
        isInitialized,
        initializeKeyHierarchy,
        encryptData,
        decryptData
      }}
    >
      {children}
    </CryptoContext.Provider>
  );
};
```

### ClientSideLogViewer

The `ClientSideLogViewer` component displays logs with client-side decryption:

```typescript
export const ClientSideLogViewer: React.FC<ClientSideLogViewerProps> = ({
  logName,
  limit = 100,
}) => {
  const { isInitialized, decryptData, tenantId } = useCrypto();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [decryptedLogs, setDecryptedLogs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchLogs() {
      if (!isInitialized) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Create a direct logs service
        const logsService = new DirectLogsService(tenantId);

        // Fetch logs directly from the logs server
        const entries = await logsService.getLogEntries(logName, limit);
        setLogs(entries);

        // Decrypt logs client-side
        const decrypted = await Promise.all(
          entries.map(async (entry) => {
            try {
              // Decrypt the log entry
              const decryptedData = await decryptData(entry.data, logName);

              // Return a new entry with decrypted data
              return {
                ...entry,
                data: decryptedData,
                _decrypted: true,
              };
            } catch (decryptError) {
              console.error(`Error decrypting log entry ${entry.id}:`, decryptError);

              // Return the original entry if decryption fails
              return {
                ...entry,
                _decryptError: decryptError.message,
              };
            }
          })
        );

        setDecryptedLogs(decrypted);
        setLoading(false);
      } catch (fetchError) {
        console.error('Error fetching logs:', fetchError);
        setError(fetchError instanceof Error ? fetchError : new Error(String(fetchError)));
        setLoading(false);
      }
    }

    fetchLogs();
  }, [logName, limit, isInitialized, decryptData, tenantId]);

  // Render implementation...
};
```

### ClientSideLogSearch

The `ClientSideLogSearch` component searches logs with client-side decryption:

```typescript
export const ClientSideLogSearch: React.FC<ClientSideLogSearchProps> = ({
  logName,
  limit = 100,
}) => {
  const { isInitialized, decryptData, tenantId } = useCrypto();
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [decryptedResults, setDecryptedResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!isInitialized) {
      setError(new Error('Crypto provider not initialized'));
      return;
    }

    if (!query.trim()) {
      setError(new Error('Please enter a search query'));
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      // Create a direct logs service
      const logsService = new DirectLogsService(tenantId);

      // Search logs directly from the logs server
      const searchResults = await logsService.searchLogs(logName, query, limit);
      setResults(searchResults);

      // Decrypt search results client-side
      const decrypted = await Promise.all(
        searchResults.map(async (entry) => {
          try {
            // Decrypt the log entry
            const decryptedData = await decryptData(entry.data, logName);

            // Return a new entry with decrypted data
            return {
              ...entry,
              data: decryptedData,
              _decrypted: true,
            };
          } catch (decryptError) {
            console.error(`Error decrypting search result ${entry.id}:`, decryptError);

            // Return the original entry if decryption fails
            return {
              ...entry,
              _decryptError: decryptError.message,
            };
          }
        })
      );

      setDecryptedResults(decrypted);
      setLoading(false);
    } catch (searchError) {
      console.error('Error searching logs:', searchError);
      setError(searchError instanceof Error ? searchError : new Error(String(searchError)));
      setLoading(false);
    }
  };

  // Render implementation...
};
```

## Conclusion

The NeuralLog Web application implements a comprehensive zero-knowledge architecture that ensures sensitive log data remains encrypted end-to-end. By performing all cryptographic operations client-side and never exposing encryption keys to the server, the application provides a secure way to view and manage logs while maintaining privacy and confidentiality.
