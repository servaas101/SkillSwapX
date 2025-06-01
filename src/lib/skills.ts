import * as jsonld from 'jsonld';
import { sb } from './supabase';

export class Skl {
  constructor() {}

  async get(uid: string) {
    try {
      const { data, error } = await sb
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
        
      if (error) {
        console.error('Skills fetch error:', error);
        return [];
      }
      
      return data || [];
    } catch (e) {
      console.error('Skills error:', e);
      return [];
    }
  }

  async uSk(
    name: string,
    category: string,
    subcategory: string | null,
    level: number,
    years: number
  ) {
    try {
      return sb.rpc('upsert_skill', {
        p_skill_name: name,
        p_category: category,
        p_subcategory: subcategory,
        p_level: level,
        p_years: years
      });
    } catch (e) {
      console.error('Upsert skill error:', e);
      throw e;
    }
  }

  async end(sid: string, rat: number, cmt: string) {
    try {
      return sb.rpc('endorse_skill', {
        p_skill_id: sid,
        p_rating: rat,
        p_comment: cmt
      });
    } catch (e) {
      console.error('Endorse skill error:', e);
      throw e;
    }
  }

  async gap(eid: string, rid: string) {
    try {
      const { data, error } = await sb.rpc('analyze_skill_gaps', {
        p_emp_id: eid,
        p_role_id: rid
      });
      
      if (error) {
        console.error('Skill gap analysis error:', error);
        return [];
      }
      
      return data || [];
    } catch (e) {
      console.error('Skill gap error:', e);
      return [];
    }
  }

  async rec(eid: string) {
    try {
      const { data, error } = await sb.rpc('get_skill_recommendations', {
        p_emp_id: eid
      });
      
      if (error) {
        console.error('Skill recommendations error:', error);
        return [];
      }
      
      return data || [];
    } catch (e) {
      console.error('Skill recommendations error:', e);
      return [];
    }
  }

  async exp(eid: string) {
    try {
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
    } catch (e) {
      console.error('Skills export error:', e);
      throw e;
    }
  }
}

export const skl = new Skl();