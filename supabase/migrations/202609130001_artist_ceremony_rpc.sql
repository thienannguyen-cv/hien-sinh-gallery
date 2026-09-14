-- Artist Ceremony RPC endpoints for secure server-side execution.
-- These RPCs allow the trusted backend worker to query pending submissions
-- and validate bundle preparation state without direct private table exposure.

CREATE OR REPLACE FUNCTION public.list_pending_encounter_requests()
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, private AS $$
  SELECT coalesce(jsonb_agg(jsonb_build_object(
    'requestId', er.request_id,
    'walletAddress', er.wallet_address,
    'submittedAt', er.submitted_at,
    'chainId', er.chain_id,
    'contributions', er.contributions
  ) ORDER BY er.submitted_at DESC), '[]'::jsonb)
  FROM private.encounter_requests er
  WHERE er.status = 'PENDING'
  AND NOT EXISTS (
    SELECT 1 FROM private.acquisition_authorizations aa
    WHERE aa.wallet_address = er.wallet_address
  );
$$;

REVOKE ALL ON FUNCTION public.list_pending_encounter_requests() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_pending_encounter_requests() TO service_role;

CREATE OR REPLACE FUNCTION public.get_pending_encounter_request(p_request_id uuid, p_wallet_address text)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, private AS $$
DECLARE
  v_rec record;
  v_has_auth boolean;
BEGIN
  -- Check if authorization already exists (One-window policy)
  SELECT EXISTS(
    SELECT 1 FROM private.acquisition_authorizations
    WHERE wallet_address = lower(p_wallet_address)
  ) INTO v_has_auth;

  IF v_has_auth THEN
    RETURN jsonb_build_object('error', 'AUTHORIZATION_ALREADY_EXISTS_FOR_WALLET');
  END IF;

  SELECT request_id, wallet_address, status, submitted_at
  INTO v_rec
  FROM private.encounter_requests
  WHERE request_id = p_request_id AND wallet_address = lower(p_wallet_address) AND status = 'PENDING';

  IF v_rec.request_id IS NULL THEN
    RETURN jsonb_build_object('error', 'PENDING_REQUEST_NOT_FOUND');
  END IF;

  RETURN jsonb_build_object(
    'status', 'OK',
    'requestId', v_rec.request_id,
    'walletAddress', v_rec.wallet_address,
    'submittedAt', v_rec.submitted_at
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_pending_encounter_request(uuid, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_pending_encounter_request(uuid, text) TO service_role;
