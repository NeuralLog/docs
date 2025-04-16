---
sidebar_position: 3
---

# Auth0 Configuration Guide

This guide provides step-by-step instructions for setting up Auth0 for NeuralLog deployed on Vercel at neurallog.app, including automation options using the Auth0 Management API.

## Manual Setup

### 1. Create an Auth0 Account and Tenant

1. Go to [Auth0's website](https://auth0.com/) and sign up for an account
2. Create a new tenant (e.g., "neurallog")

### 2. Create Applications in Auth0

#### Single Page Application (SPA) for the Web Application

1. In Auth0 dashboard, go to "Applications" → "Create Application"
2. Name: "NeuralLog Web"
3. Application Type: Single Page Application
4. Click "Create"
5. In the application settings, configure:
   - Allowed Callback URLs: `https://neurallog.app/callback, http://localhost:3000/callback`
   - Allowed Logout URLs: `https://neurallog.app, http://localhost:3000`
   - Allowed Web Origins: `https://neurallog.app, http://localhost:3000`
   - Allowed CORS Origins: `https://neurallog.app, http://localhost:3000`

#### Machine-to-Machine (M2M) Application for the Auth Service

1. Go to "Applications" → "Create Application"
2. Name: "NeuralLog Auth Service"
3. Application Type: Machine to Machine
4. Click "Create"
5. Select the Auth0 Management API with the following scopes:
   - `read:users`
   - `update:users`
   - `create:users`
   - `read:user_idp_tokens`

#### Machine-to-Machine (M2M) Application for the MCP Client

1. Go to "Applications" → "Create Application"
2. Name: "NeuralLog MCP Client"
3. Application Type: Machine to Machine
4. Click "Create"

### 3. Create an API in Auth0

1. Go to "APIs" → "Create API"
2. Name: "NeuralLog API"
3. Identifier (audience): `https://api.neurallog.app`
4. Signing Algorithm: RS256
5. Click "Create"
6. Go to the "Permissions" tab and add:
   - `logs:read`
   - `logs:write`

### 4. Configure User Database

1. Go to "Authentication" → "Database"
2. Use the default "Username-Password-Authentication" or create a new one
3. Configure password policies and security settings as needed

### 5. Configure Auth0 Rules for Multi-Tenancy

1. Go to "Auth Pipeline" → "Rules"
2. Click "Create Rule"
3. Select the "Empty Rule" template
4. Name it "Add Tenant to Tokens"
5. Add the following code:

```javascript
function addTenantToTokens(user, context, callback) {
  // Get tenant ID from app_metadata or use default
  const tenantId = user.app_metadata && user.app_metadata.tenant_id 
    ? user.app_metadata.tenant_id 
    : 'default';
  
  // Add tenant ID to ID token and access token
  context.idToken['https://neurallog.app/tenant_id'] = tenantId;
  context.accessToken['https://neurallog.app/tenant_id'] = tenantId;
  
  callback(null, user, context);
}
```

### 6. Update Environment Variables

#### For the Auth Service

In your Vercel project for the auth service:

```
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-auth-service-client-id
AUTH0_CLIENT_SECRET=your-auth-service-client-secret
AUTH0_AUDIENCE=https://api.neurallog.app

OPENFGA_API_URL=your-openfga-api-url
OPENFGA_STORE_ID=your-openfga-store-id
OPENFGA_API_TOKEN=your-openfga-api-token
```

#### For the Web Application

In your Vercel project for the web application:

```
NEXT_PUBLIC_AUTH0_DOMAIN=your-tenant.auth0.com
NEXT_PUBLIC_AUTH0_CLIENT_ID=your-web-client-id
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.neurallog.app

NEXT_PUBLIC_AUTH_SERVICE_URL=https://auth.neurallog.app
NEXT_PUBLIC_DEFAULT_TENANT_ID=default
```

#### For the MCP Client

In your Vercel project for the MCP client:

```
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-mcp-client-id
AUTH0_CLIENT_SECRET=your-mcp-client-secret
AUTH0_AUDIENCE=https://api.neurallog.app

AUTH_SERVICE_URL=https://auth.neurallog.app
TENANT_ID=default
```

## Automating Auth0 Setup with APIs

Instead of manually configuring Auth0 through the dashboard, you can use the Auth0 Management API to automate the setup process.

### Prerequisites

1. Create an Auth0 account and tenant
2. Create a Machine-to-Machine application with access to the Auth0 Management API

### Automation Script

Create a script to automate the Auth0 setup:

```typescript
// scripts/setup-auth0.ts
import { ManagementClient } from 'auth0';

async function setupAuth0() {
  // Initialize Auth0 Management client
  const management = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
  });

  // 1. Create the NeuralLog API
  console.log('Creating NeuralLog API...');
  const api = await management.createResourceServer({
    name: 'NeuralLog API',
    identifier: 'https://api.neurallog.app',
    scopes: [
      { value: 'logs:read', description: 'Read logs' },
      { value: 'logs:write', description: 'Write logs' },
    ],
    signing_alg: 'RS256',
  });
  console.log(`API created with ID: ${api.id}`);

  // 2. Create the Web Application (SPA)
  console.log('Creating Web Application...');
  const webApp = await management.createClient({
    name: 'NeuralLog Web',
    app_type: 'spa',
    callbacks: ['https://neurallog.app/callback', 'http://localhost:3000/callback'],
    allowed_logout_urls: ['https://neurallog.app', 'http://localhost:3000'],
    web_origins: ['https://neurallog.app', 'http://localhost:3000'],
    grant_types: ['authorization_code', 'implicit', 'refresh_token'],
  });
  console.log(`Web Application created with ID: ${webApp.client_id}`);

  // 3. Create the Auth Service Application (M2M)
  console.log('Creating Auth Service Application...');
  const authServiceApp = await management.createClient({
    name: 'NeuralLog Auth Service',
    app_type: 'non_interactive',
    grant_types: ['client_credentials'],
  });
  console.log(`Auth Service Application created with ID: ${authServiceApp.client_id}`);

  // 4. Create the MCP Client Application (M2M)
  console.log('Creating MCP Client Application...');
  const mcpClientApp = await management.createClient({
    name: 'NeuralLog MCP Client',
    app_type: 'non_interactive',
    grant_types: ['client_credentials'],
  });
  console.log(`MCP Client Application created with ID: ${mcpClientApp.client_id}`);

  // 5. Grant the Auth Service access to the Auth0 Management API
  console.log('Granting Auth Service access to Management API...');
  await management.createClientGrant({
    client_id: authServiceApp.client_id,
    audience: 'https://your-tenant.auth0.com/api/v2/',
    scope: ['read:users', 'update:users', 'create:users', 'read:user_idp_tokens'],
  });

  // 6. Grant the Auth Service and MCP Client access to the NeuralLog API
  console.log('Granting applications access to NeuralLog API...');
  await management.createClientGrant({
    client_id: authServiceApp.client_id,
    audience: 'https://api.neurallog.app',
    scope: ['logs:read', 'logs:write'],
  });
  
  await management.createClientGrant({
    client_id: mcpClientApp.client_id,
    audience: 'https://api.neurallog.app',
    scope: ['logs:read', 'logs:write'],
  });

  // 7. Create the tenant rule
  console.log('Creating tenant rule...');
  await management.createRule({
    name: 'Add Tenant to Tokens',
    script: `
function addTenantToTokens(user, context, callback) {
  // Get tenant ID from app_metadata or use default
  const tenantId = user.app_metadata && user.app_metadata.tenant_id 
    ? user.app_metadata.tenant_id 
    : 'default';
  
  // Add tenant ID to ID token and access token
  context.idToken['https://neurallog.app/tenant_id'] = tenantId;
  context.accessToken['https://neurallog.app/tenant_id'] = tenantId;
  
  callback(null, user, context);
}`,
    enabled: true,
  });

  console.log('Auth0 setup completed successfully!');
  console.log('Environment variables for your applications:');
  console.log(`
# Auth Service
AUTH0_DOMAIN=${process.env.AUTH0_DOMAIN}
AUTH0_CLIENT_ID=${authServiceApp.client_id}
AUTH0_CLIENT_SECRET=${authServiceApp.client_secret}
AUTH0_AUDIENCE=https://api.neurallog.app

# Web Application
NEXT_PUBLIC_AUTH0_DOMAIN=${process.env.AUTH0_DOMAIN}
NEXT_PUBLIC_AUTH0_CLIENT_ID=${webApp.client_id}
NEXT_PUBLIC_AUTH0_AUDIENCE=https://api.neurallog.app

# MCP Client
AUTH0_DOMAIN=${process.env.AUTH0_DOMAIN}
AUTH0_CLIENT_ID=${mcpClientApp.client_id}
AUTH0_CLIENT_SECRET=${mcpClientApp.client_secret}
AUTH0_AUDIENCE=https://api.neurallog.app
  `);
}

setupAuth0().catch(error => {
  console.error('Error setting up Auth0:', error);
  process.exit(1);
});
```

### Running the Automation Script

1. Install the Auth0 SDK:
   ```bash
   npm install auth0
   ```

2. Set environment variables:
   ```bash
   export AUTH0_DOMAIN=your-tenant.auth0.com
   export AUTH0_CLIENT_ID=your-management-api-client-id
   export AUTH0_CLIENT_SECRET=your-management-api-client-secret
   ```

3. Run the script:
   ```bash
   npx ts-node scripts/setup-auth0.ts
   ```

## Using the Auth0 CLI

Auth0 also provides a CLI tool that can be used to automate the setup process:

1. Install the Auth0 CLI:
   ```bash
   npm install -g auth0-cli
   ```

2. Log in to Auth0:
   ```bash
   auth0 login
   ```

3. Create a configuration file `auth0-config.json`:
   ```json
   {
     "tenant": "your-tenant",
     "api": {
       "name": "NeuralLog API",
       "identifier": "https://api.neurallog.app",
       "scopes": [
         {
           "value": "logs:read",
           "description": "Read logs"
         },
         {
           "value": "logs:write",
           "description": "Write logs"
         }
       ]
     },
     "applications": [
       {
         "name": "NeuralLog Web",
         "type": "spa",
         "callbacks": [
           "https://neurallog.app/callback",
           "http://localhost:3000/callback"
         ],
         "allowed_logout_urls": [
           "https://neurallog.app",
           "http://localhost:3000"
         ],
         "web_origins": [
           "https://neurallog.app",
           "http://localhost:3000"
         ]
       },
       {
         "name": "NeuralLog Auth Service",
         "type": "non_interactive"
       },
       {
         "name": "NeuralLog MCP Client",
         "type": "non_interactive"
       }
     ],
     "rules": [
       {
         "name": "Add Tenant to Tokens",
         "script": "function addTenantToTokens(user, context, callback) {\n  const tenantId = user.app_metadata && user.app_metadata.tenant_id ? user.app_metadata.tenant_id : 'default';\n  context.idToken['https://neurallog.app/tenant_id'] = tenantId;\n  context.accessToken['https://neurallog.app/tenant_id'] = tenantId;\n  callback(null, user, context);\n}"
       }
     ]
   }
   ```

4. Apply the configuration:
   ```bash
   auth0 apply --config auth0-config.json
   ```

## Testing the Configuration

After setting up Auth0 (either manually or through automation):

1. Visit https://neurallog.app
2. Try to access a protected route (e.g., dashboard)
3. You should be redirected to Auth0 login
4. After logging in, you should be redirected back to the protected route
5. Test API key creation and usage

## Troubleshooting

### CORS Issues

If you encounter CORS issues:

1. Verify that the allowed origins in Auth0 match your application URLs
2. Check that your API is returning the correct CORS headers:
   ```
   Access-Control-Allow-Origin: https://neurallog.app
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: Content-Type, Authorization, X-Tenant-ID
   ```

### Authentication Issues

If users can't log in:

1. Check the browser console for errors
2. Verify that the Auth0 domain and client ID are correct
3. Ensure the callback URLs are properly configured
4. Check Auth0 logs for authentication errors

### API Authorization Issues

If API calls are failing with 401 or 403 errors:

1. Verify that the audience is correctly set
2. Check that the client has the necessary permissions
3. Ensure the token is being properly passed in the Authorization header
4. Verify that the tenant ID is being correctly included in the token
