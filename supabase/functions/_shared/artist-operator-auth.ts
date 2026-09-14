import { ThreeBrushstrokesError, type AuthenticatedArtistOperator } from './three-brushstrokes-service.ts';

/**
 * Boundary contract for the eventual Artist review surface.  The caller never
 * supplies an operator subject.  A deployment must provide a verifier for an
 * authenticated Artist/operator session (for example an Access JWT validated
 * against its issuer, audience and permitted subject).  This deliberately
 * fails closed until such a verifier exists.
 */
export interface ArtistSessionVerifier {
  verify(request: Request): Promise<{ subject: string; authenticated: true } | null>;
}

export async function requireAuthenticatedArtistOperator(
  request: Request,
  verifier: ArtistSessionVerifier,
): Promise<AuthenticatedArtistOperator> {
  const session = await verifier.verify(request);
  if (!session?.authenticated || !session.subject) {
    throw new ThreeBrushstrokesError('ARTIST_OPERATOR_AUTH_REQUIRED', 401, 'Authenticated Artist review is required.');
  }
  return { subject: session.subject, authentication: 'VERIFIED_ARTIST_OPERATOR_SESSION' };
}
