# NeuralLog: Client SDK Architecture

## Overview

NeuralLog's client SDKs are designed to provide a simple, intuitive interface for developers while implementing sophisticated zero-knowledge cryptography behind the scenes. This document details the architecture and implementation of NeuralLog's client SDKs.

## Core Principles

1. **Simplicity**: Simple API for developers
2. **Zero Knowledge**: All cryptography happens client-side
3. **Cross-Language**: Consistent behavior across programming languages
4. **Performance**: Minimal impact on application performance
5. **Security**: Strong security defaults with no configuration required

## SDK Components

### 1. Logger Interface

The primary interface developers interact with:

```javascript
// TypeScript/JavaScript
const logger = new AILogger({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: 'acme-corp',
  source: 'payment-service'
});

logger.info('Payment processed', { orderId: '12345', amount: 99.99 });
logger.error('Payment failed', { orderId: '12345', error: 'Insufficient funds' });
```

```python
# Python
logger = AILogger(
    api_key=os.environ.get("NEURALLOG_API_KEY"),
    tenant_id="acme-corp",
    source="payment-service"
)

logger.info("Payment processed", {"orderId": "12345", "amount": 99.99})
logger.error("Payment failed", {"orderId": "12345", "error": "Insufficient funds"})
```

```java
// Java
AILogger logger = new AILogger.Builder()
    .apiKey(System.getenv("NEURALLOG_API_KEY"))
    .tenantId("acme-corp")
    .source("payment-service")
    .build();

logger.info("Payment processed", Map.of("orderId", "12345", "amount", 99.99));
logger.error("Payment failed", Map.of("orderId", "12345", "error", "Insufficient funds"));
```

### 2. Cryptography Layer

Handles all cryptographic operations:

```javascript
// TypeScript/JavaScript (internal implementation)
class CryptoLayer {
  constructor(apiKey, tenantId) {
    this.apiKey = apiKey;
    this.tenantId = tenantId;
  }
  
  async initialize() {
    // Derive encryption and search keys from API key
    this.encryptionKey = await this.deriveEncryptionKey();
    this.searchKey = await this.deriveSearchKey();
  }
  
  async deriveEncryptionKey() {
    // Derive encryption key from API key
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(this.apiKey),
      { name: "PBKDF2" },
      false,
      ["deriveBits"]
    );
    
    return crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: new TextEncoder().encode(`${this.tenantId}:encryption`),
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      256
    );
  }
  
  async deriveSearchKey() {
    // Similar to deriveEncryptionKey but with different salt
    // ...
  }
  
  async encrypt(data) {
    // Generate a random IV
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv
      },
      this.encryptionKey,
      new TextEncoder().encode(JSON.stringify(data))
    );
    
    // Combine IV and encrypted data
    return {
      iv: arrayBufferToBase64(iv),
      data: arrayBufferToBase64(encryptedData)
    };
  }
  
  async generateSearchTokens(data) {
    // Extract searchable terms
    const terms = this.extractSearchableTerms(data);
    
    // Generate tokens
    // ...
  }
}
```

### 3. Transport Layer

Handles communication with the NeuralLog API:

```javascript
// TypeScript/JavaScript (internal implementation)
class TransportLayer {
  constructor(apiKey, tenantId, endpoint) {
    this.apiKey = apiKey;
    this.tenantId = tenantId;
    this.endpoint = endpoint || 'https://api.neurallog.com';
  }
  
  async sendLog(encryptedLog, searchTokens) {
    // Generate API key verification
    const apiKeyVerification = await this.generateApiKeyVerification();
    
    // Send log to server
    const response = await fetch(`${this.endpoint}/logs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key-Verification': apiKeyVerification,
        'X-Tenant-ID': this.tenantId
      },
      body: JSON.stringify({
        encryptedLog,
        searchTokens,
        timestamp: Date.now()
      })
    });
    
    return response.ok;
  }
  
  async generateApiKeyVerification() {
    // Generate verification hash for API key
    // ...
  }
}
```

### 4. Configuration Layer

Handles SDK configuration and defaults:

```javascript
// TypeScript/JavaScript (internal implementation)
class ConfigurationLayer {
  constructor(options) {
    this.options = this.mergeWithDefaults(options);
  }
  
  mergeWithDefaults(options) {
    return {
      endpoint: 'https://api.neurallog.com',
      batchSize: 10,
      batchInterval: 1000,
      retryStrategy: 'exponential',
      maxRetries: 3,
      ...options
    };
  }
  
  getEndpoint() {
    return this.options.endpoint;
  }
  
  // Other configuration getters
  // ...
}
```

## Implementation Details

### Batching and Performance

To minimize performance impact, logs are batched:

```javascript
// TypeScript/JavaScript (internal implementation)
class BatchProcessor {
  constructor(transportLayer, options) {
    this.transportLayer = transportLayer;
    this.batchSize = options.batchSize || 10;
    this.batchInterval = options.batchInterval || 1000;
    this.batch = [];
    this.timer = null;
  }
  
  add(log) {
    this.batch.push(log);
    
    if (this.batch.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => this.flush(), this.batchInterval);
    }
  }
  
  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    
    if (this.batch.length === 0) {
      return;
    }
    
    const batchToSend = [...this.batch];
    this.batch = [];
    
    try {
      await this.transportLayer.sendBatch(batchToSend);
    } catch (error) {
      // Handle error, possibly retry
      // ...
    }
  }
}
```

### Error Handling

SDKs implement robust error handling:

```javascript
// TypeScript/JavaScript (internal implementation)
class ErrorHandler {
  constructor(options) {
    this.maxRetries = options.maxRetries || 3;
    this.retryStrategy = options.retryStrategy || 'exponential';
  }
  
  async executeWithRetry(operation) {
    let retries = 0;
    
    while (true) {
      try {
        return await operation();
      } catch (error) {
        if (retries >= this.maxRetries || !this.isRetryable(error)) {
          throw error;
        }
        
        retries++;
        await this.delay(this.getRetryDelay(retries));
      }
    }
  }
  
  isRetryable(error) {
    // Determine if the error is retryable
    // Network errors, rate limiting, etc.
    // ...
  }
  
  getRetryDelay(retryCount) {
    if (this.retryStrategy === 'exponential') {
      return Math.pow(2, retryCount) * 100;
    }
    
    return 1000; // Fixed delay
  }
  
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### Framework Integration

SDKs provide integrations with popular frameworks:

```javascript
// Express.js integration
const { expressMiddleware } = require('@neurallog/sdk');

app.use(expressMiddleware({
  apiKey: process.env.NEURALLOG_API_KEY,
  tenantId: 'acme-corp'
}));
```

```python
# Flask integration
from neurallog.integrations.flask import NeuralLogMiddleware

app = Flask(__name__)
app.wsgi_app = NeuralLogMiddleware(
    app.wsgi_app,
    api_key=os.environ.get("NEURALLOG_API_KEY"),
    tenant_id="acme-corp"
)
```

```java
// Spring Boot integration
@Configuration
public class NeuralLogConfig {
    @Bean
    public NeuralLogInterceptor neuralLogInterceptor() {
        return new NeuralLogInterceptor(
            System.getenv("NEURALLOG_API_KEY"),
            "acme-corp"
        );
    }
}
```

## Cross-Language Consistency

To ensure consistent behavior across languages:

1. **Shared Specifications**: All SDKs implement the same specification
2. **Test Suite**: Cross-language test suite ensures consistent behavior
3. **Reference Implementation**: TypeScript SDK serves as the reference
4. **Crypto Libraries**: Use well-vetted cryptographic libraries in each language

## Security Considerations

1. **API Key Protection**: SDKs encourage secure API key storage
2. **Memory Protection**: Sensitive data is zeroed in memory when possible
3. **Minimal Dependencies**: SDKs have minimal external dependencies
4. **Regular Updates**: SDKs are regularly updated for security patches
5. **Secure Defaults**: Strong security defaults require no configuration

## Implementation Guidelines

1. **Simplicity First**: Keep the developer API simple and intuitive
2. **Error Resilience**: Handle errors gracefully without crashing applications
3. **Performance Focus**: Minimize CPU, memory, and network overhead
4. **Backward Compatibility**: Maintain compatibility with older versions
5. **Comprehensive Documentation**: Provide clear, detailed documentation
