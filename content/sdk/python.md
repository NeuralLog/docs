---
sidebar_position: 5
---

# Python SDK

The NeuralLog Python SDK provides a client library for interacting with the NeuralLog server from Python applications. It offers a simple logging API and adapters for popular Python logging frameworks.

## Requirements

- **Python**: 3.8 or later
- **pip**: For package installation

## Installation

```bash
pip install neurallog-sdk
```

## Basic Usage

The Python SDK provides a simple API for logging messages to the NeuralLog server:

```python
from neurallog import NeuralLog, LogLevel

# Configure the SDK (optional)
NeuralLog.configure(
    server_url="http://localhost:3030",
    namespace="default"
)

# Get a logger
logger = NeuralLog.get_logger("my-application")

# Log a simple message
logger.info("Hello, world!")

# Log with structured data
logger.info("User logged in", {
    "user": "john.doe",
    "action": "login",
    "ip": "192.168.1.1"
})

# Log an error with exception
try:
    # Some code that might throw an exception
    raise ValueError("Something went wrong")
except Exception as e:
    logger.error("Failed to process request", exception=e)
```

## Framework Adapters

The Python SDK provides adapters for popular Python logging frameworks, allowing you to integrate NeuralLog into existing applications with minimal changes.

### Standard Logging

```python
import logging
from neurallog.adapters import NeuralLogHandler

# Configure the standard logging
logger = logging.getLogger("my-application")
logger.setLevel(logging.INFO)

# Add NeuralLog handler
handler = NeuralLogHandler(log_name="my-application")
logger.addHandler(handler)

# Use the logger
logger.info("This will be sent to NeuralLog")

# With extra data
logger.info("User logged in", extra={
    "user": "john.doe",
    "action": "login"
})

# With exception
try:
    raise ValueError("Something went wrong")
except Exception as e:
    logger.exception("Failed to process request")
```

### Loguru

```python
from loguru import logger
from neurallog.adapters import NeuralLogSink

# Configure Loguru
logger.configure(handlers=[
    {"sink": NeuralLogSink(log_name="my-application")}
])

# Use the logger
logger.info("This will be sent to NeuralLog")

# With structured data
logger.info("User {user} logged in from {ip}", user="john.doe", ip="192.168.1.1")

# With exception
try:
    raise ValueError("Something went wrong")
except Exception as e:
    logger.exception("Failed to process request")
```

## Configuration Options

The Python SDK can be configured using the `configure` method:

```python
from neurallog import NeuralLog

NeuralLog.configure(
    server_url="https://logs.example.com",
    namespace="production",
    api_key="your-api-key",
    batch_size=100,
    batch_interval=5.0,
    max_retries=3,
    retry_backoff=1.0,
    async_enabled=True,
    debug_enabled=False
)
```

## Advanced Features

### Context Data

You can add context data that will be included with all log entries:

```python
# Set global context for all loggers
NeuralLog.set_global_context({
    "application": "my-app",
    "environment": "production",
    "version": "1.0.0"
})

# Set context for a specific logger
logger = NeuralLog.get_logger("my-component")
logger.set_context({
    "component": "authentication"
})
```

### Batching

The SDK supports batching log entries for improved performance:

```python
NeuralLog.configure(
    async_enabled=True,
    batch_size=100,
    batch_interval=5.0
)
```

When batching is enabled, log entries are queued and sent in batches. You can manually flush the queue:

```python
# Flush all loggers
NeuralLog.flush_all()

# Flush a specific logger
logger.flush()
```

### Async Logging

The SDK supports asynchronous logging to avoid blocking your application:

```python
NeuralLog.configure(
    async_enabled=True
)
```

## API Reference

### NeuralLog

#### Static Methods

- `configure(**kwargs)` - Configure global options
- `get_logger(name)` - Get a logger instance
- `set_global_context(context)` - Set context data for all loggers
- `flush_all()` - Flush all loggers

### Logger

#### Methods

- `debug(message, data=None, exception=None)` - Log a debug message
- `info(message, data=None, exception=None)` - Log an info message
- `warning(message, data=None, exception=None)` - Log a warning message
- `error(message, data=None, exception=None)` - Log an error message
- `fatal(message, data=None, exception=None)` - Log a fatal message
- `log(level, message, data=None, exception=None)` - Log a message at the specified level
- `set_context(context)` - Set context data for this logger
- `flush()` - Flush any pending log entries

## Troubleshooting

### Common Issues

#### Connection Errors

If you're experiencing connection errors to the NeuralLog server:

```
neurallog.exceptions.NeuralLogConnectionError: Failed to connect to server
```

Check that:
- The server URL is correct
- The server is running and accessible
- Your network allows the connection

#### Authentication Errors

If you're seeing authentication errors:

```
neurallog.exceptions.NeuralLogAuthError: Invalid API key
```

Verify that:
- You've set the correct API key
- The API key has the necessary permissions

## Source Code

The source code for the NeuralLog Python SDK is available on GitHub:
[https://github.com/NeuralLog/python-sdk](https://github.com/NeuralLog/python-sdk)
