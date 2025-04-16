# AuthManager.ts

This file contains the authentication management functionality for NeuralLog.

## Login

```typescript
/**
 * Login with username and password
 * 
 * @param username Username
 * @param password Password
 * @returns Promise that resolves to the auth response
 */
public async login(username: string, password: string): Promise<AuthResponse> {
  try {
    // Login with the auth service
    const response = await this.authService.login(username, password);
    
    // Store the auth token
    this.authToken = response.token;
    
    // Derive the user key from the password
    const userKey = await this.cryptoService.deriveUserKey(username, password);
    
    // Store the user key
    this.userKey = userKey;
    
    return response;
  } catch (error) {
    throw new LogError(
      `Login failed: ${error instanceof Error ? error.message : String(error)}`,
      'login_failed'
    );
  }
}
```

## Login with API Key

```typescript
/**
 * Login with API key
 * 
 * @param apiKey API key
 * @returns Promise that resolves to the auth response
 */
public async loginWithApiKey(apiKey: string): Promise<AuthResponse> {
  try {
    // Login with the auth service
    const response = await this.authService.loginWithApiKey(apiKey);
    
    // Store the auth token
    this.authToken = response.token;
    
    // Derive the user key from the API key
    const userKey = await this.cryptoService.deriveUserKeyFromApiKey(apiKey);
    
    // Store the user key
    this.userKey = userKey;
    
    return response;
  } catch (error) {
    throw new LogError(
      `Login with API key failed: ${error instanceof Error ? error.message : String(error)}`,
      'login_with_api_key_failed'
    );
  }
}
```

## Logout

```typescript
/**
 * Logout
 * 
 * @returns Promise that resolves when logout is complete
 */
public async logout(): Promise<void> {
  try {
    // Logout with the auth service
    if (this.authToken) {
      await this.authService.logout(this.authToken);
    }
    
    // Clear the auth token and user key
    this.authToken = null;
    this.userKey = null;
  } catch (error) {
    throw new LogError(
      `Logout failed: ${error instanceof Error ? error.message : String(error)}`,
      'logout_failed'
    );
  }
}
```

## Getting Auth Token

```typescript
/**
 * Get the auth token
 * 
 * @returns Auth token
 */
public getAuthToken(): string {
  if (!this.authToken) {
    throw new LogError(
      'Not authenticated',
      'not_authenticated'
    );
  }
  
  return this.authToken;
}
```

## Getting User Key

```typescript
/**
 * Get the user key
 * 
 * @returns User key
 */
public getUserKey(): Uint8Array {
  if (!this.userKey) {
    throw new LogError(
      'Not authenticated',
      'not_authenticated'
    );
  }
  
  return this.userKey;
}
```

## Creating API Key

```typescript
/**
 * Create an API key
 * 
 * @param name Name of the API key
 * @param expiresIn Expiration time in days
 * @returns Promise that resolves to the created API key
 */
public async createApiKey(
  name: string,
  expiresIn?: number
): Promise<APIKey> {
  try {
    // Get auth token
    const authToken = this.getAuthToken();
    
    // Create the API key
    const apiKey = await this.authService.createApiKey(
      authToken,
      name,
      expiresIn
    );
    
    return apiKey;
  } catch (error) {
    throw new LogError(
      `Failed to create API key: ${error instanceof Error ? error.message : String(error)}`,
      'create_api_key_failed'
    );
  }
}
```

## Getting API Keys

```typescript
/**
 * Get API keys
 * 
 * @returns Promise that resolves to the API keys
 */
public async getApiKeys(): Promise<APIKey[]> {
  try {
    // Get auth token
    const authToken = this.getAuthToken();
    
    // Get the API keys
    const apiKeys = await this.authService.getApiKeys(authToken);
    
    return apiKeys;
  } catch (error) {
    throw new LogError(
      `Failed to get API keys: ${error instanceof Error ? error.message : String(error)}`,
      'get_api_keys_failed'
    );
  }
}
```

## Revoking API Key

```typescript
/**
 * Revoke an API key
 * 
 * @param apiKeyId API key ID
 * @returns Promise that resolves when the API key is revoked
 */
public async revokeApiKey(apiKeyId: string): Promise<void> {
  try {
    // Get auth token
    const authToken = this.getAuthToken();
    
    // Revoke the API key
    await this.authService.revokeApiKey(authToken, apiKeyId);
  } catch (error) {
    throw new LogError(
      `Failed to revoke API key: ${error instanceof Error ? error.message : String(error)}`,
      'revoke_api_key_failed'
    );
  }
}
```

## Granting Permission

```typescript
/**
 * Grant permission to a user
 * 
 * @param userId User ID
 * @param permission Permission
 * @param resource Resource
 * @param authToken Authentication token
 * @returns Promise that resolves when the permission is granted
 */
public async grantPermission(
  userId: string,
  permission: string,
  resource: string,
  authToken: string
): Promise<void> {
  try {
    // Grant the permission
    await this.authService.grantPermission(
      authToken,
      userId,
      permission,
      resource
    );
  } catch (error) {
    throw new LogError(
      `Failed to grant permission: ${error instanceof Error ? error.message : String(error)}`,
      'grant_permission_failed'
    );
  }
}
```
