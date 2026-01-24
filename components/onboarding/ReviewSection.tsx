import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProfileV3 } from '@/lib/types';
import CompletenessBar from '../CompletenessBar';
import { 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Award, 
  Languages, 
  Link as LinkIcon, 
  User, 
  ChevronRight, 
  X,
  Github,
  Linkedin,
  Twitter,
  Youtube,
  Instagram,
  Globe,
  FileCode,
  Package,
  Database,
  Palette,
  BarChart3,
  Code2,
  Trophy
} from 'lucide-react';

interface ReviewSectionProps {
  profile: ProfileV3;
  completeness: number;
  breakdown?: any;
}

// Platform detection for links
const getPlatformInfo = (url: string): { icon: React.ElementType; name: string; color: string } => {
  const hostname = url.toLowerCase();
  if (hostname.includes('github.com') || hostname.includes('github.io')) {
    return { icon: Github, name: 'GitHub', color: 'text-white' };
  }
  if (hostname.includes('linkedin.com')) {
    return { icon: Linkedin, name: 'LinkedIn', color: 'text-blue-400' };
  }
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return { icon: Twitter, name: 'Twitter/X', color: 'text-sky-400' };
  }
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return { icon: Youtube, name: 'YouTube', color: 'text-red-500' };
  }
  if (hostname.includes('instagram.com')) {
    return { icon: Instagram, name: 'Instagram', color: 'text-pink-500' };
  }
  if (hostname.includes('medium.com')) {
    return { icon: FileCode, name: 'Medium', color: 'text-green-400' };
  }
  if (hostname.includes('dev.to')) {
    return { icon: Code2, name: 'Dev.to', color: 'text-white' };
  }
  if (hostname.includes('stackoverflow.com')) {
    return { icon: Database, name: 'Stack Overflow', color: 'text-orange-500' };
  }
  if (hostname.includes('behance.net')) {
    return { icon: Palette, name: 'Behance', color: 'text-blue-500' };
  }
  if (hostname.includes('dribbble.com')) {
    return { icon: Palette, name: 'Dribbble', color: 'text-pink-400' };
  }
  if (hostname.includes('kaggle.com')) {
    return { icon: BarChart3, name: 'Kaggle', color: 'text-cyan-400' };
  }
  if (hostname.includes('pypi.org')) {
    return { icon: Package, name: 'PyPI', color: 'text-blue-400' };
  }
  if (hostname.includes('npmjs.com')) {
    return { icon: Package, name: 'npm', color: 'text-red-500' };
  }
  return { icon: Globe, name: 'Website', color: 'text-orange-400' };
};

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, scale: 0.95 }
};

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

type ModalType = 'basics' | 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'languages' | 'links' | null;

export default function ReviewSection({ profile, completeness, breakdown }: ReviewSectionProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Section card component with click handler
  const SectionCard = ({ 
    icon: Icon, 
    iconColor,
    title, 
    count, 
    children, 
    modalType,
    isEmpty = false
  }: { 
    icon: React.ElementType; 
    iconColor: string;
    title: string; 
    count?: number; 
    children: React.ReactNode;
    modalType: ModalType;
    isEmpty?: boolean;
  }) => (
    <motion.div
      variants={cardVariants}
      onClick={() => setActiveModal(modalType)}
      className={`group relative rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl overflow-hidden cursor-pointer hover:border-orange-500/30 transition-all duration-300 ${isEmpty ? 'opacity-60' : ''}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-xl ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-semibold text-white text-lg">
            {title} {count !== undefined && <span className="text-stone-400">({count})</span>}
          </h3>
        </div>
        <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
      </div>
      
      {/* Content Preview */}
      <div className="px-5 pb-5 space-y-2">
        {children}
      </div>
    </motion.div>
  );

  // Modal component
  const Modal = ({ type, title, icon: Icon, iconColor, children }: { 
    type: ModalType; 
    title: string; 
    icon: React.ElementType;
    iconColor: string;
    children: React.ReactNode;
  }) => (
    <AnimatePresence>
      {activeModal === type && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            variants={overlayVariants}
            onClick={() => setActiveModal(null)}
          />
          <motion.div
            variants={modalVariants}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900 via-stone-900/95 to-stone-950 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-stone-900/90 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
              </div>
              <motion.button
                onClick={() => setActiveModal(null)}
                className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-6">
      <motion.div variants={cardVariants}>
        <h2 className="text-2xl font-bold text-gradient mb-2">Review Your Profile</h2>
        <p className="text-stone-400">Click on any section to view details</p>
      </motion.div>

      {/* Completeness Bar */}
      <motion.div variants={cardVariants} className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl">
        <CompletenessBar completeness={completeness} breakdown={breakdown} showBreakdown={true} />
      </motion.div>

      {/* Grid Layout */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Experience */}
        <SectionCard 
          icon={Briefcase} 
          iconColor="bg-orange-500/20 text-orange-400"
          title="Experience" 
          count={profile.experience.length}
          modalType="experience"
          isEmpty={profile.experience.length === 0}
        >
          {profile.experience.slice(0, 3).map((exp, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <p className="font-medium text-white text-sm">{exp.title}</p>
              <p className="text-stone-400 text-xs">{exp.company}</p>
            </div>
          ))}
          {profile.experience.length === 0 && (
            <p className="text-stone-500 text-sm">No experience added yet</p>
          )}
          {profile.experience.length > 3 && (
            <p className="text-stone-500 text-xs">+{profile.experience.length - 3} more</p>
          )}
        </SectionCard>

        {/* Education */}
        <SectionCard 
          icon={GraduationCap} 
          iconColor="bg-blue-500/20 text-blue-400"
          title="Education" 
          count={profile.education.length}
          modalType="education"
          isEmpty={profile.education.length === 0}
        >
          {profile.education.slice(0, 2).map((edu, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <p className="font-medium text-white text-sm">{edu.degree}</p>
              <p className="text-stone-400 text-xs">{edu.school}</p>
            </div>
          ))}
          {profile.education.length === 0 && (
            <p className="text-stone-500 text-sm">No education added yet</p>
          )}
        </SectionCard>

        {/* Projects */}
        <SectionCard 
          icon={FolderGit2} 
          iconColor="bg-cyan-500/20 text-cyan-400"
          title="Projects" 
          count={profile.projects.length}
          modalType="projects"
          isEmpty={profile.projects.length === 0}
        >
          {profile.projects.slice(0, 3).map((proj, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <p className="font-medium text-white text-sm">{proj.name}</p>
            </div>
          ))}
          {profile.projects.length === 0 && (
            <p className="text-stone-500 text-sm">No projects added yet</p>
          )}
          {profile.projects.length > 3 && (
            <p className="text-stone-500 text-xs">+{profile.projects.length - 3} more</p>
          )}
        </SectionCard>

        {/* Certifications */}
        <SectionCard 
          icon={Award} 
          iconColor="bg-purple-500/20 text-purple-400"
          title="Certifications" 
          count={profile.certifications?.length || 0}
          modalType="certifications"
          isEmpty={!profile.certifications?.length}
        >
          {profile.certifications?.slice(0, 2).map((cert, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <p className="font-medium text-white text-sm">{cert.name}</p>
              <p className="text-stone-400 text-xs">{cert.issuer}</p>
            </div>
          ))}
          {(!profile.certifications || profile.certifications.length === 0) && (
            <p className="text-stone-500 text-sm">No certifications added yet</p>
          )}
        </SectionCard>

        {/* Skills */}
        <SectionCard 
          icon={Code2} 
          iconColor="bg-green-500/20 text-green-400"
          title="Skills" 
          count={profile.skills.length}
          modalType="skills"
          isEmpty={profile.skills.length === 0}
        >
          <div className="flex flex-wrap gap-1.5">
            {profile.skills.slice(0, 6).map((skill, idx) => (
              <span key={idx} className="px-2.5 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs border border-orange-500/30">
                {skill.name}
              </span>
            ))}
            {profile.skills.length > 6 && (
              <span className="px-2.5 py-1 bg-stone-700/50 text-stone-400 rounded-full text-xs">
                +{profile.skills.length - 6}
              </span>
            )}
          </div>
          {profile.skills.length === 0 && (
            <p className="text-stone-500 text-sm">No skills added yet</p>
          )}
        </SectionCard>

        {/* Languages */}
        <SectionCard 
          icon={Languages} 
          iconColor="bg-amber-500/20 text-amber-400"
          title="Languages" 
          count={profile.languages?.length || 0}
          modalType="languages"
          isEmpty={!profile.languages?.length}
        >
          <div className="flex flex-wrap gap-2">
            {profile.languages?.slice(0, 4).map((lang, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-stone-800/50 rounded-lg border border-stone-700/50">
                <span className="text-white text-sm">{lang.name}</span>
                <span className="text-stone-500 text-xs ml-1">{lang.level}</span>
              </div>
            ))}
          </div>
          {(!profile.languages || profile.languages.length === 0) && (
            <p className="text-stone-500 text-sm">No languages added yet</p>
          )}
        </SectionCard>

        {/* Links */}
        <SectionCard 
          icon={LinkIcon} 
          iconColor="bg-pink-500/20 text-pink-400"
          title="Links" 
          count={profile.basics.links?.length || 0}
          modalType="links"
          isEmpty={!profile.basics.links?.length}
        >
          <div className="space-y-2">
            {profile.basics.links?.slice(0, 3).map((link, idx) => {
              const platform = getPlatformInfo(link);
              const PlatformIcon = platform.icon;
              return (
                <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-800/50 border border-stone-700/50">
                  <div className={`p-1.5 rounded-lg bg-stone-700/50 ${platform.color}`}>
                    <PlatformIcon className="w-4 h-4" />
                  </div>
                  <span className="text-stone-300 text-sm truncate">{platform.name}</span>
                </div>
              );
            })}
          </div>
          {(!profile.basics.links || profile.basics.links.length === 0) && (
            <p className="text-stone-500 text-sm">No links added yet</p>
          )}
          {(profile.basics.links?.length || 0) > 3 && (
            <p className="text-stone-500 text-xs">+{profile.basics.links!.length - 3} more</p>
          )}
        </SectionCard>
      </div>

      {/* Modals */}
      <Modal type="experience" title="Experience" icon={Briefcase} iconColor="bg-orange-500/20 text-orange-400">
        <div className="space-y-4">
          {profile.experience.map((exp, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-white">{exp.title}</h4>
                  <p className="text-stone-400 text-sm">{exp.company}</p>
                </div>
                <span className="text-xs text-stone-500 bg-stone-700/50 px-2 py-1 rounded-full">
                  {exp.start} - {exp.end || 'Present'}
                </span>
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {exp.bullets.map((bullet: string, bIdx: number) => (
                    <li key={bIdx} className="text-stone-300 text-sm flex gap-2">
                      <span className="text-orange-400">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {profile.experience.length === 0 && (
            <p className="text-center text-stone-500 py-8">No experience entries yet</p>
          )}
        </div>
      </Modal>

      <Modal type="education" title="Education" icon={GraduationCap} iconColor="bg-blue-500/20 text-blue-400">
        <div className="space-y-4">
          {profile.education.map((edu, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <h4 className="font-semibold text-white">{edu.degree}</h4>
              <p className="text-stone-400 text-sm">{edu.school}</p>
              {(edu.start || edu.end) && <p className="text-stone-500 text-xs mt-1">{edu.start} - {edu.end || 'Present'}</p>}
            </div>
          ))}
          {profile.education.length === 0 && (
            <p className="text-center text-stone-500 py-8">No education entries yet</p>
          )}
        </div>
      </Modal>

      <Modal type="projects" title="Projects" icon={FolderGit2} iconColor="bg-cyan-500/20 text-cyan-400">
        <div className="space-y-4">
          {profile.projects.map((proj, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <h4 className="font-semibold text-white">{proj.name}</h4>
              {proj.stack && proj.stack.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {proj.stack.map((tech: string, tIdx: number) => (
                    <span key={tIdx} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded text-xs border border-cyan-500/30">
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {proj.bullets && proj.bullets.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                  {proj.bullets.map((bullet: string, bIdx: number) => (
                    <li key={bIdx} className="text-stone-300 text-sm flex gap-2">
                      <span className="text-cyan-400">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
          {profile.projects.length === 0 && (
            <p className="text-center text-stone-500 py-8">No projects yet</p>
          )}
        </div>
      </Modal>

      <Modal type="certifications" title="Certifications" icon={Award} iconColor="bg-purple-500/20 text-purple-400">
        <div className="space-y-4">
          {profile.certifications?.map((cert, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Trophy className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-white">{cert.name}</h4>
                  <p className="text-stone-400 text-sm">{cert.issuer}</p>
                  {cert.date && <p className="text-stone-500 text-xs mt-1">{cert.date}</p>}
                </div>
              </div>
            </div>
          ))}
          {(!profile.certifications || profile.certifications.length === 0) && (
            <p className="text-center text-stone-500 py-8">No certifications yet</p>
          )}
        </div>
      </Modal>

      <Modal type="skills" title="Skills" icon={Code2} iconColor="bg-green-500/20 text-green-400">
        <div className="space-y-4">
          {profile.skills.map((skill, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-white">{skill.name}</h4>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  skill.level === 'expert' ? 'bg-green-500/20 text-green-400' :
                  skill.level === 'intermediate' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-stone-600/20 text-stone-400'
                }`}>
                  {skill.level || 'intermediate'}
                </span>
              </div>
              {skill.keywords && skill.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {skill.keywords.map((kw: string, kIdx: number) => (
                    <span key={kIdx} className="px-2 py-0.5 bg-stone-700/50 text-stone-300 rounded text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {profile.skills.length === 0 && (
            <p className="text-center text-stone-500 py-8">No skills yet</p>
          )}
        </div>
      </Modal>

      <Modal type="languages" title="Languages" icon={Languages} iconColor="bg-amber-500/20 text-amber-400">
        <div className="space-y-4">
          {profile.languages?.map((lang, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50 flex items-center justify-between">
              <h4 className="font-semibold text-white">{lang.name}</h4>
              <span className="text-stone-400 text-sm">{lang.level}</span>
            </div>
          ))}
          {(!profile.languages || profile.languages.length === 0) && (
            <p className="text-center text-stone-500 py-8">No languages yet</p>
          )}
        </div>
      </Modal>

      <Modal type="links" title="Links" icon={LinkIcon} iconColor="bg-pink-500/20 text-pink-400">
        <div className="space-y-3">
          {profile.basics.links?.map((link, idx) => {
            const platform = getPlatformInfo(link);
            const PlatformIcon = platform.icon;
            return (
              <a
                key={idx}
                href={link.startsWith('http') ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-stone-800/50 border border-stone-700/50 hover:border-orange-500/30 transition-all group"
              >
                <div className={`p-2.5 rounded-xl bg-stone-700/50 ${platform.color} group-hover:scale-110 transition-transform`}>
                  <PlatformIcon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white text-sm">{platform.name}</p>
                  <p className="text-stone-500 text-xs truncate">{link}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-orange-400 transition-colors" />
              </a>
            );
          })}
          {(!profile.basics.links || profile.basics.links.length === 0) && (
            <p className="text-center text-stone-500 py-8">No links yet</p>
          )}
        </div>
      </Modal>

      {completeness < 70 && (
        <motion.div 
          variants={cardVariants}
          className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
        >
          <p className="text-sm text-amber-200">
            <strong>Tip:</strong> A more complete profile (70%+) generates better tailored resumes. Consider going back to add more details!
          </p>
        </motion.div>
      )}
    </div>
  );
}
