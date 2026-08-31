-- One-time wallet challenges for canonical stewardship archive transmission.
-- No browser role, review ticket, or frontend state can insert/read these rows.

CREATE TABLE IF NOT EXISTS public.transmission_challenges (
    nonce_hash TEXT PRIMARY KEY CHECK (nonce_hash ~ '^[0-9a-f]{64}$'),
    requester_address TEXT NOT NULL CHECK (requester_address ~ '^0x[0-9a-f]{40}$'),
    token_id BIGINT NOT NULL CHECK (token_id > 0),
    asset_type TEXT NOT NULL CHECK (asset_type IN (
        'H_CORE',
        'H_CONSTITUTIVE_SCAR',
        'H_CONSTITUTIVE_RITUAL'
    )),
    request_origin TEXT NOT NULL,
    signed_message TEXT NOT NULL,
    issued_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (expires_at > issued_at)
);

CREATE INDEX IF NOT EXISTS idx_transmission_challenges_expiry
    ON public.transmission_challenges (expires_at)
    WHERE used_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_transmission_challenge
    ON public.transmission_challenges (requester_address, token_id, asset_type, request_origin)
    WHERE used_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_stewardship_assets_component
    ON public.stewardship_assets (token_id, asset_type);

ALTER TABLE public.stewardship_assets
    ADD COLUMN IF NOT EXISTS archive_commitment TEXT;

ALTER TABLE public.stewardship_assets
    DROP CONSTRAINT IF EXISTS stewardship_assets_archive_commitment_format;

ALTER TABLE public.stewardship_assets
    ADD CONSTRAINT stewardship_assets_archive_commitment_format
    CHECK (archive_commitment IS NULL OR archive_commitment ~ '^(0x)?[0-9a-fA-F]{64}$');

ALTER TABLE public.transmission_audit_logs
    ADD COLUMN IF NOT EXISTS archive_commitment TEXT;

ALTER TABLE public.transmission_challenges ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.transmission_challenges FROM anon, authenticated;

CREATE POLICY "Service role only for transmission challenges"
    ON public.transmission_challenges
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
