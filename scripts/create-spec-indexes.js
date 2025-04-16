/**
 * Script to create index files for specification sections
 * 
 * This script creates index files for the architecture, deployment, security, and API sections
 * based on the specification files that have been copied from the specs repository.
 */

const fs = require('fs');
const path = require('path');

// Paths to the documentation directories
const architecturePath = path.join(__dirname, '..', 'docs', 'architecture');
const deploymentPath = path.join(__dirname, '..', 'docs', 'deployment');
const securityPath = path.join(__dirname, '..', 'docs', 'security');
const apiPath = path.join(__dirname, '..', 'docs', 'api');

// Function to create an index file for a directory
function createIndexFile(dirPath, title, description) {
  // Get all markdown files in the directory
  const files = fs.readdirSync(dirPath)
    .filter(file => file.endsWith('.md') && file !== '_category_.json' && file !== 'index.md')
    .sort();

  // Create the index content
  let indexContent = `---
sidebar_position: 1
---

# ${title}

${description}

## Documentation

`;

  // Add links to each file
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract the title from the markdown file (first # heading)
    const titleMatch = fileContent.match(/^# (.*)/m);
    const fileTitle = titleMatch ? titleMatch[1] : path.basename(file, '.md');
    
    // Extract a brief description (first paragraph after the title)
    let descriptionMatch = fileContent.match(/^# .*\n\n(.*)/m);
    if (!descriptionMatch) {
      descriptionMatch = fileContent.match(/^## Overview\n\n(.*)/m);
    }
    const fileDescription = descriptionMatch 
      ? descriptionMatch[1].substring(0, 150) + (descriptionMatch[1].length > 150 ? '...' : '')
      : '';
    
    // Add the link to the index
    indexContent += `### [${fileTitle}](./${file.replace('.md', '')})\n\n`;
    if (fileDescription) {
      indexContent += `${fileDescription}\n\n`;
    }
  }

  // Write the index file
  fs.writeFileSync(path.join(dirPath, 'index.md'), indexContent);
  console.log(`Created index file for ${title}`);
}

// Create the index files
try {
  if (fs.existsSync(architecturePath)) {
    createIndexFile(
      architecturePath,
      'Architecture',
      'This section contains detailed specifications for the NeuralLog architecture, including core components, event-action model, tenant isolation, and storage.'
    );
  }

  if (fs.existsSync(deploymentPath)) {
    createIndexFile(
      deploymentPath,
      'Deployment',
      'This section contains detailed specifications for deploying NeuralLog, including Kubernetes deployment, monitoring, and scaling.'
    );
  }

  if (fs.existsSync(securityPath)) {
    createIndexFile(
      securityPath,
      'Security',
      'This section contains detailed specifications for NeuralLog security, including authentication, authorization, and data protection.'
    );
  }

  if (fs.existsSync(apiPath)) {
    createIndexFile(
      apiPath,
      'API Reference',
      'This section contains detailed specifications for NeuralLog APIs, including REST, WebSocket, and GraphQL APIs.'
    );
  }
} catch (error) {
  console.error('Error creating index files:', error);
  process.exit(1);
}
