import { sb } from './supabase';
import { bc } from './blockchain';

// Badge service
export const bdg = {
  // Get badge templates
  async getTemplates() {
    const { data } = await sb
      .from('badge_templates')
      .select('*')
      .order('created_at', { ascending: true });
    return data || [];
  },

  // Get user badges
  async getUserBadges(uid: string) {
    const { data } = await sb
      .from('badge_issuance')
      .select(`
        *,
        badge:badge_templates(*),
        issuer:profiles!badge_issuance_issuer_id_fkey(
          id, fn, ln, img
        )
      `)
      .eq('recipient_id', uid)
      .order('issued_at', { ascending: false });
    return data || [];
  },

  // Issue badge
  async issue(
    badgeId: string,
    recipientId: string,
    evidence: any
  ) {
    try {
      // Create badge metadata
      const metadata = {
        ...evidence,
        issuedAt: new Date().toISOString()
      };

      // Store metadata and get IPFS URI
      const uri = await bc.store(metadata);

      // Issue badge
      const { data, error } = await sb.rpc('issue_badge', {
        p_badge_id: badgeId,
        p_recipient_id: recipientId,
        p_evidence: {
          ...evidence,
          uri
        }
      });

      if (error) throw error;

      return data;
    } catch (e) {
      console.error('Failed to issue badge:', e);
      throw e;
    }
  },

  // Verify badge
  async verify(badgeId: string) {
    try {
      const { data: badge } = await sb
        .from('badge_issuance')
        .select('*')
        .eq('id', badgeId)
        .single();

      if (!badge) {
        throw new Error('Badge not found');
      }

      // Verify on blockchain
      const verification = await bc.verify(badge.evidence.uri);

      return {
        valid: verification.valid,
        metadata: verification.metadata
      };
    } catch (e) {
      console.error('Failed to verify badge:', e);
      throw e;
    }
  }
};