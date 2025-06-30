import Graph from 'graphology';
import forceAtlas2 from 'graphology-layout-force';
import { sb } from './supabase';

// Skill graph service
export const sg = {
  // Initialize graph
  async init() {
    const g = new Graph();
    
    // Load skills from Supabase
    const { data: skills } = await sb
      .from('skills')
      .select('*')
      .order('weight', { ascending: false });
      
    if (skills) {
      // Add nodes
      skills.forEach(s => {
        g.addNode(s.id, {
          label: s.name,
          size: s.weight,
          color: s.category ? `#${s.category}` : '#666'
        });
      });
      
      // Add edges based on relationships
      skills.forEach(s => {
        if (s.related) {
          s.related.forEach((r: unknown) => {
            if (g.hasNode(r)) {
              g.addEdge(s.id, r, { weight: 1 });
            }
          });
        }
      });
    }
    
    // Apply force-directed layout
    forceAtlas2.assign(g, { iterations: 100 });
    
    return g;
  },
  
  // Get skill recommendations
  async recommend(uid: string) {
    const { data } = await sb.rpc('get_skill_recommendations', {
      p_uid: uid,
      p_limit: 5
    });
    return data;
  },
  
  // Update skill weights
  async updateWeight(id: string, w: number) {
    return sb.rpc('update_skill_weight', {
      p_id: id,
      p_weight: w
    });
  }
};