#!/usr/bin/env node

/**
 * fix-docs.js
 *
 * This script standardizes documentation across all NeuralLog repositories.
 * It creates missing documentation files based on templates and offers to update existing files.
 *
 * Usage:
 *   node fix-docs.js [repository-path] [options]
 *
 * Options:
 *   --dry-run       Show what would change without making changes
 *   --create-only   Only create missing files, don't modify existing ones
 *   --backup        Create backups of existing files before modifying them
 *   --force         Overwrite existing files without prompting
 *
 * If no repository path is provided, it will use the current directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  dryRun: args.includes('--dry-run'),
  createOnly: args.includes('--create-only'),
  backup: args.includes('--backup'),
  force: args.includes('--force')
};

// Remove options from args
const repoPath = args.filter(arg => !arg.startsWith('--'))[0] || process.cwd();
const repoName = path.basename(repoPath);

// Create readline interface for user prompts
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for confirmation
function confirm(question) {
  return new Promise((resolve) => {
    rl.question(`${question} (y/n) `, (answer) => {
      resolve(answer.toLowerCase() === 'y');
    });
  });
}

// Configuration
const TEMPLATES_DIR = path.join(__dirname, '..', 'templates', 'component-docs-template');
const DEFAULT_FILES = [
  'README.md',
  'CONTRIBUTING.md',
  'docs/api.md',
  'docs/architecture.md',
  'docs/configuration.md',
  'docs/development.md',
  'docs/examples/basic-usage.md'
];

console.log(`Fixing documentation for repository: ${repoName} at ${repoPath}`);
console.log(`Options: ${JSON.stringify(options, null, 2)}`);

if (options.dryRun) {
  console.log('DRY RUN: No files will be modified');
}

// Ensure the repository exists
if (!fs.existsSync(repoPath)) {
  console.error(`Repository path does not exist: ${repoPath}`);
  process.exit(1);
}

// Get repository information
let packageJson = {};
try {
  const packageJsonPath = path.join(repoPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  }
} catch (error) {
  console.warn(`Warning: Could not read package.json: ${error.message}`);
}

// Extract component name from package.json or use repository name
const componentName = packageJson.name ?
  packageJson.name.replace('@neurallog/', '') :
  repoName;

// Create docs directory if it doesn't exist
const docsDir = path.join(repoPath, 'docs');
if (!fs.existsSync(docsDir) && !options.dryRun) {
  console.log(`Creating docs directory: ${docsDir}`);
  fs.mkdirSync(docsDir);
}

// Create examples directory if it doesn't exist
const examplesDir = path.join(docsDir, 'examples');
if (!fs.existsSync(examplesDir) && !options.dryRun) {
  console.log(`Creating examples directory: ${examplesDir}`);
  fs.mkdirSync(examplesDir, { recursive: true });
}

// Function to replace placeholders in a template
function replacePlaceholders(content, componentName, repoName) {
  return content
    .replace(/\[Component Name\]/g, componentName.charAt(0).toUpperCase() + componentName.slice(1))
    .replace(/\[component-name\]/g, componentName.toLowerCase())
    .replace(/\[repo-name\]/g, repoName.toLowerCase());
}

// Function to create a backup of a file
function backupFile(filePath) {
  const backupPath = `${filePath}.bak`;
  if (fs.existsSync(filePath)) {
    console.log(`Creating backup: ${backupPath}`);
    if (!options.dryRun) {
      fs.copyFileSync(filePath, backupPath);
    }
  }
}

// Function to process a template file
async function processTemplateFile(templateFile, targetFile) {
  const templatePath = path.join(TEMPLATES_DIR, templateFile);
  const targetPath = path.join(repoPath, targetFile);

  // Skip if template doesn't exist
  if (!fs.existsSync(templatePath)) {
    console.warn(`Warning: Template file does not exist: ${templatePath}`);
    return;
  }

  // Create target directory if it doesn't exist
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir) && !options.dryRun) {
    console.log(`Creating directory: ${targetDir}`);
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Read template content
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders
  const processedContent = replacePlaceholders(templateContent, componentName, repoName);

  // Check if target file exists
  if (fs.existsSync(targetPath)) {
    if (options.createOnly) {
      console.log(`Skipping existing file: ${targetFile}`);
      return;
    }

    const existingContent = fs.readFileSync(targetPath, 'utf8');

    // Skip if content is identical
    if (existingContent === processedContent) {
      console.log(`File already up to date: ${targetFile}`);
      return;
    }

    // By default, skip files that differ and note that manual merging is needed
    if (!options.force) {
      console.log(`File exists and differs: ${targetFile}`);
      console.log(`MANUAL MERGE REQUIRED: Please manually merge changes into ${targetFile}`);
      return;
    }

    if (options.backup && !options.dryRun) {
      backupFile(targetPath);
    }

    console.log(`Updating file: ${targetFile}`);
    if (!options.dryRun) {
      fs.writeFileSync(targetPath, processedContent);
    }
  } else {
    console.log(`Creating file: ${targetFile}`);
    if (!options.dryRun) {
      fs.writeFileSync(targetPath, processedContent);
    }
  }
}

// Extract information from README.md for documentation
function extractSectionFromReadme(sectionName) {
  const readmePath = path.join(repoPath, 'README.md');
  if (!fs.existsSync(readmePath)) {
    return '';
  }

  const readmeContent = fs.readFileSync(readmePath, 'utf8');
  const regex = new RegExp(`## ${sectionName}\\s*([\\s\\S]*?)(?=## |$)`, 'i');
  const match = readmeContent.match(regex);
  return match ? match[1].trim() : '';
}

// Main function to process all files
async function main() {
  try {
    // Process all template files
    for (const file of DEFAULT_FILES) {
      await processTemplateFile(file, file);
    }

    // Update sidebar.ts in the docs repository if this script is run from there
    const sidebarPath = path.join(__dirname, '..', 'sidebars.ts');
    if (fs.existsSync(sidebarPath) && !options.dryRun) {
      console.log('Updating sidebar configuration...');

      // Run the update-sidebar.js script if it exists
      const updateSidebarScript = path.join(__dirname, 'update-sidebar.js');
      if (fs.existsSync(updateSidebarScript)) {
        try {
          execSync(`node ${updateSidebarScript}`, { stdio: 'inherit' });
        } catch (error) {
          console.error(`Error updating sidebar: ${error.message}`);
        }
      }
    }

    console.log('Documentation standardization complete!');
  } finally {
    rl.close();
  }
}

// Run the main function
main().catch(error => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
