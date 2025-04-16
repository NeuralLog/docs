# NeuralLog Web API Reference

This document provides a comprehensive reference for the NeuralLog Web application's routes and API endpoints.

## Table of Contents

- [Page Routes](#page-routes)
  - [Public Routes](#public-routes)
  - [Authenticated Routes](#authenticated-routes)
  - [Admin Routes](#admin-routes)
  - [Settings Routes](#settings-routes)
  - [Dynamic Routes](#dynamic-routes)
- [API Routes](#api-routes)
  - [Authentication API](#authentication-api)
  - [Logs API](#logs-api)
  - [Invitations API](#invitations-api)
  - [Statistics API](#statistics-api)
  - [System API](#system-api)
  - [Proxy API](#proxy-api)

## Page Routes

### Public Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | User login page |
| `/sign-up` | User registration page |

### Authenticated Routes

These routes are protected and require authentication:

| Route | Description |
|-------|-------------|
| `/dashboard` | Main dashboard |
| `/logs` | Logs overview page |
| `/logs/[logSlug]` | Specific log view |
| `/logs/[logSlug]/[logId]` | Specific log entry view |
| `/apikeys` | API keys management |
| `/auth-demo` | Auth SDK demonstration |

### Admin Routes

These routes are restricted to administrators:

| Route | Description |
|-------|-------------|
| `/admin/invitations` | Manage user invitations |

### Settings Routes

| Route | Description |
|-------|-------------|
| `/settings` | General settings |
| `/settings/encryption` | Encryption settings |

### Dynamic Routes

| Route | Description |
|-------|-------------|
| `/[tenant]` | Tenant-specific landing page |
| `/test-logs` | Test logs page (for development) |

## API Routes

### Authentication API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Authenticate user with credentials |
| `/api/auth/logout` | POST | Log out the current user |
| `/api/auth/register` | POST | Register a new user |
| `/api/auth/me` | GET | Get current user information |
| `/api/auth/token` | POST | Get authentication token |
| `/api/auth/change-password` | POST | Change user password |
| `/api/auth/exchange-token-for-resource` | POST | Exchange token for resource-specific access |

### Logs API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/logs` | GET | Get all logs |
| `/api/logs` | POST | Create a new log |
| `/api/logs/[logSlug]` | GET | Get entries for a specific log |
| `/api/logs/[logSlug]` | POST | Add entry to a specific log |
| `/api/logs/[logSlug]/statistics` | GET | Get statistics for a specific log |

### Invitations API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/invitations` | GET | Get all invitations |
| `/api/invitations` | POST | Create a new invitation |
| `/api/invitations/validate` | POST | Validate an invitation |
| `/api/invitations/[id]/use` | POST | Use an invitation |




### System API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/system/settings` | GET | Get system settings |
| `/api/system/settings` | POST | Update system settings |
| `/api/system/registration-status` | GET | Check if registration is open |
| `/api/system/lock-registration` | POST | Lock registration (admin only) |

### Proxy API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/proxy/logs` | POST | Proxy requests to the logs service |

## Authentication

Most API endpoints require authentication. Include an authentication token in the request headers:

```
Authorization: Bearer <token>
```

You can obtain a token by calling the `/api/auth/login` endpoint with valid credentials.

## Error Handling

API endpoints return standard HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses include a JSON object with an `error` field containing a description of the error.

## Request and Response Format

All API endpoints accept and return JSON data. Set the `Content-Type` header to `application/json` for POST and PUT requests.

Example request:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Example response:

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

## Rate Limiting

API endpoints may be subject to rate limiting. If you exceed the rate limit, you will receive a `429 Too Many Requests` response.

## Versioning

The current API version is v1. The API may be updated in the future with breaking changes. When this happens, a new version will be released, and the old version will be deprecated but still supported for a transition period.

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for browser-based applications. The following headers are included in API responses:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Webhooks

The API does not currently support webhooks, but this feature may be added in the future.
