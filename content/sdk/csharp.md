---
sidebar_position: 4
---

# C# SDK

The NeuralLog C# SDK provides a client library for interacting with the NeuralLog server from .NET applications. It offers a familiar logging API and adapters for popular .NET logging frameworks.

## Requirements

- **.NET**: .NET 6.0 or later
- **NuGet**: For package installation

## Installation

### NuGet Package Manager

```
Install-Package NeuralLog.SDK
```

### .NET CLI

```
dotnet add package NeuralLog.SDK
```

### Package Reference

```xml
<PackageReference Include="NeuralLog.SDK" Version="1.0.0" />
```

## Basic Usage

The C# SDK provides a simple API for logging messages to the NeuralLog server:

```csharp
using NeuralLog.SDK;
using NeuralLog.SDK.Models;

// Configure the SDK (optional)
NeuralLog.Configure(options => {
    options.ServerUrl = "http://localhost:3030";
    options.Namespace = "default";
});

// Get a logger
var logger = NeuralLog.GetLogger("my-application");

// Log a simple message
logger.Info("Hello, world!");

// Log with structured data
var data = new Dictionary<string, object> {
    { "user", "john.doe" },
    { "action", "login" },
    { "ip", "192.168.1.1" }
};
logger.Info("User logged in", data);

// Log an error with exception
try {
    // Some code that might throw an exception
    throw new Exception("Something went wrong");
}
catch (Exception ex) {
    logger.Error("Failed to process request", ex);
}
```

## Framework Adapters

The C# SDK provides adapters for popular .NET logging frameworks, allowing you to integrate NeuralLog into existing applications with minimal changes.

### Microsoft.Extensions.Logging

```csharp
using Microsoft.Extensions.Logging;
using NeuralLog.SDK.Extensions.Logging;

// In Startup.cs or Program.cs
public void ConfigureServices(IServiceCollection services)
{
    services.AddLogging(builder => {
        builder.AddNeuralLog(options => {
            options.LogName = "my-application";
            options.ServerUrl = "http://localhost:3030";
        });
    });
}

// In a class using dependency injection
public class MyService
{
    private readonly ILogger<MyService> _logger;

    public MyService(ILogger<MyService> logger)
    {
        _logger = logger;
    }

    public void DoSomething()
    {
        _logger.LogInformation("This will be sent to NeuralLog");
    }
}
```

### Serilog

```csharp
using Serilog;
using NeuralLog.SDK.Serilog;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.NeuralLog("my-application")
    .CreateLogger();

// Use the logger
Log.Information("This will be sent to NeuralLog");

// With structured data
Log.Information("User {User} logged in from {IP}", "john.doe", "192.168.1.1");

// With exception
try {
    throw new Exception("Something went wrong");
}
catch (Exception ex) {
    Log.Error(ex, "Failed to process request");
}
```

### NLog

```csharp
using NLog;
using NeuralLog.SDK.NLog;

// In NLog.config
<nlog>
  <extensions>
    <add assembly="NeuralLog.SDK.NLog"/>
  </extensions>
  <targets>
    <target name="neurallog" type="NeuralLog" logName="my-application" />
  </targets>
  <rules>
    <logger name="*" minlevel="Info" writeTo="neurallog" />
  </rules>
</nlog>

// In code
private static readonly Logger Logger = LogManager.GetCurrentClassLogger();

public void DoSomething()
{
    Logger.Info("This will be sent to NeuralLog");
}
```

## Configuration Options

The C# SDK can be configured using the `Configure` method:

```csharp
NeuralLog.Configure(options => {
    options.ServerUrl = "https://logs.example.com";
    options.Namespace = "production";
    options.ApiKey = "your-api-key";
    options.BatchSize = 100;
    options.BatchIntervalMs = 5000;
    options.MaxRetries = 3;
    options.RetryBackoffMs = 1000;
    options.AsyncEnabled = true;
    options.DebugEnabled = false;
});
```

## Advanced Features

### Context Data

You can add context data that will be included with all log entries:

```csharp
// Set global context for all loggers
NeuralLog.SetGlobalContext(new Dictionary<string, object> {
    { "application", "my-app" },
    { "environment", "production" },
    { "version", "1.0.0" }
});

// Set context for a specific logger
var logger = NeuralLog.GetLogger("my-component");
logger.SetContext(new Dictionary<string, object> {
    { "component", "authentication" }
});
```

### Batching

The SDK supports batching log entries for improved performance:

```csharp
NeuralLog.Configure(options => {
    options.AsyncEnabled = true;
    options.BatchSize = 100;
    options.BatchIntervalMs = 5000;
});
```

When batching is enabled, log entries are queued and sent in batches. You can manually flush the queue:

```csharp
// Flush all loggers
NeuralLog.FlushAll();

// Flush a specific logger
logger.Flush();
```

## Troubleshooting

### Common Issues

#### Connection Errors

If you're experiencing connection errors to the NeuralLog server:

```
NeuralLog.SDK.Exceptions.NeuralLogConnectionException: Failed to connect to server
```

Check that:
- The server URL is correct
- The server is running and accessible
- Your network allows the connection

#### Authentication Errors

If you're seeing authentication errors:

```
NeuralLog.SDK.Exceptions.NeuralLogAuthException: Invalid API key
```

Verify that:
- You've set the correct API key
- The API key has the necessary permissions

## Source Code

The source code for the NeuralLog C# SDK is available on GitHub:
[https://github.com/NeuralLog/csharp-sdk](https://github.com/NeuralLog/csharp-sdk)
