---
sidebar_position: 1
---

# Authentication Implementation Guide

This guide provides detailed instructions for implementing proper authentication in the NeuralLog ecosystem, focusing on securing the logs server and restricting registration in the web application.

> **Note**: This guide describes the current implementation. For the target unified authentication architecture, see [Unified Authentication Architecture](../overview/unified-auth-architecture.md).

## Securing the Logs Server

Currently, the logs server lacks proper authentication middleware, making it vulnerable to unauthorized access. Here's how to implement authentication in the logs server:

### 1. Create Authentication Middleware

Create a new directory `src/middleware` in the logs server project and add an authentication middleware:

```typescript
// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import logger from '../utils/logger';

interface AuthCheckResponse {
  status: string;
  allowed: boolean;
}

/**
 * Authentication middleware for the logs server
 * Verifies API keys and JWT tokens against the auth service
 */
export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get tenant ID from headers
    const tenantId = req.headers['x-tenant-id'] as string || 'default';

    // Check for API key
    const apiKey = req.headers['x-api-key'] as string;

    // Check for JWT token
    const authHeader = req.headers.authorization;
    const jwtToken = authHeader?.startsWith('Bearer ')
      ? authHeader.substring(7)
      : null;

    // If neither API key nor JWT token is provided, return 401
    if (!apiKey && !jwtToken) {
      return res.status(401).json({
        status: 'error',
        message: 'Authentication required'
      });
    }

    // Determine the resource and permission based on the request
    const { method, path } = req;
    const resource = getResourceFromPath(path);
    const permission = getPermissionFromMethod(method);

    // Check permission with auth service
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3040';
    const response = await axios.post<AuthCheckResponse>(
      `${authServiceUrl}/api/auth/check`,
      {
        user: jwtToken ? `jwt:${jwtToken}` : `apikey:${apiKey}`,
        relation: permission,
        object: resource
      },
      {
        headers: {
          'x-tenant-id': tenantId,
          'Content-Type': 'application/json'
        }
      }
    );

    // If not allowed, return 403
    if (!response.data.allowed) {
      return res.status(403).json({
        status: 'error',
        message: 'Insufficient permissions'
      });
    }

    // Add user info to request for later use
    req.user = {
      tenantId,
      authenticated: true,
      // Add more user info as needed
    };

    // Continue to the next middleware
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Authentication service unavailable'
    });
  }
};

/**
 * Get resource identifier from path
 */
function getResourceFromPath(path: string): string {
  // Extract log name from path if available
  const logMatch = path.match(/\/logs\/([^\/]+)/);
  if (logMatch) {
    return `log:${logMatch[1]}`;
  }

  // For general logs access
  if (path.startsWith('/logs')) {
    return 'logs:all';
  }

  // For statistics
  if (path.startsWith('/statistics')) {
    return 'statistics:all';
  }

  // Default resource
  return 'system:logs';
}

/**
 * Get permission from HTTP method
 */
function getPermissionFromMethod(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'read';
    case 'POST':
    case 'PUT':
    case 'PATCH':
      return 'write';
    case 'DELETE':
      return 'delete';
    default:
      return 'read';
  }
}

// Add user property to Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: {
        tenantId: string;
        authenticated: boolean;
        [key: string]: any;
      };
    }
  }
}
```

### 2. Apply Middleware to Routes

Update the server setup to use the authentication middleware:

```typescript
// src/server/server.ts
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import logger from '../utils/logger';
import routes from './routes';
import { setupSwagger } from '../utils/swagger';
import { authMiddleware } from '../middleware/authMiddleware';

export class Server {
  private app: express.Application;
  private port: number;

  constructor(port: number = 3030) {
    this.app = express();
    this.port = port;

    // Configure middleware
    this.app.use(cors());
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));

    // Add health check route (no auth required)
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'ok',
        message: 'NeuralLog server is running',
        version: '1.0.0'
      });
    });

    // Apply authentication middleware to all routes except health check
    this.app.use(/^(?!\/health).*$/, authMiddleware);

    // Configure routes
    this.app.use('/', routes);

    // Setup Swagger
    setupSwagger(this.app);

    // Error handling
    this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      logger.error(`Error: ${err.message}`);
      res.status(500).json({
        status: 'error',
        message: err.message
      });
    });
  }

  public start(): void {
    this.app.listen(this.port, '0.0.0.0', () => {
      logger.info(`Server listening on 0.0.0.0:${this.port}`);
    });
  }
}
```

### 3. Update Environment Configuration

Add the auth service URL to the environment configuration:

```
# .env
AUTH_SERVICE_URL=http://auth-service:3040
```

### 4. Update Docker Compose Configuration

Ensure the logs server has access to the auth service in the Docker Compose configuration:

```yaml
# docker-compose.server.yml
services:
  server:
    image: node:22-alpine
    container_name: neurallog-server
    working_dir: /app
    volumes:
      - ../server:/app
    environment:
      NODE_ENV: development
      PORT: 3030
      STORAGE_TYPE: redis
      REDIS_HOST: neurallog-redis
      REDIS_PORT: 6379
      DEFAULT_NAMESPACE: default
      AUTH_SERVICE_URL: http://auth-service:3040
    ports:
      - "3030:3030"
    command: sh -c "npm config set registry http://verdaccio:4873 ; npm install ; npm run build ; npm start"
    networks:
      - neurallog-network
    depends_on:
      - redis
      - verdaccio
      - auth-service
    restart: unless-stopped
```

## Securing the Web Application Registration

Currently, the web application allows anyone to register, which is a security risk. Here's how to restrict registration:

### 1. Configure Clerk Authentication

Update the Clerk configuration to restrict sign-ups:

```typescript
// src/auth/clerk-config.ts
import { ClerkProvider } from '@clerk/nextjs';

export const clerkConfig = {
  // Only allow specific email domains
  allowedSignUpDomains: ['neurallog.com', 'example.com'],

  // Require admin approval for new sign-ups
  requireAdminApproval: true,

  // Use invitation-only sign-ups
  invitationOnly: true
};

export const ClerkProviderWithConfig = ({ children }) => {
  return (
    <ClerkProvider
      {...clerkConfig}
    >
      {children}
    </ClerkProvider>
  );
};
```

### 2. Implement Invitation System

Create an invitation system that allows administrators to invite new users:

```typescript
// src/pages/api/invitations/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { createInvitation } from '@/services/invitationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get the authenticated user
    const { userId } = getAuth(req);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Check if user is an admin
    const isAdmin = await checkUserIsAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Get email from request body
    const { email, role } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Create invitation
    const invitation = await createInvitation({
      email,
      role: role || 'user',
      invitedBy: userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    // Return the invitation
    return res.status(200).json({ invitation });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function checkUserIsAdmin(userId: string): Promise<boolean> {
  // Implement admin check logic here
  // This could be a call to the auth service or a database query
  return true; // Placeholder
}
```

### 3. Create Invitation Service

Implement the invitation service to manage invitations:

```typescript
// src/services/invitationService.ts
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db';

interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  createdAt: string;
  expiresAt: string;
  usedAt?: string;
}

interface CreateInvitationParams {
  email: string;
  role: string;
  invitedBy: string;
  expiresAt: Date;
}

export async function createInvitation(params: CreateInvitationParams): Promise<Invitation> {
  const invitation: Invitation = {
    id: uuidv4(),
    email: params.email,
    role: params.role,
    invitedBy: params.invitedBy,
    createdAt: new Date().toISOString(),
    expiresAt: params.expiresAt.toISOString()
  };

  // Save invitation to database
  await db.invitations.create(invitation);

  // Send invitation email
  await sendInvitationEmail(invitation);

  return invitation;
}

export async function getInvitationByToken(token: string): Promise<Invitation | null> {
  // Get invitation from database
  const invitation = await db.invitations.findUnique({
    where: { id: token }
  });

  // Check if invitation exists and is not expired
  if (!invitation || new Date(invitation.expiresAt) < new Date() || invitation.usedAt) {
    return null;
  }

  return invitation;
}

export async function markInvitationAsUsed(token: string): Promise<boolean> {
  // Mark invitation as used
  const result = await db.invitations.update({
    where: { id: token },
    data: { usedAt: new Date().toISOString() }
  });

  return !!result;
}

async function sendInvitationEmail(invitation: Invitation): Promise<void> {
  // Implement email sending logic here
  console.log(`Sending invitation email to ${invitation.email}`);
}
```

### 4. Update Sign-Up Page

Modify the sign-up page to require an invitation token:

```tsx
// src/pages/sign-up/[[...index]].tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { SignUp } from '@clerk/nextjs';
import { getInvitationByToken } from '@/services/invitationService';

export default function SignUpPage() {
  const router = useRouter();
  const { token } = router.query;
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Verify invitation token
  useEffect(() => {
    async function verifyToken() {
      if (!token) {
        setError('Invitation token is required');
        setLoading(false);
        return;
      }

      try {
        const invitationData = await getInvitationByToken(token as string);
        if (!invitationData) {
          setError('Invalid or expired invitation token');
        } else {
          setInvitation(invitationData);
        }
      } catch (err) {
        setError('Error verifying invitation token');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, [token]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <h1>Error</h1>
        <p>{error}</p>
        <p>Please contact an administrator to get a valid invitation.</p>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <p>You've been invited to join NeuralLog as a {invitation.role}.</p>
      <SignUp
        initialValues={{ emailAddress: invitation.email }}
        afterSignUpUrl={`/api/invitations/complete?token=${token}`}
      />
    </div>
  );
}
```

### 5. Create Invitation Completion Endpoint

Create an API endpoint to mark invitations as used after sign-up:

```typescript
// src/pages/api/invitations/complete.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { markInvitationAsUsed } from '@/services/invitationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Get token from query
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    // Mark invitation as used
    const success = await markInvitationAsUsed(token as string);
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // Redirect to dashboard
    return res.redirect('/dashboard');
  } catch (error) {
    console.error('Error completing invitation:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

## Implementing Role-Based Access Control

To further secure the application, implement role-based access control (RBAC):

### 1. Define Roles and Permissions

Create a roles and permissions configuration:

```typescript
// src/config/roles.ts
export enum Role {
  ADMIN = 'admin',
  MANAGER = 'manager',
  USER = 'user',
  READONLY = 'readonly'
}

export const rolePermissions = {
  [Role.ADMIN]: [
    'logs:read',
    'logs:write',
    'logs:delete',
    'users:read',
    'users:write',
    'users:delete',
    'settings:read',
    'settings:write',
    'invitations:create'
  ],
  [Role.MANAGER]: [
    'logs:read',
    'logs:write',
    'users:read',
    'settings:read',
    'invitations:create'
  ],
  [Role.USER]: [
    'logs:read',
    'logs:write'
  ],
  [Role.READONLY]: [
    'logs:read'
  ]
};

export function hasPermission(userRole: Role, permission: string): boolean {
  return rolePermissions[userRole]?.includes(permission) || false;
}
```

### 2. Create Authorization Middleware for the Web Application

Implement authorization middleware for API routes:

```typescript
// src/middleware/authorizationMiddleware.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getAuth } from '@clerk/nextjs/server';
import { getUserRole } from '@/services/userService';
import { hasPermission } from '@/config/roles';

export function withAuthorization(permission: string) {
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    try {
      // Get the authenticated user
      const { userId } = getAuth(req);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Get user role
      const userRole = await getUserRole(userId);
      if (!userRole) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      // Check if user has the required permission
      if (!hasPermission(userRole, permission)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // User has permission, continue
      return next();
    } catch (error) {
      console.error('Authorization error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}
```

### 3. Apply Authorization to API Routes

Use the authorization middleware in API routes:

```typescript
// src/pages/api/logs/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { withAuthorization } from '@/middleware/authorizationMiddleware';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle the request
  // ...
}

// Apply authorization middleware
export default withAuthorization('logs:read')(handler);
```

## Security Best Practices

### 1. Rate Limiting

Implement rate limiting to prevent brute force attacks:

```typescript
// src/middleware/rateLimitMiddleware.ts
import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.'
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  }
});
```

### 2. HTTPS Enforcement

Ensure all communication is encrypted:

```typescript
// src/middleware/httpsMiddleware.ts
import { NextApiRequest, NextApiResponse } from 'next';

export function withHttps(handler: Function) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Check if request is secure
    const isSecure = req.headers['x-forwarded-proto'] === 'https' || req.secure;

    // In production, redirect to HTTPS
    if (process.env.NODE_ENV === 'production' && !isSecure) {
      const host = req.headers.host || '';
      return res.redirect(`https://${host}${req.url}`);
    }

    // Continue with the request
    return handler(req, res);
  };
}
```

### 3. Content Security Policy

Implement a Content Security Policy to prevent XSS attacks:

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.clerk.io;
      style-src 'self' 'unsafe-inline' https://cdn.clerk.io;
      img-src 'self' data: https://cdn.clerk.io;
      font-src 'self';
      connect-src 'self' https://api.clerk.io https://api.neurallog.com;
      frame-src 'self' https://accounts.clerk.io;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  }
];

module.exports = {
  // ... other config
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};
```

## Securing the MCP Client

The MCP (Model Context Protocol) client is a critical component that allows AI models to interact with the logs server. Currently, the MCP client lacks authentication when communicating with the logs server, which is a security vulnerability.

### 1. Add Authentication to MCP Client

Update the MCP client to include authentication headers in all requests to the logs server:

```typescript
// src/index.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";

// Configuration
const webServerUrl = process.env.WEB_SERVER_URL || "http://localhost:3030";
const apiKey = process.env.API_KEY || ""; // Add API key environment variable
const tenantId = process.env.TENANT_ID || "default"; // Add tenant ID environment variable

// Create axios instance with default headers
const api = axios.create({
  baseURL: webServerUrl,
  headers: {
    "x-api-key": apiKey,
    "x-tenant-id": tenantId
  }
});

// Create an MCP server
const server = new McpServer({
  name: "AI-MCP-Logger",
  version: "0.1.0"
});

// Add get_logs tool
server.tool(
  "get_logs",
  { limit: z.number().optional().describe("Maximum number of log names to return (default: 1000)") },
  async (args) => {
    try {
      // Use the authenticated API instance
      const response = await api.get(`/logs`, {
        params: { limit: args.limit || 1000 }
      });

      // Return the data directly without additional formatting
      return {
        content: [{
          type: "text",
          text: JSON.stringify(response.data, null, 2)
        }]
      };
    } catch (error: any) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Error getting logs: ${error.message || String(error)}`
          }, null, 2)
        }],
        isError: true
      };
    }
  }
);

// Update all other tools to use the authenticated API instance...
```

### 2. Update Docker Configuration

Update the Docker configuration to include the API key and tenant ID:

```dockerfile
# Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Set default environment variables
ENV WEB_SERVER_URL=http://localhost:3030
ENV API_KEY=""
ENV TENANT_ID="default"

CMD ["node", "src/index.js"]
```

### 3. Update Docker Run Commands

Update the Docker run commands in package.json to include the API key:

```json
"scripts": {
  "docker:build": "docker build -t ai-mcp-logger-mcp-client .",
  "docker:run": "docker run -i -e WEB_SERVER_URL=http://localhost:3030 -e API_KEY=your-api-key -e TENANT_ID=default ai-mcp-logger-mcp-client",
  "docker:run:remote": "docker run -i -e WEB_SERVER_URL=http://your-server-address:3030 -e API_KEY=your-api-key -e TENANT_ID=your-tenant-id ai-mcp-logger-mcp-client"
}
```

### 4. Add Authentication Documentation

Update the README.md to include information about authentication:

```markdown
## Authentication

The MCP client requires authentication to access the logs server. You need to provide an API key and tenant ID:

### Environment Variables

- `WEB_SERVER_URL`: URL of the logs server (default: http://localhost:3030)
- `API_KEY`: API key for authentication (required)
- `TENANT_ID`: Tenant ID for multi-tenancy support (default: "default")

### Running with Authentication

```bash
# Run locally with authentication
API_KEY=your-api-key TENANT_ID=your-tenant-id npm start

# Run with Docker
docker run -i \
  -e WEB_SERVER_URL=http://localhost:3030 \
  -e API_KEY=your-api-key \
  -e TENANT_ID=your-tenant-id \
  ai-mcp-logger-mcp-client
```
```

### 5. Error Handling for Authentication Failures

Improve error handling for authentication failures:

```typescript
// Add this function to handle authentication errors
function handleAuthError(error: any, operation: string): any {
  if (error.response) {
    if (error.response.status === 401) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Authentication failed: Invalid API key or missing authentication. Please check your API_KEY environment variable.`
          }, null, 2)
        }],
        isError: true
      };
    } else if (error.response.status === 403) {
      return {
        content: [{
          type: "text",
          text: JSON.stringify({
            error: true,
            message: `Authorization failed: Insufficient permissions to ${operation}. Please check your API key permissions.`
          }, null, 2)
        }],
        isError: true
      };
    }
  }

  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        error: true,
        message: `Error during ${operation}: ${error.message || String(error)}`
      }, null, 2)
    }],
    isError: true
  };
}

// Then use it in catch blocks
catch (error: any) {
  return handleAuthError(error, "getting logs");
}
```

## Conclusion

By implementing these security measures, you will significantly improve the security posture of the NeuralLog ecosystem:

1. The logs server will be properly authenticated, ensuring only authorized users can access logs.
2. The web application will restrict registration to invited users only, preventing unauthorized access.
3. The MCP client will authenticate with the logs server, ensuring secure AI model interactions.
4. Role-based access control will ensure users can only access resources they are authorized to use.
5. Additional security measures like rate limiting, HTTPS enforcement, and Content Security Policy will protect against common web vulnerabilities.

Remember to test these implementations thoroughly in a development environment before deploying to production. Also, consider implementing regular security audits and vulnerability scanning to identify and address potential security issues.
