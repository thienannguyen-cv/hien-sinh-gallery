-- Operator-only store function: write a signed authorization into the private table.
-- This function is callable only by service_role (the server-side key).
-- The browser/anon/authenticated roles have no access.
CREATE OR REPLACE FUNCTION public.store_acquisition_authorization(
  p_wallet_address text,
  p_authorization jsonb,
  p_request_id uuid DEFAULT NULL
) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, private AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO private.acquisition_authorizations(wallet_address, "authorization", request_id)
    VALUES (lower(p_wallet_address), p_authorization, p_request_id)
    RETURNING authorization_id INTO new_id;
  RETURN new_id;
END;
$$;
REVOKE ALL ON FUNCTION public.store_acquisition_authorization(text,jsonb,uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.store_acquisition_authorization(text,jsonb,uuid) TO service_role;
