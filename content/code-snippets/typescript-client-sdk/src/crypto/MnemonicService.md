# MnemonicService.ts

This file contains functionality for generating and validating BIP-39 mnemonic phrases.

## Mnemonic Generation

```typescript
/**
 * Generate a BIP-39 mnemonic phrase
 * 
 * @param strength Entropy strength in bits (128, 160, 192, 224, 256)
 * @returns Mnemonic phrase
 */
public generateMnemonic(strength: number = 128): string {
  try {
    // Validate strength
    if (![128, 160, 192, 224, 256].includes(strength)) {
      throw new Error('Invalid strength. Must be one of: 128, 160, 192, 224, 256');
    }

    // Generate random bytes
    const byteCount = strength / 8;
    const entropy = crypto.getRandomValues(new Uint8Array(byteCount));

    // Convert to mnemonic
    return this.entropyToMnemonic(entropy);
  } catch (error) {
    throw new LogError(
      `Failed to generate mnemonic: ${error instanceof Error ? error.message : String(error)}`,
      'generate_mnemonic_failed'
    );
  }
}
```

## Mnemonic Validation

```typescript
/**
 * Validate a BIP-39 mnemonic phrase
 * 
 * @param mnemonic Mnemonic phrase
 * @returns True if valid, false otherwise
 */
public validateMnemonic(mnemonic: string): boolean {
  try {
    // Normalize the mnemonic
    const normalizedMnemonic = this.normalizeMnemonic(mnemonic);

    // Split into words
    const words = normalizedMnemonic.split(' ');

    // Check word count
    if (![12, 15, 18, 21, 24].includes(words.length)) {
      return false;
    }

    // Check if all words are in the wordlist
    for (const word of words) {
      if (!this.wordlist.includes(word)) {
        return false;
      }
    }

    // Convert to entropy
    const entropy = this.mnemonicToEntropy(normalizedMnemonic);

    // Convert back to mnemonic and compare
    const generatedMnemonic = this.entropyToMnemonic(entropy);
    return normalizedMnemonic === generatedMnemonic;
  } catch (error) {
    return false;
  }
}
```

## Entropy to Mnemonic Conversion

```typescript
/**
 * Convert entropy to a mnemonic phrase
 * 
 * @param entropy Entropy bytes
 * @returns Mnemonic phrase
 */
private entropyToMnemonic(entropy: Uint8Array): string {
  // Calculate checksum bits
  const checksumBits = entropy.length * 8 / 32;
  
  // Calculate SHA-256 hash of entropy
  const hash = this.sha256(entropy);
  
  // Convert entropy to binary string
  let binaryString = '';
  for (let i = 0; i < entropy.length; i++) {
    binaryString += entropy[i].toString(2).padStart(8, '0');
  }
  
  // Add checksum bits
  for (let i = 0; i < checksumBits; i++) {
    binaryString += ((hash[Math.floor(i / 8)] >> (7 - (i % 8))) & 1).toString();
  }
  
  // Split into 11-bit segments and convert to words
  const words = [];
  for (let i = 0; i < binaryString.length / 11; i++) {
    const wordIndex = parseInt(binaryString.slice(i * 11, (i + 1) * 11), 2);
    words.push(this.wordlist[wordIndex]);
  }
  
  return words.join(' ');
}
```

## Mnemonic to Entropy Conversion

```typescript
/**
 * Convert a mnemonic phrase to entropy
 * 
 * @param mnemonic Mnemonic phrase
 * @returns Entropy bytes
 */
private mnemonicToEntropy(mnemonic: string): Uint8Array {
  // Split into words
  const words = mnemonic.split(' ');
  
  // Convert words to binary string
  let binaryString = '';
  for (const word of words) {
    const wordIndex = this.wordlist.indexOf(word);
    if (wordIndex === -1) {
      throw new Error(`Invalid word: ${word}`);
    }
    binaryString += wordIndex.toString(2).padStart(11, '0');
  }
  
  // Calculate entropy length
  const entropyBits = Math.floor(binaryString.length / 33) * 32;
  const entropyBytes = entropyBits / 8;
  
  // Extract entropy bits
  const entropyBinaryString = binaryString.slice(0, entropyBits);
  
  // Convert to bytes
  const entropy = new Uint8Array(entropyBytes);
  for (let i = 0; i < entropyBytes; i++) {
    entropy[i] = parseInt(entropyBinaryString.slice(i * 8, (i + 1) * 8), 2);
  }
  
  // Verify checksum
  const checksumBits = entropyBytes / 4;
  const checksumBinaryString = binaryString.slice(entropyBits, entropyBits + checksumBits);
  
  const hash = this.sha256(entropy);
  let calculatedChecksumBinaryString = '';
  for (let i = 0; i < checksumBits; i++) {
    calculatedChecksumBinaryString += ((hash[Math.floor(i / 8)] >> (7 - (i % 8))) & 1).toString();
  }
  
  if (checksumBinaryString !== calculatedChecksumBinaryString) {
    throw new Error('Invalid checksum');
  }
  
  return entropy;
}
```
