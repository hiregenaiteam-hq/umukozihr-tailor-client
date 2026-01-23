import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { publicProfile } from '@/lib/api';
import { ProfileV3 } from '@/lib/types';
import { HeaderLogo } from '@/components/Logo';
import { 
  User, MapPin, Mail, Phone, Globe, ExternalLink, 
  Briefcase, GraduationCap, Code, Award, Languages,
  Calendar, CheckCircle, Sparkles, FileText, ArrowRight, X, ChevronRight
} from 'lucide-react';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 200, damping: 20 }
  }
};

interface PublicProfileData {
  username: string;
  profile: ProfileV3;
  completeness: number;
  profile_views: number;
  member_since: string;
  is_available_for_hire: boolean;
  avatar_url?: string;
}

// Floating orb component for background with motion
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div 
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 0.15, 
        scale: [1, 1.1, 1],
        x: [0, 30, 0],
        y: [0, -20, 0]
      }}
      transition={{
        delay,
        duration: 8,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut"
      }}
      style={{ background: 'linear-gradient(135deg, #f97316, #fbbf24)' }}
    />
  );
}

export default function PublicProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  
  const [profileData, setProfileData] = useState<PublicProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (username && typeof username === 'string') {
      loadPublicProfile(username);
    }
  }, [username]);

  const loadPublicProfile = async (usernameParam: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await publicProfile.get(usernameParam);
      setProfileData(response.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Profile not found');
      } else if (err.response?.status === 403) {
        setError('This profile is private');
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // OG Meta tags for social sharing
  const getMetaTags = () => {
    if (!profileData) return null;
    
    const { profile, username } = profileData;
    const title = `${profile.basics.full_name || 'Professional'} | UmukoziHR Tailor`;
    const description = profile.basics.headline || 
      `${profile.basics.full_name}'s professional profile on UmukoziHR Tailor. View experience, skills, and more.`;
    const url = `https://tailor.umukozihr.com/p/${username}`;
    
    return (
      <>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="profile" />
        <meta property="og:image" content="https://tailor.umukozihr.com/og-profile.png" />
        <meta property="og:site_name" content="UmukoziHR Tailor" />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://tailor.umukozihr.com/og-profile.png" />
        
        <meta property="profile:first_name" content={profile.basics.full_name?.split(' ')[0] || ''} />
        <meta property="profile:last_name" content={profile.basics.full_name?.split(' ').slice(1).join(' ') || ''} />
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-orange-500/20"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute inset-0 rounded-full border-2 border-t-orange-500 border-r-amber-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 m-auto flex items-center justify-center"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="h-7 w-7 text-orange-400" />
            </motion.div>
          </div>
          <motion.p 
            className="text-stone-400 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Loading profile...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <Head>
          <title>Profile Not Found | UmukoziHR Tailor</title>
        </Head>
        <motion.div 
          className="text-center rounded-2xl border border-white/10 bg-stone-900/80 backdrop-blur-xl p-8 max-w-md mx-4"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring" as const, stiffness: 200, damping: 20 }}
        >
          <motion.div 
            className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" as const, stiffness: 300 }}
          >
            <User className="h-8 w-8 text-red-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
          <p className="text-stone-400 mb-6">
            The profile you're looking for doesn't exist or is private.
          </p>
          <motion.a
            href="https://tailor.umukozihr.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Create Your Profile <ArrowRight className="h-4 w-4" />
          </motion.a>
        </motion.div>
      </div>
    );
  }

  if (!profileData) return null;

  const { profile, profile_views, member_since, is_available_for_hire } = profileData;

  return (
    <>
      <Head>
        <title>{profile.basics.full_name || 'Professional'} | UmukoziHR Tailor</title>
        <meta name="description" content={profile.basics.headline || 'Professional profile on UmukoziHR Tailor'} />
        {getMetaTags()}
      </Head>
      
      <Toaster position="top-right" />
      
      <div className={`min-h-screen bg-[#0c0a09] relative transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background Effects */}
        <div className="fixed inset-0 bg-mesh pointer-events-none" />
        <FloatingOrb className="w-[500px] h-[500px] -top-32 -right-32" delay={0} />
        <FloatingOrb className="w-[400px] h-[400px] bottom-0 -left-20" delay={3} />
        <FloatingOrb className="w-[300px] h-[300px] top-1/2 left-1/2" delay={5} />

        {/* Header with CTA */}
        <motion.header 
          className="sticky top-0 z-50 border-b border-white/5 bg-stone-950/80 backdrop-blur-xl"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <a href="https://tailor.umukozihr.com" className="flex items-center gap-3 group">
                <HeaderLogo size="md" />
              </a>
              <motion.a
                href="https://tailor.umukozihr.com"
                className="text-sm flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg shadow-orange-500/20"
                whileHover={{ scale: 1.05, boxShadow: '0 10px 30px rgba(249, 115, 22, 0.3)' }}
                whileTap={{ scale: 0.95 }}
              >
                Create Your Profile <ArrowRight className="h-4 w-4" />
              </motion.a>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          {/* Profile Hero */}
          <motion.div 
            className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-8 mb-6"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar */}
              {profileData.avatar_url ? (
                <motion.img 
                  src={profileData.avatar_url} 
                  alt={profile.basics.full_name || 'Profile'}
                  className="w-24 h-24 rounded-2xl object-cover shrink-0 ring-2 ring-orange-500/30"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                />
              ) : (
                <motion.div 
                  className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold shrink-0 bg-gradient-to-br from-orange-500 to-amber-500 text-white"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {profile.basics.full_name?.charAt(0)?.toUpperCase() || '?'}
                </motion.div>
              )}
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {profile.basics.full_name || 'Professional'}
                    </h1>
                    {profile.basics.headline && (
                      <p className="text-lg text-stone-300 mb-3">{profile.basics.headline}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400">
                      {profile.basics.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4 text-orange-400" />
                          {profile.basics.location}
                        </span>
                      )}
                      {profile.basics.email && (
                        <motion.a 
                          href={`mailto:${profile.basics.email}`}
                          className="flex items-center gap-1 hover:text-orange-400 transition"
                          whileHover={{ x: 3 }}
                        >
                          <Mail className="h-4 w-4 text-orange-400" />
                          {profile.basics.email}
                        </motion.a>
                      )}
                      {profile.basics.website && (
                        <motion.a 
                          href={profile.basics.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-orange-400 transition"
                          whileHover={{ x: 3 }}
                        >
                          <Globe className="h-4 w-4 text-orange-400" />
                          Website
                        </motion.a>
                      )}
                    </div>
                  </motion.div>
                  
                  {is_available_for_hire && (
                    <motion.span 
                      className="px-3 py-1.5 rounded-full bg-green-500/20 text-green-400 text-sm font-medium flex items-center gap-1.5 border border-green-500/30"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Open to opportunities
                    </motion.span>
                  )}
                </div>
                
                {/* Stats */}
                <motion.div 
                  className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10 text-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-stone-400">
                    <span className="text-white font-semibold">{profile_views}</span> profile views
                  </div>
                  <div className="text-stone-400">
                    Member since <span className="text-white font-semibold">{member_since}</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Summary */}
          {profile.basics.summary && (
            <motion.div 
              className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-orange-400" />
                About
              </h2>
              <p className="text-stone-300 leading-relaxed whitespace-pre-line">
                {profile.basics.summary}
              </p>
            </motion.div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Experience */}
              {profile.experience && profile.experience.length > 0 && (
                <motion.div 
                  className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-orange-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Experience</h2>
                  </div>
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {profile.experience.map((exp, idx) => (
                      <motion.div 
                        key={idx} 
                        className="p-4 rounded-xl bg-stone-800/50 border border-white/5 hover:border-orange-500/30 transition-all"
                        variants={itemVariants}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{exp.title}</h3>
                            <p className="text-orange-400">{exp.company}</p>
                          </div>
                          <span className="text-sm text-stone-500 flex items-center gap-1 bg-stone-900/50 px-2 py-1 rounded-lg">
                            <Calendar className="h-3 w-3" />
                            {exp.start} - {exp.end}
                          </span>
                        </div>
                        {exp.location && (
                          <p className="text-sm text-stone-400 mb-2 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {exp.location}
                          </p>
                        )}
                        {exp.bullets && exp.bullets.length > 0 && (
                          <ul className="list-disc list-inside text-sm text-stone-300 space-y-1 mt-2">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx}>{bullet}</li>
                            ))}
                          </ul>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <motion.div 
                  className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Education</h2>
                  </div>
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {profile.education.map((edu, idx) => (
                      <motion.div 
                        key={idx} 
                        className="p-4 rounded-xl bg-stone-800/50 border border-white/5 hover:border-amber-500/30 transition-all"
                        variants={itemVariants}
                        whileHover={{ x: 4 }}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-white">{edu.degree}</h3>
                            <p className="text-amber-400">{edu.school}</p>
                          </div>
                          {(edu.start || edu.end) && (
                            <span className="text-sm text-stone-500 bg-stone-900/50 px-2 py-1 rounded-lg">
                              {edu.start} - {edu.end}
                            </span>
                          )}
                        </div>
                        {edu.gpa && (
                          <p className="text-sm text-stone-400 mt-1">GPA: {edu.gpa}</p>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Projects */}
              {profile.projects && profile.projects.length > 0 && (
                <motion.div 
                  className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                        <Code className="h-5 w-5 text-blue-400" />
                      </div>
                      <h2 className="text-lg font-semibold text-white">Projects ({profile.projects.length})</h2>
                    </div>
                    {profile.projects.length > 2 && (
                      <button
                        onClick={() => setShowProjectsModal(true)}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        View All <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <motion.div 
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {profile.projects.slice(0, 2).map((project, idx) => (
                      <motion.div 
                        key={idx} 
                        className="p-4 rounded-xl bg-stone-800/50 border border-white/5 hover:border-blue-500/30 transition-all"
                        variants={itemVariants}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white">{project.name}</h3>
                          {project.url && (
                            <motion.a 
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 p-1 rounded-lg hover:bg-blue-500/10 transition"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </motion.a>
                          )}
                        </div>
                        {project.stack && project.stack.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.stack.slice(0, 4).map((tech, tIdx) => (
                              <span key={tIdx} className="px-2 py-0.5 text-xs rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">{tech}</span>
                            ))}
                            {project.stack.length > 4 && (
                              <span className="px-2 py-0.5 text-xs rounded-md bg-stone-700 text-stone-400">+{project.stack.length - 4}</span>
                            )}
                          </div>
                        )}
                        {project.bullets && project.bullets.length > 0 && (
                          <p className="text-sm text-stone-400 line-clamp-2">
                            {project.bullets[0].length > 100 
                              ? project.bullets[0].substring(0, 100) + '...' 
                              : project.bullets[0]}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                  {profile.projects.length > 2 && (
                    <button
                      onClick={() => setShowProjectsModal(true)}
                      className="w-full mt-4 py-2.5 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <span>View all {profile.projects.length} projects</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills - Organized by Category */}
              {profile.skills && profile.skills.length > 0 && (
                <motion.div 
                  className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-orange-400" />
                      Skills ({profile.skills.length})
                    </h2>
                    {profile.skills.length > 4 && (
                      <button
                        onClick={() => setShowSkillsModal(true)}
                        className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
                      >
                        View All <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <motion.div 
                    className="space-y-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {profile.skills.slice(0, 4).map((skill, idx) => (
                      <motion.div key={idx} variants={itemVariants}>
                        {/* Category header */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-sm font-medium ${
                            skill.level === 'expert' ? 'text-orange-400' : 
                            skill.level === 'intermediate' ? 'text-amber-400' : 
                            'text-stone-400'
                          }`}>
                            {skill.name}
                          </span>
                          <span className={`text-xs px-1.5 py-0.5 rounded-md ${
                            skill.level === 'expert' ? 'bg-orange-500/20 text-orange-400' : 
                            skill.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' : 
                            'bg-stone-700 text-stone-400'
                          }`}>
                            {skill.level}
                          </span>
                          {skill.keywords && skill.keywords.length > 0 && (
                            <span className="text-xs text-stone-500">({skill.keywords.length})</span>
                          )}
                        </div>
                        {/* Keywords/actual skills - truncated */}
                        {skill.keywords && skill.keywords.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {skill.keywords.slice(0, 6).map((keyword, kidx) => (
                              <span 
                                key={kidx} 
                                className="px-2 py-0.5 text-xs rounded-md bg-stone-800 text-stone-300 border border-stone-700 hover:border-orange-500/30 transition-colors"
                              >
                                {keyword}
                              </span>
                            ))}
                            {skill.keywords.length > 6 && (
                              <span className="px-2 py-0.5 text-xs rounded-md bg-orange-500/20 text-orange-400 border border-orange-500/30">
                                +{skill.keywords.length - 6}
                              </span>
                            )}
                          </div>
                        )}
                      </motion.div>
                    ))}
                    {profile.skills.length > 4 && (
                      <button
                        onClick={() => setShowSkillsModal(true)}
                        className="w-full py-2.5 text-sm text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <span>View all {profile.skills.length} categories</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <motion.div 
                  className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Languages className="h-5 w-5 text-green-400" />
                    <h2 className="text-lg font-semibold text-white">Languages</h2>
                  </div>
                  <div className="space-y-2">
                    {profile.languages.map((lang, idx) => (
                      <motion.div 
                        key={idx} 
                        className="flex justify-between text-sm p-2 rounded-lg hover:bg-stone-800/50 transition"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                      >
                        <span className="text-white">{lang.name}</span>
                        <span className="text-stone-500 text-xs">{lang.level}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Certifications */}
              {profile.certifications && profile.certifications.length > 0 && (
                <motion.div 
                  className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Certifications</h2>
                  </div>
                  <motion.div 
                    className="space-y-3"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {profile.certifications.map((cert, idx) => (
                      <motion.div 
                        key={idx} 
                        className="p-3 rounded-xl bg-stone-800/50 border border-white/5 hover:border-purple-500/30 transition"
                        variants={itemVariants}
                      >
                        <p className="font-medium text-white text-sm">{cert.name}</p>
                        <p className="text-xs text-stone-400">{cert.issuer}</p>
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )}

              {/* Links */}
              {profile.basics.links && profile.basics.links.length > 0 && (
                <motion.div 
                  className="rounded-2xl border border-white/10 bg-stone-900/60 backdrop-blur-xl p-6"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <ExternalLink className="h-5 w-5 text-orange-400" />
                    Links
                  </h2>
                  <div className="space-y-2">
                    {profile.basics.links
                      .filter((link) => {
                        // Filter out invalid URLs
                        if (!link || typeof link !== 'string' || link.trim() === '') return false;
                        try {
                          new URL(link);
                          return true;
                        } catch {
                          return false;
                        }
                      })
                      .map((link, idx) => {
                        let hostname = link;
                        try {
                          hostname = new URL(link).hostname.replace('www.', '');
                        } catch {
                          // Fallback to the link itself
                        }
                        return (
                          <motion.a
                            key={idx}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-sm text-stone-400 hover:text-orange-400 transition p-2 rounded-lg hover:bg-stone-800/50"
                            whileHover={{ x: 4 }}
                          >
                            <ExternalLink className="h-4 w-4" />
                            {hostname}
                          </motion.a>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* CTA Banner */}
          <motion.div 
            className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/80 to-stone-950/80 backdrop-blur-xl p-8 text-center overflow-hidden relative"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-orange-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-amber-500/20 blur-3xl" />
            
            <div className="max-w-2xl mx-auto relative z-10">
              <motion.div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.9, type: "spring" as const, stiffness: 200 }}
              >
                <Sparkles className="h-8 w-8 text-white" />
              </motion.div>
              <motion.h2 
                className="text-2xl font-bold text-white mb-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                Create Your Professional Profile
              </motion.h2>
              <motion.p 
                className="text-stone-400 mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
              >
                Join thousands of professionals using UmukoziHR Tailor to create AI-powered, 
                tailored resumes and shareable profiles.
              </motion.p>
              <motion.a
                href="https://tailor.umukozihr.com"
                className="inline-flex items-center gap-2 text-lg px-8 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold shadow-lg shadow-orange-500/30"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2 }}
                whileHover={{ scale: 1.05, boxShadow: '0 15px 40px rgba(249, 115, 22, 0.4)' }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </motion.a>
            </div>
          </motion.div>
        </main>

        {/* Footer */}
        <motion.footer 
          className="relative z-10 border-t border-white/5 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-stone-400 text-sm">
                <FileText className="h-4 w-4 text-orange-400" />
                <span>Powered by <a href="https://umukozihr.com" className="text-orange-400 hover:underline">UmukoziHR</a></span>
              </div>
              <div className="text-stone-500 text-sm">
                © {new Date().getFullYear()} UmukoziHR. All rights reserved.
              </div>
            </div>
          </div>
        </motion.footer>

        {/* Skills Modal */}
        <AnimatePresence>
          {showSkillsModal && profile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowSkillsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl max-h-[80vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">All Skills</h2>
                      <p className="text-sm text-stone-400">
                        {profile.skills?.length || 0} categories • {profile.skills?.reduce((acc, s) => acc + (s.keywords?.length || 0), 0) || 0} total skills
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowSkillsModal(false)}
                    className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {profile.skills?.map((skill, idx) => (
                    <div key={idx} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-semibold ${
                          skill.level === 'expert' ? 'text-orange-400' : 
                          skill.level === 'intermediate' ? 'text-amber-400' : 
                          'text-stone-400'
                        }`}>
                          {skill.name}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          skill.level === 'expert' ? 'bg-orange-500/20 text-orange-400' : 
                          skill.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' : 
                          'bg-stone-700 text-stone-400'
                        }`}>
                          {skill.level}
                        </span>
                        {skill.keywords && skill.keywords.length > 0 && (
                          <span className="text-xs text-stone-500">
                            ({skill.keywords.length} skills)
                          </span>
                        )}
                      </div>
                      {skill.keywords && skill.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {skill.keywords.map((keyword, kidx) => (
                            <span 
                              key={kidx} 
                              className="px-3 py-1.5 text-sm rounded-lg bg-stone-800/50 text-stone-300 border border-stone-700 hover:border-stone-600 transition"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Modal Footer */}
                <div className="p-4 border-t border-white/10 bg-stone-950/50">
                  <button
                    onClick={() => setShowSkillsModal(false)}
                    className="w-full py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Projects Modal */}
        <AnimatePresence>
          {showProjectsModal && profile && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowProjectsModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-4xl max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <Code className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-white">All Projects</h2>
                      <p className="text-sm text-stone-400">
                        {profile.projects?.length || 0} projects
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowProjectsModal(false)}
                    className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                {/* Modal Body - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.projects?.map((project, idx) => (
                      <div key={idx} className="p-5 rounded-xl bg-stone-800/50 border border-white/5 hover:border-blue-500/30 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-white text-lg">{project.name}</h3>
                          {project.url && (
                            <a 
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 p-1.5 rounded-lg hover:bg-blue-500/10 transition"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {project.stack && project.stack.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.stack.map((tech, tIdx) => (
                              <span key={tIdx} className="px-2 py-1 text-xs rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30">{tech}</span>
                            ))}
                          </div>
                        )}
                        {project.bullets && project.bullets.length > 0 && (
                          <ul className="text-sm text-stone-400 space-y-2">
                            {project.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="flex gap-2">
                                <span className="text-blue-400 mt-1">•</span>
                                <span>{bullet}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Modal Footer */}
                <div className="p-4 border-t border-white/10 bg-stone-950/50">
                  <button
                    onClick={() => setShowProjectsModal(false)}
                    className="w-full py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
