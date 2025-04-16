---
sidebar_position: 2
---

# Repository Management

Since NeuralLog is not a monorepo, managing the various repositories requires some additional tooling and processes. This guide explains how to effectively manage the NeuralLog repositories.

## Repository Structure

NeuralLog consists of the following repositories:

- **server**: The logs server implementation
- **web**: The web application frontend
- **auth**: The authentication and authorization service
- **shared**: Common types and utilities
- **specs**: Project specifications and GitHub issues
- **docs**: Project documentation
- **infra**: Infrastructure configuration
- **SDKs**: Client libraries for various programming languages:
  - **typescript-sdk**: TypeScript/JavaScript SDK
  - **java-sdk**: Java SDK
  - **csharp-sdk**: C# SDK
  - **python-sdk**: Python SDK
  - **go-sdk**: Go SDK

## Repository Setup

### Initial Setup

```powershell
# Create a directory for NeuralLog
mkdir NeuralLog
cd NeuralLog

# Clone the repositories
git clone https://github.com/NeuralLog/server.git server
git clone https://github.com/NeuralLog/web.git web
git clone https://github.com/NeuralLog/auth.git auth
git clone https://github.com/NeuralLog/shared.git shared
git clone https://github.com/NeuralLog/specs.git specs
git clone https://github.com/NeuralLog/docs.git docs
git clone https://github.com/NeuralLog/infra.git infra

# Clone SDK repositories
git clone https://github.com/NeuralLog/typescript-sdk.git typescript-sdk
git clone https://github.com/NeuralLog/java-sdk.git java-sdk
git clone https://github.com/NeuralLog/csharp-sdk.git csharp-sdk
git clone https://github.com/NeuralLog/python-sdk.git python-sdk
git clone https://github.com/NeuralLog/go-sdk.git go-sdk
```

### Branch Management

All repositories should use `main` as the default branch. For feature development, use feature branches:

```powershell
# Create a feature branch
cd server
git checkout -b feature/new-feature
```

## Shared Package Management

The `shared` repository contains common types and utilities used by other repositories. When making changes to the shared package:

1. Update the code in the `shared` repository
2. Build and publish the package to the private registry
3. Update the package in the dependent repositories

```powershell
# Update the shared package
cd shared
git checkout -b feature/new-types
# Make changes...
git add .
git commit -m "Add new types"
git push origin feature/new-types

# Build and publish
npm version patch
npm run build
npm publish --registry http://localhost:4873

# Update in dependent repositories
cd ../server
npm install @neurallog/shared@latest --registry http://localhost:4873
```

## Automation Scripts

To simplify repository management, you can create automation scripts:

### Repository Status Script

```powershell
# repo-status.ps1
$repos = @("server", "web", "auth", "shared", "specs", "docs", "infra", "typescript-sdk", "java-sdk", "csharp-sdk", "python-sdk", "go-sdk")

foreach ($repo in $repos) {
    Write-Host "Repository: $repo" -ForegroundColor Green
    Push-Location -Path $repo
    git status
    Pop-Location
    Write-Host ""
}
```

### Pull All Script

```powershell
# pull-all.ps1
$repos = @("server", "web", "auth", "shared", "specs", "docs", "infra", "typescript-sdk", "java-sdk", "csharp-sdk", "python-sdk", "go-sdk")

foreach ($repo in $repos) {
    Write-Host "Pulling $repo..." -ForegroundColor Green
    Push-Location -Path $repo
    git pull
    Pop-Location
    Write-Host ""
}
```

### Push All Script

```powershell
# push-all.ps1
param (
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

$repos = @("server", "web", "auth", "shared", "specs", "docs", "infra", "typescript-sdk", "java-sdk", "csharp-sdk", "python-sdk", "go-sdk")

foreach ($repo in $repos) {
    Write-Host "Pushing $repo..." -ForegroundColor Green
    Push-Location -Path $repo
    git add .
    git commit -m $CommitMessage
    git push
    Pop-Location
    Write-Host ""
}
```

## GitHub Issues Management

GitHub issues are managed in the `specs` repository. To work with issues:

```powershell
# Install GitHub CLI
winget install GitHub.cli

# Authenticate
gh auth login

# List issues
cd specs
gh issue list

# Create an issue
gh issue create --title "New feature" --body "Description of the feature"

# Close an issue
gh issue close 123
```

## Documentation Management

The documentation is managed in the `docs` repository using Docusaurus. To work with documentation:

```powershell
# Run the documentation site locally
cd docs
npm install
npm start
```

To deploy the documentation to GitHub Pages:

```powershell
npm run build
npm run deploy
```

## Versioning Strategy

NeuralLog uses semantic versioning for all components:

- **Major version**: Incompatible API changes
- **Minor version**: New features in a backward-compatible manner
- **Patch version**: Backward-compatible bug fixes

When releasing a new version:

1. Update the version in the `package.json` file
2. Create a git tag for the version
3. Push the tag to the repository

```powershell
# Update version
npm version minor

# Push with tags
git push --follow-tags
```

## Continuous Integration

Set up GitHub Actions for continuous integration in each repository:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '22'
    - name: Install dependencies
      run: npm ci
    - name: Build
      run: npm run build
    - name: Test
      run: npm test
```

## Release Process

When releasing a new version of NeuralLog:

1. Update and publish the shared package
2. Update the dependent repositories
3. Test the integration
4. Create release tags in all repositories
5. Update the documentation

```powershell
# Update shared package
cd shared
npm version minor
npm run build
npm publish --registry http://localhost:4873

# Update server
cd ../server
npm install @neurallog/shared@latest --registry http://localhost:4873
npm version minor
git add .
git commit -m "Update to shared package v1.1.0"
git tag v1.1.0
git push --follow-tags

# Repeat for other repositories...
```

## SDK Management

Each SDK has its own repository and release cycle. When updating an SDK:

1. Make the necessary changes
2. Update the version
3. Build and test
4. Create a release tag
5. Update the documentation

```powershell
# Update TypeScript SDK
cd typescript-sdk
npm version minor
npm run build
npm test
git tag v1.1.0
git push --follow-tags

# Update Java SDK
cd ../java-sdk
# Update version in pom.xml
mvn clean install
git add .
git commit -m "Release v1.1.0"
git tag v1.1.0
git push --follow-tags

# Update C# SDK
cd ../csharp-sdk
# Update version in .csproj file
dotnet build
dotnet test
git add .
git commit -m "Release v1.1.0"
git tag v1.1.0
git push --follow-tags

# Update Python SDK
cd ../python-sdk
# Update version in setup.py
python -m build
python -m pytest
git add .
git commit -m "Release v1.1.0"
git tag v1.1.0
git push --follow-tags

# Update Go SDK
cd ../go-sdk
# Update version in go.mod
go test ./...
git add .
git commit -m "Release v1.1.0"
git tag v1.1.0
git push --follow-tags
```

## Troubleshooting

### Git Issues

If you encounter git issues:

```powershell
# Check git configuration
git config --list

# Reset local changes
git reset --hard HEAD

# Clean untracked files
git clean -fd
```

### Package Issues

If you encounter issues with the shared package:

```powershell
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm ci

# Check package versions
npm list @neurallog/shared
```

### Docker Issues

If you encounter Docker issues:

```powershell
# Check Docker containers
docker ps -a

# Check Docker networks
docker network ls

# Check Docker volumes
docker volume ls
```
