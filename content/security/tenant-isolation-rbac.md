# NeuralLog Tenant Isolation and RBAC

This document explains the tenant isolation architecture and Role-Based Access Control (RBAC) model in NeuralLog.

## Tenant Isolation Architecture

NeuralLog implements a hybrid isolation model with both shared global components and dedicated tenant-specific components:

### Global Shared Components (Multi-Tenant Aware)

1. **Auth Service**: A single global auth service instance serving all tenants
2. **OpenFGA**: A single global OpenFGA instance for authorization across all tenants
3. **Auth0**: A single global Auth0 tenant for user authentication
4. **PostgreSQL**: A single global database for OpenFGA and Auth Service data

### Tenant-Specific Dedicated Components (Single-Tenant)

1. **Web Server**: Dedicated web application instance per tenant
2. **Logs Server**: Dedicated logs server instance per tenant
3. **Redis**: One Redis instance per tenant, shared between auth and logs services

### Isolation Mechanisms

1. **Infrastructure Isolation**: Each tenant gets dedicated web, logs, and Redis instances
2. **Namespace Isolation**: In Kubernetes, each tenant's components run in isolated namespaces
3. **Network Isolation**: Network policies restrict communication between tenant namespaces
4. **Logical Isolation**: OpenFGA enforces tenant boundaries through its authorization model
5. **Data Namespacing**: Even in shared components, data is properly namespaced by tenant ID

## Role-Based Access Control (RBAC)

NeuralLog uses OpenFGA for comprehensive role-based access control:

### Role Hierarchy

1. **System Roles**:
   - **System Admin**: Full access to all tenants and resources
   - **Tenant Admin**: Full access to a specific tenant
   - **Organization Admin**: Full access to a specific organization
   - **User**: Basic user access

2. **Resource-Specific Roles**:
   - **Log Owner**: Full access to a specific log
   - **Log Writer**: Can write to a specific log
   - **Log Reader**: Can read a specific log
   - **API Key Manager**: Can manage API keys

### Permission Model

1. **Permission Format**: `resource:action`
   - Example: `logs:read`, `users:delete`, `apikeys:manage`

2. **Permission Inheritance**:
   - Roles can inherit permissions from other roles
   - Higher-level roles automatically include lower-level permissions

3. **Resource Ownership**:
   - Resources have owners with full control
   - Ownership can be at user, organization, or tenant level

4. **Tenant Context**:
   - All permissions are scoped to a tenant
   - Cross-tenant access is strictly controlled

## OpenFGA Authorization Model

The following is the enhanced OpenFGA authorization model that supports the RBAC system and tenant isolation:

```json
{
  "type_definitions": [
    {
      "type": "tenant",
      "relations": {
        "admin": { "this": {} },
        "member": { "this": {} },
        "exists": { "this": {} }
      }
    },
    
    {
      "type": "organization",
      "relations": {
        "admin": { "this": {} },
        "member": { "this": {} },
        "parent": {
          "type": "tenant"
        }
      },
      "metadata": {
        "relations": {
          "parent": { "directly_related_user_types": [{ "type": "tenant" }] }
        }
      }
    },
    
    {
      "type": "user",
      "relations": {
        "self": { "this": {} }
      }
    },
    
    {
      "type": "role",
      "relations": {
        "assignee": { "this": {} },
        "parent": {
          "type": "role"
        }
      },
      "metadata": {
        "relations": {
          "parent": { "directly_related_user_types": [{ "type": "role" }] }
        }
      }
    },
    
    {
      "type": "log",
      "relations": {
        "owner": { "this": {} },
        "reader": { 
          "union": {
            "child": [
              { "this": {} },
              { 
                "computedUserset": {
                  "object": "",
                  "relation": "admin"
                }
              }
            ]
          }
        },
        "writer": { 
          "union": {
            "child": [
              { "this": {} },
              { 
                "computedUserset": {
                  "object": "",
                  "relation": "admin"
                }
              }
            ]
          }
        },
        "parent": {
          "type": "organization"
        }
      },
      "metadata": {
        "relations": {
          "parent": { "directly_related_user_types": [{ "type": "organization" }] }
        }
      }
    },
    
    {
      "type": "apikey",
      "relations": {
        "owner": { "this": {} },
        "manager": { 
          "union": {
            "child": [
              { "this": {} },
              { 
                "computedUserset": {
                  "object": "",
                  "relation": "admin"
                }
              }
            ]
          }
        },
        "parent": {
          "type": "user"
        }
      },
      "metadata": {
        "relations": {
          "parent": { "directly_related_user_types": [{ "type": "user" }] }
        }
      }
    }
  ]
}
```

## Implementation Guidelines

1. **Centralized Authorization Service**: Implement as a separate microservice
2. **Caching**: Cache permission checks for performance
3. **Audit Logging**: Log all permission checks and changes
4. **UI Integration**: Show/hide UI elements based on permissions
5. **API Integration**: Validate permissions for all API calls

## Common Authorization Scenarios

### 1. Managing API Keys

To allow a user to manage someone else's API keys:

1. **Admin Role**: The user must have an admin role (tenant admin or organization admin)
2. **Permission Check**: The auth service checks if the user has the `apikeys:manage` permission
3. **API Key Ownership**: The auth service verifies the relationship between the API key and its owner
4. **Tenant Context**: The operation is scoped to the current tenant

### 2. Deleting Users

To delete a user and their associated resources:

1. **Admin Role**: The user must have an admin role (tenant admin or system admin)
2. **Permission Check**: The auth service checks if the user has the `users:delete` permission
3. **Cascading Delete**: The operation cascades to delete all resources owned by the user
4. **Tenant Context**: The operation is scoped to the current tenant

### 3. Log Operations

To control access to log operations:

1. **Permission Check**: The auth service checks if the user has the appropriate permission:
   - `logs:read` for reading logs
   - `logs:write` for appending to logs
   - `logs:search` for searching logs
2. **Resource Ownership**: The auth service verifies the relationship between the user and the log
3. **Tenant Context**: The operation is scoped to the current tenant
