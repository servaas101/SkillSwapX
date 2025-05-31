import { sb } from './supabase';
import * as jsonld from 'jsonld';

// Skill taxonomy service
export const skl = {
  // Get user skills
  async get(uid: string) {
    const { data } = await sb
      .from('skills')
      .select(`
        *,
        skill_endorsements (
          endorser:profiles(id, fn, ln, img)
        )
      `)
      .eq('uid', uid)
      .order('weight', { ascending: false });
    return data;
  },

  // Add new skill
  async add(name: string, level: number, category: string) {
    const { data } = await sb
      .from('skills')
      .insert({
        name,
        level,
        category,
        weight: 1
      })
      .select()
      .single();
    return data;
  },

  // Endorse skill
  async endorse(id: string) {
    return sb.rpc('endorse_skill', {
      p_skill_id: id
    });
  },

  // Export skills as JSON-LD
  async export(uid: string) {
    const skills = await this.get(uid);
    
    const context = {
      "@context": {
        "@vocab": "https://schema.org/",
        "hasSkill": "knows",
        "skillLevel": "proficiencyLevel",
        "endorsements": "recommendationCount"
      }
    };

    const data = {
      "@type": "Person",
      "hasSkill": skills?.map(s => ({
        "@type": "Skill",
        "name": s.name,
        "skillLevel": s.level,
        "category": s.category,
        "endorsements": s.skill_endorsements?.length || 0
      }))
    };

    return jsonld.compact(data, context);
  }
};