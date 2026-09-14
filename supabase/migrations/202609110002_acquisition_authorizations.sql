-- An authorization is a wallet-bound public-protocol artifact. This database
-- never holds the Artist private key and cannot produce an Artist signature.
CREATE TABLE IF NOT EXISTS private.acquisition_authorizations (
  authorization_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid REFERENCES private.encounter_requests(request_id),
  wallet_address text NOT NULL CHECK (wallet_address ~ '^0x[0-9a-f]{40}$' AND wallet_address <> '0x0000000000000000000000000000000000000000'),
  "authorization" jsonb NOT NULL,
  status text NOT NULL DEFAULT 'ISSUED' CHECK (status IN ('ISSUED', 'REVOKED')),
  issued_at timestamptz NOT NULL DEFAULT now(), revoked_at timestamptz
);
CREATE UNIQUE INDEX IF NOT EXISTS one_live_acquisition_authorization_per_wallet ON private.acquisition_authorizations(wallet_address) WHERE status = 'ISSUED';
ALTER TABLE private.acquisition_authorizations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.acquisition_authorizations FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON private.acquisition_authorizations TO service_role;
CREATE OR REPLACE FUNCTION public.acquisition_authorization_for_wallet(p_wallet_address text)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, private AS $$
  SELECT "authorization" FROM private.acquisition_authorizations WHERE wallet_address = lower(p_wallet_address) AND status = 'ISSUED' ORDER BY issued_at DESC, authorization_id DESC LIMIT 1;
$$;
REVOKE ALL ON FUNCTION public.acquisition_authorization_for_wallet(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acquisition_authorization_for_wallet(text) TO service_role;

