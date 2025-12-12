import React from 'react';
import { Experience } from '@/lib/types';
import { Plus, Trash2, Info } from 'lucide-react';

// Guidance tooltip component
function SectionGuidance({ title, tips }: { title: string; tips: string[] }) {
  return (
    <div className="p-4 glass-subtle rounded-xl border border-orange-500/20 mb-6">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
          <Info className="h-4 w-4 text-orange-400" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-orange-300 mb-1">{title}</h4>
          <ul className="text-xs text-stone-400 space-y-1">
            {tips.map((tip, idx) => (
              <li key={idx}>• {tip}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

interface ExperienceSectionProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

export default function ExperienceSection({ data, onChange }: ExperienceSectionProps) {
  const addExperience = () => {
    onChange([
      ...data,
      {
        title: '',
        company: '',
        location: '',
        start: '',
        end: 'present',
        employment_type: 'full-time',
        bullets: ['']
      }
    ]);
  };

  const removeExperience = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addBullet = (expIndex: number) => {
    const newData = [...data];
    newData[expIndex].bullets.push('');
    onChange(newData);
  };

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const newData = [...data];
    newData[expIndex].bullets[bulletIndex] = value;
    onChange(newData);
  };

  const removeBullet = (expIndex: number, bulletIndex: number) => {
    const newData = [...data];
    newData[expIndex].bullets = newData[expIndex].bullets.filter((_, i) => i !== bulletIndex);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Work Experience</h2>
        <p className="text-stone-400">Add your professional experience</p>
      </div>

      <SectionGuidance
        title="Tips for a stronger profile"
        tips={[
          "One role with title + company + 2 achievements = 40% profile score",
          "Focus on quantifiable results (%, $, time saved)",
          "Include relevant keywords from your target job descriptions",
          "Recent graduates: internships, co-ops, and projects count!"
        ]}
      />

      <div className="space-y-6">
        {data.map((exp, expIndex) => (
          <div key={expIndex} className="p-6 glass-subtle rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">
                Experience #{expIndex + 1}
              </h3>
              {data.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExperience(expIndex)}
                  className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  Job Title <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={exp.title}
                  onChange={(e) => updateExperience(expIndex, 'title', e.target.value)}
                  className="input-glass"
                  placeholder="Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  Company <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(expIndex, 'company', e.target.value)}
                  className="input-glass"
                  placeholder="Tech Corp"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={exp.location}
                  onChange={(e) => updateExperience(expIndex, 'location', e.target.value)}
                  className="input-glass"
                  placeholder="San Francisco, CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  Employment Type
                </label>
                <select
                  value={exp.employment_type}
                  onChange={(e) => updateExperience(expIndex, 'employment_type', e.target.value)}
                  className="select-glass"
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                  <option value="internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  Start Date (YYYY-MM)
                </label>
                <input
                  type="month"
                  value={exp.start}
                  onChange={(e) => updateExperience(expIndex, 'start', e.target.value)}
                  className="input-glass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  End Date (YYYY-MM or "present")
                </label>
                <div className="flex gap-2">
                  <input
                    type={exp.end === 'present' ? 'text' : 'month'}
                    value={exp.end}
                    onChange={(e) => updateExperience(expIndex, 'end', e.target.value)}
                    className="input-glass flex-1"
                    disabled={exp.end === 'present'}
                  />
                  <button
                    type="button"
                    onClick={() => updateExperience(expIndex, 'end', exp.end === 'present' ? '' : 'present')}
                    className="px-4 py-2 glass-subtle hover:bg-white/10 rounded-lg transition-colors text-sm font-medium text-stone-300"
                  >
                    {exp.end === 'present' ? 'Set End' : 'Present'}
                  </button>
                </div>
              </div>
            </div>

            {/* Bullets */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Key Achievements & Responsibilities
              </label>
              <div className="space-y-2">
                {exp.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex gap-2">
                    <textarea
                      value={bullet}
                      onChange={(e) => updateBullet(expIndex, bulletIndex, e.target.value)}
                      className="textarea-glass flex-1"
                      placeholder="• Built scalable microservices that improved performance by 40%..."
                      rows={2}
                    />
                    {exp.bullets.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeBullet(expIndex, bulletIndex)}
                        className="px-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addBullet(expIndex)}
                  className="px-4 py-2 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors font-medium text-sm"
                >
                  + Add Achievement
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addExperience}
        className="w-full py-3 border-2 border-dashed border-stone-700 rounded-xl text-stone-400 hover:border-orange-500 hover:text-orange-400 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Experience
      </button>
    </div>
  );
}
