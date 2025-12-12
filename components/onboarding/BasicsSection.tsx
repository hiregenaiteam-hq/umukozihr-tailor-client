import React from 'react';
import { Basics } from '@/lib/types';

interface BasicsSectionProps {
  data: Basics;
  onChange: (data: Basics) => void;
}

export default function BasicsSection({ data, onChange }: BasicsSectionProps) {
  const handleChange = (field: keyof Basics, value: string | string[]) => {
    onChange({ ...data, [field]: value });
  };

  const handleLinkChange = (index: number, value: string) => {
    const newLinks = [...data.links];
    newLinks[index] = value;
    onChange({ ...data, links: newLinks });
  };

  const addLink = () => {
    onChange({ ...data, links: [...data.links, ''] });
  };

  const removeLink = (index: number) => {
    const newLinks = data.links.filter((_, i) => i !== index);
    onChange({ ...data, links: newLinks });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gradient mb-2">Basic Information</h2>
        <p className="text-stone-400">Let's start with your personal details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Full Name <span className="text-orange-400">*</span>
          </label>
          <input
            type="text"
            value={data.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            className="input-glass"
            placeholder="John Doe"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Professional Headline
          </label>
          <input
            type="text"
            value={data.headline}
            onChange={(e) => handleChange('headline', e.target.value)}
            className="input-glass"
            placeholder="Senior Software Engineer | AI Specialist"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Professional Summary
          </label>
          <textarea
            value={data.summary}
            onChange={(e) => handleChange('summary', e.target.value)}
            className="textarea-glass"
            placeholder="A brief summary of your professional experience and expertise..."
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Email <span className="text-orange-400">*</span>
          </label>
          <input
            type="email"
            value={data.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="input-glass"
            placeholder="john@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={data.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            className="input-glass"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={data.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="input-glass"
            placeholder="San Francisco, CA"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-stone-300 mb-2">
            Website/Portfolio
          </label>
          <input
            type="url"
            value={data.website}
            onChange={(e) => handleChange('website', e.target.value)}
            className="input-glass"
            placeholder="https://johndoe.com"
          />
        </div>
      </div>

      {/* Social Links */}
      <div>
        <label className="block text-sm font-medium text-stone-300 mb-2">
          Social Links (LinkedIn, GitHub, etc.)
        </label>
        <div className="space-y-2">
          {data.links.map((link, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="url"
                value={link}
                onChange={(e) => handleLinkChange(index, e.target.value)}
                className="input-glass flex-1"
                placeholder="https://linkedin.com/in/johndoe"
              />
              <button
                type="button"
                onClick={() => removeLink(index)}
                className="px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addLink}
            className="px-4 py-2 text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors font-medium"
          >
            + Add Link
          </button>
        </div>
      </div>
    </div>
  );
}
