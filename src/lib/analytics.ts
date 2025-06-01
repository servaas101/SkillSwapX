import { Db } from './supabase';

export class Ana {
  private db: Db;

  constructor() {
    this.db = new Db();
  }

  async gap(oid: string) {
    const { data, error } = await sb.rpc('analyze_skill_gaps', {
      p_org_id: oid
    });
    
    if (error) throw error;
    return data;
  }

  async stf(pid: string) {
    const { data, error } = await sb.rpc('get_project_staffing', {
      p_project_id: pid
    });
    
    if (error) throw error;
    return data;
  }

  async trd(skl: string, mon = 6) {
    const { data, error } = await sb.rpc('track_skill_trend', {
      p_skill_name: skl,
      p_months: mon
    });
    
    if (error) throw error;
    return data;
  }

  async met(oid: string) {
    const { data, error } = await sb
      .from('compliance_logs')
      .select('typ, act, ts')
      .eq('org_id', oid)
      .order('ts', { ascending: false });
      
    if (error) throw error;
    
    const met = {
      gdpr: 0,
      ccpa: 0,
      hipaa: 0,
      total: 0
    };
    
    data?.forEach(log => {
      met.total++;
      if (log.typ === 'gdpr') met.gdpr++;
      if (log.typ === 'ccpa') met.ccpa++;
      if (log.typ === 'hipaa') met.hipaa++;
    });
    
    return met;
  }
}