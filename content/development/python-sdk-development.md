# Python SDK Development

This guide provides information for developers working on the NeuralLog Python SDK.

## Development Environment

### Prerequisites

- Python 3.8 or later
- pip
- Git

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/NeuralLog/python-sdk.git
   cd python-sdk
   ```

2. Install the package in development mode:
   ```bash
   pip install -e .
   ```

3. Run the tests:
   ```bash
   python -m unittest discover tests
   ```

## Project Structure

- **neurallog_sdk**: The main SDK package
  - **models**: Data models used by the SDK
  - **http**: HTTP client implementation
  - **adapters**: Adapters for popular Python logging frameworks
- **tests**: Unit tests for the SDK

## PyPI Packaging

The Python SDK is set up for automatic PyPI package publishing using GitHub Actions. The package configuration is defined in the `setup.py` file:

```python
setup(
    name="neurallog-sdk",
    version="1.0.0",
    author="NeuralLog Team",
    author_email="info@neurallog.com",
    description="Python SDK for NeuralLog - A logging system for AI applications",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/NeuralLog/python-sdk",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "requests>=2.25.0",
    ],
)
```

### Publishing Process

The PyPI package is published automatically when a new release is created on GitHub. The publishing process is defined in the `.github/workflows/publish.yml` file:

1. A new release is created on GitHub
2. The GitHub Actions workflow is triggered
3. The workflow builds, tests, and packages the SDK
4. The package is published to PyPI

### Setting Up PyPI API Credentials

To enable automatic PyPI package publishing, you need to add PyPI credentials as secrets in the GitHub repository settings:

1. Create a PyPI account at [pypi.org](https://pypi.org/)
2. Generate an API token in your PyPI account settings
3. Go to the GitHub repository settings at https://github.com/NeuralLog/python-sdk/settings/secrets/actions
4. Add two new repository secrets:
   - `PYPI_USERNAME`: Your PyPI username or `__token__` if using an API token
   - `PYPI_PASSWORD`: Your PyPI password or the API token value
5. Click "Add secret" for each

### Manual Publishing

You can also publish the PyPI package manually:

1. Build the package:
   ```bash
   python -m build
   ```

2. Publish the package:
   ```bash
   python -m twine upload dist/*
   ```

## Versioning

The SDK follows [Semantic Versioning](https://semver.org/):

- **Major version**: Incompatible API changes
- **Minor version**: Backwards-compatible functionality additions
- **Patch version**: Backwards-compatible bug fixes

To update the version:

1. Update the `version` parameter in the `setup.py` file
2. Update the `__version__` variable in the `neurallog_sdk/__init__.py` file
3. Create a new release on GitHub with the same version number

## Framework Adapters

The SDK is designed to support adapters for popular Python logging frameworks. When implementing a new adapter:

1. Create a new module in the `neurallog_sdk/adapters` directory
2. Implement the adapter using the appropriate interfaces from the logging framework
3. Add unit tests for the adapter
4. Update the documentation to include the new adapter

## Documentation

The SDK documentation is maintained in the [NeuralLog/docs](https://github.com/NeuralLog/docs) repository. When making changes to the SDK, make sure to update the documentation as well:

1. Update the Python SDK documentation at `docs/components/python-sdk.md`
2. Update this development guide if necessary
3. Create or update any additional documentation pages as needed

## Continuous Integration

The SDK uses GitHub Actions for continuous integration. The CI workflow is defined in the `.github/workflows/ci.yml` file and runs on every push to the main branch and on pull requests.

The CI workflow:
1. Builds the SDK
2. Runs the tests on multiple Python versions (3.8, 3.9, 3.10, 3.11)
3. Reports the results

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add or update tests
5. Update documentation
6. Submit a pull request

## License

The SDK is licensed under the MIT License.
