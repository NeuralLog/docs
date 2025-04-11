"use strict";(self.webpackChunkneural_log_docs=self.webpackChunkneural_log_docs||[]).push([[144],{2069:(e,n,a)=>{a.r(n),a.d(n,{assets:()=>t,contentTitle:()=>s,default:()=>g,frontMatter:()=>l,metadata:()=>o,toc:()=>c});const o=JSON.parse('{"id":"components/java-sdk","title":"Java SDK","description":"The Java SDK for NeuralLog provides a client library for interacting with the NeuralLog server from Java applications. It offers a familiar logging API similar to Log4j and adapters for popular Java logging frameworks.","source":"@site/docs/components/java-sdk.md","sourceDirName":"components","slug":"/components/java-sdk","permalink":"/docs/docs/components/java-sdk","draft":false,"unlisted":false,"editUrl":"https://github.com/NeuralLog/docs/tree/main/docs/components/java-sdk.md","tags":[],"version":"current","frontMatter":{},"sidebar":"tutorialSidebar","previous":{"title":"TypeScript SDK","permalink":"/docs/docs/components/sdk"},"next":{"title":"C# SDK","permalink":"/docs/docs/components/csharp-sdk"}}');var r=a(4848),i=a(8453);const l={},s="Java SDK",t={},c=[{value:"Requirements",id:"requirements",level:2},{value:"Installation",id:"installation",level:2},{value:"Maven",id:"maven",level:3},{value:"Gradle",id:"gradle",level:3},{value:"Basic Usage",id:"basic-usage",level:2},{value:"Framework Adapters",id:"framework-adapters",level:2},{value:"Log4j 2 Appender",id:"log4j-2-appender",level:3},{value:"SLF4J/Logback Appender",id:"slf4jlogback-appender",level:3},{value:"Java Util Logging (JUL) Handler",id:"java-util-logging-jul-handler",level:3},{value:"Apache Commons Logging Adapter",id:"apache-commons-logging-adapter",level:3},{value:"Configuration Options",id:"configuration-options",level:2},{value:"Java 22 Compatibility",id:"java-22-compatibility",level:2},{value:"Java 22 Features",id:"java-22-features",level:3},{value:"Building with Java 22",id:"building-with-java-22",level:3},{value:"Troubleshooting",id:"troubleshooting",level:2},{value:"Common Issues",id:"common-issues",level:3},{value:"Connection Errors",id:"connection-errors",level:4},{value:"Authentication Errors",id:"authentication-errors",level:4},{value:"Additional Resources",id:"additional-resources",level:2}];function d(e){const n={a:"a",code:"code",h1:"h1",h2:"h2",h3:"h3",h4:"h4",header:"header",li:"li",ol:"ol",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,i.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(n.header,{children:(0,r.jsx)(n.h1,{id:"java-sdk",children:"Java SDK"})}),"\n",(0,r.jsx)(n.p,{children:"The Java SDK for NeuralLog provides a client library for interacting with the NeuralLog server from Java applications. It offers a familiar logging API similar to Log4j and adapters for popular Java logging frameworks."}),"\n",(0,r.jsx)(n.h2,{id:"requirements",children:"Requirements"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Java"}),": Version 22 or later"]}),"\n",(0,r.jsxs)(n.li,{children:[(0,r.jsx)(n.strong,{children:"Maven"}),": Version 3.6 or later (for building from source)"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"installation",children:"Installation"}),"\n",(0,r.jsx)(n.h3,{id:"maven",children:"Maven"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-xml",children:"<dependency>\n    <groupId>com.neurallog</groupId>\n    <artifactId>neurallog-sdk</artifactId>\n    <version>1.0.0</version>\n</dependency>\n"})}),"\n",(0,r.jsx)(n.h3,{id:"gradle",children:"Gradle"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-groovy",children:"implementation 'com.neurallog:neurallog-sdk:1.0.0'\n"})}),"\n",(0,r.jsx)(n.h2,{id:"basic-usage",children:"Basic Usage"}),"\n",(0,r.jsx)(n.p,{children:"The Java SDK provides a simple API for logging messages to the NeuralLog server:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-java",children:'import com.neurallog.sdk.AILogger;\nimport com.neurallog.sdk.NeuralLog;\nimport com.neurallog.sdk.NeuralLogConfig;\n\nimport java.util.HashMap;\nimport java.util.Map;\n\npublic class Example {\n    public static void main(String[] args) {\n        // Configure the SDK (optional)\n        NeuralLogConfig config = new NeuralLogConfig()\n            .setServerUrl("http://localhost:3030")\n            .setNamespace("default");\n        NeuralLog.configure(config);\n\n        // Get a logger\n        AILogger logger = NeuralLog.getLogger("my-application");\n\n        // Log a simple message\n        logger.info("Hello, world!");\n\n        // Log with structured data\n        Map<String, Object> data = new HashMap<>();\n        data.put("user", "john.doe");\n        data.put("action", "login");\n        data.put("ip", "192.168.1.1");\n        logger.info("User logged in", data);\n\n        // Log an error with exception\n        try {\n            // Some code that might throw an exception\n            throw new RuntimeException("Something went wrong");\n        } catch (Exception e) {\n            logger.error("Failed to process request", e);\n        }\n    }\n}\n'})}),"\n",(0,r.jsx)(n.h2,{id:"framework-adapters",children:"Framework Adapters"}),"\n",(0,r.jsx)(n.p,{children:"The Java SDK provides adapters for popular Java logging frameworks, allowing you to integrate NeuralLog into existing applications with minimal changes."}),"\n",(0,r.jsx)(n.h3,{id:"log4j-2-appender",children:"Log4j 2 Appender"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-xml",children:'<Configuration>\n  <Appenders>\n    <NeuralLog name="NeuralLog" logName="my-application">\n      <PatternLayout pattern="%d{HH:mm:ss.SSS} [%t] %-5level %logger{36} - %msg%n"/>\n    </NeuralLog>\n  </Appenders>\n  <Loggers>\n    <Root level="info">\n      <AppenderRef ref="NeuralLog"/>\n    </Root>\n  </Loggers>\n</Configuration>\n'})}),"\n",(0,r.jsx)(n.h3,{id:"slf4jlogback-appender",children:"SLF4J/Logback Appender"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-xml",children:'<configuration>\n  <appender name="NEURALLOG" class="com.neurallog.sdk.slf4j.NeuralLogSlf4jAppender">\n    <logName>my-application</logName>\n  </appender>\n  \n  <root level="info">\n    <appender-ref ref="NEURALLOG" />\n  </root>\n</configuration>\n'})}),"\n",(0,r.jsx)(n.h3,{id:"java-util-logging-jul-handler",children:"Java Util Logging (JUL) Handler"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-java",children:'import java.util.logging.Logger;\nimport java.util.logging.Level;\nimport com.neurallog.sdk.jul.NeuralLogJulHandler;\n\npublic class JulExample {\n    public static void main(String[] args) {\n        Logger logger = Logger.getLogger("my-application");\n        logger.addHandler(new NeuralLogJulHandler("my-application"));\n        logger.setLevel(Level.INFO);\n        \n        logger.info("This will be sent to NeuralLog");\n    }\n}\n'})}),"\n",(0,r.jsx)(n.h3,{id:"apache-commons-logging-adapter",children:"Apache Commons Logging Adapter"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-java",children:'// Configure NeuralLog as the Commons Logging implementation\nSystem.setProperty("org.apache.commons.logging.Log",\n                  "com.neurallog.sdk.commons.NeuralLogCommonsLogger");\n\n// Get a logger\nimport org.apache.commons.logging.Log;\nimport org.apache.commons.logging.LogFactory;\n\npublic class MyApp {\n    private static final Log log = LogFactory.getLog(MyApp.class);\n\n    public void doSomething() {\n        log.info("This will be sent to NeuralLog");\n    }\n}\n'})}),"\n",(0,r.jsx)(n.h2,{id:"configuration-options",children:"Configuration Options"}),"\n",(0,r.jsxs)(n.p,{children:["The Java SDK can be configured using the ",(0,r.jsx)(n.code,{children:"NeuralLogConfig"})," class:"]}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{className:"language-java",children:'NeuralLogConfig config = new NeuralLogConfig()\n    .setServerUrl("https://logs.example.com")\n    .setNamespace("production")\n    .setApiKey("your-api-key")\n    .setBatchSize(100)\n    .setBatchIntervalMs(5000)\n    .setMaxRetries(3)\n    .setRetryBackoffMs(1000)\n    .setAsyncEnabled(true)\n    .setDebugEnabled(false);\n\nNeuralLog.configure(config);\n'})}),"\n",(0,r.jsx)(n.h2,{id:"java-22-compatibility",children:"Java 22 Compatibility"}),"\n",(0,r.jsx)(n.p,{children:"The NeuralLog Java SDK is fully compatible with Java 22. The SDK has been tested and verified to work with Java 22, including all framework adapters (Log4j, SLF4J/Logback, JUL, and Commons Logging)."}),"\n",(0,r.jsx)(n.h3,{id:"java-22-features",children:"Java 22 Features"}),"\n",(0,r.jsx)(n.p,{children:"When using Java 22, the SDK takes advantage of:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"Improved performance with the latest JVM optimizations"}),"\n",(0,r.jsx)(n.li,{children:"Enhanced security features"}),"\n",(0,r.jsx)(n.li,{children:"Better memory management"}),"\n"]}),"\n",(0,r.jsx)(n.h3,{id:"building-with-java-22",children:"Building with Java 22"}),"\n",(0,r.jsx)(n.p,{children:"To build the SDK with Java 22:"}),"\n",(0,r.jsxs)(n.ol,{children:["\n",(0,r.jsx)(n.li,{children:"Ensure you have JDK 22 installed"}),"\n",(0,r.jsxs)(n.li,{children:["Set the ",(0,r.jsx)(n.code,{children:"JAVA_HOME"})," environment variable to point to your JDK 22 installation"]}),"\n",(0,r.jsxs)(n.li,{children:["Run Maven with the Java 22 JDK:","\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{children:"mvn clean install\n"})}),"\n"]}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"troubleshooting",children:"Troubleshooting"}),"\n",(0,r.jsx)(n.h3,{id:"common-issues",children:"Common Issues"}),"\n",(0,r.jsx)(n.h4,{id:"connection-errors",children:"Connection Errors"}),"\n",(0,r.jsx)(n.p,{children:"If you're experiencing connection errors to the NeuralLog server:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{children:"com.neurallog.sdk.exceptions.NeuralLogConnectionException: Failed to connect to server\n"})}),"\n",(0,r.jsx)(n.p,{children:"Check that:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"The server URL is correct"}),"\n",(0,r.jsx)(n.li,{children:"The server is running and accessible"}),"\n",(0,r.jsx)(n.li,{children:"Your network allows the connection"}),"\n"]}),"\n",(0,r.jsx)(n.h4,{id:"authentication-errors",children:"Authentication Errors"}),"\n",(0,r.jsx)(n.p,{children:"If you're seeing authentication errors:"}),"\n",(0,r.jsx)(n.pre,{children:(0,r.jsx)(n.code,{children:"com.neurallog.sdk.exceptions.NeuralLogAuthException: Invalid API key\n"})}),"\n",(0,r.jsx)(n.p,{children:"Verify that:"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:"You've set the correct API key"}),"\n",(0,r.jsx)(n.li,{children:"The API key has the necessary permissions"}),"\n"]}),"\n",(0,r.jsx)(n.h2,{id:"additional-resources",children:"Additional Resources"}),"\n",(0,r.jsxs)(n.ul,{children:["\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://github.com/NeuralLog/java-sdk",children:"GitHub Repository"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://docs.neurallog.com/api/java",children:"API Documentation"})}),"\n",(0,r.jsx)(n.li,{children:(0,r.jsx)(n.a,{href:"https://github.com/NeuralLog/java-sdk-examples",children:"Sample Applications"})}),"\n"]})]})}function g(e={}){const{wrapper:n}={...(0,i.R)(),...e.components};return n?(0,r.jsx)(n,{...e,children:(0,r.jsx)(d,{...e})}):d(e)}},8453:(e,n,a)=>{a.d(n,{R:()=>l,x:()=>s});var o=a(6540);const r={},i=o.createContext(r);function l(e){const n=o.useContext(i);return o.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function s(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:l(e.components),o.createElement(i.Provider,{value:n},e.children)}}}]);