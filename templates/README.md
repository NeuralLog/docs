# NeuralLog Documentation Templates

This directory contains templates for creating consistent documentation across all NeuralLog components.

## Component Documentation Template

The `component-docs-template` directory contains a template for component-specific documentation. This template should be used as a starting point for documenting each NeuralLog component.

### How to Use the Template

1. Copy the template files to your component repository:

   ```bash
   # From the root of your component repository
   mkdir -p docs/examples
   cp -r /path/to/NeuralLog/docs/templates/component-docs-template/README.md ./
   cp -r /path/to/NeuralLog/docs/templates/component-docs-template/CONTRIBUTING.md ./
   cp -r /path/to/NeuralLog/docs/templates/component-docs-template/docs/* ./docs/
   ```

2. Replace placeholders in the template files:
   - `[Component Name]` - The name of your component (e.g., "Auth", "Server")
   - `[repo-name]` - The name of your repository (e.g., "auth", "server")
   - `[component-name]` - The lowercase name of your component (e.g., "auth", "server")

3. Fill in the template with component-specific information:
   - Update the overview, features, and quick start sections in README.md
   - Document the API in docs/api.md
   - Document configuration options in docs/configuration.md
   - Document the architecture in docs/architecture.md
   - Add examples in docs/examples/

### Template Structure

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

## Documentation Aggregation

The documentation from each component repository is automatically aggregated into the central documentation site using a GitHub Action. The action pulls documentation from each component repository and integrates it into the central documentation site.

### How Documentation Aggregation Works

1. The GitHub Action runs on a schedule (daily) or can be triggered manually.
2. It checks out each component repository.
3. It extracts information from each component's documentation.
4. It updates the central documentation site with the extracted information.
5. It commits and pushes the changes to the central documentation repository.

### Documentation Aggregation Rules

- The README.md file is used to generate the overview page for each component.
- The docs/api.md file is used for the API reference.
- The docs/configuration.md file is used for configuration documentation.
- The docs/architecture.md file is used for architecture documentation.
- The docs/examples/ directory is used for examples.

## Best Practices

- Keep documentation close to the code it documents.
- Use consistent formatting and style across all documentation.
- Update documentation when you update code.
- Include examples for common use cases.
- Document all public APIs.
- Use diagrams to explain complex concepts.
- Keep documentation concise and focused.
