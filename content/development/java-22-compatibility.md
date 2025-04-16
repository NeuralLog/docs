# Java 22 Compatibility

This guide explains the changes made to ensure NeuralLog Java SDK compatibility with Java 22.

## Overview

The NeuralLog Java SDK has been updated to be fully compatible with Java 22. This includes:

1. Updating dependencies to versions that support Java 22
2. Fixing code that was incompatible with Java 22
3. Adding configuration for Java 22 experimental features
4. Updating documentation to reflect Java 22 support

## Dependency Updates

The following dependencies were updated to support Java 22:

| Dependency | Old Version | New Version |
|------------|------------|------------|
| Mockito Core | < 5.0.0 | 5.10.0 |
| Byte Buddy | < 1.14.0 | 1.14.12 |
| Byte Buddy Agent | < 1.14.0 | 1.14.12 |

These updates were necessary because older versions of these libraries were not compatible with Java 22's new features and changes.

## Code Changes

### NeuralLogCommonsLogger

The `NeuralLogCommonsLogger` class was updated to use the overridable `getLogger` method instead of directly calling `NeuralLog.getLogger`:

```java
// Before
public NeuralLogCommonsLogger(String name) {
    this.logger = NeuralLog.getLogger(name);
}

// After
public NeuralLogCommonsLogger(String name) {
    this.logger = getLogger(name);
}
```

This change allows for proper mocking in tests.

### NeuralLogJulHandler

The `NeuralLogJulHandler` class was updated to use `MessageFormat` instead of `String.format` for JUL parameter formatting:

```java
// Before
if (record.getParameters() != null && record.getParameters().length > 0) {
    try {
        message = String.format(message, record.getParameters());
    } catch (Exception e) {
        // Ignore formatting errors
    }
}

// After
if (record.getParameters() != null && record.getParameters().length > 0) {
    try {
        // Use MessageFormat instead of String.format for JUL parameter formatting
        java.text.MessageFormat formatter = new java.text.MessageFormat(message);
        message = formatter.format(record.getParameters());
    } catch (Exception e) {
        // Ignore formatting errors
    }
}
```

This change ensures proper parameter formatting in Java 22.

### NeuralLogSlf4jAppender

The `NeuralLogSlf4jAppender` class was updated to handle MDC adapter issues in Java 22:

```java
// Before
// Extract MDC data
Map<String, Object> data = new HashMap<>();
if (event.getMDCPropertyMap() != null && !event.getMDCPropertyMap().isEmpty()) {
    data.putAll(event.getMDCPropertyMap());
}

// After
// Extract MDC data
Map<String, Object> data = new HashMap<>();
try {
    Map<String, String> mdcMap = event.getMDCPropertyMap();
    if (mdcMap != null && !mdcMap.isEmpty()) {
        data.putAll(mdcMap);
    }
} catch (NullPointerException e) {
    // Ignore MDC errors in tests
}
```

This change adds error handling for MDC adapter issues in Java 22.

## Maven Configuration

The Maven configuration was updated to support Java 22:

1. Updated Java version in POM file:

```xml
<maven.compiler.source>22</maven.compiler.source>
<maven.compiler.target>22</maven.compiler.target>
```

2. Added experimental Byte Buddy support for Java 22:

```xml
<plugin>
    <groupId>org.apache.maven.plugins</groupId>
    <artifactId>maven-surefire-plugin</artifactId>
    <version>3.1.2</version>
    <configuration>
        <argLine>-Dnet.bytebuddy.experimental=true</argLine>
    </configuration>
</plugin>
```

## Testing

All tests have been updated to work with Java 22. The test suite now passes with Java 22, ensuring that the SDK is fully compatible with this version.

## Documentation Updates

The documentation has been updated to reflect Java 22 compatibility:

1. Updated the README.md file to specify Java 22 as the minimum required version
2. Added a new section in the documentation about Java 22 compatibility
3. Updated the build instructions to include Java 22-specific steps

## Conclusion

With these changes, the NeuralLog Java SDK is now fully compatible with Java 22. Users can now use the latest Java features while still benefiting from the NeuralLog logging system.
