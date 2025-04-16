# AuthService.ts

This file contains the service for interacting with the authentication endpoints of the auth service.

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
    const response = await this.apiClient.post(
      `${this.baseUrl}/login`,
      {
        username,
        password
      }
    );
    
    return response.data;
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
    const response = await this.apiClient.post(
      `${this.baseUrl}/login/api-key`,
      {
        apiKey
      }
    );
    
    return response.data;
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
 * @param authToken Authentication token
 * @returns Promise that resolves when logout is complete
 */
public async logout(authToken: string): Promise<void> {
  try {
    await this.apiClient.post(
      `${this.baseUrl}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
  } catch (error) {
    throw new LogError(
      `Logout failed: ${error instanceof Error ? error.message : String(error)}`,
      'logout_failed'
    );
  }
}
```

## Get User Profile

```typescript
/**
 * Get user profile
 * 
 * @param authToken Authentication token
 * @returns Promise that resolves to the user profile
 */
public async getUserProfile(authToken: string): Promise<UserProfile> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/profile`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to get user profile: ${error instanceof Error ? error.message : String(error)}`,
      'get_user_profile_failed'
    );
  }
}
```

## Create API Key

```typescript
/**
 * Create an API key
 * 
 * @param authToken Authentication token
 * @param name Name of the API key
 * @param expiresIn Expiration time in days
 * @returns Promise that resolves to the created API key
 */
public async createApiKey(
  authToken: string,
  name: string,
  expiresIn?: number
): Promise<APIKey> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/api-keys`,
      {
        name,
        expiresIn
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to create API key: ${error instanceof Error ? error.message : String(error)}`,
      'create_api_key_failed'
    );
  }
}
```

## Get API Keys

```typescript
/**
 * Get API keys
 * 
 * @param authToken Authentication token
 * @returns Promise that resolves to the API keys
 */
public async getApiKeys(authToken: string): Promise<APIKey[]> {
  try {
    const response = await this.apiClient.get(
      `${this.baseUrl}/api-keys`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    throw new LogError(
      `Failed to get API keys: ${error instanceof Error ? error.message : String(error)}`,
      'get_api_keys_failed'
    );
  }
}
```

## Revoke API Key

```typescript
/**
 * Revoke an API key
 * 
 * @param authToken Authentication token
 * @param apiKeyId API key ID
 * @returns Promise that resolves when the API key is revoked
 */
public async revokeApiKey(authToken: string, apiKeyId: string): Promise<void> {
  try {
    await this.apiClient.delete(
      `${this.baseUrl}/api-keys/${apiKeyId}`,
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
  } catch (error) {
    throw new LogError(
      `Failed to revoke API key: ${error instanceof Error ? error.message : String(error)}`,
      'revoke_api_key_failed'
    );
  }
}
```

## Check Permission

```typescript
/**
 * Check if the user has permission to perform an action on a resource
 * 
 * @param authToken Authentication token
 * @param action Action to check
 * @param resource Resource to check
 * @returns Promise that resolves to true if the user has permission
 */
public async checkPermission(
  authToken: string,
  action: string,
  resource: string
): Promise<boolean> {
  try {
    const response = await this.apiClient.post(
      `${this.baseUrl}/permissions/check`,
      {
        action,
        resource
      },
      {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      }
    );
    
    return response.data.allowed;
  } catch (error) {
    throw new LogError(
      `Failed to check permission: ${error instanceof Error ? error.message : String(error)}`,
      'check_permission_failed'
    );
  }
}
```
