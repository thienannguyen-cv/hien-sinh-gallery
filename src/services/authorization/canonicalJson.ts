import { keccak256, sha256, stringToBytes, type Hex } from 'viem';

/**
 * RFC 8785 Deterministic JSON Canonicalization Scheme (JCS)
 *
 * Requirements:
 * 1. Object keys are sorted lexicographically by UTF-16 code units.
 * 2. Primitives are formatted without extraneous whitespace (no space after ':' or ',').
 * 3. BigInt integers are serialized deterministically as decimal strings.
 * 4. Arrays preserve element order while recursively canonicalizing their items.
 * 5. Deterministic UTF-8 string encoding is applied for hash computation.
 */
export function canonicalizeJson(data: unknown): string {
  if (data === null || data === undefined) {
    return 'null';
  }

  if (typeof data === 'bigint') {
    return `"${data.toString(10)}"`;
  }

  if (typeof data === 'number') {
    if (!Number.isFinite(data)) {
      throw new Error(`Cannot canonicalize non-finite number: ${data}`);
    }
    return JSON.stringify(data);
  }

  if (typeof data === 'boolean') {
    return data ? 'true' : 'false';
  }

  if (typeof data === 'string') {
    return JSON.stringify(data);
  }

  if (Array.isArray(data)) {
    const elements = data.map(item => canonicalizeJson(item));
    return `[${elements.join(',')}]`;
  }

  if (typeof data === 'object') {
    const keys = Object.keys(data as Record<string, unknown>).sort();
    const pairs: string[] = [];
    for (const key of keys) {
      const val = (data as Record<string, unknown>)[key];
      if (val !== undefined && typeof val !== 'function' && typeof val !== 'symbol') {
        pairs.push(`${JSON.stringify(key)}:${canonicalizeJson(val)}`);
      }
    }
    return `{${pairs.join(',')}}`;
  }

  throw new Error(`Unsupported type for canonicalization: ${typeof data}`);
}

/**
 * Computes the authoritative keccak256 hash of a canonicalized artifact.
 * Used for on-chain commitment binding in HienSinhAuthorizationRegistry.
 */
export function canonicalArtifactHash(artifact: unknown): Hex {
  const canonicalString = canonicalizeJson(artifact);
  const bytes = stringToBytes(canonicalString);
  return keccak256(bytes);
}

/**
 * Computes SHA-256 hash of a canonicalized artifact.
 * Used for cross-system archival and forensic verification.
 */
export function canonicalArtifactSha256(artifact: unknown): Hex {
  const canonicalString = canonicalizeJson(artifact);
  const bytes = stringToBytes(canonicalString);
  return sha256(bytes);
}
