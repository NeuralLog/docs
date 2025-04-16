# NeuralLog Documentation Scripts

This directory contains scripts for managing NeuralLog documentation.

## fix-docs

The `fix-docs` script standardizes documentation across all NeuralLog repositories. It creates missing documentation files based on templates and offers to update existing files.

### Usage

#### Windows (PowerShell)

```powershell
.\fix-docs.ps1 [repository-path] [options]
```

#### Windows (Command Prompt)

```cmd
fix-docs.bat [repository-path] [options]
```

#### Unix/Linux/macOS

```bash
./fix-docs.js [repository-path] [options]
```

### Options

- `--dry-run`: Show what would change without making changes
- `--create-only`: Only create missing files, don't modify existing ones
- `--backup`: Create backups of existing files before modifying them
- `--force`: Overwrite existing files that differ from templates

### Behavior

By default, the script:
- Creates missing documentation files
- Updates files that are identical to the template but with different placeholders
- Skips files that differ from the template and notes that manual merging is required

The `--force` option will overwrite files that differ from the template, so use it with caution.

If no repository path is provided, it will use the current directory.

### Examples

```bash
# Fix documentation in the current repository (interactive mode)
./fix-docs.js

# Fix documentation in a specific repository
./fix-docs.js ../auth

# Show what would change without making changes
./fix-docs.js --dry-run

# Only create missing files, don't modify existing ones
./fix-docs.js --create-only

# Create backups of existing files before modifying them
./fix-docs.js --backup

# Overwrite existing files without prompting
./fix-docs.js --force

# Combine options
./fix-docs.js ../auth --backup --force
```

## update-sidebar

The `update-sidebar.js` script updates the sidebar configuration in the central documentation repository based on the available documentation.

### Usage

```bash
node update-sidebar.js
```

This script is automatically called by the `fix-docs` script when run from the central documentation repository.
