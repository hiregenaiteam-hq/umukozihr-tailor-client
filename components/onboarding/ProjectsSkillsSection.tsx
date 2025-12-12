import React from 'react';
import { Project, Skill, Certification, Award, Language } from '@/lib/types';
import { Plus, Trash2, X, Info } from 'lucide-react';

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

// Projects Section
interface ProjectsSectionProps {
  data: Project[];
  onChange: (data: Project[]) => void;
}

export function ProjectsSection({ data, onChange }: ProjectsSectionProps) {
  const addProject = () => {
    onChange([...data, { name: '', url: '', stack: [], bullets: [''] }]);
  };

  const removeProject = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addStack = (projIndex: number, tech: string) => {
    if (!tech.trim()) return;
    const newData = [...data];
    newData[projIndex].stack.push(tech);
    onChange(newData);
  };

  const removeStack = (projIndex: number, techIndex: number) => {
    const newData = [...data];
    newData[projIndex].stack = newData[projIndex].stack.filter((_, i) => i !== techIndex);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Projects</h2>
        <p className="text-stone-400">Showcase your notable projects</p>
      </div>

      <SectionGuidance
        title="Projects help you stand out"
        tips={[
          "One project with name + 2 bullet points = 10% profile score",
          "Include side projects, hackathons, open source contributions",
          "Link to live demos or GitHub repos when possible"
        ]}
      />

      <div className="space-y-4">
        {data.map((proj, index) => (
          <div key={index} className="p-6 glass-subtle rounded-xl border border-white/10">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-white">Project #{index + 1}</h3>
              <button
                type="button"
                onClick={() => removeProject(index)}
                className="text-red-600 hover:bg-red-50 p-2 rounded transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={proj.name}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  className="input-glass"
                  placeholder="AI Resume Tailor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Project URL</label>
                <input
                  type="url"
                  value={proj.url}
                  onChange={(e) => updateProject(index, 'url', e.target.value)}
                  className="input-glass"
                  placeholder="https://github.com/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Tech Stack</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {proj.stack.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm flex items-center gap-1 border border-orange-500/30"
                    >
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeStack(index, techIndex)}
                        className="hover:bg-orange-500/30 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      const value = e.currentTarget.value.trim();
                      if (value) {
                        // Split by comma and add each tech separately
                        const techs = value.split(',').map(t => t.trim()).filter(t => t);
                        techs.forEach(tech => addStack(index, tech));
                        e.currentTarget.value = '';
                      }
                    }
                  }}
                  className="input-glass"
                  placeholder="Type technologies separated by commas or press Enter (e.g., React, Python, AWS)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-2">Description Points</label>
                {proj.bullets.map((bullet, bIndex) => (
                  <textarea
                    key={bIndex}
                    value={bullet}
                    onChange={(e) => {
                      const newData = [...data];
                      newData[index].bullets[bIndex] = e.target.value;
                      onChange(newData);
                    }}
                    className="textarea-glass mb-2"
                    placeholder="Key achievement or feature..."
                    rows={2}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addProject}
        className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-stone-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Project
      </button>
    </div>
  );
}

// Skills Section
interface SkillsSectionProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
}

export function SkillsSection({ data, onChange }: SkillsSectionProps) {
  const addSkill = () => {
    onChange([...data, { name: '', level: 'intermediate', keywords: [] }]);
  };

  const removeSkill = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateSkill = (index: number, field: keyof Skill, value: any) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  const addKeyword = (skillIndex: number, keyword: string) => {
    if (!keyword.trim()) return;
    const newData = [...data];
    newData[skillIndex].keywords.push(keyword);
    onChange(newData);
  };

  const removeKeyword = (skillIndex: number, kwIndex: number) => {
    const newData = [...data];
    newData[skillIndex].keywords = newData[skillIndex].keywords.filter((_, i) => i !== kwIndex);
    onChange(newData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Skills</h2>
        <p className="text-stone-400">List your technical and professional skills</p>
      </div>

      <SectionGuidance
        title="Skill requirements for best results"
        tips={[
          "5+ skills = 10% profile score (3 skills = 7%, 1 skill = 4%)",
          "Include both technical and soft skills",
          "Add keywords that match job descriptions you're targeting"
        ]}
      />

      <div className="space-y-4">
        {data.map((skill, index) => (
          <div key={index} className="p-4 glass-subtle rounded-xl border border-white/10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-stone-300 mb-1">Skill Name</label>
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateSkill(index, 'name', e.target.value)}
                  className="input-glass"
                  placeholder="Python"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-300 mb-1">Level</label>
                <select
                  value={skill.level}
                  onChange={(e) => updateSkill(index, 'level', e.target.value)}
                  className="select-glass"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">Related Keywords</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skill.keywords.map((kw, kwIndex) => (
                  <span key={kwIndex} className="px-2 py-1 bg-orange-500/20 text-orange-300 rounded text-sm flex items-center gap-1 border border-orange-500/30">
                    {kw}
                    <button
                      type="button"
                      onClick={() => removeKeyword(index, kwIndex)}
                      className="hover:bg-orange-500/30 rounded-full p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      // Split by comma and add each keyword separately
                      const keywords = value.split(',').map(k => k.trim()).filter(k => k);
                      keywords.forEach(keyword => addKeyword(index, keyword));
                      e.currentTarget.value = '';
                    }
                  }
                }}
                className="input-glass"
                placeholder="Type keywords separated by commas or press Enter (e.g., FastAPI, Django, Flask)"
              />
            </div>

            {data.length > 1 && (
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="mt-2 text-red-400 hover:bg-red-500/20 px-3 py-1 rounded text-sm"
              >
                Remove Skill
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addSkill}
        className="w-full py-3 border-2 border-dashed border-white/20 rounded-xl text-stone-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Plus size={20} />
        Add Skill
      </button>
    </div>
  );
}

// Links & Extras Section
interface LinksExtrasSectionProps {
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  onCertificationsChange: (data: Certification[]) => void;
  onAwardsChange: (data: Award[]) => void;
  onLanguagesChange: (data: Language[]) => void;
}

export function LinksExtrasSection({
  certifications,
  awards,
  languages,
  onCertificationsChange,
  onAwardsChange,
  onLanguagesChange
}: LinksExtrasSectionProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Additional Information</h2>
        <p className="text-stone-400">Certifications, awards, and languages</p>
      </div>

      {/* Certifications */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Certifications</h3>
        {certifications.map((cert, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 glass-subtle rounded-xl border border-white/10">
            <input
              type="text"
              value={cert.name}
              onChange={(e) => {
                const newData = [...certifications];
                newData[index].name = e.target.value;
                onCertificationsChange(newData);
              }}
              className="input-glass"
              placeholder="Certification Name"
            />
            <input
              type="text"
              value={cert.issuer}
              onChange={(e) => {
                const newData = [...certifications];
                newData[index].issuer = e.target.value;
                onCertificationsChange(newData);
              }}
              className="input-glass"
              placeholder="Issuer"
            />
            <input
              type="month"
              value={cert.date}
              onChange={(e) => {
                const newData = [...certifications];
                newData[index].date = e.target.value;
                onCertificationsChange(newData);
              }}
              className="input-glass"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onCertificationsChange([...certifications, { name: '', issuer: '', date: '' }])}
          className="text-orange-400 hover:bg-orange-500/20 px-4 py-2 rounded"
        >
          + Add Certification
        </button>
      </div>

      {/* Awards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Awards & Achievements</h3>
        {awards.map((award, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 glass-subtle rounded-xl border border-white/10">
            <input
              type="text"
              value={award.name}
              onChange={(e) => {
                const newData = [...awards];
                newData[index].name = e.target.value;
                onAwardsChange(newData);
              }}
              className="input-glass"
              placeholder="Award Name"
            />
            <input
              type="text"
              value={award.by}
              onChange={(e) => {
                const newData = [...awards];
                newData[index].by = e.target.value;
                onAwardsChange(newData);
              }}
              className="input-glass"
              placeholder="Awarded By"
            />
            <input
              type="month"
              value={award.date}
              onChange={(e) => {
                const newData = [...awards];
                newData[index].date = e.target.value;
                onAwardsChange(newData);
              }}
              className="input-glass"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onAwardsChange([...awards, { name: '', by: '', date: '' }])}
          className="text-orange-400 hover:bg-orange-500/20 px-4 py-2 rounded"
        >
          + Add Award
        </button>
      </div>

      {/* Languages */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Languages</h3>
        {languages.map((lang, index) => (
          <div key={index} className="grid grid-cols-2 gap-3 p-4 glass-subtle rounded-xl border border-white/10">
            <input
              type="text"
              value={lang.name}
              onChange={(e) => {
                const newData = [...languages];
                newData[index].name = e.target.value;
                onLanguagesChange(newData);
              }}
              className="input-glass"
              placeholder="Language"
            />
            <input
              type="text"
              value={lang.level}
              onChange={(e) => {
                const newData = [...languages];
                newData[index].level = e.target.value;
                onLanguagesChange(newData);
              }}
              className="input-glass"
              placeholder="Level (e.g., Native, C2, Fluent)"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onLanguagesChange([...languages, { name: '', level: '' }])}
          className="text-orange-400 hover:bg-orange-500/20 px-4 py-2 rounded"
        >
          + Add Language
        </button>
      </div>
    </div>
  );
}
