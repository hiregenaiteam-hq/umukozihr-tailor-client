import toast from 'react-hot-toast';
import { FileText, Download, CheckCircle, Calendar, MapPin, FileEdit } from "lucide-react";
import { config } from '@/lib/config';

export default function JobCard({ data }: { data: any }) {
  const hasPdfs = data.resume_pdf && data.cover_letter_pdf;
  const hasDocx = data.resume_docx || data.cover_letter_docx;
  
  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('http') ? url : `${config.apiUrl}${url}`;
  };

  // Force download on all devices (including mobile)
  const handleDownload = async (url: string, filename: string) => {
    const fullUrl = getFullUrl(url);
    
    try {
      toast.loading(`Downloading ${filename}...`, { id: 'download' });
      
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success(`Downloaded ${filename}`, { id: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      window.open(fullUrl, '_blank');
      toast.success(`Opening ${filename}...`, { id: 'download' });
    }
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

        {/* Download Buttons - PDF and DOCX only */}
        <div className="flex flex-wrap gap-2">
          {/* PDF Downloads */}
          {hasPdfs ? (
            <>
              <button
                onClick={() => handleDownload(data.resume_pdf, `${data.job_id}_resume.pdf`)}
                className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Resume PDF</span>
              </button>
              <button
                onClick={() => handleDownload(data.cover_letter_pdf, `${data.job_id}_cover.pdf`)}
                className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cover PDF</span>
              </button>
            </>
          ) : (
            /* Show individual PDF buttons if only one exists */
            <>
              {data.resume_pdf && (
                <button
                  onClick={() => handleDownload(data.resume_pdf, `${data.job_id}_resume.pdf`)}
                  className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Resume PDF</span>
                </button>
              )}
              {data.cover_letter_pdf && (
                <button
                  onClick={() => handleDownload(data.cover_letter_pdf, `${data.job_id}_cover.pdf`)}
                  className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Cover PDF</span>
                </button>
              )}
            </>
          )}
          
          {/* DOCX Downloads */}
          {hasDocx && (
            <>
              {data.resume_docx && (
                <button
                  onClick={() => handleDownload(data.resume_docx, `${data.job_id}_resume.docx`)}
                  className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Resume Word</span>
                </button>
              )}
              {data.cover_letter_docx && (
                <button
                  onClick={() => handleDownload(data.cover_letter_docx, `${data.job_id}_cover.docx`)}
                  className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>Cover Word</span>
                </button>
              )}
            </>
          )}
          
          {/* If no files available yet */}
          {!hasPdfs && !hasDocx && (
            <span className="text-xs text-stone-500">Files generating...</span>
          )}
        </div>
      </div>
    </div>
  );
}
