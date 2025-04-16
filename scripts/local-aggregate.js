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
