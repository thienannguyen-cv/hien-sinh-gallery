-- Final fail-closed archive boundary for a DEDICATED Hiện Sinh Supabase project.
-- This migration intentionally aborts when unrelated storage buckets exist.
-- It removes inherited/additive policy ambiguity instead of attempting to
-- coexist with unknown grants or permissive policies.

BEGIN;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM storage.buckets
        WHERE id <> 'stewardship-private-archive'
    ) THEN
        RAISE EXCEPTION 'Archive security migration requires a dedicated Supabase project with no unrelated buckets';
    END IF;
END
$$;

INSERT INTO storage.buckets (id, name, public)
VALUES ('stewardship-private-archive', 'stewardship-private-archive', false)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    public = false;

-- A wallet-signed nonce is the sole replay boundary. Keeping every nonce row
-- gives each database conflict one stable meaning: this nonce was seen before.
-- Concurrency is not represented by a second uniqueness rule.
DROP INDEX IF EXISTS public.idx_one_active_transmission_challenge;

DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE (schemaname = 'public' AND tablename IN (
            'stewardship_assets',
            'transmission_audit_logs',
            'transmission_challenges'
        ))
        OR (schemaname = 'storage' AND tablename = 'objects')
    LOOP
        EXECUTE format(
            'DROP POLICY IF EXISTS %I ON %I.%I',
            policy_record.policyname,
            policy_record.schemaname,
            policy_record.tablename
        );
    END LOOP;
END
$$;

ALTER TABLE public.stewardship_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stewardship_assets FORCE ROW LEVEL SECURITY;
ALTER TABLE public.transmission_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmission_audit_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.transmission_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transmission_challenges FORCE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects FORCE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.stewardship_assets FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.transmission_audit_logs FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE public.transmission_challenges FROM PUBLIC, anon, authenticated;
REVOKE ALL ON TABLE storage.objects FROM PUBLIC, anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.stewardship_assets TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transmission_audit_logs TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.transmission_challenges TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE storage.objects TO service_role;

CREATE POLICY "Hiện Sinh service role assets"
    ON public.stewardship_assets
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Hiện Sinh service role audit"
    ON public.transmission_audit_logs
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Hiện Sinh service role challenges"
    ON public.transmission_challenges
    FOR ALL TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Hiện Sinh service role archive objects"
    ON storage.objects
    FOR ALL TO service_role
    USING (bucket_id = 'stewardship-private-archive')
    WITH CHECK (bucket_id = 'stewardship-private-archive');

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.stewardship_assets
        WHERE archive_commitment IS NULL
    ) THEN
        RAISE EXCEPTION 'Existing stewardship asset lacks archive_commitment; remediate before lockdown';
    END IF;
END
$$;

ALTER TABLE public.stewardship_assets
    ALTER COLUMN archive_commitment SET NOT NULL;

ALTER TABLE public.transmission_audit_logs
    ADD COLUMN IF NOT EXISTS authorization_block_number TEXT;

ALTER TABLE public.transmission_audit_logs
    ADD COLUMN IF NOT EXISTS authorization_block_hash TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM public.transmission_audit_logs
        WHERE authorization_block_number IS NULL OR authorization_block_hash IS NULL
    ) THEN
        RAISE EXCEPTION 'Existing transmission audit row lacks finalized authorization block evidence';
    END IF;
END
$$;

ALTER TABLE public.transmission_audit_logs
    ALTER COLUMN authorization_block_number SET NOT NULL;

ALTER TABLE public.transmission_audit_logs
    ALTER COLUMN authorization_block_hash SET NOT NULL;

ALTER TABLE public.transmission_audit_logs
    DROP CONSTRAINT IF EXISTS transmission_audit_block_number_format;

ALTER TABLE public.transmission_audit_logs
    ADD CONSTRAINT transmission_audit_block_number_format
    CHECK (authorization_block_number ~ '^[0-9]+$');

ALTER TABLE public.transmission_audit_logs
    DROP CONSTRAINT IF EXISTS transmission_audit_block_hash_format;

ALTER TABLE public.transmission_audit_logs
    ADD CONSTRAINT transmission_audit_block_hash_format
    CHECK (authorization_block_hash ~ '^0x[0-9a-f]{64}$');

COMMIT;
