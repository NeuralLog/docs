/**
 * Script to extract information from a component's README.md and create an overview page
 * 
 * Usage: node extract-readme-info.js <input-readme> <output-overview> <component-name>
 * 
 * Example: node extract-readme-info.js auth/README.md docs/components/auth/overview.md "Auth"
 */

const fs = require('fs');
const path = require('path');

// Get command line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3];
const componentName = process.argv[4];

if (!inputFile || !outputFile || !componentName) {
  console.error('Usage: node extract-readme-info.js <input-readme> <output-overview> <component-name>');
  process.exit(1);
}

// Read the README file
let readmeContent;
try {
  readmeContent = fs.readFileSync(inputFile, 'utf8');
} catch (error) {
  console.error(`Error reading file ${inputFile}:`, error);
  process.exit(1);
}

// Extract sections from README
const extractSection = (content, sectionName) => {
  const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=## |$)`, 'i');
  const match = content.match(regex);
  return match ? match[1].trim() : '';
};

// Extract overview, features, and quick start sections
const overview = extractSection(readmeContent, 'Overview');
const features = extractSection(readmeContent, 'Features');
const quickStart = extractSection(readmeContent, 'Quick Start');

// Create the overview content
const overviewContent = `---
sidebar_position: 1
---

# ${componentName} Overview

${overview}

## Features

${features}

## Quick Start

${quickStart}

## Documentation

For detailed documentation, see:

- [API Reference](./api.md)
- [Configuration](./configuration.md)
- [Architecture](./architecture.md)
- [Examples](./examples)

For the source code and component-specific documentation, visit the [NeuralLog ${componentName} Repository](https://github.com/NeuralLog/${componentName.toLowerCase()}).
`;

// Ensure the directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write the overview file
try {
  fs.writeFileSync(outputFile, overviewContent);
  console.log(`Successfully created ${outputFile}`);
} catch (error) {
  console.error(`Error writing file ${outputFile}:`, error);
  process.exit(1);
}
