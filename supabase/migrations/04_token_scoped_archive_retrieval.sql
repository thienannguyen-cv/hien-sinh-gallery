-- Forward repair: token-specific retrieval; preserve old nonce/audit evidence.
BEGIN;
ALTER TABLE public.transmission_challenges
  DROP CONSTRAINT IF EXISTS transmission_challenges_token_id_check;
ALTER TABLE public.transmission_challenges
  ADD CONSTRAINT transmission_challenges_token_id_check CHECK (token_id >= 0);
ALTER TABLE public.transmission_challenges
  DROP CONSTRAINT IF EXISTS transmission_challenges_asset_type_check;
ALTER TABLE public.transmission_challenges
  ADD CONSTRAINT transmission_challenges_asset_type_check CHECK (asset_type IN (
    'H_CORE', 'H_CONSTITUTIVE_SCAR', 'H_CONSTITUTIVE_RITUAL',
    'H_FRAME_PACKAGE', 'H_PAINTING_PACKAGE'
  ));
-- Server restricts new requests to0..9 and the matching owner/asset scope.
-- Legacy RITUAL rows remain readable for history, never automatically served.
COMMIT;
