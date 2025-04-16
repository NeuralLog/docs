---
sidebar_position: 6
---

# Data Retention

NeuralLog implements a comprehensive data retention policy system that allows tenants to control how long their log data is stored. This document describes the design, implementation, and usage of this system.

## Overview

Data retention policies in NeuralLog allow you to:

- Set a default retention period for all logs in a tenant
- Configure specific retention periods for individual logs
- Automatically delete log entries that exceed their retention period
- Check how many log entries would be affected by a policy change before applying it

All of this is implemented while maintaining NeuralLog's zero-knowledge architecture, ensuring that log names remain encrypted and private.

## Design Principles

The data retention system follows these key principles:

1. **Separation of Concerns**: Metadata about log entries is stored in a separate keyspace from the logs themselves
2. **Minimal Metadata**: Only store the minimum information needed for retention enforcement (timestamps)
3. **Atomic Operations**: Metadata operations are tied directly to log operations
4. **No Direct Exposure**: Metadata is never directly exposed through APIs
5. **Zero-Knowledge Preservation**: Log names remain encrypted in retention policies

## Implementation Details

### Metadata Storage

NeuralLog uses Redis for storing log entry metadata:

```
// Key structure for log entry timestamps
tenant:{tenantId}:logs:timestamps = Sorted Set of {logName}:{logEntryId} with score = creation timestamp
```

This structure allows efficient querying of logs by creation time using Redis's sorted set operations. The metadata is intentionally minimal, storing only the creation timestamp and not other information like log size.

### Retention Policy Storage

Retention policies are stored in NeDB with the following structure:

```typescript
interface RetentionPolicy {
  tenantId: string;
  logName?: string;  // Encrypted log name (if specific to a log)
  retentionPeriodMs: number;  // -1 for unlimited retention
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

When a log-specific policy is not found, the system falls back to the tenant-wide default policy.

### Purging Mechanism

A scheduled job runs periodically to purge expired log entries:

1. For each tenant, retrieve all retention policies
2. For each log, determine the applicable retention policy
3. Calculate the cutoff timestamp based on the retention period
4. Query Redis for log entries older than the cutoff timestamp
5. Delete the expired log entries and their associated metadata

## API Reference

The Log Server provides the following API endpoints for managing retention policies:

### Get Retention Policy

```
GET /api/v1/retention-policy
```

Parameters:
- `x-tenant-id` (header): Tenant ID
- `logName` (query, optional): Encrypted log name

Returns the retention policy for the specified log or the tenant-wide default policy if no log name is provided.

### Set Retention Policy

```
POST /api/v1/retention-policy
```

Parameters:
- `x-tenant-id` (header): Tenant ID
- Request body:
  ```json
  {
    "retentionPeriodMs": 2592000000,  // 30 days in milliseconds
    "logName": "encrypted-log-name"   // Optional, for log-specific policy
  }
  ```

Sets the retention policy for the specified log or the tenant-wide default policy if no log name is provided.

### Delete Retention Policy

```
DELETE /api/v1/retention-policy
```

Parameters:
- `x-tenant-id` (header): Tenant ID
- `logName` (query, optional): Encrypted log name

Deletes the retention policy for the specified log or the tenant-wide default policy if no log name is provided.

### Get All Retention Policies

```
GET /api/v1/retention-policy/all
```

Parameters:
- `x-tenant-id` (header): Tenant ID

Returns all retention policies for the tenant.

### Get Expired Logs Count

```
GET /api/v1/retention-policy/expired-count
```

Parameters:
- `x-tenant-id` (header): Tenant ID
- `retentionPeriodMs` (query): Retention period in milliseconds
- `logName` (query, optional): Encrypted log name

Returns the count of logs that would be affected by the specified retention policy.

## Client SDK Usage

The NeuralLog Client SDK provides methods for managing retention policies:

```typescript
// Get the default retention policy for the tenant
const defaultPolicy = await client.getRetentionPolicy();

// Set a specific retention policy for a log (30 days)
await client.setRetentionPolicy(30 * 24 * 60 * 60 * 1000, "application-logs");

// Get the retention policy for a specific log
const logPolicy = await client.getRetentionPolicy("application-logs");

// Get all retention policies for the tenant
const allPolicies = await client.getAllRetentionPolicies();

// Delete the retention policy for a specific log
await client.deleteRetentionPolicy("application-logs");

// Check how many log entries would be affected by a policy change
const count = await client.getExpiredLogsCount(7 * 24 * 60 * 60 * 1000, "application-logs");
```

The client SDK handles the encryption of log names transparently, maintaining the zero-knowledge architecture.

## Web UI

The NeuralLog Web application provides a user interface for managing retention policies in the Settings section. The UI allows users to:

- View and update the default retention policy for all logs
- Set specific retention policies for individual logs
- Delete log-specific retention policies
- Check how many log entries would be affected by a policy change before applying it

## Configuration

The data retention system can be configured with the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `RETENTION_PURGE_INTERVAL_MS` | Interval between purge jobs in milliseconds | `3600000` (1 hour) |
| `RETENTION_MAX_PERIOD_MS` | Maximum allowed retention period in milliseconds | `31536000000` (1 year) |
| `RETENTION_DEFAULT_PERIOD_MS` | Default retention period in milliseconds | `-1` (unlimited) |

## Best Practices

1. **Set Appropriate Retention Periods**: Balance between data availability and storage costs
2. **Use Log-Specific Policies**: Set different retention periods based on the importance and usage patterns of different logs
3. **Check Impact Before Changes**: Use the `getExpiredLogsCount` method to understand the impact of policy changes before applying them
4. **Regular Audits**: Periodically review retention policies to ensure they meet your needs and compliance requirements

## Troubleshooting

### Common Issues

#### Retention Policy Not Applied

If a retention policy doesn't seem to be applied:

1. Check if a log-specific policy exists that might be overriding the default policy
2. Verify that the purge job is running (check logs for "Purging expired logs" messages)
3. Ensure the retention period is set correctly (in milliseconds)

#### Performance Issues

If the purge job is causing performance issues:

1. Increase the `RETENTION_PURGE_INTERVAL_MS` to run the job less frequently
2. Consider implementing more granular policies to reduce the number of logs processed in each job
3. Monitor Redis performance during purge operations

## Related Documentation

- [Storage Adapters](./storage-adapters.md)
- [Configuration Guide](./configuration.md)
- [API Reference](./api.md)
- [Zero-Knowledge Architecture](../security/zero-knowledge-architecture.md)
