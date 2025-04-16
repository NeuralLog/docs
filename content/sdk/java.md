---
sidebar_position: 3
---

# Java SDK

The Java SDK for NeuralLog provides a client library for interacting with the NeuralLog server from Java applications. It offers a familiar logging API similar to Log4j and adapters for popular Java logging frameworks.

## Requirements

- **Java**: Version 22 or later
- **Maven**: Version 3.6 or later (for building from source)

## Installation

### Maven

```xml
<dependency>
    <groupId>com.neurallog</groupId>
    <artifactId>neurallog-sdk</artifactId>
    <version>1.0.0</version>
</dependency>
```

### Gradle

```groovy
implementation 'com.neurallog:neurallog-sdk:1.0.0'
```

## Basic Usage

The Java SDK provides a simple API for logging messages to the NeuralLog server:

```java
import com.neurallog.sdk.AILogger;
import com.neurallog.sdk.NeuralLog;
import com.neurallog.sdk.NeuralLogConfig;

import java.util.HashMap;
import java.util.Map;

public class Example {
    public static void main(String[] args) {
        // Configure the SDK (optional)
        NeuralLogConfig config = new NeuralLogConfig()
            .setServerUrl("http://localhost:3030")
            .setNamespace("default");
        NeuralLog.configure(config);

        // Get a logger
        AILogger logger = NeuralLog.getLogger("my-application");

        // Log a simple message
        logger.info("Hello, world!");

        // Log with structured data
        Map<String, Object> data = new HashMap<>();
        data.put("user", "john.doe");
        data.put("action", "login");
        data.put("ip", "192.168.1.1");
        logger.info("User logged in", data);

        // Log an error with exception
        try {
            // Some code that might throw an exception
            throw new RuntimeException("Something went wrong");
        } catch (Exception e) {
            logger.error("Failed to process request", e);
        }
    }
}
```

## Framework Adapters

The Java SDK provides adapters for popular Java logging frameworks, allowing you to integrate NeuralLog into existing applications with minimal changes.

### Log4j 2 Appender

```xml
<Configuration>
  <Appenders>
    <NeuralLog name="NeuralLog" logName="my-application">
      <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>
    </NeuralLog>
  </Appenders>
  <Loggers>
    <Root level="info">
      <AppenderRef ref="NeuralLog"/>
    </Root>
  </Loggers>
</Configuration>
```

### SLF4J/Logback Appender

```xml
<configuration>
  <appender name="NEURALLOG" class="com.neurallog.sdk.slf4j.NeuralLogSlf4jAppender">
    <logName>my-application</logName>
  </appender>
  
  <root level="info">
    <appender-ref ref="NEURALLOG" />
  </root>
</configuration>
```

### Java Util Logging (JUL) Handler

```java
import java.util.logging.Logger;
import java.util.logging.Level;
import com.neurallog.sdk.jul.NeuralLogJulHandler;

public class JulExample {
    public static void main(String[] args) {
        Logger logger = Logger.getLogger("my-application");
        logger.addHandler(new NeuralLogJulHandler("my-application"));
        logger.setLevel(Level.INFO);
        
        logger.info("This will be sent to NeuralLog");
    }
}
```

### Apache Commons Logging Adapter

```java
// Configure NeuralLog as the Commons Logging implementation
System.setProperty("org.apache.commons.logging.Log",
                  "com.neurallog.sdk.commons.NeuralLogCommonsLogger");

// Get a logger
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

public class MyApp {
    private static final Log log = LogFactory.getLog(MyApp.class);

    public void doSomething() {
        log.info("This will be sent to NeuralLog");
    }
}
```

## Configuration Options

The Java SDK can be configured using the `NeuralLogConfig` class:

```java
NeuralLogConfig config = new NeuralLogConfig()
    .setServerUrl("https://logs.example.com")
    .setNamespace("production")
    .setApiKey("your-api-key")
    .setBatchSize(100)
    .setBatchIntervalMs(5000)
    .setMaxRetries(3)
    .setRetryBackoffMs(1000)
    .setAsyncEnabled(true)
    .setDebugEnabled(false);

NeuralLog.configure(config);
```

## Java 22 Compatibility

The NeuralLog Java SDK is fully compatible with Java 22. The SDK has been tested and verified to work with Java 22, including all framework adapters (Log4j, SLF4J/Logback, JUL, and Commons Logging).

### Java 22 Features

When using Java 22, the SDK takes advantage of:

- Improved performance with the latest JVM optimizations
- Enhanced security features
- Better memory management

### Building with Java 22

To build the SDK with Java 22:

1. Ensure you have JDK 22 installed
2. Set the `JAVA_HOME` environment variable to point to your JDK 22 installation
3. Run Maven with the Java 22 JDK:
   ```
   mvn clean install
   ```

## Troubleshooting

### Common Issues

#### Connection Errors

If you're experiencing connection errors to the NeuralLog server:

```
com.neurallog.sdk.exceptions.NeuralLogConnectionException: Failed to connect to server
```

Check that:
- The server URL is correct
- The server is running and accessible
- Your network allows the connection

#### Authentication Errors

If you're seeing authentication errors:

```
com.neurallog.sdk.exceptions.NeuralLogAuthException: Invalid API key
```

Verify that:
- You've set the correct API key
- The API key has the necessary permissions

## Source Code

The source code for the NeuralLog Java SDK is available on GitHub:
[https://github.com/NeuralLog/java-sdk](https://github.com/NeuralLog/java-sdk)
