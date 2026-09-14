/** Domain-separated review notification token. It is necessary but not sufficient
 * for a decision: the review surface must also establish an authenticated Artist. */
const encoder = new TextEncoder();

function base64Url(value: Uint8Array) {
  let binary = '';
  for (const byte of value) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function decodeBase64Url(value: string) {
  const padded = value.replaceAll('-', '+').replaceAll('_', '/') + '==='.slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}

async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return base64Url(new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value))));
}

function equal(left: string, right: string) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  return difference === 0;
}

export interface ArtistReviewTokenPayload {
  type: 'HS_ARTIST_REVIEW_V1';
  reviewId: string;
  submissionId: string;
  recipient: string;
  jti: string;
  issuedAt: string;
  expiresAt: string;
  audience: 'https://smapworks.art';
}

export async function signArtistReviewToken(payload: ArtistReviewTokenPayload, secret: string) {
  const encoded = base64Url(encoder.encode(JSON.stringify(payload)));
  return `${encoded}.${await hmac(secret, encoded)}`;
}

export async function verifyArtistReviewToken(token: string, secret: string, now: Date): Promise<ArtistReviewTokenPayload | null> {
  const [encoded, signature, extra] = token.split('.');
  if (!encoded || !signature || extra || !equal(signature, await hmac(secret, encoded))) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(decodeBase64Url(encoded))) as ArtistReviewTokenPayload;
    if (payload.type !== 'HS_ARTIST_REVIEW_V1' || payload.audience !== 'https://smapworks.art' || !/^[A-Za-z0-9_-]{32,96}$/.test(payload.jti)) return null;
    if (Date.parse(payload.expiresAt) <= now.getTime() || Date.parse(payload.issuedAt) > now.getTime()) return null;
    return payload;
  } catch {
    return null;
  }
}
