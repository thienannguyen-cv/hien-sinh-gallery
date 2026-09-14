/** Notification-only email. It contains no decision links and no submission text. */
export const ARTIST_REVIEW_RECIPIENT = 'quinnthienanlnguyen@gmail.com';
export const PROPOSED_ARTIST_REVIEW_SENDER = 'review@smapworks.art';

export function buildArtistReviewEmail(input: {
  submissionReference: string;
  walletDisplay: string;
  reviewUrl: string;
}) {
  const subject = '[SMAPWORKS] Private encounter evidence awaiting review';
  const text = [
    'A private Three Brushstrokes submission is awaiting review.',
    '',
    `Reference: ${input.submissionReference}`,
    `Wallet: ${input.walletDisplay}`,
    '',
    'Open the canonical review surface:',
    input.reviewUrl,
    '',
    'This notification does not itself confirm evidence, issue an invitation, grant access, or authorize a transaction.',
    'Review the pending record on smapworks.art before taking any action.',
  ].join('\n');
  return { to: ARTIST_REVIEW_RECIPIENT, from: PROPOSED_ARTIST_REVIEW_SENDER, subject, text };
}
