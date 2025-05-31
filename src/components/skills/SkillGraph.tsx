import { useEffect, useRef } from 'react';
import Sigma from 'sigma';
import { sg } from '../../lib/skill-graph';

export function SkillGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const loadGraph = async () => {
      if (!containerRef.current) return;
      
      // Initialize skill graph
      const graph = await sg.init();
      
      // Render with Sigma
      new Sigma(graph, containerRef.current, {
        renderEdgeLabels: false,
        defaultNodeColor: '#999',
        defaultEdgeColor: '#ccc'
      });
    };
    
    loadGraph();
  }, []);

  return (
    <div className="relative h-[600px] w-full rounded-lg border bg-white shadow-sm">
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}