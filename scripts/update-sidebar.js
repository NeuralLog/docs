/**
 * Script to update the sidebar configuration based on available documentation
 *
 * This script scans the docs directory and updates the sidebar.ts file
 * to include all available documentation.
 */

const fs = require('fs');
const path = require('path');

// Paths to the docs directories
const componentsDir = path.join(__dirname, '..', 'docs', 'components');
const architectureDir = path.join(__dirname, '..', 'docs', 'architecture');
const deploymentDir = path.join(__dirname, '..', 'docs', 'deployment');
const securityDir = path.join(__dirname, '..', 'docs', 'security');
const apiDir = path.join(__dirname, '..', 'docs', 'api');

// Path to the sidebar configuration file
const sidebarFile = path.join(__dirname, '..', 'sidebars.ts');

// Read the sidebar configuration file
let sidebarContent;
try {
  sidebarContent = fs.readFileSync(sidebarFile, 'utf8');
} catch (error) {
  console.error(`Error reading sidebar file ${sidebarFile}:`, error);
  process.exit(1);
}

// Function to generate sidebar items for a directory
function generateSidebarItems(dirPath, basePathSegment) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  // Get all markdown files in the directory
  const files = fs.readdirSync(dirPath, { withFileTypes: true });

  // Process regular files
  const fileItems = files
    .filter(dirent => !dirent.isDirectory() && dirent.name.endsWith('.md') && dirent.name !== '_category_.json')
    .map(dirent => {
      const fileName = dirent.name.replace('.md', '');
      return `${basePathSegment}/${fileName}`;
    })
    .sort();

  // Process subdirectories
  const subdirItems = files
    .filter(dirent => dirent.isDirectory())
    .map(dirent => {
      const subdirName = dirent.name;
      const subdirPath = path.join(dirPath, subdirName);
      const subdirFiles = fs.readdirSync(subdirPath)
        .filter(file => file.endsWith('.md') && file !== '_category_.json')
        .map(file => `${basePathSegment}/${subdirName}/${file.replace('.md', '')}`)
        .sort();

      if (subdirFiles.length === 0) {
        return null;
      }

      return {
        type: 'category',
        label: subdirName.charAt(0).toUpperCase() + subdirName.slice(1),
        items: subdirFiles
      };
    })
    .filter(item => item !== null);

  return [...fileItems, ...subdirItems];
}

// Generate component sidebar items
let componentSidebarItems = [];
if (fs.existsSync(componentsDir)) {
  // Get all component directories
  const components = fs.readdirSync(componentsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  // Generate sidebar items for each component
  componentSidebarItems = components.map(component => {
    const componentDir = path.join(componentsDir, component);

    // Check for available documentation files
    const hasApi = fs.existsSync(path.join(componentDir, 'api.md'));
    const hasConfiguration = fs.existsSync(path.join(componentDir, 'configuration.md'));
    const hasArchitecture = fs.existsSync(path.join(componentDir, 'architecture.md'));
    const hasStorageAdapters = fs.existsSync(path.join(componentDir, 'storage-adapters.md'));
    const hasExamples = fs.existsSync(path.join(componentDir, 'examples'));

    // Generate examples items if examples directory exists
    let examplesItems = [];
    if (hasExamples) {
      const examplesDir = path.join(componentDir, 'examples');
      examplesItems = fs.readdirSync(examplesDir)
        .filter(file => file.endsWith('.md'))
        .map(file => `components/${component}/examples/${file.replace('.md', '')}`);
    }

    // Generate component sidebar item
    const items = [`components/${component}/overview`];
    if (hasApi) items.push(`components/${component}/api`);
    if (hasConfiguration) items.push(`components/${component}/configuration`);
    if (hasArchitecture) items.push(`components/${component}/architecture`);
    if (hasStorageAdapters) items.push(`components/${component}/storage-adapters`);
    if (examplesItems.length > 0) {
      items.push({
        type: 'category',
        label: 'Examples',
        items: examplesItems
      });
    }

    return {
      type: 'category',
      label: component.charAt(0).toUpperCase() + component.slice(1),
      items
    };
  });
}

// Generate architecture sidebar items
const architectureSidebarItems = generateSidebarItems(architectureDir, 'architecture');

// Generate deployment sidebar items
const deploymentSidebarItems = generateSidebarItems(deploymentDir, 'deployment');

// Generate security sidebar items
const securitySidebarItems = generateSidebarItems(securityDir, 'security');

// Generate API sidebar items
const apiSidebarItems = generateSidebarItems(apiDir, 'api');

// Generate the updated sidebar content
let updatedSidebarContent = sidebarContent;

// Update components section
if (componentSidebarItems.length > 0) {
  const componentsSidebarSection = `{
      type: 'category',
      label: 'Components',
      items: ${JSON.stringify(componentSidebarItems, null, 6).replace(/"/g, "'")},
    },`;

  updatedSidebarContent = updatedSidebarContent.replace(
    /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'Components',[\s\n]*items:[\s\n]*\[[\s\S]*?\],[\s\n]*},)/,
    componentsSidebarSection
  );
}

// Update architecture section
if (architectureSidebarItems.length > 0) {
  const architectureSidebarSection = `{
      type: 'category',
      label: 'Architecture',
      items: ${JSON.stringify(architectureSidebarItems, null, 6).replace(/"/g, "'")},
    },`;

  // Check if architecture section already exists
  if (updatedSidebarContent.includes("label: 'Architecture'")) {
    updatedSidebarContent = updatedSidebarContent.replace(
      /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'Architecture',[\s\n]*items:[\s\n]*\[[\s\S]*?\],[\s\n]*},)/,
      architectureSidebarSection
    );
  } else {
    // Add architecture section after components section
    updatedSidebarContent = updatedSidebarContent.replace(
      /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'Components',[\s\n]*items:[\s\S]*?},)/,
      `$1\n    ${architectureSidebarSection}`
    );
  }
}

// Update deployment section
if (deploymentSidebarItems.length > 0) {
  const deploymentSidebarSection = `{
      type: 'category',
      label: 'Deployment',
      items: ${JSON.stringify(deploymentSidebarItems, null, 6).replace(/"/g, "'")},
    },`;

  // Check if deployment section already exists
  if (updatedSidebarContent.includes("label: 'Deployment'")) {
    updatedSidebarContent = updatedSidebarContent.replace(
      /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'Deployment',[\s\n]*items:[\s\n]*\[[\s\S]*?\],[\s\n]*},)/,
      deploymentSidebarSection
    );
  } else {
    // Add deployment section after architecture section
    updatedSidebarContent = updatedSidebarContent.replace(
      /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'Architecture',[\s\S]*?},)/,
      `$1\n    ${deploymentSidebarSection}`
    );
  }
}

// Update security section
if (securitySidebarItems.length > 0) {
  const securitySidebarSection = `{
      type: 'category',
      label: 'Security',
      items: ${JSON.stringify(securitySidebarItems, null, 6).replace(/"/g, "'")},
    },`;

  // Check if security section already exists
  if (updatedSidebarContent.includes("label: 'Security'")) {
    updatedSidebarContent = updatedSidebarContent.replace(
      /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'Security',[\s\n]*items:[\s\n]*\[[\s\S]*?\],[\s\n]*},)/,
      securitySidebarSection
    );
  } else {
    // Add security section after deployment section
    updatedSidebarContent = updatedSidebarContent.replace(
      /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'Deployment',[\s\S]*?},)/,
      `$1\n    ${securitySidebarSection}`
    );
  }
}

// Update API section
if (apiSidebarItems.length > 0) {
  const apiSidebarSection = `{
      type: 'category',
      label: 'API Reference',
      items: ${JSON.stringify(apiSidebarItems, null, 6).replace(/"/g, "'")},
    },`;

  // Check if API section already exists
  if (updatedSidebarContent.includes("label: 'API Reference'")) {
    updatedSidebarContent = updatedSidebarContent.replace(
      /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'API Reference',[\s\n]*items:[\s\n]*\[[\s\S]*?\],[\s\n]*},)/,
      apiSidebarSection
    );
  } else {
    // Add API section after security section
    updatedSidebarContent = updatedSidebarContent.replace(
      /({[\s\n]*type:[\s\n]*'category',[\s\n]*label:[\s\n]*'Security',[\s\S]*?},)/,
      `$1\n    ${apiSidebarSection}`
    );
  }
}

// Write the updated sidebar configuration
try {
  fs.writeFileSync(sidebarFile, updatedSidebarContent);
  console.log(`Successfully updated sidebar configuration in ${sidebarFile}`);
} catch (error) {
  console.error(`Error writing sidebar file ${sidebarFile}:`, error);
  process.exit(1);
}
