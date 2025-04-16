# Documentation Publishing Process

This guide explains how the NeuralLog documentation system works end-to-end, from aggregating documentation from component repositories to publishing the final documentation site to GitHub Pages.

## Overview

The NeuralLog documentation system follows a two-step process:

1. **Documentation Aggregation**: Documentation from component repositories is aggregated into the central documentation repository (`NeuralLog/docs`)
2. **Documentation Publishing**: The aggregated documentation is built and published to GitHub Pages

This approach ensures that component-specific documentation lives alongside the code while still providing a unified documentation site.

## Documentation Aggregation

### Aggregation Workflow

The documentation aggregation process is handled by a GitHub Action workflow defined in `.github/workflows/aggregate-docs.yml`. This workflow:

1. Runs on a schedule (daily at midnight) or can be triggered manually
2. Checks out the central documentation repository (`NeuralLog/docs`)
3. Checks out component repositories (auth, server, web, mcp-client)
4. Copies documentation from component repositories to the central repository
5. Updates the sidebar configuration to include the aggregated documentation
6. Commits and pushes the changes to the central repository

### Aggregation Process Details

The aggregation process follows these steps for each component:

1. Creates a directory for the component in `docs/components/`
2. Copies API documentation (`api.md`) from the component repository
3. Copies configuration documentation (`configuration.md`) from the component repository
4. Copies architecture documentation (`architecture.md`) from the component repository
5. Copies examples from the component repository
6. Extracts information from the component's README.md to create an overview page

For example, for the server component:

```bash
mkdir -p docs/docs/components/server

# Copy API documentation
cp server/docs/api.md docs/docs/components/server/api.md

# Copy configuration documentation
cp server/docs/configuration.md docs/docs/components/server/configuration.md

# Copy architecture documentation
cp server/docs/architecture.md docs/docs/components/server/architecture.md

# Copy storage adapters documentation
cp server/docs/storage-adapters.md docs/docs/components/server/storage-adapters.md

# Extract information from README for overview
node docs/scripts/extract-readme-info.js server/README.md docs/docs/components/server/overview.md "Server"
```

### Sidebar Configuration

After copying the documentation, the workflow updates the sidebar configuration to include the aggregated documentation:

```bash
node docs/scripts/update-sidebar.js
```

This script scans the `docs` directory and updates the `sidebars.ts` file to include all available documentation.

### Committing Changes

Finally, the workflow commits and pushes the changes to the central repository:

```bash
cd docs
git config --local user.email "github-actions[bot]@users.noreply.github.com"
git config --local user.name "github-actions[bot]"
git add docs
git diff --quiet && git diff --staged --quiet || git commit -m "docs: Update documentation from components and specs [skip ci]"
git push
```

The `[skip ci]` tag in the commit message prevents the deployment workflow from running twice.

## Documentation Publishing

### Publishing Workflow

The documentation publishing process is handled by a GitHub Action workflow defined in `.github/workflows/deploy.yml`. This workflow:

1. Runs when changes are pushed to the main branch of the central documentation repository
2. Checks out the repository
3. Installs dependencies
4. Builds the documentation site using Docusaurus
5. Deploys the built site to GitHub Pages

### Publishing Process Details

The publishing process follows these steps:

1. **Checkout**: Checks out the repository
   ```yaml
   - uses: actions/checkout@v3
   ```

2. **Setup Node.js**: Sets up Node.js for building the site
   ```yaml
   - uses: actions/setup-node@v3
     with:
       node-version: 18
       cache: npm
   ```

3. **Install Dependencies**: Installs the required dependencies
   ```yaml
   - name: Install dependencies
     run: npm ci
   ```

4. **Build Website**: Builds the documentation site using Docusaurus
   ```yaml
   - name: Build website
     run: npm run build
   ```

5. **Deploy to GitHub Pages**: Deploys the built site to GitHub Pages
   ```yaml
   - name: Deploy to GitHub Pages
     uses: peaceiris/actions-gh-pages@v3
     with:
       github_token: ${{ secrets.GITHUB_TOKEN }}
       publish_dir: ./build
       user_name: github-actions[bot]
       user_email: 41898282+github-actions[bot]@users.noreply.github.com
   ```

### GitHub Pages Configuration

The GitHub Pages configuration is defined in the `docusaurus.config.ts` file:

```typescript
const config: Config = {
  title: 'NeuralLog Docs',
  tagline: 'Comprehensive documentation for NeuralLog projects',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://neurallog.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'NeuralLog', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.

  // ...
};
```

This configuration tells Docusaurus to deploy the site to `https://neurallog.github.io/docs/`.

## Manual Publishing

You can also manually publish the documentation site:

### Using the Docusaurus CLI

```bash
# Build the site
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The `deploy` script is defined in `package.json`:

```json
{
  "scripts": {
    "deploy": "docusaurus deploy"
  }
}
```

This script builds the site and pushes it to the `gh-pages` branch of the repository.

### Using SSH

```bash
USE_SSH=true npm run deploy
```

### Using HTTPS

```bash
GIT_USER=<Your GitHub username> npm run deploy
```

## End-to-End Process

The complete end-to-end process for updating and publishing documentation is:

1. **Update Component Documentation**: Update documentation in component repositories
2. **Aggregate Documentation**: The aggregation workflow runs (automatically or manually) to pull documentation from component repositories
3. **Publish Documentation**: The publishing workflow runs automatically when changes are pushed to the central repository

## Triggering the Workflows Manually

### Triggering Aggregation Workflow

You can manually trigger the aggregation workflow from the GitHub Actions tab:

1. Go to the NeuralLog/docs repository on GitHub
2. Click on the "Actions" tab
3. Select the "Aggregate Documentation" workflow
4. Click "Run workflow"
5. Optionally specify which components to aggregate
6. Click "Run workflow" again

### Triggering Publishing Workflow

The publishing workflow runs automatically when changes are pushed to the main branch. However, you can also manually trigger it:

1. Go to the NeuralLog/docs repository on GitHub
2. Click on the "Actions" tab
3. Select the "Deploy to GitHub Pages" workflow
4. Click "Run workflow"
5. Select the branch to deploy from (usually `main`)
6. Click "Run workflow" again

## Troubleshooting

### Aggregation Issues

If documentation is not being aggregated correctly:

1. Check that the component repository has the expected documentation files
2. Check that the aggregation workflow is running successfully
3. Check the workflow logs for any errors
4. Try running the aggregation workflow manually

### Publishing Issues

If the documentation site is not being published correctly:

1. Check that the publishing workflow is running successfully
2. Check the workflow logs for any errors
3. Check the GitHub Pages settings in the repository settings
4. Try running the publishing workflow manually

### GitHub Pages Issues

If the GitHub Pages site is not working correctly:

1. Check that the `gh-pages` branch exists and contains the built site
2. Check the GitHub Pages settings in the repository settings
3. Check that the `docusaurus.config.ts` file has the correct GitHub Pages configuration
4. Try manually deploying the site using the Docusaurus CLI

## Best Practices

### Component Documentation

- Keep component documentation up-to-date with code changes
- Follow the standard structure for component documentation
- Use relative links to reference other documentation files
- Include code examples and diagrams where appropriate

### Central Documentation

- Avoid manually editing files in the `docs/components/` directory
- Update component documentation in the component repositories instead
- Use the aggregation workflow to pull in updated documentation
- Add cross-component documentation in the central repository

## Conclusion

The NeuralLog documentation system provides a way to maintain consistent documentation across all repositories while allowing component-specific documentation to live alongside the code. By understanding the aggregation and publishing processes, you can ensure that the documentation remains up-to-date and useful for users and developers.
