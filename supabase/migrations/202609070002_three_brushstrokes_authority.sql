-- P2 local candidate: private, non-qualifying encounter evidence.
-- No table in this migration grants STEWARD, Package 05, purchaser, SANCTUM,
-- or Curator authority. Browser roles never read these records directly.

CREATE SCHEMA IF NOT EXISTS private;

CREATE TABLE IF NOT EXISTS private.three_brushstrokes_wallet_challenges (
  nonce_hash text PRIMARY KEY CHECK (nonce_hash ~ '^[0-9a-f]{64}$'),
  wallet_address text NOT NULL CHECK (wallet_address ~ '^0x[0-9a-f]{40}$'),
  chain_id bigint NOT NULL,
  request_origin text NOT NULL,
  commitment_sha256 text NOT NULL CHECK (commitment_sha256 ~ '^[0-9a-f]{64}$'),
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS private.three_brushstrokes_submissions (
  submission_id uuid PRIMARY KEY,
  wallet_address text NOT NULL CHECK (wallet_address ~ '^0x[0-9a-f]{40}$'),
  chain_id bigint NOT NULL,
  contributions jsonb NOT NULL CHECK (jsonb_typeof(contributions) = 'array' AND jsonb_array_length(contributions) = 3),
  commitment_sha256 text NOT NULL CHECK (commitment_sha256 ~ '^[0-9a-f]{64}$'),
  verified_at timestamptz NOT NULL,
  submitted_at timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('PENDING_ARTIST_REVIEW', 'CONFIRM_ENCOUNTER_EVIDENCE', 'DO_NOT_CONFIRM_ENCOUNTER_EVIDENCE')),
  CHECK (submitted_at >= verified_at)
);

CREATE TABLE IF NOT EXISTS private.three_brushstrokes_wallet_sessions (
  token_hash text PRIMARY KEY CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  wallet_address text NOT NULL CHECK (wallet_address ~ '^0x[0-9a-f]{40}$'),
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  CHECK (expires_at > issued_at)
);

CREATE TABLE IF NOT EXISTS private.three_brushstrokes_artist_confirmations (
  confirmation_id uuid PRIMARY KEY,
  submission_id uuid NOT NULL UNIQUE REFERENCES private.three_brushstrokes_submissions(submission_id),
  decision text NOT NULL CHECK (decision IN ('CONFIRM_ENCOUNTER_EVIDENCE', 'DO_NOT_CONFIRM_ENCOUNTER_EVIDENCE')),
  operator_subject text NOT NULL,
  decided_at timestamptz NOT NULL
);

CREATE TABLE IF NOT EXISTS private.stewardship_invitations (
  invitation_id uuid PRIMARY KEY,
  submission_id uuid NOT NULL UNIQUE REFERENCES private.three_brushstrokes_submissions(submission_id),
  confirmation_id uuid NOT NULL UNIQUE REFERENCES private.three_brushstrokes_artist_confirmations(confirmation_id),
  wallet_address text NOT NULL CHECK (wallet_address ~ '^0x[0-9a-f]{40}$'),
  issued_at timestamptz NOT NULL,
  expires_at timestamptz,
  revoked_at timestamptz,
  signing_key_id text NOT NULL,
  signed_payload text NOT NULL,
  signature text NOT NULL
);

CREATE TABLE IF NOT EXISTS private.three_brushstrokes_review_tokens (
  token_jti_hash text PRIMARY KEY CHECK (token_jti_hash ~ '^[0-9a-f]{64}$'),
  submission_id uuid NOT NULL REFERENCES private.three_brushstrokes_submissions(submission_id),
  recipient_email text NOT NULL,
  issued_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  revoked_at timestamptz,
  CHECK (expires_at > issued_at)
);

-- The nonce transition and submission insertion are one database operation.
-- A replay cannot win a race between two submit requests.
CREATE OR REPLACE FUNCTION private.commit_three_brushstrokes_submission(
  p_nonce_hash text,
  p_submission_id uuid,
  p_wallet_address text,
  p_chain_id bigint,
  p_contributions jsonb,
  p_commitment_sha256 text,
  p_verified_at timestamptz,
  p_submitted_at timestamptz
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, pg_temp
AS $$
BEGIN
  UPDATE private.three_brushstrokes_wallet_challenges
     SET used_at = p_submitted_at
   WHERE nonce_hash = p_nonce_hash
     AND used_at IS NULL
     AND expires_at > p_submitted_at;
  IF NOT FOUND THEN RETURN false; END IF;

  INSERT INTO private.three_brushstrokes_submissions (
    submission_id, wallet_address, chain_id, contributions, commitment_sha256,
    verified_at, submitted_at, status
  ) VALUES (
    p_submission_id, p_wallet_address, p_chain_id, p_contributions, p_commitment_sha256,
    p_verified_at, p_submitted_at, 'PENDING_ARTIST_REVIEW'
  );
  RETURN true;
END;
$$;

CREATE INDEX IF NOT EXISTS three_brushstrokes_wallet_session_lookup
  ON private.three_brushstrokes_wallet_sessions (wallet_address, expires_at)
  WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS stewardship_invitation_wallet_lookup
  ON private.stewardship_invitations (wallet_address, issued_at)
  WHERE revoked_at IS NULL;

ALTER TABLE private.three_brushstrokes_wallet_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_wallet_challenges FORCE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_submissions FORCE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_wallet_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_wallet_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_artist_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_artist_confirmations FORCE ROW LEVEL SECURITY;
ALTER TABLE private.stewardship_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.stewardship_invitations FORCE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_review_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE private.three_brushstrokes_review_tokens FORCE ROW LEVEL SECURITY;

REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA private TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA private TO service_role;
