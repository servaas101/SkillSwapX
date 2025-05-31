import { useEffect, useRef } from 'react';
import { skl } from '../../lib/skills';

type Props = {
  uid: string;
  size?: number;
};

export function SkillRadar({ uid, size = 400 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const loadSkills = async () => {
      const skills = await skl.get(uid);
      if (!skills || !canvasRef.current) return;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, size, size);

      // Draw radar
      const center = size / 2;
      const radius = (size - 40) / 2;
      const categories = [...new Set(skills.map(s => s.category))];
      const angle = (2 * Math.PI) / categories.length;

      // Draw axes
      categories.forEach((_, i) => {
        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.lineTo(
          center + radius * Math.cos(i * angle),
          center + radius * Math.sin(i * angle)
        );
        ctx.strokeStyle = '#e5e7eb';
        ctx.stroke();
      });

      // Draw skill points
      skills.forEach(skill => {
        const catIndex = categories.indexOf(skill.category);
        const dist = (skill.level / 5) * radius;
        
        ctx.beginPath();
        ctx.arc(
          center + dist * Math.cos(catIndex * angle),
          center + dist * Math.sin(catIndex * angle),
          4,
          0,
          2 * Math.PI
        );
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
      });
    };

    loadSkills();
  }, [uid, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className="mx-auto"
    />
  );
}