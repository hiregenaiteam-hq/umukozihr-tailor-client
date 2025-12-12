import toast from 'react-hot-toast';
import { FileText, Download, ExternalLink, Calendar, MapPin, CheckCircle } from "lucide-react";

export default function JobCard({ data }: { data: any }) {
  return (
    <div className="glass-subtle p-5 rounded-xl hover:border-orange-500/20 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center group-hover:animate-pulse-glow transition-all">
              <FileText className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white truncate">
                {data.job_id}
              </h3>
              <div className="flex items-center gap-3 text-sm text-stone-400">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="badge badge-orange text-xs">{data.region}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="text-xs">{new Date(data.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Resume and cover letter generated</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            {data.resume_pdf && (
              <a
                href={data.resume_pdf}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 glass-subtle rounded-lg text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
                onClick={() => toast.success('Resume PDF opened')}
              >
                <Download className="w-4 h-4" />
                Resume
              </a>
            )}
            {data.cover_letter_pdf && (
              <a
                href={data.cover_letter_pdf}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 glass-subtle rounded-lg text-sm font-medium text-green-400 hover:bg-green-500/10 transition-all"
                onClick={() => toast.success('Cover letter PDF opened')}
              >
                <Download className="w-4 h-4" />
                Cover
              </a>
            )}
          </div>
          <div className="flex gap-2">
            {data.resume_tex && (
              <a
                href={data.resume_tex}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-500 hover:text-orange-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                .tex
              </a>
            )}
            {data.cover_letter_tex && (
              <a
                href={data.cover_letter_tex}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-stone-500 hover:text-orange-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Cover .tex
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
