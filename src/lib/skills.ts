import { sb } from './supabase';
import * as jsonld from 'jsonld';

// Skill taxonomy service
export const skl = {
  // Get user skills
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

  // Add or update skill
  async upsert(
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

  // Endorse skill
  async endorse(skillId: string, rating: number, comment: string) {
    return sb.rpc('endorse_skill', {
      p_skill_id: skillId,
      p_rating: rating,
      p_comment: comment
    });
  },

  // Get skill gaps
  async getGaps(empId: string, roleId: string) {
    const { data } = await sb.rpc('analyze_skill_gaps', {
      p_emp_id: empId,
      p_role_id: roleId
    });
    return data || [];
  },

  // Get skill recommendations
  async getRecommendations(empId: string) {
    const { data } = await sb.rpc('get_skill_recommendations', {
      p_emp_id: empId
    });
    return data || [];
  },

  // Export skills as JSON-LD
  async export(empId: string) {
    const skills = await this.get(empId);
    
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
      "hasSkill": skills?.map(s => ({
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
};