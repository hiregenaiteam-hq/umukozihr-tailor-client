import React, { useState } from 'react';
import { jd as jdApi } from '@/lib/api';
import toast from 'react-hot-toast';
import { Link2, FileText, Plus, Globe, Sparkles, ArrowRight, Loader2 } from 'lucide-react';

interface JobInput {
  id: string;
  region: 'US' | 'EU' | 'GL';
  company: string;
  title: string;
  jd_text: string;
}

interface JDComposerProps {
  onAddJob: (job: JobInput) => void;
  defaultRegion?: 'US' | 'EU' | 'GL';
}

export default function JDComposer({ onAddJob, defaultRegion = 'US' }: JDComposerProps) {
  const [inputMode, setInputMode] = useState<'text' | 'url'>('text');
  const [url, setUrl] = useState('');
  const [company, setCompany] = useState('');
  const [title, setTitle] = useState('');
  const [jdText, setJdText] = useState('');
  const [region, setRegion] = useState<'US' | 'EU' | 'GL'>(defaultRegion);
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchFromUrl = async () => {
    if (!url.trim()) {
      toast.error('Please enter a job URL');
      return;
    }

    setIsFetching(true);
    try {
      const response = await jdApi.fetchFromUrl(url);
      if (response.data.success) {
        setJdText(response.data.jd_text || '');
        setCompany(response.data.company || '');
        setTitle(response.data.title || '');
        toast.success('Job description extracted successfully!');
        setInputMode('text');
      } else {
        toast.error(response.data.message || 'Failed to fetch job description');
      }
    } catch (error) {
      toast.error('Failed to fetch job description. Please paste manually.');
    } finally {
      setIsFetching(false);
    }
  };

  const handleAddJob = () => {
    if (!company.trim() || !title.trim() || !jdText.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (jdText.trim().length < 50) {
      toast.error('Job description must be at least 50 characters');
      return;
    }

    const job: JobInput = {
      id: `${company}_${title}_${Date.now()}`.replace(/\s+/g, '_'),
      region,
      company: company.trim(),
      title: title.trim(),
      jd_text: jdText.trim()
    };

    onAddJob(job);
    setCompany('');
    setTitle('');
    setJdText('');
    setUrl('');
    toast.success(`Added ${title} at ${company}`);
  };

  return (
    <div className="space-y-5">
      {/* Input Mode Toggle */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
        <button
          onClick={() => setInputMode('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
            inputMode === 'text'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <FileText className="h-4 w-4" />
          Paste Text
        </button>
        <button
          onClick={() => setInputMode('url')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium transition-all ${
            inputMode === 'url'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Link2 className="h-4 w-4" />
          Paste Link
        </button>
      </div>

      {/* URL Input Mode */}
      {inputMode === 'url' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Job Posting URL
            </label>
            <div className="flex gap-2">
              <div className="flex-1 relative group">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500 group-focus-within:text-orange-400 transition-colors" />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="input-glass pl-12"
                  placeholder="https://linkedin.com/jobs/view/..."
                />
              </div>
              <button
                onClick={handleFetchFromUrl}
                disabled={isFetching}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                {isFetching ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Fetch
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-2">
              We'll extract job details automatically. If it fails, paste manually.
            </p>
          </div>
        </div>
      )}

      {/* Text Input Mode */}
      {inputMode === 'text' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Company <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input-glass"
                placeholder="Google"
              />
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Job Title <span className="text-orange-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input-glass"
                placeholder="Senior Software Engineer"
              />
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-stone-300 mb-2">
                Region
              </label>
              <div className="relative">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as 'US' | 'EU' | 'GL')}
                  className="select-glass pl-12"
                >
                  <option value="US">US - United States</option>
                  <option value="EU">EU - Europe</option>
                  <option value="GL">GL - Global</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div>
            <label className="block text-sm font-medium text-stone-300 mb-2">
              Job Description <span className="text-orange-400">*</span>
            </label>
            <textarea
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              className="textarea-glass font-mono text-sm"
              placeholder="Paste the full job description here..."
              rows={8}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-stone-500">
                Minimum 50 characters ({jdText.length} / 50)
              </p>
              {jdText.length >= 50 && (
                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  Valid
                </span>
              )}
            </div>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAddJob}
            className="btn-primary w-full flex items-center justify-center gap-3 group"
          >
            <Plus className="h-5 w-5" />
            <span>Add Job to Queue</span>
            <ArrowRight className="h-5 w-5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </button>
        </div>
      )}
    </div>
  );
}
