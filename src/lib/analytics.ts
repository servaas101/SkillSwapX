import { sb } from './supabase';

// Analytics service
export const analytics = {
  // Get skill gaps analysis
  async getSkillGaps(orgId: string) {
    const { data, error } = await sb.rpc('analyze_skill_gaps', {
      p_org_id: orgId
    });
    
    if (error) throw error;
    return data;
  },

  // Get project staffing recommendations
  async getProjectStaffing(projectId: string) {
    const { data, error } = await sb.rpc('get_project_staffing', {
      p_project_id: projectId
    });
    
    if (error) throw error;
    return data;
  },

  // Track skill trends
  async trackSkillTrend(skillName: string, months = 6) {
    const { data, error } = await sb.rpc('track_skill_trend', {
      p_skill_name: skillName,
      p_months: months
    });
    
    if (error) throw error;
    return data;
  },

  // Get compliance metrics
  async getComplianceMetrics(orgId: string) {
    const { data, error } = await sb
      .from('compliance_logs')
      .select('typ, act, ts')
      .eq('org_id', orgId)
      .order('ts', { ascending: false });
      
    if (error) throw error;
    
    // Calculate compliance metrics
    const metrics = {
      gdpr: 0,
      ccpa: 0,
      hipaa: 0,
      total: 0
    };
    
    data?.forEach(log => {
      metrics.total++;
      if (log.typ === 'gdpr') metrics.gdpr++;
      if (log.typ === 'ccpa') metrics.ccpa++;
      if (log.typ === 'hipaa') metrics.hipaa++;
    });
    
    return metrics;
  }
};