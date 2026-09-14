--
-- Production Seeding: stewardship_assets
-- Generated from CANONICAL-RELEASE-ARTIFACT-MANIFEST.json
-- Release ID: hien-sinh-pre-release-2026-09-02
--

BEGIN;

-- 1. Clean existing records if needed
DELETE FROM public.stewardship_assets WHERE token_id >= 0 AND token_id <= 9;

-- 2. Insert the 10 canonical release archive records
INSERT INTO public.stewardship_assets (token_id, asset_type, asset_hash, archive_commitment, file_path)
VALUES
  (0, 'H_PAINTING_PACKAGE', '0x83117dc8df49f5164a776d2b28e54b5eee36aff6d22b3275a00fb5b18df93b18', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Painting.zip'),
  (1, 'H_FRAME_PACKAGE', '0x40efece8ff5b45b479e225f3c6c17530cf83ed77893d86510470ece222ff52e1', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-01.zip'),
  (2, 'H_FRAME_PACKAGE', '0x3ff9647e5f97d55f2257f9818fcbe5d00ab72329c72353020e0ad6ee59f07cac', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-02.zip'),
  (3, 'H_FRAME_PACKAGE', '0x136fcbeb4b18eb7780f2edaabc2c851cd2283647e072c46440ec3e3e13be3bc4', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-03.zip'),
  (4, 'H_FRAME_PACKAGE', '0x839121b52bcccf94efaaf5ce592d0a301ce5e273f597009d431389c39687226d', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-04.zip'),
  (5, 'H_FRAME_PACKAGE', '0x9744bba0b13afdacd753cf2dd8fd59564c1a8ebc43ae93bd56b9fe485836f1a1', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-05.zip'),
  (6, 'H_FRAME_PACKAGE', '0xf6fa89eb63f68ab467a07fc8f02be7e3cc6182eaf8f241a7aa29512329d05005', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-06.zip'),
  (7, 'H_FRAME_PACKAGE', '0x2f271568885ed566fd49cada06392402c07b14d661947c5b48ea3454f0e08e50', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-07.zip'),
  (8, 'H_FRAME_PACKAGE', '0x0abc4678775a9a01deee8b20e65ec04715feb2939f3ba3c1b48d5574e63f38af', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-08.zip'),
  (9, 'H_FRAME_PACKAGE', '0x50987ce80a75c798a1c09f62f1f1ab4e3db8e171bef85dc12e9f3ab5212b9c0a', '0x7689f75da4ef23bf040ad57f282b24b84f6ede5e17b92cb5cd6a4dc96fced5e9', 'Hien-Sinh-Frame-09.zip');

COMMIT;
