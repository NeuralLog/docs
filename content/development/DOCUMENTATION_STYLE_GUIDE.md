# NeuralLog Documentation Style Guide

This guide establishes standards for documentation across all NeuralLog repositories to ensure consistency, clarity, and maintainability.

## Core Principles

1. **Documentation as Code**: Documentation lives with the code it describes
2. **Single Source of Truth**: Each piece of information has one canonical location
3. **Consistency**: Consistent structure and formatting across all repositories
4. **Discoverability**: Easy to find and navigate
5. **Maintainability**: Easy to update and maintain

## Repository Documentation Structure

Each repository should follow this structure:

```
repository-name/
├── README.md                  # Overview, quick start, basic usage
├── docs/                      # Detailed documentation
│   ├── api.md                 # API reference
│   ├── architecture.md        # Component architecture
│   ├── configuration.md       # Configuration options
│   ├── examples/              # Usage examples
│   │   └── basic-usage.md     # Basic usage example
│   └── development.md         # Development guide
└── CONTRIBUTING.md            # Contributing guidelines
```

## README.md Structure

The README.md file should follow this structure:

```markdown
# Component Name

Brief one-line description of the component.

## Overview

2-3 paragraphs describing what the component does and its role in the NeuralLog ecosystem.

## Features

- Feature 1: Brief description
- Feature 2: Brief description
- Feature 3: Brief description

## Installation

```bash
# Installation commands
```

## Quick Start

```typescript
// Code example showing basic usage
```

## Documentation

For detailed documentation, see:

- [API Reference](../api.md)
- [Architecture](../architecture/index.md)
- [Configuration](../components/log-server/configuration.md)
- [Examples](../components/log-server/examples.md)
- [Development Guide](./)

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING) for details on how to contribute.

## License

MIT
```

## Documentation Files

### api.md

API documentation should:
- Document all public APIs
- Include parameter types and descriptions
- Provide examples for common use cases
- Group related APIs together
- Include error handling information

### architecture.md

Architecture documentation should:
- Describe the component's architecture
- Explain how it fits into the NeuralLog ecosystem
- Include diagrams where appropriate
- Describe key design decisions and trade-offs

### configuration.md

Configuration documentation should:
- List all configuration options
- Provide default values
- Explain the purpose of each option
- Include examples for common configurations

### examples/

Examples should:
- Be self-contained and runnable
- Include comments explaining key concepts
- Cover common use cases
- Progress from simple to complex

### development.md

Development documentation should:
- Describe the development environment setup
- Explain the build process
- Describe the testing approach
- Include guidelines for contributing code

## Markdown Formatting

### Headers

- Use ATX-style headers (`#` for h1, `##` for h2, etc.)
- Use title case for headers
- Include a space after the `#`
- Use only one h1 per document (the title)

### Code Blocks

- Use fenced code blocks with language specifiers
- For terminal commands, use `bash` as the language
- For configuration files, use the appropriate language or `yaml`
- For code examples, use the appropriate language

### Links

- Use relative links for internal documentation
- Use absolute links for external resources
- Include descriptive link text

### Lists

- Use `-` for unordered lists
- Use `1.` for ordered lists
- Indent nested lists with 2 spaces

### Tables

- Use tables for structured data
- Include a header row
- Align columns for readability

### Images

- Include alt text for all images
- Keep images in a dedicated `images/` directory
- Use descriptive filenames

## Writing Style

- Use clear, concise language
- Write in the present tense
- Use active voice
- Address the reader directly ("you")
- Use consistent terminology
- Define acronyms and technical terms
- Keep paragraphs short (3-5 sentences)
- Use sentence case for titles and headings

## Documentation Aggregation

The central documentation hub aggregates content from all repositories. To ensure proper aggregation:

1. Follow the standard repository structure
2. Use consistent file names
3. Use relative links within your repository
4. Include front matter in Markdown files for Docusaurus

## Front Matter for Docusaurus

Include front matter at the top of Markdown files for Docusaurus:

```markdown
---
sidebar_position: 1
---

# Document Title

Document content...
```

The `sidebar_position` determines the order in the sidebar.
