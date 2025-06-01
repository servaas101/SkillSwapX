import { Db } from './supabase';
import * as jsonld from 'jsonld';

export class Skl {
  private db: Db;

  constructor() {
    this.db = new Db();
  }

  async get(uid: string) {
    const { data } = await sb
      .from('skill_inventory')
      .select(`
        *,
        endorsements:skill_endorsements(
          id,
          rating,
          comment,
          created_at,
          endorser:profiles(id, fn, ln, img)
        )
      `)
      .eq('emp_id', uid)
      .order('category', { ascending: true });
    return data || [];
  },

  async uSk(
    name: string,
    category: string,
    subcategory: string | null,
    level: number,
    years: number
  ) {
    return sb.rpc('upsert_skill', {
      p_skill_name: name,
      p_category: category,
      p_subcategory: subcategory,
      p_level: level,
      p_years: years
    });
  },

  async end(sid: string, rat: number, cmt: string) {
    return sb.rpc('endorse_skill', {
      p_skill_id: sid,
      p_rating: rat,
      p_comment: cmt
    });
  },

  async gap(eid: string, rid: string) {
    const { data } = await sb.rpc('analyze_skill_gaps', {
      p_emp_id: eid,
      p_role_id: rid
    });
    return data || [];
  },

  async rec(eid: string) {
    const { data } = await sb.rpc('get_skill_recommendations', {
      p_emp_id: eid
    });
    return data || [];
  },

  async exp(eid: string) {
    const skl = await this.get(eid);
    
    const context = {
      "@context": {
        "@vocab": "https://schema.org/",
        "hasSkill": "knows",
        "skillLevel": "proficiencyLevel",
        "endorsements": "recommendationCount",
        "category": "additionalType"
      }
    };

    const data = {
      "@type": "Person",
      "hasSkill": skl?.map(s => ({
        "@type": "Skill",
        "name": s.skill_name,
        "skillLevel": s.proficiency_level,
        "category": s.category,
        "subcategory": s.subcategory,
        "yearsExperience": s.years_experience,
        "endorsements": s.endorsements?.length || 0
      }))
    };

    return jsonld.compact(data, context);
  }
}