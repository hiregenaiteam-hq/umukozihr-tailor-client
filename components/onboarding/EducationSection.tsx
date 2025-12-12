import React from 'react';
import { Education } from '@/lib/types';
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

interface EducationSectionProps {
  data: Education[];
  onChange: (data: Education[]) => void;
}

export default function EducationSection({ data, onChange }: EducationSectionProps) {
  const addEducation = () => {
    onChange([...data, { school: '', degree: '', start: '', end: '', gpa: null }]);
  };

  const removeEducation = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Education</h2>
        <p className="text-stone-400">Add your educational background</p>
      </div>

      <SectionGuidance
        title="Education Requirements"
        tips={[
          "One entry with school + degree = 15% profile score",
          "Include bootcamps, certifications, or online courses",
          "Self-taught? Skip this section — your projects will shine!"
        ]}
      />

      <div className="space-y-4">
        {data.map((edu, index) => (
          <div key={index} className="p-6 glass-subtle rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">Education #{index + 1}</h3>
              {data.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  School/University <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                  className="input-glass"
                  placeholder="University of California, Berkeley"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-300 mb-2">
                  Degree <span className="text-orange-400">*</span>
                </label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  className="input-glass"
                  placeholder="Bachelor of Science in Computer Science"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Start Date</label>
                <input
                  type="month"
                  value={edu.start}
                  onChange={(e) => updateEducation(index, 'start', e.target.value)}
                  className="input-glass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">End Date</label>
                <input
                  type="month"
                  value={edu.end}
                  onChange={(e) => updateEducation(index, 'end', e.target.value)}
                  className="input-glass"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">GPA (Optional)</label>
                <input
                  type="text"
                  value={edu.gpa || ''}
                  onChange={(e) => updateEducation(index, 'gpa', e.target.value || null)}
                  className="input-glass"
                  placeholder="3.8/4.0"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addEducation}
        className="w-full py-3 border-2 border-dashed border-stone-700 rounded-xl text-stone-400 hover:border-orange-500 hover:text-orange-400 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Education
      </button>
    </div>
  );
}
