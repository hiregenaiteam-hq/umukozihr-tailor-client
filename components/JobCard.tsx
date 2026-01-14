import toast from 'react-hot-toast';
import { FileText, Download, CheckCircle, Calendar, MapPin, FileCode, FileEdit } from "lucide-react";
import { config } from '@/lib/config';

export default function JobCard({ data }: { data: any }) {
  // Check if PDFs were compiled successfully
  const hasPdfs = data.resume_pdf && data.cover_letter_pdf;
  const hasDocx = data.resume_docx || data.cover_letter_docx;
  const hasTex = data.resume_tex || data.cover_letter_tex;
  
  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${config.apiUrl}${url}`;
  };
  
  return (
    <div className="glass-subtle p-4 sm:p-5 rounded-xl hover:border-orange-500/20 transition-all group overflow-hidden">
      <div className="flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="neu-flat w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center group-hover:animate-pulse-glow transition-all">
            <FileText className="w-5 h-5 text-orange-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-white truncate max-w-full" title={data.job_id}>
              {data.job_id}
            </h3>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-stone-400 mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="badge badge-orange text-xs">{data.region}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 flex-shrink-0" />
                <span className="text-xs">{new Date(data.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs sm:text-sm text-green-400">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Resume and cover letter generated</span>
        </div>

        {/* Download Buttons */}
        <div className="flex flex-wrap gap-2">
          {/* PDF Downloads - Primary if available */}
          {hasPdfs && (
            <>
              <a
                href={getFullUrl(data.resume_pdf)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
                onClick={() => toast.success('Resume PDF opened')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Resume PDF</span>
              </a>
              <a
                href={getFullUrl(data.cover_letter_pdf)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
                onClick={() => toast.success('Cover letter PDF opened')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cover PDF</span>
              </a>
            </>
          )}
          
          {/* DOCX Downloads */}
          {hasDocx && (
            <>
              {data.resume_docx && (
                <a
                  href={getFullUrl(data.resume_docx)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all"
                  onClick={() => toast.success('Resume DOCX opened')}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Resume Word</span>
                </a>
              )}
              {data.cover_letter_docx && (
                <a
                  href={getFullUrl(data.cover_letter_docx)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all"
                  onClick={() => toast.success('Cover letter DOCX opened')}
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Cover Word</span>
                </a>
              )}
            </>
          )}
          
          {/* TEX Downloads - Always show if no PDFs or as additional option */}
          {hasTex && !hasPdfs && (
            <>
              {data.resume_tex && (
                <a
                  href={getFullUrl(data.resume_tex)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all"
                  onClick={() => toast.success('Resume TEX opened')}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Resume TEX</span>
                </a>
              )}
              {data.cover_letter_tex && (
                <a
                  href={getFullUrl(data.cover_letter_tex)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-amber-400 hover:bg-amber-500/10 transition-all"
                  onClick={() => toast.success('Cover letter TEX opened')}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Cover TEX</span>
                </a>
              )}
            </>
          )}
        </div>
        
        {/* Helpful tip if only TEX files */}
        {hasTex && !hasPdfs && !hasDocx && (
          <p className="text-xs text-stone-500">
            Tip: Open TEX files in <a href="https://overleaf.com" target="_blank" rel="noreferrer" className="text-amber-400 hover:underline">Overleaf</a> to compile PDFs
          </p>
        )}
      </div>
    </div>
  );
}
