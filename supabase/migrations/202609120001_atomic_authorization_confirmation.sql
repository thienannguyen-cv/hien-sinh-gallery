-- Atomic acquisition authorization and encounter confirmation migration.
-- Enforces strict one-authorization-window policy (no renewal, no reissuance).
-- Artist signs first; server verifies signature; atomic RPC stores authorization and sets encounter to CONFIRMED.

-- 1. Ensure table private.acquisition_authorizations has strict unique constraints and audit columns
DO $$
BEGIN
  -- Add prepared_at column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'private' AND table_name = 'acquisition_authorizations' AND column_name = 'prepared_at'
  ) THEN
    ALTER TABLE private.acquisition_authorizations ADD COLUMN prepared_at timestamptz NOT NULL DEFAULT now();
  END IF;

  -- Add deadline column if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'private' AND table_name = 'acquisition_authorizations' AND column_name = 'deadline'
  ) THEN
    ALTER TABLE private.acquisition_authorizations ADD COLUMN deadline timestamptz;
  END IF;
END $$;

-- 2. Strict One-Window Policy Unique Constraints
-- Only ONE authorization EVER per wallet_address
CREATE UNIQUE INDEX IF NOT EXISTS one_authorization_ever_per_wallet 
  ON private.acquisition_authorizations(wallet_address);

-- Only ONE authorization EVER per encounter request_id
CREATE UNIQUE INDEX IF NOT EXISTS one_authorization_ever_per_request 
  ON private.acquisition_authorizations(request_id) 
  WHERE request_id IS NOT NULL;

-- 3. Atomic Store and Confirm RPC Function
CREATE OR REPLACE FUNCTION public.store_verified_acquisition_authorization(
  p_wallet_address text,
  p_authorization jsonb,
  p_request_id uuid DEFAULT NULL,
  p_prepared_at timestamptz DEFAULT now(),
  p_deadline timestamptz DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, private AS $$
DECLARE
  v_new_id uuid;
  v_req_id uuid;
  v_req_status text;
  v_resolved_deadline timestamptz;
BEGIN
  -- Validate wallet address format
  IF p_wallet_address IS NULL OR p_wallet_address !~ '^0x[0-9a-f]{40}$' OR p_wallet_address = '0x0000000000000000000000000000000000000000' THEN
    RAISE EXCEPTION 'INVALID_WALLET_ADDRESS';
  END IF;

  -- Enforce strict one-window policy: no existing authorization may exist for this wallet
  IF EXISTS (
    SELECT 1 FROM private.acquisition_authorizations
    WHERE wallet_address = lower(p_wallet_address)
  ) THEN
    RAISE EXCEPTION 'AUTHORIZATION_ALREADY_EXISTS_ONE_WINDOW_ONLY';
  END IF;

  -- If request_id is provided, verify encounter request state
  IF p_request_id IS NOT NULL THEN
    SELECT request_id, status INTO v_req_id, v_req_status
    FROM private.encounter_requests
    WHERE request_id = p_request_id AND wallet_address = lower(p_wallet_address)
    FOR UPDATE;

    IF v_req_id IS NULL THEN
      RAISE EXCEPTION 'ENCOUNTER_REQUEST_NOT_FOUND';
    END IF;

    IF v_req_status <> 'PENDING' THEN
      RAISE EXCEPTION 'ENCOUNTER_REQUEST_NOT_PENDING (current status: %)', v_req_status;
    END IF;

    -- Check if request already has an authorization
    IF EXISTS (
      SELECT 1 FROM private.acquisition_authorizations
      WHERE request_id = p_request_id
    ) THEN
      RAISE EXCEPTION 'AUTHORIZATION_ALREADY_EXISTS_FOR_REQUEST';
    END IF;
  ELSE
    -- If request_id not provided, find the latest PENDING encounter request for this wallet
    SELECT request_id, status INTO v_req_id, v_req_status
    FROM private.encounter_requests
    WHERE wallet_address = lower(p_wallet_address) AND status = 'PENDING'
    ORDER BY submitted_at DESC
    LIMIT 1
    FOR UPDATE;
  END IF;

  -- Derive deadline if not explicitly provided (7 days from prepared_at)
  v_resolved_deadline := coalesce(p_deadline, p_prepared_at + interval '7 days');

  -- Atomically insert the verified authorization
  INSERT INTO private.acquisition_authorizations (
    request_id,
    wallet_address,
    "authorization",
    prepared_at,
    deadline,
    status,
    issued_at
  ) VALUES (
    v_req_id,
    lower(p_wallet_address),
    p_authorization,
    p_prepared_at,
    v_resolved_deadline,
    'ISSUED',
    now()
  ) RETURNING authorization_id INTO v_new_id;

  -- Atomically transition the encounter request to CONFIRMED
  IF v_req_id IS NOT NULL THEN
    UPDATE private.encounter_requests
    SET status = 'CONFIRMED', decided_at = now()
    WHERE request_id = v_req_id;
  END IF;

  RETURN v_new_id;
END;
$$;

-- Security & Permissions
REVOKE ALL ON FUNCTION public.store_verified_acquisition_authorization(text, jsonb, uuid, timestamptz, timestamptz) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_verified_acquisition_authorization(text, jsonb, uuid, timestamptz, timestamptz) TO service_role;
