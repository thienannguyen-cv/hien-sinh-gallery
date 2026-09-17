-- Migration: Synchronize encounter status with acquisition authorizations.
-- Fixes desynchronization where an address with an existing valid Artist authorization
-- in private.acquisition_authorizations was incorrectly reported as 'NONE'.

CREATE OR REPLACE FUNCTION public.encounter_request_status(p_wallet_address text)
RETURNS text LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = pg_catalog, private AS $$
BEGIN
  -- 1. If an active acquisition authorization exists for this wallet, it is authoritatively CONFIRMED
  IF EXISTS (
    SELECT 1 FROM private.acquisition_authorizations
    WHERE wallet_address = lower(p_wallet_address) AND status = 'ISSUED'
  ) THEN
    RETURN 'CONFIRMED';
  END IF;

  -- 2. Otherwise, check the latest decision or pending request from the queue
  RETURN coalesce((SELECT status FROM private.encounter_requests
    WHERE wallet_address = lower(p_wallet_address) AND chain_id = 8453
    ORDER BY decided_at DESC NULLS LAST, submitted_at DESC, request_id DESC LIMIT 1), 'NONE');
END;
$$;

REVOKE ALL ON FUNCTION public.encounter_request_status(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.encounter_request_status(text) TO service_role;
