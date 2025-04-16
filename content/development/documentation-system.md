# Documentation System

This guide explains how the NeuralLog documentation system works and how to use it to maintain consistent documentation across all repositories.

## Overview

NeuralLog uses a distributed documentation approach where:

1. Each component repository contains its own documentation in a `/docs` directory
2. The central documentation repository (`NeuralLog/docs`) aggregates documentation from all components
3. Documentation is automatically pulled from component repositories using GitHub Actions
4. A consistent structure is maintained across all repositories

This approach allows component-specific documentation to live alongside the code while still providing a unified documentation site.

## Documentation Structure

### Component Repository Structure

Each component repository should have the following documentation structure:

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

### Central Documentation Repository Structure

The central documentation repository (`NeuralLog/docs`) has the following structure:

```
docs/
├── blog/                      # Blog posts
├── docs/                      # Documentation content
│   ├── architecture/          # Architecture documentation
│   ├── components/            # Component-specific documentation
│   │   ├── auth/              # Auth component documentation
│   │   ├── server/            # Server component documentation
│   │   ├── web/               # Web component documentation
│   │   └── mcp-client/        # MCP Client documentation
│   ├── deployment/            # Deployment guides
│   ├── development/           # Development guides
│   ├── getting-started/       # Getting started guides
│   ├── overview/              # Overview documentation
│   ├── sdk/                   # SDK documentation
│   └── security/              # Security documentation
├── scripts/                   # Documentation scripts
│   ├── extract-readme-info.js # Extract info from README
│   ├── update-sidebar.js      # Update sidebar configuration
│   ├── create-spec-indexes.js # Create index files for specs
│   └── fix-docs.js            # Fix documentation files
├── templates/                 # Documentation templates
│   └── component-docs-template/ # Template for component docs
└── static/                    # Static files (images, etc.)
```

## Documentation Aggregation

The documentation from each component repository is automatically aggregated into the central documentation site using a GitHub Action.

### How Documentation Aggregation Works

1. The GitHub Action runs on a schedule (daily) or can be triggered manually
2. It checks out each component repository
3. It extracts information from each component's documentation
4. It updates the central documentation site with the extracted information
5. It commits and pushes the changes to the central documentation repository

### Documentation Aggregation Workflow

The workflow is defined in `.github/workflows/aggregate-docs.yml` and performs the following steps:

1. **Checkout docs repository**: Clones the central documentation repository
2. **Determine components to aggregate**: Identifies which components to process
3. **Checkout component repositories**: Clones each component repository
4. **Process specifications**: Copies specification files from the specs repository
5. **Aggregate component documentation**: For each component:
   - Creates a directory for the component in `docs/components/`
   - Copies API documentation (`api.md`)
   - Copies configuration documentation (`configuration.md`)
   - Copies architecture documentation (`architecture.md`)
   - Copies examples
   - Extracts information from README for an overview
6. **Update sidebar configuration**: Updates the sidebar to include all documentation
7. **Commit and push changes**: Commits and pushes the changes to the central repository

## Documentation Scripts

The `scripts` directory contains several scripts for managing documentation:

### extract-readme-info.js

This script extracts information from a component's README.md and creates an overview page:

```bash
node extract-readme-info.js <input-readme> <output-overview> <component-name>
```

Example:
```bash
node extract-readme-info.js auth/README.md docs/components/auth/overview.md "Auth"
```

### update-sidebar.js

This script updates the sidebar configuration based on available documentation:

```bash
node update-sidebar.js
```

It scans the `docs` directory and updates the `sidebars.ts` file to include all available documentation.

### create-spec-indexes.js

This script creates index files for specification sections:

```bash
node create-spec-indexes.js
```

It creates index files for the architecture, deployment, security, and API sections based on the specification files.

### fix-docs.js

This script standardizes documentation across all NeuralLog repositories:

```bash
node fix-docs.js [repository-path] [options]
```

Options:
- `--dry-run`: Show what would change without making changes
- `--create-only`: Only create missing files, don't modify existing ones
- `--backup`: Create backups of existing files before modifying them
- `--force`: Overwrite existing files without prompting

Example:
```bash
node fix-docs.js ../auth --backup --force
```

## Documentation Templates

The `templates` directory contains templates for creating consistent documentation across all NeuralLog components:

### component-docs-template

This template provides a starting point for component-specific documentation:

```
component-docs-template/
├── README.md                   # Main README file with overview and quick start
├── CONTRIBUTING.md             # Contributing guidelines
└── docs/
    ├── api.md                  # API reference documentation
    ├── architecture.md         # Architecture documentation
    ├── configuration.md        # Configuration documentation
    └── examples/
        └── basic-usage.md      # Basic usage example
```

## Maintaining Documentation

### Adding New Documentation

To add new documentation to a component:

1. Create the documentation file in the component's `docs` directory
2. Follow the standard structure and formatting
3. The documentation will be automatically aggregated into the central documentation site

### Updating Existing Documentation

To update existing documentation:

1. Update the documentation file in the component's `docs` directory
2. The changes will be automatically aggregated into the central documentation site

### Fixing Documentation

To fix documentation across all repositories:

1. Run the `fix-docs.js` script:
   ```bash
   node scripts/fix-docs.js [repository-path]
   ```
2. The script will create missing documentation files and offer to update existing ones

## Best Practices

### Documentation Style

- Use clear, concise language
- Use headings to organize content
- Include code examples where appropriate
- Use diagrams to illustrate complex concepts
- Keep documentation up-to-date with code changes

### README.md Structure

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

- API Reference
- Architecture
- Configuration
- Examples
- Development Guide

## Contributing

See the Contributing section for details on how to contribute.

## License

MIT
```

### Documentation Files

Each documentation file should:

1. Start with a title (# Title)
2. Include a brief overview
3. Use proper heading hierarchy (# for title, ## for sections, ### for subsections)
4. Include code examples where appropriate
5. Use relative links to other documentation files

## Troubleshooting

### Documentation Not Appearing

If documentation is not appearing in the central documentation site:

1. Check that the documentation file exists in the component's `docs` directory
2. Verify that the file has the correct name (e.g., `api.md`, `architecture.md`)
3. Check that the GitHub Action has run successfully
4. Run the `update-sidebar.js` script manually to update the sidebar configuration

### Sidebar Not Updating

If the sidebar is not updating:

1. Run the `update-sidebar.js` script manually:
   ```bash
   node scripts/update-sidebar.js
   ```
2. Check the `sidebars.ts` file for errors
3. Verify that the documentation files exist in the expected locations

### Documentation Formatting Issues

If documentation has formatting issues:

1. Check that the Markdown syntax is correct
2. Verify that code blocks are properly formatted
3. Use the `fix-docs.js` script to standardize documentation:
   ```bash
   node scripts/fix-docs.js [repository-path]
   ```

## Conclusion

The NeuralLog documentation system provides a way to maintain consistent documentation across all repositories while allowing component-specific documentation to live alongside the code. By following the guidelines in this document, you can ensure that the documentation remains up-to-date and useful for users and developers.
