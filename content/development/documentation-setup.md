# Documentation Setup Guide

This guide explains how to set up and run the NeuralLog documentation site locally for development and testing.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 16 or higher)
- [npm](https://www.npmjs.com/) (version 7 or higher)
- [Git](https://git-scm.com/)

## Setting Up the Documentation Site

### 1. Clone the Documentation Repository

First, clone the NeuralLog documentation repository:

```bash
# Create a directory for NeuralLog
mkdir NeuralLog
cd NeuralLog

# Clone the docs repository
git clone https://github.com/NeuralLog/docs.git docs
cd docs
```

### 2. Install Dependencies

Install the required dependencies:

```bash
npm install
```

### 3. Run the Development Server

Start the development server:

```bash
npm start
```

This will start a local development server at [http://localhost:3000/docs/](http://localhost:3000/docs/) and open it in your default browser. The site will automatically reload if you make changes to the content.

## Working with Documentation

### Directory Structure

The documentation site uses [Docusaurus](https://docusaurus.io/), and the content is organized as follows:

```
docs/
├── blog/                      # Blog posts
├── docs/                      # Documentation content
│   ├── architecture/          # Architecture documentation
│   ├── components/            # Component-specific documentation
│   ├── deployment/            # Deployment guides
│   ├── development/           # Development guides
│   ├── getting-started/       # Getting started guides
│   ├── overview/              # Overview documentation
│   ├── sdk/                   # SDK documentation
│   └── security/              # Security documentation
├── src/                       # React components and custom pages
├── static/                    # Static files (images, etc.)
├── docusaurus.config.ts       # Docusaurus configuration
└── sidebars.ts                # Sidebar configuration
```

### Adding New Documentation

To add new documentation:

1. Create a new Markdown file in the appropriate directory under `docs/`
2. Add frontmatter at the top of the file:

```markdown
---
sidebar_position: 1
---

# Title of the Document

Content goes here...
```

3. Update the sidebar configuration in `sidebars.ts` if needed (usually handled automatically by the `update-sidebar.js` script)

### Adding Images

To add images to your documentation:

1. Place the image files in the `static/img/` directory
2. Reference the images in your Markdown files:

```markdown
![Docusaurus logo](/img/docusaurus.png)
```

### Creating Blog Posts

To create a new blog post:

1. Create a new directory in the `blog/` directory with the date and title:

```
blog/2023-01-01-title-of-post/
```

2. Create an `index.md` file in the directory with frontmatter:

```markdown
---
slug: title-of-post
title: Title of the Post
authors: [author_name]
tags: [tag1, tag2]
---

Content of the blog post goes here...
```

## Aggregating Documentation from Components

The documentation site can aggregate documentation from other NeuralLog component repositories. This is typically done automatically by a GitHub Action, but you can also do it manually:

### 1. Clone Component Repositories

Clone the component repositories you want to aggregate documentation from:

```bash
# From the NeuralLog directory
git clone https://github.com/NeuralLog/server.git server
git clone https://github.com/NeuralLog/web.git web
git clone https://github.com/NeuralLog/auth.git auth
git clone https://github.com/NeuralLog/mcp-client.git mcp-client
```

### 2. Run the Aggregation Script

You can manually run the aggregation process by executing the steps in the GitHub Action workflow:

```bash
# From the docs directory
mkdir -p docs/components/server
mkdir -p docs/components/web
mkdir -p docs/components/auth
mkdir -p docs/components/mcp-client

# Copy documentation from server
cp ../server/docs/api.md docs/components/server/api.md
cp ../server/docs/configuration.md docs/components/server/configuration.md
cp ../server/docs/architecture.md docs/components/server/architecture.md
node scripts/extract-readme-info.js ../server/README.md docs/components/server/overview.md "Server"

# Copy documentation from web
cp ../web/docs/api.md docs/components/web/api.md
cp ../web/docs/architecture.md docs/components/web/architecture.md
node scripts/extract-readme-info.js ../web/README.md docs/components/web/overview.md "Web"

# Copy documentation from auth
cp ../auth/docs/api.md docs/components/auth/api.md
cp ../auth/docs/configuration.md docs/components/auth/configuration.md
node scripts/extract-readme-info.js ../auth/README.md docs/components/auth/overview.md "Auth"

# Copy documentation from mcp-client
cp ../mcp-client/docs/api.md docs/components/mcp-client/api.md
node scripts/extract-readme-info.js ../mcp-client/README.md docs/components/mcp-client/overview.md "MCP Client"

# Update sidebar configuration
node scripts/update-sidebar.js
```

## Building for Production

To build the documentation site for production:

```bash
npm run build
```

This will generate static content in the `build` directory that can be served by any static hosting service.

To test the production build locally:

```bash
npm run serve
```

This will start a local server at [http://localhost:3000/docs/](http://localhost:3000/docs/) serving the production build.

## Customizing the Documentation Site

### Changing the Theme

You can customize the theme by editing the following files:

- `src/css/custom.css`: Custom CSS
- `docusaurus.config.ts`: Docusaurus configuration, including theme settings

### Adding Custom Pages

To add custom pages:

1. Create a new React component in the `src/pages/` directory
2. The component will be automatically available at the corresponding URL path

### Customizing the Navbar and Footer

You can customize the navbar and footer by editing the `docusaurus.config.ts` file:

```typescript
// docusaurus.config.ts
export default {
  // ...
  themeConfig: {
    navbar: {
      title: 'NeuralLog Docs',
      logo: {
        alt: 'NeuralLog Logo',
        src: 'img/logo.svg',
      },
      items: [
        // Navbar items
      ],
    },
    footer: {
      style: 'dark',
      links: [
        // Footer links
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NeuralLog`,
    },
  },
};
```

## Troubleshooting

### Common Issues

#### Installation Errors

If you encounter errors during installation:

```bash
# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

#### Build Errors

If you encounter errors during build:

```bash
# Check for TypeScript errors
npm run typecheck

# Clear build directory and try again
rm -rf build
npm run build
```

#### Sidebar Not Updating

If the sidebar is not updating:

```bash
# Run the update-sidebar script manually
node scripts/update-sidebar.js
```

#### Images Not Displaying

If images are not displaying:

1. Check that the image path is correct
2. Make sure the image file exists in the `static/img/` directory
3. Use the correct URL path: `/docs/img/example.png`

## Deployment

The documentation site is automatically deployed to GitHub Pages when changes are pushed to the main branch. You can also deploy it manually:

```bash
# Build the site
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Additional Resources

- [Docusaurus Documentation](https://docusaurus.io/docs)
- [Markdown Guide](https://www.markdownguide.org/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

## Conclusion

You now have a local setup of the NeuralLog documentation site and can contribute to its development. If you have any questions or issues, please refer to the troubleshooting section or contact the NeuralLog team.
