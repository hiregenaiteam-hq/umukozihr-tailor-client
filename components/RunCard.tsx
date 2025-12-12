import React from 'react';
import { HistoryItem } from '@/lib/types';
import { config } from '@/lib/config';
import { Download, FileText, RefreshCw, ExternalLink, CheckCircle, XCircle, Calendar, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RunCardProps {
  run: HistoryItem;
  onRegenerate: (runId: string) => void;
  onDownload: (url: string, filename: string) => void;
}

export default function RunCard({ run, onRegenerate, onDownload }: RunCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRegionFlag = (region: string) => {
    switch (region) {
      case 'US': return 'í·ºí·¸';
      case 'EU': return 'í·ªí·º';
      case 'GL': return 'í¼';
      default: return 'í¼';
    }
  };

  const handleDownload = (url: string, type: string) => {
    const filename = `${run.company}_${run.title}_${type}.${type.includes('pdf') ? 'pdf' : 'tex'}`;
    onDownload(url, filename);
  };

  const handleOverleafOpen = () => {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://www.overleaf.com/docs';
    form.target = '_blank';
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'snip_uri[]';
    input.value = `${config.apiUrl}${run.artifacts_urls.resume_tex}`;
    form.appendChild(input);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    toast.success('Opening in Overleaf...');
  };

  const artifacts = run.artifacts_urls;

  return (
    <div className="glass-card p-6 group hover:border-orange-500/30 transition-all">
      {/* Header */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-white group-hover:text-gradient transition-all">
              {run.title}
            </h3>
            <span className="text-lg">{getRegionFlag(run.region)}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-400 mb-2">
            <Building2 className="h-4 w-4" />
            <span>{run.company}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-500">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(run.created_at)}</span>
          </div>
          {run.profile_version && (
            <span className="inline-block mt-2 badge badge-orange text-xs">
              Profile v{run.profile_version}
            </span>
          )}
        </div>

        <button
          onClick={() => onRegenerate(run.run_id)}
          className="btn-icon opacity-50 group-hover:opacity-100 transition-opacity"
          title="Re-generate with current profile"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Downloads */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {artifacts.resume_pdf && (
          <button
            onClick={() => handleDownload(artifacts.resume_pdf!, 'resume_pdf')}
            className="flex items-center gap-2 px-3 py-2 glass-subtle rounded-lg text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
          >
            <Download className="h-4 w-4" />
            Resume PDF
          </button>
        )}
        {artifacts.cover_letter_pdf && (
          <button
            onClick={() => handleDownload(artifacts.cover_letter_pdf!, 'cover_pdf')}
            className="flex items-center gap-2 px-3 py-2 glass-subtle rounded-lg text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
          >
            <Download className="h-4 w-4" />
            Cover Letter
          </button>
        )}
        {artifacts.resume_tex && (
          <button
            onClick={() => handleDownload(artifacts.resume_tex!, 'resume_tex')}
            className="flex items-center gap-2 px-3 py-2 glass-subtle rounded-lg text-sm font-medium text-stone-400 hover:bg-white/5 transition-all"
          >
            <FileText className="h-4 w-4" />
            Resume TEX
          </button>
        )}
        {artifacts.cover_letter_tex && (
          <button
            onClick={() => handleDownload(artifacts.cover_letter_tex!, 'cover_tex')}
            className="flex items-center gap-2 px-3 py-2 glass-subtle rounded-lg text-sm font-medium text-stone-400 hover:bg-white/5 transition-all"
          >
            <FileText className="h-4 w-4" />
            Cover TEX
          </button>
        )}
      </div>

      {/* Overleaf Button */}
      {artifacts.resume_tex && (
        <button
          onClick={handleOverleafOpen}
          className="w-full py-2.5 btn-secondary flex items-center justify-center gap-2 text-sm"
        >
          <ExternalLink className="h-4 w-4" />
          Open in Overleaf
        </button>
      )}

      {/* Compilation Status */}
      {artifacts.pdf_compilation && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex gap-6 text-xs">
            <span className="flex items-center gap-1.5">
              {artifacts.pdf_compilation.resume_success ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className="text-stone-400">Resume</span>
            </span>
            <span className="flex items-center gap-1.5">
              {artifacts.pdf_compilation.cover_letter_success ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-400" />
              )}
              <span className="text-stone-400">Cover</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
