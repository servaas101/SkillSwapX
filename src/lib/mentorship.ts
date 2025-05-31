import { sb } from './supabase';
import { bc } from './blockchain';

// Mentorship service
export const mtr = {
  // Get mentor programs
  async getPrograms(mentorId?: string) {
    const query = sb
      .from('mentorship_programs')
      .select(`
        *,
        mentor:profiles!mentorship_programs_mentor_id_fkey(
          id, fn, ln, img
        ),
        sessions:mentorship_sessions(
          id, mentee_id, scheduled_at, status
        ),
        progress:mentorship_progress(
          milestone, status, completed_at
        )
      `)
      .eq('status', 'active');
      
    if (mentorId) {
      query.eq('mentor_id', mentorId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Schedule session
  async scheduleSession(
    programId: string,
    menteeId: string,
    scheduledAt: Date,
    duration: number
  ) {
    const { data, error } = await sb.rpc('schedule_mentorship_session', {
      p_program_id: programId,
      p_mentee_id: menteeId,
      p_scheduled_at: scheduledAt.toISOString(),
      p_duration: duration
    });
    
    if (error) throw error;
    return data;
  },

  // Update progress
  async updateProgress(
    programId: string,
    menteeId: string,
    milestone: string,
    status: string,
    evidence?: any
  ) {
    const { data, error } = await sb.rpc('update_mentorship_progress', {
      p_program_id: programId,
      p_mentee_id: menteeId,
      p_milestone: milestone,
      p_status: status,
      p_evidence: evidence
    });
    
    if (error) throw error;
    return data;
  },

  // Issue badge
  async issueBadge(
    programId: string,
    menteeId: string,
    badgeId: string
  ) {
    try {
      // Issue badge through RPC
      const { data, error } = await sb.rpc('issue_mentorship_badge', {
        p_program_id: programId,
        p_mentee_id: menteeId,
        p_badge_id: badgeId
      });
      
      if (error) throw error;

      // Get badge metadata
      const { data: badge } = await sb
        .from('mentorship_badges')
        .select('*')
        .eq('id', badgeId)
        .single();

      if (!badge) throw new Error('Badge not found');

      // Create NFT metadata
      const metadata = {
        name: badge.name,
        description: badge.description,
        image: badge.metadata?.image,
        attributes: {
          level: badge.level,
          issuedAt: new Date().toISOString(),
          programId,
          menteeId
        }
      };

      // Store metadata on IPFS
      const uri = await bc.store(metadata);

      // Mint NFT
      const txHash = await bc.mint(menteeId, uri);

      return {
        badgeId: data,
        txHash,
        uri
      };
    } catch (e) {
      console.error('Failed to issue badge:', e);
      throw e;
    }
  },

  // Get mentor stats
  async getMentorStats(mentorId: string) {
    const { data, error } = await sb.rpc('calculate_mentor_reputation', {
      p_mentor_id: mentorId
    });
    
    if (error) throw error;
    return data;
  }
};