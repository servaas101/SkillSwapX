import { sb } from './supabase';
import * as jsonld from 'jsonld';

// Mock data for development
const mockTrends = {
  react: [
    { month: 'Jan', demand: 85 },
    { month: 'Feb', demand: 88 },
    { month: 'Mar', demand: 90 },
    { month: 'Apr', demand: 92 },
    { month: 'May', demand: 95 }
  ],
  blockchain: [
    { month: 'Jan', demand: 70 },
    { month: 'Feb', demand: 75 },
    { month: 'Mar', demand: 82 },
    { month: 'Apr', demand: 85 },
    { month: 'May', demand: 88 }
  ],
  ai: [
    { month: 'Jan', demand: 90 },
    { month: 'Feb', demand: 92 },
    { month: 'Mar', demand: 95 },
    { month: 'Apr', demand: 97 },
    { month: 'May', demand: 98 }
  ]
};

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
    return data || [];
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
  },

  // Get organization skill gaps
  async getGaps(orgId: string) {
    try {
      const { data } = await sb.rpc('analyze_skill_gaps', {
        p_org_id: orgId
      });
      return data || [];
    } catch (e) {
      // Mock data for development
      return [
        { name: 'AI/ML', required: 4, current: 2, gap: 2, course: 'Advanced ML', duration: '3 months' },
        { name: 'Blockchain', required: 3, current: 1, gap: 2, course: 'DeFi Basics', duration: '2 months' },
        { name: 'Cloud Native', required: 4, current: 3, gap: 1, course: 'K8s Advanced', duration: '1 month' },
        { name: 'DevOps', required: 3, current: 2, gap: 1, course: 'CI/CD Pipeline', duration: '2 weeks' }
      ];
    }
  },

  // Get project staffing recommendations
  async getStaffing(projectId: string) {
    try {
      const { data } = await sb.rpc('get_project_staffing', {
        p_project_id: projectId
      });
      return data || [];
    } catch (e) {
      // Mock data for development
      return [
        {
          id: '1',
          name: 'Alice Chen',
          title: 'Senior Developer',
          experience: 8,
          score: 95,
          skills: [
            { name: 'Blockchain', level: 4 },
            { name: 'Smart Contracts', level: 4 },
            { name: 'DeFi', level: 3 },
            { name: 'Web3', level: 4 }
          ]
        },
        {
          id: '2',
          name: 'Bob Smith',
          title: 'Tech Lead',
          experience: 10,
          score: 90,
          skills: [
            { name: 'Blockchain', level: 3 },
            { name: 'Architecture', level: 5 },
            { name: 'Security', level: 4 },
            { name: 'Leadership', level: 5 }
          ]
        },
        {
          id: '3',
          name: 'Carol Wu',
          title: 'Blockchain Developer',
          experience: 5,
          score: 88,
          skills: [
            { name: 'Blockchain', level: 5 },
            { name: 'Solidity', level: 4 },
            { name: 'React', level: 3 },
            { name: 'TypeScript', level: 4 }
          ]
        }
      ];
    }
  },

  // Get skill adjacency recommendations
  async getAdjacent(skillId: string) {
    try {
      const { data } = await sb.rpc('get_adjacent_skills', {
        p_skill_id: skillId
      });
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // Get learning recommendations
  async getLearning(uid: string) {
    try {
      const { data } = await sb.rpc('get_learning_path', {
        p_uid: uid
      });
      return data || [];
    } catch (e) {
      return [];
    }
  },

  // Track skill trend
  async trackTrend(skillName: string) {
    try {
      const { data } = await sb.rpc('track_skill_trend', {
        p_skill_name: skillName
      });
      return data || [];
    } catch (e) {
      // Return mock trend data in development
      return mockTrends[skillName as keyof typeof mockTrends] || [];
    }
  }
};