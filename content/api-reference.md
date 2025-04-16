---
sidebar_position: 5
---

# API Reference

This page provides a reference for the NeuralLog API endpoints.

## OpenAPI Integration

NeuralLog uses OpenAPI (formerly known as Swagger) as the single source of truth for API definitions across all services. The OpenAPI schemas define all endpoints, request/response structures, and validation rules.

### OpenAPI Schemas

- **Log Server**: The OpenAPI schema is located at `src/openapi.yaml` in the log-server repository.
- **Auth Service**: The OpenAPI schema is organized in a modular way in the auth service repository:
  - `src/openapi.yaml`: The main OpenAPI schema file
  - `src/openapi/components/`: Directory containing schema definitions
  - `src/openapi/paths/`: Directory containing API path definitions

### TypeScript Type Generation

TypeScript types for the API are automatically generated from the OpenAPI schemas during the build process. These types are used by the client SDK to ensure type safety and consistency between the server and client.

The generated types are located in the `typescript-client-sdk/src/types/api.ts` file and are used by both the server and client applications.

### Interactive API Documentation

The OpenAPI schemas also provide interactive API documentation through Swagger UI:

- **Log Server**: `http://<log-server-host>:<port>/api-docs`
- **Auth Service**: `http://<auth-service-host>:<port>/api-docs`

For more information about the OpenAPI integration, see the [OpenAPI Integration](../development/openapi-integration.md) guide.

## Logs Server API

### Logs Endpoints

#### Get All Logs

```
GET /logs
```

Returns a list of all log names.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.
- `limit`: (Optional) Maximum number of logs to return. Defaults to 1000.

**Response:**
```json
{
  "status": "success",
  "namespace": "default",
  "logs": ["log1", "log2", "log3"]
}
```

#### Get Log by Name

```
GET /logs/:logName
```

Returns all entries for a specific log.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.
- `limit`: (Optional) Maximum number of entries to return. Defaults to 100.

**Response:**
```json
{
  "status": "success",
  "name": "log1",
  "namespace": "default",
  "entries": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "timestamp": 1617293932123,
      "data": {
        "model": "gpt-4",
        "status": "success",
        "latency": 1200,
        "message": "Test log"
      }
    }
  ]
}
```

#### Create or Overwrite Log

```
POST /logs/:logName
```

Creates a new log or overwrites an existing log.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.
- `Content-Type`: `application/json`

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.

**Request Body:**
```json
{
  "data": {
    "model": "gpt-4",
    "status": "success",
    "latency": 1200,
    "message": "Test log"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "logId": "123e4567-e89b-12d3-a456-426614174000",
  "namespace": "default"
}
```

#### Append to Log

```
PATCH /logs/:logName
```

Appends an entry to an existing log.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.
- `Content-Type`: `application/json`

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.

**Request Body:**
```json
{
  "data": {
    "model": "gpt-4",
    "status": "success",
    "latency": 1200,
    "message": "Test log"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "logId": "123e4567-e89b-12d3-a456-426614174000",
  "namespace": "default"
}
```

#### Clear Log

```
DELETE /logs/:logName
```

Clears all entries from a log.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.

**Response:**
```json
{
  "status": "success",
  "namespace": "default",
  "cleared": true
}
```

### Log Entry Endpoints

#### Get Log Entry by ID

```
GET /logs/:logName/:logId
```

Returns a specific log entry.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.

**Response:**
```json
{
  "status": "success",
  "namespace": "default",
  "entry": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "timestamp": 1617293932123,
    "data": {
      "model": "gpt-4",
      "status": "success",
      "latency": 1200,
      "message": "Test log"
    }
  }
}
```

#### Update Log Entry by ID

```
POST /logs/:logName/:logId
```

Updates a specific log entry.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.
- `Content-Type`: `application/json`

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.

**Request Body:**
```json
{
  "data": {
    "model": "gpt-4",
    "status": "success",
    "latency": 1200,
    "message": "Updated test log"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "namespace": "default",
  "message": "Log entry 123e4567-e89b-12d3-a456-426614174000 updated in log log1"
}
```

#### Delete Log Entry by ID

```
DELETE /logs/:logName/:logId
```

Deletes a specific log entry.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.

**Response:**
```json
{
  "status": "success",
  "namespace": "default",
  "message": "Log entry 123e4567-e89b-12d3-a456-426614174000 deleted from log log1"
}
```

### Search Endpoint

```
GET /search
```

Searches for logs based on various criteria.

**Headers:**
- `X-Tenant-ID`: (Optional) Tenant ID. Defaults to the default namespace.

**Query Parameters:**
- `namespace`: (Optional) Namespace. Defaults to the default namespace.
- `query`: (Optional) Search query.
- `log_name`: (Optional) Filter by log name.
- `start_time`: (Optional) Filter by start time (timestamp).
- `end_time`: (Optional) Filter by end time (timestamp).
- `limit`: (Optional) Maximum number of results to return. Defaults to 100.
- `field_*`: (Optional) Filter by specific fields. For example, `field_model=gpt-4` filters by the `model` field.

**Response:**
```json
{
  "status": "success",
  "namespace": "default",
  "total": 1,
  "results": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "logName": "log1",
      "timestamp": 1617293932123,
      "data": {
        "model": "gpt-4",
        "status": "success",
        "latency": 1200,
        "message": "Test log"
      }
    }
  ]
}
```



## Auth Service API

### Authentication Endpoints

#### Login

```
POST /auth/login
```

Authenticates a user and returns a JWT token.

**Headers:**
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "username": "user@example.com",
    "tenantId": "default"
  }
}
```

#### Register

```
POST /auth/register
```

Registers a new user.

**Headers:**
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password123",
  "tenantId": "default"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User registered successfully",
  "user": {
    "id": "123",
    "username": "user@example.com",
    "tenantId": "default"
  }
}
```

#### Logout

```
POST /auth/logout
```

Logs out the current user.

**Headers:**
- `Authorization`: `Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "message": "Logged out successfully"
}
```

#### Get Session

```
GET /auth/session
```

Returns the current session information.

**Headers:**
- `Authorization`: `Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "user": {
    "id": "123",
    "username": "user@example.com",
    "tenantId": "default"
  }
}
```

### API Key Endpoints

#### Create API Key

```
POST /auth/api-keys
```

Creates a new API key.

**Headers:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "name": "My API Key",
  "expiresIn": 86400000
}
```

**Response:**
```json
{
  "status": "success",
  "apiKey": {
    "id": "456",
    "name": "My API Key",
    "key": "api_key_123456",
    "createdAt": 1617293932123,
    "expiresAt": 1617380332123
  }
}
```

#### List API Keys

```
GET /auth/api-keys
```

Lists all API keys for the current user.

**Headers:**
- `Authorization`: `Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "apiKeys": [
    {
      "id": "456",
      "name": "My API Key",
      "createdAt": 1617293932123,
      "expiresAt": 1617380332123
    }
  ]
}
```

#### Delete API Key

```
DELETE /auth/api-keys/:id
```

Deletes an API key.

**Headers:**
- `Authorization`: `Bearer <token>`

**Response:**
```json
{
  "status": "success",
  "message": "API key deleted successfully"
}
```

### Permission Endpoints

#### Check Permissions

```
POST /auth/check
```

Checks if the current user has the specified permissions.

**Headers:**
- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

**Request Body:**
```json
{
  "permission": "logs:read",
  "resource": "log:log1"
}
```

**Response:**
```json
{
  "status": "success",
  "allowed": true
}
```
