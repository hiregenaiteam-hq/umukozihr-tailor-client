import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast, { Toaster } from 'react-hot-toast';
import { publicProfile } from '@/lib/api';
import { ProfileV3 } from '@/lib/types';
import { 
  User, MapPin, Mail, Phone, Globe, ExternalLink, 
  Briefcase, GraduationCap, Code, Award, Languages,
  Calendar, CheckCircle, Sparkles, FileText, ArrowRight
} from 'lucide-react';

interface PublicProfileData {
  username: string;
  profile: ProfileV3;
  completeness: number;
  profile_views: number;
  member_since: string;
  is_available_for_hire: boolean;
}

// Floating orb component for background
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div 
      className={`floating-orb floating-orb-orange ${className}`}
      style={{ animationDelay: `${delay}s` }}
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
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-orange-400" />
          </div>
          <p className="text-stone-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <Head>
          <title>Profile Not Found | UmukoziHR Tailor</title>
        </Head>
        <div className="text-center glass-card p-8 max-w-md mx-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <User className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{error}</h1>
          <p className="text-stone-400 mb-6">
            The profile you're looking for doesn't exist or is private.
          </p>
          <a
            href="https://tailor.umukozihr.com"
            className="btn-primary inline-flex items-center gap-2"
          >
            Create Your Profile <ArrowRight className="h-4 w-4" />
          </a>
        </div>
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

        {/* Header with CTA */}
        <header className="sticky top-0 z-50 glass-heavy border-b border-white/5">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <a href="https://tailor.umukozihr.com" className="flex items-center gap-3 group">
                <div className="neu-raised w-10 h-10 rounded-xl flex items-center justify-center">
                  <FileText className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <span className="text-lg font-bold text-gradient">UmukoziHR Tailor</span>
                  <span className="hidden sm:block text-xs text-stone-500">AI-Powered Resume Builder</span>
                </div>
              </a>
              <a
                href="https://tailor.umukozihr.com"
                className="btn-primary text-sm flex items-center gap-2"
              >
                Create Your Profile <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          {/* Profile Hero */}
          <div className="glass-card p-8 mb-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Avatar */}
              <div className="neu-raised w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-bold text-gradient shrink-0">
                {profile.basics.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                      {profile.basics.full_name || 'Professional'}
                    </h1>
                    {profile.basics.headline && (
                      <p className="text-lg text-stone-300 mb-3">{profile.basics.headline}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-stone-400">
                      {profile.basics.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {profile.basics.location}
                        </span>
                      )}
                      {profile.basics.email && (
                        <a 
                          href={`mailto:${profile.basics.email}`}
                          className="flex items-center gap-1 hover:text-orange-400 transition"
                        >
                          <Mail className="h-4 w-4" />
                          {profile.basics.email}
                        </a>
                      )}
                      {profile.basics.website && (
                        <a 
                          href={profile.basics.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-orange-400 transition"
                        >
                          <Globe className="h-4 w-4" />
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                  
                  {is_available_for_hire && (
                    <span className="badge badge-green">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Open to opportunities
                    </span>
                  )}
                </div>
                
                {/* Stats */}
                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/10 text-sm">
                  <div className="text-stone-400">
                    <span className="text-white font-semibold">{profile_views}</span> profile views
                  </div>
                  <div className="text-stone-400">
                    Member since <span className="text-white font-semibold">{member_since}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          {profile.basics.summary && (
            <div className="glass-card p-6 mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <h2 className="text-lg font-semibold text-white mb-3">About</h2>
              <p className="text-stone-300 leading-relaxed whitespace-pre-line">
                {profile.basics.summary}
              </p>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Experience */}
              {profile.experience && profile.experience.length > 0 && (
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center">
                      <Briefcase className="h-5 w-5 text-orange-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Experience</h2>
                  </div>
                  <div className="space-y-4">
                    {profile.experience.map((exp, idx) => (
                      <div key={idx} className="glass-subtle p-4 rounded-xl">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{exp.title}</h3>
                            <p className="text-orange-400">{exp.company}</p>
                          </div>
                          <span className="text-sm text-stone-500 flex items-center gap-1">
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education */}
              {profile.education && profile.education.length > 0 && (
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center">
                      <GraduationCap className="h-5 w-5 text-amber-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Education</h2>
                  </div>
                  <div className="space-y-4">
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="glass-subtle p-4 rounded-xl">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-white">{edu.degree}</h3>
                            <p className="text-amber-400">{edu.school}</p>
                          </div>
                          {(edu.start || edu.end) && (
                            <span className="text-sm text-stone-500">
                              {edu.start} - {edu.end}
                            </span>
                          )}
                        </div>
                        {edu.gpa && (
                          <p className="text-sm text-stone-400 mt-1">GPA: {edu.gpa}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Projects */}
              {profile.projects && profile.projects.length > 0 && (
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center">
                      <Code className="h-5 w-5 text-blue-400" />
                    </div>
                    <h2 className="text-lg font-semibold text-white">Projects</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.projects.map((project, idx) => (
                      <div key={idx} className="glass-subtle p-4 rounded-xl">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white">{project.name}</h3>
                          {project.url && (
                            <a 
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {project.stack && project.stack.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {project.stack.map((tech, tIdx) => (
                              <span key={tIdx} className="badge badge-blue text-xs">{tech}</span>
                            ))}
                          </div>
                        )}
                        {project.bullets && project.bullets.length > 0 && (
                          <ul className="text-sm text-stone-400 space-y-1">
                            {project.bullets.slice(0, 2).map((bullet, bIdx) => (
                              <li key={bIdx}>• {bullet}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Skills */}
              {profile.skills && profile.skills.length > 0 && (
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                  <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className={`badge ${
                          skill.level === 'expert' ? 'badge-orange' : 
                          skill.level === 'intermediate' ? 'badge-amber' : 
                          'badge-stone'
                        }`}
                      >
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Languages */}
              {profile.languages && profile.languages.length > 0 && (
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Languages className="h-5 w-5 text-green-400" />
                    <h2 className="text-lg font-semibold text-white">Languages</h2>
                  </div>
                  <div className="space-y-2">
                    {profile.languages.map((lang, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-white">{lang.name}</span>
                        <span className="text-stone-400">{lang.level}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Certifications */}
              {profile.certifications && profile.certifications.length > 0 && (
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Award className="h-5 w-5 text-purple-400" />
                    <h2 className="text-lg font-semibold text-white">Certifications</h2>
                  </div>
                  <div className="space-y-3">
                    {profile.certifications.map((cert, idx) => (
                      <div key={idx} className="glass-subtle p-3 rounded-lg">
                        <p className="font-medium text-white text-sm">{cert.name}</p>
                        <p className="text-xs text-stone-400">{cert.issuer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              {profile.basics.links && profile.basics.links.length > 0 && (
                <div className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                  <h2 className="text-lg font-semibold text-white mb-4">Links</h2>
                  <div className="space-y-2">
                    {profile.basics.links.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-stone-400 hover:text-orange-400 transition"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {new URL(link).hostname.replace('www.', '')}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* CTA Banner */}
          <div className="mt-12 glass-card p-8 text-center animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
            <div className="max-w-2xl mx-auto">
              <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-orange-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Create Your Professional Profile
              </h2>
              <p className="text-stone-400 mb-6">
                Join thousands of professionals using UmukoziHR Tailor to create AI-powered, 
                tailored resumes and shareable profiles.
              </p>
              <a
                href="https://tailor.umukozihr.com"
                className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-3"
              >
                Get Started Free <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/5 mt-12">
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
        </footer>
      </div>
    </>
  );
}
