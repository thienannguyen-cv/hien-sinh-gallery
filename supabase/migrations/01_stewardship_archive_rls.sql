-- Supabase Database Migration & Row Level Security (RLS) Policy
-- Project: "Hiện Sinh" — Relational Practice Artwork
-- Schema: hien-sinh/archive/v2

-- 1. Create table for encrypted asset manifests & signed URL generation
CREATE TABLE IF NOT EXISTS public.stewardship_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id INT NOT NULL,
    asset_type VARCHAR(50) NOT NULL, -- 'H_CORE', 'H_CONSTITUTIVE_SCAR', 'H_CONSTITUTIVE_RITUAL'
    asset_hash VARCHAR(66) NOT NULL, -- SHA-256 hash string (0x...)
    file_path VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by token_id and asset_type
CREATE INDEX IF NOT EXISTS idx_stewardship_assets_token ON public.stewardship_assets(token_id, asset_type);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.stewardship_assets ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: Public read is DENIED by default.
-- Only authenticated Service Role (Edge Functions) can query raw asset paths.
CREATE POLICY "Strict Service Role Only for Stewardship Assets"
    ON public.stewardship_assets
    FOR SELECT
    USING (auth.role() = 'service_role');

-- 4. Audit Log Table for Accession Transmission Events
CREATE TABLE IF NOT EXISTS public.transmission_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_address VARCHAR(42) NOT NULL,
    token_id INT NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    verification_hash VARCHAR(66) NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.transmission_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Strict Service Role Only for Audit Logs"
    ON public.transmission_audit_logs
    FOR ALL
    USING (auth.role() = 'service_role');
