---
sidebar_position: 3
---

# Go SDK

The NeuralLog Go SDK provides a simple way to integrate NeuralLog into your Go applications. It allows you to send logs to NeuralLog with minimal configuration and provides adapters for popular Go logging libraries.

## Installation

```bash
go get github.com/NeuralLog/go-sdk
```

## Basic Usage

```go
package main

import (
    "github.com/NeuralLog/go-sdk/neurallog"
    "github.com/NeuralLog/go-sdk/neurallog/models"
)

func main() {
    // Configure NeuralLog (optional)
    neurallog.Configure(
        neurallog.WithServerURL("https://logs.example.com"),
        neurallog.WithAPIKey("your-api-key"),
        neurallog.WithNamespace("production"),
    )

    // Get a logger
    logger := neurallog.GetLogger("my-log")

    // Log messages
    logger.Debug("Debug message")
    logger.Info("Info message")
    logger.Warning("Warning message")
    logger.Error("Error message")
    logger.Fatal("Fatal message")

    // Log with structured data
    logger.Info("User logged in", neurallog.WithData(map[string]interface{}{
        "user_id": 123,
        "username": "john.doe",
    }))

    // Log with exception
    err := someFunction()
    if err != nil {
        logger.Error("Failed to do something", neurallog.WithException(err))
    }

    // Set context for all future logs from this logger
    logger.SetContext(map[string]interface{}{
        "app": "my-app",
        "environment": "production",
    })

    // Set global context for all loggers
    neurallog.SetGlobalContext(map[string]interface{}{
        "app": "my-app",
        "environment": "production",
    })

    // Flush any pending logs
    neurallog.FlushAll()
}
```

## Configuration Options

The NeuralLog SDK can be configured with the following options:

```go
neurallog.Configure(
    // Server URL (default: http://localhost:3030)
    neurallog.WithServerURL("https://logs.example.com"),
    
    // Namespace (default: default)
    neurallog.WithNamespace("production"),
    
    // API key
    neurallog.WithAPIKey("your-api-key"),
    
    // Enable/disable async logging (default: true)
    neurallog.WithAsyncEnabled(true),
    
    // Batch size for async logging (default: 100)
    neurallog.WithBatchSize(100),
    
    // Batch interval for async logging (default: 5s)
    neurallog.WithBatchInterval(models.WithBatchInterval(5 * time.Second)),
    
    // Maximum number of retries (default: 3)
    neurallog.WithMaxRetries(3),
    
    // Retry backoff duration (default: 1s)
    neurallog.WithRetryBackoff(models.WithRetryBackoff(time.Second)),
    
    // Enable/disable debug logging (default: false)
    neurallog.WithDebugEnabled(false),
    
    // HTTP timeout (default: 30s)
    neurallog.WithTimeout(models.WithTimeout(30 * time.Second)),
    
    // Maximum number of HTTP connections (default: 10)
    neurallog.WithMaxConnections(10),
    
    // Custom HTTP headers
    neurallog.WithHeaders(map[string]string{
        "X-Custom-Header": "value",
    }),
)
```

## Adapters for Popular Go Logging Libraries

### Standard Go Log Adapter

```go
package main

import (
    "log"
    "os"

    "github.com/NeuralLog/go-sdk/neurallog/adapters"
    "github.com/NeuralLog/go-sdk/neurallog/models"
)

func main() {
    // Create a standard logger
    stdLogger := log.New(os.Stdout, "INFO: ", log.Ldate|log.Ltime)

    // Create the adapter
    adapter := adapters.NewStdLogAdapter("my-log", stdLogger,
        adapters.WithLevel(models.LogLevelInfo),
        adapters.WithContext(map[string]interface{}{
            "app": "my-app",
        }),
    )

    // Use the adapter
    adapter.Print("Hello, world!")
    adapter.Printf("Hello, %s!", "world")
    adapter.Println("Hello, world!")
}
```

### Logrus Adapter

```go
package main

import (
    "github.com/NeuralLog/go-sdk/neurallog/adapters"
    "github.com/sirupsen/logrus"
)

func main() {
    // Create a logrus logger
    logger := logrus.New()
    logger.SetLevel(logrus.DebugLevel)

    // Create the hook
    hook := adapters.NewLogrusHook("my-log",
        adapters.WithLogrusContext(map[string]interface{}{
            "app": "my-app",
        }),
    )

    // Add the hook to the logger
    logger.AddHook(hook)

    // Use logrus as usual
    logger.Debug("Debug message")
    logger.Info("Info message")
    logger.Warn("Warning message")
    logger.Error("Error message")

    // Log with fields
    logger.WithFields(logrus.Fields{
        "user": "john.doe",
        "action": "login",
    }).Info("User logged in")

    // Log with error
    err := someFunction()
    logger.WithError(err).Error("Failed to do something")
}
```

### Zap Adapter

```go
package main

import (
    "github.com/NeuralLog/go-sdk/neurallog/adapters"
    "go.uber.org/zap"
    "go.uber.org/zap/zapcore"
)

func main() {
    // Create a zap core
    core := adapters.NewZapCore("my-log", zapcore.DebugLevel,
        adapters.WithZapContext(map[string]interface{}{
            "app": "my-app",
        }),
    )

    // Create a zap logger with the core
    logger := zap.New(core)

    // Use zap as usual
    logger.Debug("Debug message")
    logger.Info("Info message")
    logger.Warn("Warning message")
    logger.Error("Error message")

    // Log with fields
    logger.Info("User logged in",
        zap.String("user", "john.doe"),
        zap.String("action", "login"),
    )

    // Log with error
    err := someFunction()
    logger.Error("Failed to do something", zap.Error(err))
}
```

## Source Code

The source code for the NeuralLog Go SDK is available on GitHub:

[https://github.com/NeuralLog/go-sdk](https://github.com/NeuralLog/go-sdk)
