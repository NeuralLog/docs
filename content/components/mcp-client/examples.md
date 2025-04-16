# MCP Client Examples

This section provides examples of how to use the NeuralLog Model Context Protocol (MCP) client in various scenarios.

## Basic Usage

The [Basic Usage Example](./examples/basic-usage.md) demonstrates how to set up and use the MCP client for common tasks such as:

- Connecting to the Log Server
- Retrieving logs for AI model context
- Processing logs with AI models
- Generating insights from logs

## Advanced Examples

### Integrating with OpenAI

```typescript
// Import the MCP client
import { MCPClient } from '@neurallog/mcp-client';
import { OpenAI } from 'openai';

// Create an MCP client instance
const mcpClient = new MCPClient({
  baseUrl: 'http://localhost:3030',
  tenantId: 'acme-corp',
  apiKey: 'your-api-key'
});

// Create an OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Example: Process logs with OpenAI
async function processLogsWithOpenAI(logName, timeRange, prompt) {
  try {
    // Step 1: Retrieve logs from the specified time range
    const logs = await mcpClient.getLogs(logName, {
      startTime: timeRange.start,
      endTime: timeRange.end,
      limit: 100
    });

    // Step 2: Format logs for the AI model
    const formattedLogs = logs.map(log => {
      return `[${new Date(log.timestamp).toISOString()}] ${JSON.stringify(log.data)}`;
    }).join('\n');

    // Step 3: Create a prompt with the logs
    const fullPrompt = `${prompt}\n\nHere are the logs:\n${formattedLogs}`;

    // Step 4: Send to OpenAI for processing
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an AI assistant that analyzes log data to provide insights.' },
        { role: 'user', content: fullPrompt }
      ],
      max_tokens: 1000
    });

    // Step 5: Return the AI-generated insights
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Log processing with OpenAI failed:', error);
    throw error;
  }
}

// Example usage
async function analyzeErrorLogs() {
  const insights = await processLogsWithOpenAI('application-errors', {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
    end: new Date()
  }, 'Analyze these error logs and identify the most common patterns. Suggest potential root causes and solutions.');

  console.log('AI Insights:', insights);
}
```

### Real-time Log Monitoring

```typescript
// Import the MCP client
import { MCPClient } from '@neurallog/mcp-client';

// Create an MCP client instance
const mcpClient = new MCPClient({
  baseUrl: 'http://localhost:3030',
  tenantId: 'acme-corp',
  apiKey: 'your-api-key'
});

// Example: Real-time log monitoring
async function monitorLogsInRealTime(logName, callback) {
  try {
    // Step 1: Set up a WebSocket connection for real-time updates
    const subscription = await mcpClient.subscribeToLogs(logName);

    // Step 2: Set up event handlers
    subscription.on('log', (log) => {
      console.log(`New log received: ${log.id}`);
      callback(log);
    });

    subscription.on('error', (error) => {
      console.error('Subscription error:', error);
    });

    // Step 3: Return the subscription for later cleanup
    return subscription;
  } catch (error) {
    console.error('Log monitoring setup failed:', error);
    throw error;
  }
}

// Example: Process logs in real-time
async function processLogsInRealTime() {
  // Set up a log processor
  const logProcessor = (log) => {
    // Check if the log contains an error
    if (log.data.level === 'error' || log.data.level === 'fatal') {
      // Send an alert
      sendAlert({
        title: 'Critical Error Detected',
        message: `Error in ${log.data.service}: ${log.data.message}`,
        severity: 'high',
        timestamp: log.timestamp,
        logId: log.id
      });
    }

    // Update dashboards
    updateDashboard(log);
  };

  // Start monitoring
  const subscription = await monitorLogsInRealTime('application-logs', logProcessor);

  // Later, to stop monitoring
  // subscription.unsubscribe();
}
```

### Anomaly Detection

```typescript
// Import the MCP client
import { MCPClient } from '@neurallog/mcp-client';

// Create an MCP client instance
const mcpClient = new MCPClient({
  baseUrl: 'http://localhost:3030',
  tenantId: 'acme-corp',
  apiKey: 'your-api-key'
});

// Example: Detect anomalies in logs
async function detectAnomalies(logName, timeWindow = 3600000) { // Default: 1 hour
  try {
    // Step 1: Retrieve logs from the specified time window
    const endTime = new Date();
    const startTime = new Date(endTime.getTime() - timeWindow);

    const logs = await mcpClient.getLogs(logName, {
      startTime,
      endTime,
      limit: 1000
    });

    // Step 2: Extract metrics for analysis
    const metrics = logs.map(log => {
      return {
        timestamp: new Date(log.timestamp).getTime(),
        responseTime: log.data.responseTime || 0,
        statusCode: log.data.statusCode || 200,
        errorCount: log.data.error ? 1 : 0
      };
    });

    // Step 3: Calculate baseline statistics
    const baselineResponseTime = calculateMean(metrics.map(m => m.responseTime));
    const stdDevResponseTime = calculateStdDev(metrics.map(m => m.responseTime), baselineResponseTime);

    const errorRate = metrics.reduce((sum, m) => sum + m.errorCount, 0) / metrics.length;

    // Step 4: Identify anomalies
    const anomalies = metrics.filter(metric => {
      // Response time more than 3 standard deviations from the mean
      const isResponseTimeAnomaly = Math.abs(metric.responseTime - baselineResponseTime) > 3 * stdDevResponseTime;

      // Error status code
      const isErrorStatusCode = metric.statusCode >= 500;

      return isResponseTimeAnomaly || isErrorStatusCode;
    });

    // Step 5: Return the anomalies with the corresponding logs
    const anomalyLogs = logs.filter((log, index) =>
      anomalies.some(a => a.timestamp === new Date(log.timestamp).getTime())
    );

    console.log(`Detected ${anomalyLogs.length} anomalies out of ${logs.length} logs`);
    return {
      anomalyLogs,
      stats: {
        totalLogs: logs.length,
        anomalyCount: anomalyLogs.length,
        baselineResponseTime,
        stdDevResponseTime,
        errorRate
      }
    };
  } catch (error) {
    console.error('Anomaly detection failed:', error);
    throw error;
  }
}

// Helper functions
function calculateMean(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function calculateStdDev(values, mean) {
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}
```

## Next Steps

- Learn about [Configuration Options](./configuration.md)
- Explore the [API Reference](./api.md)
- Read about the [Architecture](./architecture.md)
