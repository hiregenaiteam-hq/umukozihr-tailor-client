import React from 'react';
import { ProfileV3 } from '@/lib/types';
import CompletenessBar from '../CompletenessBar';

interface ReviewSectionProps {
  profile: ProfileV3;
  completeness: number;
  breakdown?: any;
}

export default function ReviewSection({ profile, completeness, breakdown }: ReviewSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Review Your Profile</h2>
        <p className="text-stone-400">Make sure everything looks good before continuing</p>
      </div>

      {/* Completeness Bar */}
      <div className="p-6 glass-subtle rounded-xl border border-white/10">
        <CompletenessBar completeness={completeness} breakdown={breakdown} showBreakdown={true} />
      </div>

      {/* Basics */}
      <div className="glass-subtle rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">Basic Information</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><span className="text-stone-400">Name:</span> <span className="font-medium text-white">{profile.basics.full_name || '-'}</span></div>
          <div><span className="text-stone-400">Email:</span> <span className="font-medium text-white">{profile.basics.email || '-'}</span></div>
          <div><span className="text-stone-400">Phone:</span> <span className="font-medium text-white">{profile.basics.phone || '-'}</span></div>
          <div><span className="text-stone-400">Location:</span> <span className="font-medium text-white">{profile.basics.location || '-'}</span></div>
        </div>
        {profile.basics.headline && (
          <div className="mt-3 text-sm">
            <span className="text-stone-400">Headline:</span> <span className="font-medium text-white">{profile.basics.headline}</span>
          </div>
        )}
      </div>

      {/* Experience */}
      {profile.experience.length > 0 && (
        <div className="glass-subtle rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Experience</h3>
          <div className="space-y-3">
            {profile.experience.map((exp, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-medium text-white">{exp.title} at {exp.company}</div>
                <div className="text-stone-400">{exp.start} - {exp.end}</div>
                <div className="text-stone-500">{exp.bullets.length} achievement{exp.bullets.length > 1 ? 's' : ''}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {profile.education.length > 0 && (
        <div className="glass-subtle rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Education</h3>
          <div className="space-y-2">
            {profile.education.map((edu, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-medium text-white">{edu.degree}</div>
                <div className="text-stone-400">{edu.school}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {profile.skills.length > 0 && (
        <div className="glass-subtle rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Skills ({profile.skills.length})</h3>
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-sm border border-orange-500/30">
                {skill.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {profile.projects.length > 0 && (
        <div className="glass-subtle rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-3">Projects ({profile.projects.length})</h3>
          <div className="space-y-2">
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="text-sm">
                <div className="font-medium text-white">{proj.name}</div>
                <div className="text-stone-400">{proj.stack.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {completeness < 70 && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <p className="text-sm text-amber-200">
            <strong>Tip:</strong> A more complete profile (70%+) generates better tailored resumes. Consider going back to add more details!
          </p>
        </div>
      )}
    </div>
  );
}
