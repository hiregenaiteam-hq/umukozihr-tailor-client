import toast from 'react-hot-toast';
import { FileText, Download, CheckCircle, Calendar, MapPin } from "lucide-react";

export default function JobCard({ data }: { data: any }) {
  // Check if PDFs were compiled successfully
  const hasPdfs = data.resume_pdf && data.cover_letter_pdf;
  const pdfStatus = data.pdf_compilation;
  
  return (
    <div className="glass-subtle p-4 sm:p-5 rounded-xl hover:border-orange-500/20 transition-all group overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0 overflow-hidden">
          <div className="flex items-start gap-3 mb-3">
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
        </div>

        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
          {hasPdfs ? (
            <div className="flex gap-2">
              <a
                href={data.resume_pdf}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
                onClick={() => toast.success('Resume PDF opened')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Resume</span>
              </a>
              <a
                href={data.cover_letter_pdf}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 glass-subtle rounded-lg text-xs sm:text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
                onClick={() => toast.success('Cover letter PDF opened')}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Cover</span>
              </a>
            </div>
          ) : (
            <div className="text-xs text-stone-500 text-left sm:text-right">
              <span className="text-amber-400">TEX files only</span>
              <p className="mt-1">Download ZIP for files</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
