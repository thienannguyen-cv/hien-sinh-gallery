-- Owner decision 2026-09-11: submit/confirm without wallet signing.
-- These records express Artist approval of a supplied address, not proof that
-- a submitter controls it, a contract signature, or asset-download authority.
CREATE SCHEMA IF NOT EXISTS private;
CREATE TABLE IF NOT EXISTS private.encounter_requests (
  request_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL CHECK (wallet_address ~ '^0x[0-9a-f]{40}$' AND wallet_address <> '0x0000000000000000000000000000000000000000'),
  chain_id bigint NOT NULL DEFAULT 8453 CHECK (chain_id = 8453),
  contributions jsonb NOT NULL CHECK (jsonb_typeof(contributions) = 'array' AND jsonb_array_length(contributions) = 3),
  status text NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','DECLINED','REVOKED')),
  submitted_at timestamptz NOT NULL DEFAULT now(),
  decided_at timestamptz,
  CHECK ((status = 'PENDING' AND decided_at IS NULL) OR (status <> 'PENDING' AND decided_at IS NOT NULL))
);
CREATE INDEX IF NOT EXISTS encounter_confirmed_wallet ON private.encounter_requests(wallet_address)
  WHERE status = 'CONFIRMED';

CREATE OR REPLACE FUNCTION private.guard_encounter_request() RETURNS trigger
LANGUAGE plpgsql SET search_path = pg_catalog, private AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.status := 'PENDING'; NEW.decided_at := NULL; NEW.submitted_at := now();
  ELSE
    IF NEW.wallet_address IS DISTINCT FROM OLD.wallet_address OR NEW.chain_id IS DISTINCT FROM OLD.chain_id
      OR NEW.contributions IS DISTINCT FROM OLD.contributions OR NEW.request_id IS DISTINCT FROM OLD.request_id
      OR NEW.submitted_at IS DISTINCT FROM OLD.submitted_at THEN
      RAISE EXCEPTION 'Submitted address and contributions are immutable; create a new request';
    END IF;
    IF NEW.status IS DISTINCT FROM OLD.status THEN
      NEW.decided_at := CASE WHEN NEW.status = 'PENDING' THEN NULL ELSE now() END;
    ELSE NEW.decided_at := OLD.decided_at;
    END IF;
  END IF;
  IF EXISTS (SELECT 1 FROM jsonb_array_elements(NEW.contributions) AS x(value)
    WHERE jsonb_typeof(value) <> 'string' OR length(btrim(value #>> '{}')) = 0 OR length(value #>> '{}') > 4000) THEN
    RAISE EXCEPTION 'Exactly three non-empty contributions of at most 4000 characters are required';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS guard_encounter_request ON private.encounter_requests;
CREATE TRIGGER guard_encounter_request BEFORE INSERT OR UPDATE ON private.encounter_requests
FOR EACH ROW EXECUTE FUNCTION private.guard_encounter_request();

-- Browser roles have no table writes and cannot confirm themselves. A private
-- server inserts validated requests; Artist changes status in Supabase dashboard.
ALTER TABLE private.encounter_requests ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON private.encounter_requests FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON private.encounter_requests TO service_role;
REVOKE UPDATE, DELETE ON private.encounter_requests FROM service_role;

CREATE OR REPLACE FUNCTION public.submit_encounter_request(p_wallet_address text, p_contributions jsonb)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, private AS $$
DECLARE new_id uuid;
BEGIN
  INSERT INTO private.encounter_requests(wallet_address, contributions)
    VALUES (lower(p_wallet_address), p_contributions) RETURNING request_id INTO new_id;
  RETURN new_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.encounter_request_status(p_wallet_address text)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = pg_catalog, private AS $$
  -- Latest Artist decision controls the wallet. A new unsigned submission cannot
  -- erase a prior decision. With no decision, report the latest pending request.
  SELECT coalesce((SELECT status FROM private.encounter_requests
    WHERE wallet_address = lower(p_wallet_address) AND chain_id = 8453
    ORDER BY decided_at DESC NULLS LAST, submitted_at DESC, request_id DESC LIMIT 1), 'NONE');
$$;
REVOKE ALL ON FUNCTION public.submit_encounter_request(text,jsonb) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.encounter_request_status(text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_encounter_request(text,jsonb) TO service_role;
GRANT EXECUTE ON FUNCTION public.encounter_request_status(text) TO service_role;
