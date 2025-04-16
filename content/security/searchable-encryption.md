# NeuralLog: Zero-Knowledge Searchable Encryption

## Overview

NeuralLog implements a novel searchable encryption scheme that enables powerful search capabilities over encrypted data without requiring the server to decrypt the data. This document details how searchable encryption works in NeuralLog.

## Searchable Encryption Principles

### Core Concept

Searchable encryption allows searching over encrypted data without revealing the plaintext content or search terms to the server. NeuralLog's implementation uses a deterministic token-based approach:

1. **Token Generation**: Search tokens are generated client-side
2. **Token Indexing**: Tokens are indexed on the server
3. **Search Matching**: Searches match tokens without decryption
4. **Zero Knowledge**: Server never learns plaintext content or search terms

### Token Generation

Search tokens are generated using HMAC with tenant-specific search keys:

```javascript
async function generateSearchTokens(content, searchKey, tenantId) {
  // Extract searchable terms
  const terms = extractSearchableTerms(content);

  // For each term, generate a deterministic but secure token
  return Promise.all(terms.map(async term => {
    // Important: Combine the term with tenant ID to ensure tenant isolation
    const tokenInput = `${tenantId}:${term.toLowerCase().trim()}`;

    // Generate HMAC token
    const encoder = new TextEncoder();
    const keyData = await crypto.subtle.importKey(
      "raw",
      searchKey,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const signature = await crypto.subtle.sign(
      "HMAC",
      keyData,
      encoder.encode(tokenInput)
    );

    return arrayBufferToBase64(signature);
  }));
}
```

### Term Extraction

Terms are extracted from content using natural language processing techniques:

```javascript
function extractSearchableTerms(content) {
  // Convert content to string if it's not already
  const contentStr = typeof content === 'string'
    ? content
    : JSON.stringify(content);

  // Extract words and normalize
  const words = contentStr
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2); // Filter out short words

  // Deduplicate words
  return [...new Set(words)];
}
```

## Server-Side Token Storage

Tokens are stored in Redis for efficient searching:

```javascript
// Server-side
async function storeSearchTokens(logId, searchTokens, tenantId) {
  const redis = getRedisForTenant(tenantId);

  // For each token, store a reference to this log
  for (const token of searchTokens) {
    await redis.sadd(
      `tenant:${tenantId}:search:token:${token}`,
      logId
    );
  }

  // Store the tokens for this log
  await redis.sadd(
    `tenant:${tenantId}:log:${logId}:tokens`,
    ...searchTokens
  );
}
```

## Search Process

Searching is performed by generating tokens from the search query:

```javascript
// Client-side
async function search(query, searchKey, tenantId) {
  // Generate search tokens from the query
  const searchTokens = await generateSearchTokens({ query }, searchKey, tenantId);

  // Send search request to server
  const response = await fetch(`/api/logs/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${authToken}`,
      'X-Tenant-ID': tenantId
    },
    body: JSON.stringify({
      tokens: searchTokens
    })
  });

  // Get encrypted log entries
  const { entries } = await response.json();

  // Decrypt entries client-side
  return await decryptLogEntries(entries, encryptionKey);
}

// Server-side
async function handleSearchRequest(req, res) {
  const { tokens } = req.body;
  const { tenantId } = req.headers;

  const redis = getRedisForTenant(tenantId);

  // Find logs that match all tokens
  let matchingLogIds = null;

  for (const token of tokens) {
    const logIds = await redis.smembers(
      `tenant:${tenantId}:search:token:${token}`
    );

    if (matchingLogIds === null) {
      matchingLogIds = new Set(logIds);
    } else {
      // Intersection - logs must match all tokens
      matchingLogIds = new Set(
        [...matchingLogIds].filter(id => logIds.includes(id))
      );
    }

    if (matchingLogIds.size === 0) {
      break; // No matches, stop early
    }
  }

  // Get the encrypted log entries
  const entries = await getEncryptedLogEntries(
    Array.from(matchingLogIds),
    tenantId
  );

  res.json({ entries });
}
```

## Tenant-Consistent Search Keys

To enable multiple users in the same tenant to search the same logs:

```javascript
// Client-side
async function deriveSearchKey(apiKey, tenantId) {
  // 1. First derive a user-specific key from the API key
  const userKey = await deriveUserKey(apiKey);

  // 2. Use the user key to authenticate to the server
  const response = await fetch('/api/tenant/search-key-material', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'X-Tenant-ID': tenantId
    }
  });

  // 3. Get tenant-specific key material (same for all tenant users)
  const { keyMaterial } = await response.json();

  // 4. Combine user key with tenant key material
  // This produces the same search key for all users in the tenant
  return await crypto.subtle.deriveKey(
    {
      name: "HKDF",
      hash: "SHA-256",
      salt: hexToArrayBuffer(keyMaterial),
      info: new TextEncoder().encode("search-key")
    },
    userKey,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    true,
    ["sign"]
  );
}
```

## Advanced Search Capabilities

NeuralLog's searchable encryption supports advanced search features:

### 1. Phrase Search

```javascript
function generatePhraseTokens(phrase, searchKey, tenantId) {
  // Generate tokens for the entire phrase
  const phraseToken = generateToken(`phrase:${phrase}`, searchKey, tenantId);

  // Also generate tokens for individual words for fallback
  const wordTokens = phrase.split(/\s+/).map(word =>
    generateToken(word, searchKey, tenantId)
  );

  return [phraseToken, ...wordTokens];
}
```

### 2. Field-Specific Search

```javascript
function generateFieldTokens(field, value, searchKey, tenantId) {
  // Generate token for field:value pair
  return generateToken(`field:${field}:${value}`, searchKey, tenantId);
}
```

### 3. Numeric Range Search

```javascript
function generateRangeTokens(field, min, max, searchKey, tenantId) {
  // For numeric ranges, generate tokens for bucketed values
  const tokens = [];
  const bucketSize = 10; // Adjust based on precision needs

  for (let bucket = Math.floor(min / bucketSize);
       bucket <= Math.floor(max / bucketSize);
       bucket++) {
    tokens.push(
      generateToken(`range:${field}:${bucket}`, searchKey, tenantId)
    );
  }

  return tokens;
}
```

## Zero-Knowledge Aggregate Analysis

NeuralLog implements advanced techniques for analyzing encrypted data in aggregate without decryption:

### FFT on Searchable Encryption Hashes

Fast Fourier Transform (FFT) can be applied to searchable encryption hashes to identify patterns and trends while maintaining zero-knowledge principles:

1. **Token Frequency Analysis**: Analyze token frequency distributions without knowing what the tokens represent
2. **Temporal Pattern Detection**: Apply FFT to token occurrences over time to identify cyclical patterns
3. **Cross-Token Correlation**: Identify relationships between different tokens without knowing their meaning
4. **Anomaly Detection**: Detect unusual patterns in token distributions that may indicate issues

```javascript
async function analyzeTokenPatterns(tokens, timeframe, tenantId) {
  // Get token frequency data over time
  const tokenTimeSeries = await getTokenTimeSeries(tokens, timeframe, tenantId);

  // Apply FFT to each token's time series
  const fftResults = tokenTimeSeries.map(series => applyFFT(series));

  // Identify significant frequencies and patterns
  const patterns = identifySignificantPatterns(fftResults);

  // Detect anomalies in the frequency domain
  const anomalies = detectFrequencyAnomalies(fftResults);

  return {
    patterns,
    anomalies,
    // Return FFT results for visualization
    fftResults
  };
}
```

This approach enables sophisticated analysis of encrypted data while maintaining zero-knowledge principles, as the server never needs to decrypt the data to identify patterns and anomalies.

## Security Properties

NeuralLog's searchable encryption provides:

1. **Zero Knowledge**: Server never learns plaintext content or search terms
2. **Tenant Isolation**: Search tokens are tenant-specific
3. **Forward Security**: Revoked users cannot search historical data
4. **Minimal Leakage**: Only reveals which documents contain the same terms

## Security Considerations

1. **Token Inference**: With enough data, statistical analysis might reveal patterns
   - Mitigated by using tenant-specific keys
   - Further mitigated by adding random salt to token generation
   - Can be addressed with frequency-hiding techniques

2. **Update Security**: Adding or removing searchable terms requires careful handling
   - Implement secure update protocols
   - Consider forward and backward security
   - Use versioning for token updates

3. **Query Privacy**: Search patterns themselves might reveal sensitive information
   - Implement query obfuscation techniques
   - Consider adding dummy queries
   - Use private information retrieval techniques for sensitive searches

4. **Frequency Analysis**: Token frequency can leak information
   - Implement frequency-hiding techniques
   - Consider adding dummy tokens
   - Use padding to normalize token distributions

5. **Correlation Attacks**: Correlating multiple queries can leak information
   - Implement query unlinkability measures
   - Consider stateful query transformations
   - Use different token derivation for different query sessions

## Implementation Guidelines

1. **Token Size**: Use full-length HMAC outputs (32 bytes) for security
2. **Normalization**: Consistently normalize terms before token generation
3. **Selective Indexing**: Only index terms that need to be searchable
4. **Rate Limiting**: Implement rate limiting to prevent brute force attacks
