import type { SupabaseClient } from 'npm:@supabase/supabase-js@2.95.0';
import { ArchiveAccessError, type ArchiveAssetType, type ArchiveChallengeRecord,
  type TransmissionDependencies } from './transmission-service.ts';

function mapChallenge(row: Record<string, unknown>): ArchiveChallengeRecord {
  return {
    nonceHash: String(row.nonce_hash),
    address: String(row.requester_address),
    tokenId: Number(row.token_id),
    assetType: String(row.asset_type) as ArchiveAssetType,
    origin: String(row.request_origin),
    message: String(row.signed_message),
    issuedAt: String(row.issued_at),
    expiresAt: String(row.expires_at),
    usedAt: row.used_at ? String(row.used_at) : null,
  };
}

export function createArchiveStorageDependencies(supabase: SupabaseClient): Pick<TransmissionDependencies,
  'getAsset' | 'createSignedUrl' | 'writeAuditLog' | 'hasAcquisitionAuthorization'> {
  return {
      async hasAcquisitionAuthorization(address: string): Promise<boolean> {
        const { data, error } = await supabase
          .schema('private')
          .from('acquisition_authorizations')
          .select('authorization_id')
          .eq('wallet_address', address.toLowerCase())
          .limit(1);
        if (error) throw error;
        return Boolean(data && data.length > 0);
      },
      async getAsset(tokenId, assetType) {
        const { data, error } = await supabase
          .from('stewardship_assets')
          .select('token_id,asset_type,asset_hash,archive_commitment,file_path')
          .eq('token_id', tokenId)
          .eq('asset_type', assetType)
          .maybeSingle();
        if (error) throw error;
        return data ? {
          tokenId: Number(data.token_id),
          assetType: String(data.asset_type) as ArchiveAssetType,
          assetHash: String(data.asset_hash),
          archiveCommitment: String(data.archive_commitment),
          filePath: String(data.file_path),
        } : null;
      },
      async createSignedUrl(filePath, expiresInSeconds) {
        const { data, error } = await supabase.storage
          .from('stewardship-private-archive')
          .createSignedUrl(filePath, expiresInSeconds);
        if (error || !data?.signedUrl) throw error ?? new Error('Signed URL unavailable.');
        return data.signedUrl;
      },
      async writeAuditLog(entry) {
        const { error } = await supabase.from('transmission_audit_logs').insert({
          requester_address: entry.address,
          token_id: entry.tokenId,
          asset_type: entry.assetType,
          verification_hash: entry.assetHash,
          archive_commitment: entry.archiveCommitment,
          authorization_block_number: entry.authorizationBlockNumber,
          authorization_block_hash: entry.authorizationBlockHash,
          expires_at: entry.expiresAt,
        });
        if (error) throw error;
      },
  };
}
