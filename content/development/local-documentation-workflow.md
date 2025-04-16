# Local Documentation Workflow

This guide explains how to run the NeuralLog documentation aggregation and publishing process locally, and how the CI job accesses other repositories.

## Running the Documentation Process Locally

### Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (version 7 or higher)
- [Git](https://git-scm.com/)

### Setting Up the Repository Structure

To run the documentation process locally, you need to set up a directory structure similar to what the CI job uses:

```
NeuralLog/
├── docs/             # Central documentation repository
├── auth/             # Auth component repository
├── log-server/       # Log Server component repository
├── web/              # Web component repository
├── mcp-client/       # MCP Client component repository
└── specs/            # Specifications repository
```

Clone all the repositories into the same parent directory:

```bash
# Create a directory for NeuralLog
mkdir NeuralLog
cd NeuralLog

# Clone the repositories
git clone https://github.com/NeuralLog/docs.git docs
git clone https://github.com/NeuralLog/auth.git auth
git clone https://github.com/NeuralLog/log-server.git log-server
git clone https://github.com/NeuralLog/web.git web
git clone https://github.com/NeuralLog/mcp-client.git mcp-client
git clone https://github.com/NeuralLog/specs.git specs
```

### Running the Aggregation Process Locally

Once you have the repositories set up, you can run the aggregation process manually:

1. **Install dependencies**:

```bash
cd docs
npm install
```

2. **Create a local aggregation script**:

Create a file called `local-aggregate.js` in the `docs/scripts` directory:

```javascript
// docs/scripts/local-aggregate.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define the components to aggregate
const components = ['auth', 'log-server', 'web', 'mcp-client'];

// Create component directories
components.forEach(component => {
  const componentDir = path.join(__dirname, '../docs/components', component);
  if (!fs.existsSync(componentDir)) {
    fs.mkdirSync(componentDir, { recursive: true });
  }
});

// Copy documentation from component repositories
components.forEach(component => {
  console.log(`Processing ${component}...`);
  
  // Map component names to repository names if they differ
  const repoName = component === 'log-server' ? 'log-server' : component;
  
  // Path to the component repository
  const repoPath = path.join(__dirname, '../../', repoName);
  
  // Path to the component docs in the central repository
  const docsPath = path.join(__dirname, '../docs/components', component);
  
  // Check if the component repository exists
  if (!fs.existsSync(repoPath)) {
    console.error(`Repository for ${component} not found at ${repoPath}`);
    return;
  }
  
  // Copy API documentation if it exists
  const apiSrc = path.join(repoPath, 'docs/api.md');
  const apiDest = path.join(docsPath, 'api.md');
  if (fs.existsSync(apiSrc)) {
    fs.copyFileSync(apiSrc, apiDest);
    console.log(`Copied API documentation for ${component}`);
  }
  
  // Copy configuration documentation if it exists
  const configSrc = path.join(repoPath, 'docs/configuration.md');
  const configDest = path.join(docsPath, 'configuration.md');
  if (fs.existsSync(configSrc)) {
    fs.copyFileSync(configSrc, configDest);
    console.log(`Copied configuration documentation for ${component}`);
  }
  
  // Copy architecture documentation if it exists
  const archSrc = path.join(repoPath, 'docs/architecture.md');
  const archDest = path.join(docsPath, 'architecture.md');
  if (fs.existsSync(archSrc)) {
    fs.copyFileSync(archSrc, archDest);
    console.log(`Copied architecture documentation for ${component}`);
  }
  
  // Copy zero-knowledge documentation if it exists
  const zkSrc = path.join(repoPath, 'docs/zero-knowledge.md');
  const zkDest = path.join(docsPath, 'zero-knowledge.md');
  if (fs.existsSync(zkSrc)) {
    fs.copyFileSync(zkSrc, zkDest);
    console.log(`Copied zero-knowledge documentation for ${component}`);
  }
  
  // Copy storage-adapters documentation if it exists
  const storageSrc = path.join(repoPath, 'docs/storage-adapters.md');
  const storageDest = path.join(docsPath, 'storage-adapters.md');
  if (fs.existsSync(storageSrc)) {
    fs.copyFileSync(storageSrc, storageDest);
    console.log(`Copied storage-adapters documentation for ${component}`);
  }
  
  // Copy getting-started documentation if it exists
  const gsSrc = path.join(repoPath, 'docs/getting-started.md');
  const gsDest = path.join(docsPath, 'getting-started.md');
  if (fs.existsSync(gsSrc)) {
    fs.copyFileSync(gsSrc, gsDest);
    console.log(`Copied getting-started documentation for ${component}`);
  }
  
  // Copy integration documentation if it exists
  const intSrc = path.join(repoPath, 'docs/integration.md');
  const intDest = path.join(docsPath, 'integration.md');
  if (fs.existsSync(intSrc)) {
    fs.copyFileSync(intSrc, intDest);
    console.log(`Copied integration documentation for ${component}`);
  }
  
  // Extract README information
  const readmeSrc = path.join(repoPath, 'README.md');
  const overviewDest = path.join(docsPath, 'overview.md');
  if (fs.existsSync(readmeSrc)) {
    try {
      execSync(`node ${path.join(__dirname, 'extract-readme-info.js')} ${readmeSrc} ${overviewDest} "${component}"`);
      console.log(`Extracted README information for ${component}`);
    } catch (error) {
      console.error(`Error extracting README information for ${component}:`, error.message);
    }
  }
  
  // Copy examples directory if it exists
  const examplesSrc = path.join(repoPath, 'docs/examples');
  const examplesDest = path.join(docsPath, 'examples');
  if (fs.existsSync(examplesSrc)) {
    if (!fs.existsSync(examplesDest)) {
      fs.mkdirSync(examplesDest, { recursive: true });
    }
    
    const examples = fs.readdirSync(examplesSrc);
    examples.forEach(example => {
      const exampleSrc = path.join(examplesSrc, example);
      const exampleDest = path.join(examplesDest, example);
      if (fs.statSync(exampleSrc).isFile()) {
        fs.copyFileSync(exampleSrc, exampleDest);
      }
    });
    console.log(`Copied examples for ${component}`);
  }
});

// Process specifications if the specs repository exists
const specsPath = path.join(__dirname, '../../specs');
if (fs.existsSync(specsPath)) {
  console.log('Processing specifications...');
  
  // Create specs directories
  const specsDirs = ['architecture', 'api', 'security', 'deployment'];
  specsDirs.forEach(dir => {
    const specsDir = path.join(__dirname, '../docs/specs', dir);
    if (!fs.existsSync(specsDir)) {
      fs.mkdirSync(specsDir, { recursive: true });
    }
  });
  
  // Copy architecture specs
  const archSpecsSrc = path.join(specsPath, 'architecture');
  const archSpecsDest = path.join(__dirname, '../docs/specs/architecture');
  if (fs.existsSync(archSpecsSrc)) {
    const specs = fs.readdirSync(archSpecsSrc);
    specs.forEach(spec => {
      const specSrc = path.join(archSpecsSrc, spec);
      const specDest = path.join(archSpecsDest, spec);
      if (fs.statSync(specSrc).isFile() && spec.endsWith('.md')) {
        fs.copyFileSync(specSrc, specDest);
      }
    });
    console.log('Copied architecture specifications');
  }
  
  // Copy API specs
  const apiSpecsSrc = path.join(specsPath, 'api');
  const apiSpecsDest = path.join(__dirname, '../docs/specs/api');
  if (fs.existsSync(apiSpecsSrc)) {
    const specs = fs.readdirSync(apiSpecsSrc);
    specs.forEach(spec => {
      const specSrc = path.join(apiSpecsSrc, spec);
      const specDest = path.join(apiSpecsDest, spec);
      if (fs.statSync(specSrc).isFile() && spec.endsWith('.md')) {
        fs.copyFileSync(specSrc, specDest);
      }
    });
    console.log('Copied API specifications');
  }
  
  // Copy security specs
  const secSpecsSrc = path.join(specsPath, 'security');
  const secSpecsDest = path.join(__dirname, '../docs/specs/security');
  if (fs.existsSync(secSpecsSrc)) {
    const specs = fs.readdirSync(secSpecsSrc);
    specs.forEach(spec => {
      const specSrc = path.join(secSpecsSrc, spec);
      const specDest = path.join(secSpecsDest, spec);
      if (fs.statSync(specSrc).isFile() && spec.endsWith('.md')) {
        fs.copyFileSync(specSrc, specDest);
      }
    });
    console.log('Copied security specifications');
  }
  
  // Copy deployment specs
  const depSpecsSrc = path.join(specsPath, 'deployment');
  const depSpecsDest = path.join(__dirname, '../docs/specs/deployment');
  if (fs.existsSync(depSpecsSrc)) {
    const specs = fs.readdirSync(depSpecsSrc);
    specs.forEach(spec => {
      const specSrc = path.join(depSpecsSrc, spec);
      const specDest = path.join(depSpecsDest, spec);
      if (fs.statSync(specSrc).isFile() && spec.endsWith('.md')) {
        fs.copyFileSync(specSrc, specDest);
      }
    });
    console.log('Copied deployment specifications');
  }
  
  // Create spec indexes
  try {
    execSync(`node ${path.join(__dirname, 'create-spec-indexes.js')}`);
    console.log('Created specification indexes');
  } catch (error) {
    console.error('Error creating specification indexes:', error.message);
  }
}

// Update sidebar configuration
try {
  execSync(`node ${path.join(__dirname, 'update-sidebar.js')}`);
  console.log('Updated sidebar configuration');
} catch (error) {
  console.error('Error updating sidebar configuration:', error.message);
}

console.log('Documentation aggregation complete!');
```

3. **Run the aggregation script**:

```bash
node scripts/local-aggregate.js
```

This script will:
- Create directories for each component in the central documentation repository
- Copy documentation files from component repositories
- Extract information from README files
- Copy examples
- Process specifications
- Update the sidebar configuration

4. **Start the development server**:

```bash
npm start
```

This will start a local development server at [http://localhost:3000/docs/](http://localhost:3000/docs/) where you can preview the aggregated documentation.

### Building and Testing the Documentation Site Locally

To build and test the documentation site locally:

```bash
# Build the site
npm run build

# Serve the built site
npm run serve
```

This will build the documentation site and serve it at [http://localhost:3000/docs/](http://localhost:3000/docs/).

## How CI Jobs Access Other Repositories

The CI job that aggregates documentation needs access to multiple repositories. Here's how it works:

### GitHub Actions Workflow

The aggregation workflow is defined in `.github/workflows/aggregate-docs.yml`. It uses GitHub Actions to check out multiple repositories:

```yaml
jobs:
  aggregate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout docs repository
        uses: actions/checkout@v3
        with:
          path: docs

      - name: Determine components to aggregate
        id: components
        run: |
          if [ -z "${{ github.event.inputs.components }}" ]; then
            echo "components=auth,server,web,mcp-client" >> $GITHUB_OUTPUT
          else
            echo "components=${{ github.event.inputs.components }}" >> $GITHUB_OUTPUT
          fi

      - name: Checkout specs repository
        if: ${{ github.event.inputs.include_specs != 'false' }}
        uses: actions/checkout@v3
        with:
          repository: NeuralLog/specs
          path: specs

      - name: Checkout auth repository
        if: ${{ contains(steps.components.outputs.components, 'auth') }}
        uses: actions/checkout@v3
        with:
          repository: NeuralLog/auth
          path: auth

      - name: Checkout server repository
        if: ${{ contains(steps.components.outputs.components, 'server') }}
        uses: actions/checkout@v3
        with:
          repository: NeuralLog/server
          path: server

      - name: Checkout web repository
        if: ${{ contains(steps.components.outputs.components, 'web') }}
        uses: actions/checkout@v3
        with:
          repository: NeuralLog/web
          path: web

      - name: Checkout mcp-client repository
        if: ${{ contains(steps.components.outputs.components, 'mcp-client') }}
        uses: actions/checkout@v3
        with:
          repository: NeuralLog/mcp-client
          path: mcp-client
```

### Repository Access

The CI job accesses other repositories in one of two ways:

1. **Public Repositories**: For public repositories, the CI job can check them out directly without any special permissions.

2. **Private Repositories**: For private repositories, the CI job needs appropriate permissions. This is typically handled in one of these ways:

   a. **GitHub Token**: The workflow uses the `GITHUB_TOKEN` secret, which has access to the repository where the workflow is running. For accessing other repositories in the same organization, you may need to use a Personal Access Token (PAT) with appropriate permissions.
   
   b. **SSH Keys**: The workflow can use SSH keys for authentication when checking out repositories.
   
   c. **GitHub App**: A GitHub App can be used to provide more fine-grained permissions.

In the NeuralLog case, the repositories are in the same organization, and the workflow uses the default `GITHUB_TOKEN` which has sufficient permissions to access all the repositories in the organization.

### Permissions Configuration

The workflow may include permissions configuration to ensure it has the necessary access:

```yaml
permissions:
  contents: write  # Needed to push changes back to the repository
```

This gives the workflow permission to write to the repository contents, which is needed to commit and push the aggregated documentation.

## Customizing the Local Workflow

You can customize the local aggregation script to suit your needs:

### Adding More Components

To add more components to the aggregation process, update the `components` array in the script:

```javascript
const components = ['auth', 'log-server', 'web', 'mcp-client', 'new-component'];
```

### Changing Repository Paths

If your repositories are in different locations, update the paths in the script:

```javascript
const repoPath = path.join(__dirname, '../../custom-path', repoName);
```

### Adding More Documentation Types

To copy additional documentation types, add more copy operations to the script:

```javascript
// Copy custom documentation if it exists
const customSrc = path.join(repoPath, 'docs/custom.md');
const customDest = path.join(docsPath, 'custom.md');
if (fs.existsSync(customSrc)) {
  fs.copyFileSync(customSrc, customDest);
  console.log(`Copied custom documentation for ${component}`);
}
```

## Troubleshooting

### Common Issues

#### Missing Repositories

If you're missing some repositories, you'll see errors like:

```
Repository for component not found at /path/to/component
```

Make sure all repositories are cloned to the expected locations.

#### Script Errors

If the script fails with errors, check:

1. That all required Node.js modules are installed
2. That the paths in the script are correct
3. That the repository structure matches what the script expects

#### Sidebar Configuration Errors

If the sidebar configuration fails to update, check:

1. That the `update-sidebar.js` script exists and is working correctly
2. That the documentation files are in the expected locations
3. That the sidebar configuration file (`sidebars.ts`) is writable

## Conclusion

Running the NeuralLog documentation aggregation process locally allows you to preview changes before they're published. By understanding how the CI job accesses other repositories, you can also set up similar workflows for your own projects.

The key points to remember are:

1. Set up a directory structure that mirrors what the CI job uses
2. Create a script to aggregate documentation from component repositories
3. Use the Docusaurus development server to preview the aggregated documentation
4. Understand how CI jobs access multiple repositories using GitHub Actions

With this knowledge, you can effectively work with the NeuralLog documentation system locally and understand how it works in the CI environment.
