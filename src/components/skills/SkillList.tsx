import { useState, useEffect } from 'react';
import { Award, ThumbsUp, Download } from 'lucide-react';
import { skl } from '../../lib/skills';

type Props = {
  uid: string;
};

export function SkillList({ uid }: Props) {
  const [skills, setSkills] = useState<any[]>([]);
  const [ldg, setLdg] = useState(true);

  useEffect(() => {
    const lSkl = async () => {
      try {
        const d = await skl.get(uid);
        if (d) setSkills(d);
      } catch (e) {
        console.error('Failed to load skills:', e);
      } finally {
        setLdg(false);
      }
    };

    lSkl();
  }, [uid]);

  const hEnd = async (id: string) => {
    try {
      await skl.endorse(id);
      const d = await skl.get(uid);
      if (d) setSkills(d);
    } catch (e) {
      console.error('Failed to endorse skill:', e);
    }
  };

  const hExp = async () => {
    try {
      const d = await skl.export(uid);
      const b = new Blob([JSON.stringify(d, null, 2)], {
        type: 'application/ld+json'
      });
      const u = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = u;
      a.download = 'skills.jsonld';
      a.click();
      URL.revokeObjectURL(u);
    } catch (e) {
      console.error('Failed to export skills:', e);
    }
  };

  if (ldg) {
    return (
      <div className="flex justify-center p-6">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Skills & Expertise</h2>
        <button
          onClick={hExp}
          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <Download className="mr-2 h-4 w-4" />
          Export JSON-LD
        </button>
      </div>

      <div className="divide-y divide-gray-200">
        {skills.map(skill => (
          <div key={skill.id} className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-blue-600" />
                  <h3 className="ml-2 text-lg font-medium text-gray-900">
                    {skill.name}
                  </h3>
                  <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    {skill.category}
                  </span>
                </div>
                <div className="mt-1">
                  <div className="flex items-center">
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-600"
                        style={{ width: `${(skill.level / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      Level {skill.level}/5
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => hEnd(skill.id)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                {skill.skill_endorsements?.length || 0}
              </button>
            </div>

            {skill.skill_endorsements?.length > 0 && (
              <div className="mt-2 flex -space-x-2">
                {skill.skill_endorsements.map((e: any) => (
                  <div
                    key={e.endorser.id}
                    className="relative inline-block h-8 w-8 rounded-full border-2 border-white bg-gray-100"
                    title={`${e.endorser.fn} ${e.endorser.ln}`}
                  >
                    {e.endorser.img ? (
                      <img
                        src={e.endorser.img}
                        alt={`${e.endorser.fn} ${e.endorser.ln}`}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                        {e.endorser.fn[0]}
                        {e.endorser.ln[0]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}