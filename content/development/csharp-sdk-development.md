# C# SDK Development

This guide provides information for developers working on the NeuralLog C# SDK.

## Development Environment

### Prerequisites

- .NET 9.0 SDK or later
- Visual Studio 2022 or later, Visual Studio Code, or JetBrains Rider
- Git

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/NeuralLog/csharp-sdk.git
   cd csharp-sdk
   ```

2. Build the solution:
   ```bash
   dotnet build
   ```

3. Run the tests:
   ```bash
   dotnet test
   ```

## Project Structure

- **src/NeuralLog.SDK**: The main SDK project
  - **Models**: Data models used by the SDK
  - **Http**: HTTP client implementation
- **tests/NeuralLog.SDK.Tests**: Unit tests for the SDK

## NuGet Packaging

The C# SDK is set up for automatic NuGet package publishing using GitHub Actions. The package configuration is defined in the `NeuralLog.SDK.csproj` file:

```xml
<PropertyGroup>
  <Version>1.0.0</Version>
  <Authors>NeuralLog Team</Authors>
  <Company>NeuralLog</Company>
  <Description>C# SDK for NeuralLog - A logging system for AI applications</Description>
  <PackageLicenseExpression>MIT</PackageLicenseExpression>
  <PackageProjectUrl>https://github.com/NeuralLog/csharp-sdk</PackageProjectUrl>
  <RepositoryUrl>https://github.com/NeuralLog/csharp-sdk</RepositoryUrl>
  <RepositoryType>git</RepositoryType>
  <PackageTags>logging;ai;sdk;neurallog</PackageTags>
  <PackageReadmeFile>README.md</PackageReadmeFile>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <GeneratePackageOnBuild>true</GeneratePackageOnBuild>
</PropertyGroup>
```

### Publishing Process

The NuGet package is published automatically when a new release is created on GitHub. The publishing process is defined in the `.github/workflows/publish.yml` file:

1. A new release is created on GitHub
2. The GitHub Actions workflow is triggered
3. The workflow builds, tests, and packages the SDK
4. The package is published to the NuGet Gallery

### Setting Up NuGet API Key

To enable automatic NuGet package publishing, you need to add a NuGet API key as a secret in the GitHub repository settings:

1. Generate a NuGet API key from [nuget.org](https://www.nuget.org/)
2. Go to the GitHub repository settings at https://github.com/NeuralLog/csharp-sdk/settings/secrets/actions
3. Add a new repository secret with the name `NUGET_API_KEY`
4. Paste your NuGet API key as the value
5. Click "Add secret"

### Manual Publishing

You can also publish the NuGet package manually:

1. Build the package:
   ```bash
   dotnet pack src/NeuralLog.SDK/NeuralLog.SDK.csproj --configuration Release
   ```

2. Publish the package:
   ```bash
   dotnet nuget push src/NeuralLog.SDK/bin/Release/NeuralLog.SDK.1.0.0.nupkg --api-key YOUR_API_KEY --source https://api.nuget.org/v3/index.json
   ```

## Versioning

The SDK follows [Semantic Versioning](https://semver.org/):

- **Major version**: Incompatible API changes
- **Minor version**: Backwards-compatible functionality additions
- **Patch version**: Backwards-compatible bug fixes

To update the version:

1. Update the `Version` property in the `NeuralLog.SDK.csproj` file
2. Create a new release on GitHub with the same version number

## Framework Adapters

The SDK is designed to support adapters for popular .NET logging frameworks. When implementing a new adapter:

1. Create a new project for the adapter (e.g., `NeuralLog.SDK.Extensions.Logging`)
2. Implement the adapter using the appropriate interfaces from the logging framework
3. Add unit tests for the adapter
4. Update the documentation to include the new adapter

## Documentation

The SDK documentation is maintained in the [NeuralLog/docs](https://github.com/NeuralLog/docs) repository. When making changes to the SDK, make sure to update the documentation as well:

1. Update the C# SDK documentation at `docs/components/csharp-sdk.md`
2. Update this development guide if necessary
3. Create or update any additional documentation pages as needed

## Continuous Integration

The SDK uses GitHub Actions for continuous integration. The CI workflow is defined in the `.github/workflows/ci.yml` file and runs on every push to the main branch and on pull requests.

The CI workflow:
1. Builds the SDK
2. Runs the tests
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
