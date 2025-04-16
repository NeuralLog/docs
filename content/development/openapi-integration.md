# OpenAPI Integration

NeuralLog uses OpenAPI (formerly known as Swagger) as the single source of truth for API definitions across all services. This document explains how OpenAPI is integrated into the NeuralLog ecosystem and how to work with it.

## Overview

OpenAPI is an industry-standard specification for describing RESTful APIs. NeuralLog uses OpenAPI to:

1. Document all API endpoints
2. Generate TypeScript types for client-server communication
3. Ensure consistency between server implementations and client SDKs
4. Provide interactive API documentation

## OpenAPI as Single Source of Truth

In NeuralLog, the OpenAPI schema serves as the single source of truth for all API definitions. This means:

- All API endpoints are defined in OpenAPI schemas
- All request and response structures are defined in OpenAPI schemas
- All validation rules are defined in OpenAPI schemas
- TypeScript types are generated from OpenAPI schemas

This approach ensures that documentation, types, and implementation stay in sync.

## OpenAPI Schema Structure

### Log Server

The log-server uses a single OpenAPI schema file:

- `src/openapi.yaml`: The main OpenAPI schema file

### Auth Service

The auth service uses a modular OpenAPI schema structure:

- `src/openapi.yaml`: The main OpenAPI schema file
- `src/openapi/components/`: Directory containing schema definitions for various components
- `src/openapi/paths/`: Directory containing API path definitions

This modular structure makes it easier to maintain and extend the API documentation.

## TypeScript Type Generation

TypeScript types for the API are automatically generated from the OpenAPI schemas during the build process. These types are used by the client SDK to ensure type safety and consistency between the server and client.

The generated types are located in the `typescript-client-sdk/src/types/api.ts` file and are used by both the server and client applications.

### Type Generation Process

1. The OpenAPI schema is read from the source file(s)
2. TypeScript interfaces are generated for all schema definitions
3. The generated types are written to `typescript-client-sdk/src/types/api.ts`
4. These types are then used by both the server and client code

## Working with OpenAPI

### Updating the API in Log Server

When making changes to the API in the log-server:

1. Update the OpenAPI schema in `src/openapi.yaml`
2. Run `npm run generate-api-types` to generate updated TypeScript types
3. Update the implementation to match the new schema

### Updating the API in Auth Service

When making changes to the API in the auth service:

1. Update the component schemas in `src/openapi/components/`
2. Update the API paths in `src/openapi/paths/`
3. Run `npm run generate-openapi` to generate the complete OpenAPI schema
4. Run `npm run generate-api-types` to generate updated TypeScript types
5. Update the implementation to match the new schema

### Using Generated Types in Client SDK

The client SDK automatically uses the generated types from `src/types/api.ts`. When making changes to the API:

1. Update the OpenAPI schema in the server component
2. Generate the updated types
3. The client SDK will automatically use the updated types

## Benefits of OpenAPI Integration

### Consistency

The OpenAPI schema ensures consistency between:

- API documentation
- Server implementation
- Client SDK
- TypeScript types

### Documentation

The OpenAPI schema provides comprehensive API documentation that is always up-to-date.

### Type Safety

The generated TypeScript types provide type safety for client code, reducing errors and improving developer experience.

### Maintainability

Changes to the API are reflected in the types automatically, making the codebase more maintainable.

## Best Practices

### Keep the OpenAPI Schema Up-to-Date

Always update the OpenAPI schema first when making changes to the API.

### Use Generated Types

Always use the generated types in both server and client code.

### Test API Changes

After making changes to the API, test both the server and client to ensure they work correctly.

### Document API Changes

Document any API changes in the relevant component documentation.

## Conclusion

The OpenAPI integration in NeuralLog provides a robust foundation for API development and documentation. By using OpenAPI as the single source of truth, NeuralLog ensures consistency, type safety, and maintainability across all components.
