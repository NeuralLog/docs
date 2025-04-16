# Auth Examples

This section provides examples of how to use the NeuralLog Auth service in various scenarios.

## Basic Usage

The [Basic Usage Example](./examples/basic-usage.md) demonstrates how to set up and use the Auth service for common tasks such as:

- Authenticating users
- Checking permissions
- Managing API keys
- Setting up tenant access

## Advanced Examples

### Zero-Knowledge Authentication

```typescript
// Import the auth client
import { AuthServiceClient } from '@neurallog/auth-client';
import { CryptoService } from '@neurallog/typescript-client-sdk';

// Create a client instance
const authClient = new AuthServiceClient({
  baseUrl: 'http://localhost:3040',
  tenantId: 'acme-corp'
});

// Create a crypto service
const cryptoService = new CryptoService();

// Example: Zero-knowledge authentication
async function zkAuthenticate(username, password, recoveryPhrase) {
  try {
    // Step 1: Initialize the key hierarchy
    const masterSecret = await cryptoService.deriveMasterSecret('acme-corp', recoveryPhrase);
    await cryptoService.deriveMasterKEK(masterSecret);

    // Step 2: Get available KEK versions
    const kekVersions = await authClient.getKEKVersions();

    // Step 3: Derive operational KEKs for all versions
    for (const version of kekVersions) {
      await cryptoService.deriveOperationalKEK(version.id);
    }

    // Step 4: Authenticate with the server
    const authResult = await authClient.login(username, password);

    // Step 5: Get KEK blobs for the user
    const kekBlobs = await authClient.getKEKBlobs(authResult.token);

    // Step 6: Decrypt the KEK blobs
    for (const blob of kekBlobs) {
      const decryptedKEK = await cryptoService.decryptKEKBlob(blob);
      console.log(`Decrypted KEK for version ${blob.version}`);
    }

    return authResult.token;
  } catch (error) {
    console.error('Zero-knowledge authentication failed:', error);
    throw error;
  }
}
```

### Admin Promotion with Shamir's Secret Sharing

```typescript
// Import the auth client and crypto service
import { AuthServiceClient } from '@neurallog/auth-client';
import { CryptoService, ShamirSecretSharing } from '@neurallog/typescript-client-sdk';

// Create a client instance
const authClient = new AuthServiceClient({
  baseUrl: 'http://localhost:3040',
  tenantId: 'acme-corp'
});

// Create a crypto service
const cryptoService = new CryptoService();

// Example: Promote a user to admin using Shamir's Secret Sharing
async function promoteToAdmin(adminToken, userIdToPromote, threshold, totalShares) {
  try {
    // Step 1: Get the current KEK version
    const activeVersion = await authClient.getActiveKEKVersion(adminToken);

    // Step 2: Get the operational KEK for the active version
    const operationalKEK = cryptoService.getOperationalKEK(activeVersion.id);

    // Step 3: Create Shamir's Secret Sharing scheme
    const sss = new ShamirSecretSharing();
    const shares = sss.split(operationalKEK, threshold, totalShares);

    // Step 4: Encrypt one share for the new admin
    const userPublicKey = await authClient.getUserPublicKey(adminToken, userIdToPromote);
    const encryptedShare = await cryptoService.encryptShareWithPublicKey(shares[0], userPublicKey);

    // Step 5: Send the encrypted share to the server
    await authClient.provisionAdminShare(adminToken, {
      userId: userIdToPromote,
      kekVersion: activeVersion.id,
      encryptedShare,
      threshold,
      shareIndex: 0
    });

    console.log(`User ${userIdToPromote} has been provisioned with a share for admin promotion`);
    return true;
  } catch (error) {
    console.error('Admin promotion failed:', error);
    throw error;
  }
}
```

### Key Rotation

```typescript
// Import the auth client
import { AuthServiceClient } from '@neurallog/auth-client';
import { CryptoService } from '@neurallog/typescript-client-sdk';

// Create a client instance
const authClient = new AuthServiceClient({
  baseUrl: 'http://localhost:3040',
  tenantId: 'acme-corp'
});

// Create a crypto service
const cryptoService = new CryptoService();

// Example: Rotate KEK
async function rotateKEK(adminToken, recoveryPhrase, usersToRemove = []) {
  try {
    // Step 1: Initialize the key hierarchy
    const masterSecret = await cryptoService.deriveMasterSecret('acme-corp', recoveryPhrase);
    await cryptoService.deriveMasterKEK(masterSecret);

    // Step 2: Get current KEK versions
    const kekVersions = await authClient.getKEKVersions(adminToken);

    // Step 3: Create a new KEK version
    const newVersionId = `v${kekVersions.length + 1}`;
    await cryptoService.deriveOperationalKEK(newVersionId);
    const newKEK = cryptoService.getOperationalKEK(newVersionId);

    // Step 4: Create a new KEK version on the server
    await authClient.createKEKVersion(adminToken, {
      id: newVersionId,
      status: 'active'
    });

    // Step 5: Provision the new KEK for all users except those being removed
    const users = await authClient.getUsers(adminToken);
    for (const user of users) {
      if (!usersToRemove.includes(user.id)) {
        // Encrypt the new KEK for this user
        const userPublicKey = await authClient.getUserPublicKey(adminToken, user.id);
        const encryptedKEK = await cryptoService.encryptKEKWithPublicKey(newKEK, userPublicKey);

        // Provision the KEK blob
        await authClient.provisionKEKBlob(adminToken, {
          userId: user.id,
          kekVersion: newVersionId,
          encryptedKEK
        });
      }
    }

    // Step 6: Mark the previous version as deprecated
    const previousVersion = kekVersions[kekVersions.length - 1];
    await authClient.updateKEKVersionStatus(adminToken, previousVersion.id, 'deprecated');

    console.log(`KEK rotated to version ${newVersionId}`);
    return newVersionId;
  } catch (error) {
    console.error('KEK rotation failed:', error);
    throw error;
  }
}
```

## Next Steps

- Learn about [Configuration Options](./configuration.md)
- Explore the [API Reference](./api.md)
- Read about the [Architecture](./architecture.md)
