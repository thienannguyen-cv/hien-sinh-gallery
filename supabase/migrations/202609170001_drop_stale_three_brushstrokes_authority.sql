-- Migration: Drop stale Three Brushstrokes candidate tables and functions
-- Context: Replaced by direct Cloudflare Worker -> Supabase RPC architecture
-- (private.encounter_requests and private.acquisition_authorizations remain fully active).

-- 1. Drop stale child tables with foreign keys first
DROP TABLE IF EXISTS private.three_brushstrokes_review_tokens CASCADE;
DROP TABLE IF EXISTS private.stewardship_invitations CASCADE;
DROP TABLE IF EXISTS private.three_brushstrokes_artist_confirmations CASCADE;
DROP TABLE IF EXISTS private.three_brushstrokes_wallet_sessions CASCADE;

-- 2. Drop stale parent tables
DROP TABLE IF EXISTS private.three_brushstrokes_submissions CASCADE;
DROP TABLE IF EXISTS private.three_brushstrokes_wallet_challenges CASCADE;

-- 3. Drop stale candidate function
DROP FUNCTION IF EXISTS private.commit_three_brushstrokes_submission(text, uuid, text, bigint, jsonb, text, timestamptz, timestamptz) CASCADE;
