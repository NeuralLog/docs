---
sidebar_position: 1
---

# mcp-client Overview

The NeuralLog MCP Client is a key component of the NeuralLog ecosystem, providing a bridge between AI assistants and the NeuralLog logging system. It implements the Model Context Protocol (MCP) to allow AI models to interact with logs through standardized tools.

![Model Context Protocol Integration with NeuralLog](/img/mcp-neurallog.png)

*The Model Context Protocol enables AI agents to seamlessly access and analyze your logs while maintaining zero-knowledge security.*

## Features

- **Standardized AI Integration**: Connect any MCP-compatible AI agent to your logs with a unified interface
- **Seamless AI Access**: AI tools get immediate access to your logs from day one, with zero configuration
- **Instant AI Value**: Get AI-powered insights from your very first log entry - no training or setup required
- **Zero-Knowledge Security**: Maintain end-to-end encryption while still enabling AI analysis
- **Proactive Monitoring**: Enable AI agents to detect patterns, anomalies, and potential issues before they impact your users


## Quick Start

```bash
# Install the MCP client
npm install @neurallog/mcp-client

# Initialize and configure
const { MCPClient } = require('@neurallog/mcp-client');

const mcpClient = new MCPClient({
  apiKey: 'your-neurallog-api-key',
  tenantId: 'your-tenant-id'
});

// Register MCP tools with your AI framework
const tools = mcpClient.getTools();
```

### Example: Searching Logs with AI

```javascript
// AI agent can now use tools like:
async function searchLogs(query, timeRange, limit) {
  const results = await mcpClient.searchLogs({
    query,
    timeRange,
    limit
  });

  return results;
}

// Example AI agent prompt
/*
  You have access to the following tools:
  - search_logs_neurallog: Search logs with a query string
    Parameters: {query: string, timeRange: string, limit: number}
*/
```


## Documentation

For detailed documentation, see:

- [API Reference](./api.md)
- [Configuration](./configuration.md)
- [Architecture](./architecture.md)
- [Examples](./examples)

For the source code and component-specific documentation, visit the [NeuralLog mcp-client Repository](https://github.com/NeuralLog/mcp-client).
