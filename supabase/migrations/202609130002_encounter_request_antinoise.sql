-- Anti-noise guardrail for public encounter submissions.
-- Prevents queue flooding by enforcing idempotency on active PENDING submissions
-- and blocking duplicate submissions when a one-window authorization already exists.

CREATE OR REPLACE FUNCTION public.submit_encounter_request(
  p_wallet_address text,
  p_contributions jsonb
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, private AS $$
DECLARE
  v_existing_id uuid;
  new_id uuid;
BEGIN
  -- Validate wallet address format
  IF p_wallet_address IS NULL OR p_wallet_address !~ '^0x[0-9a-f]{40}$' OR p_wallet_address = '0x0000000000000000000000000000000000000000' THEN
    RAISE EXCEPTION 'INVALID_WALLET_ADDRESS';
  END IF;

  -- 1. If an acquisition authorization already exists for this wallet, reject new submissions under one-window policy
  IF EXISTS (
    SELECT 1 FROM private.acquisition_authorizations
    WHERE wallet_address = lower(p_wallet_address)
  ) THEN
    RAISE EXCEPTION 'AUTHORIZATION_ALREADY_EXISTS_ONE_WINDOW_ONLY';
  END IF;

  -- 2. Anti-noise / Idempotency guardrail: If an active PENDING request already exists, return existing request_id
  SELECT request_id INTO v_existing_id
  FROM private.encounter_requests
  WHERE wallet_address = lower(p_wallet_address) AND status = 'PENDING'
  ORDER BY submitted_at DESC
  LIMIT 1;

  IF v_existing_id IS NOT NULL THEN
    RETURN v_existing_id;
  END IF;

  -- 3. Otherwise insert the new pending encounter request
  INSERT INTO private.encounter_requests(wallet_address, contributions)
    VALUES (lower(p_wallet_address), p_contributions)
    RETURNING request_id INTO new_id;

  RETURN new_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_encounter_request(text, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_encounter_request(text, jsonb) TO service_role;
