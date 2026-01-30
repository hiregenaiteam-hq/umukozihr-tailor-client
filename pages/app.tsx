import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { profile as profileApi, generation as generationApi, history as historyApi, upload as uploadApi, subscription as subscriptionApi, avatar as avatarApi, SubscriptionStatus } from '@/lib/api';
import { config } from '@/lib/config';
import { ProfileV3, HistoryItem } from '@/lib/types';
import CompletenessBar from '@/components/CompletenessBar';
import JDComposer from '@/components/JDComposer';
import RunCard from '@/components/RunCard';
import JobCard from '@/components/JobCard';
import ThemeToggle from '@/components/ThemeToggle';
import ShareButtons from '@/components/ShareButtons';
import { HeaderLogo } from '@/components/Logo';
import { UpgradeModal } from '@/components/UpgradeModal';
import { 
  User, FileText, History, LogOut, Settings, 
  Sparkles, ChevronRight, Briefcase, MapPin, 
  GraduationCap, Code, Play, Trash2, Download,
  Clock, CheckCircle, AlertCircle, Zap, Shield, Share2, Upload, AlertTriangle, Home, ArrowLeft, Camera,
  Award, Languages, Globe, ExternalLink, FolderKanban, X, Plus, Pencil,
  Github, Linkedin, Twitter, Youtube, Dribbble, Figma, Instagram, Facebook
} from 'lucide-react';
import { Experience, Education, Project, Certification, Language, Skill } from '@/lib/types';

// Platform detection for branded link icons
const getPlatformInfo = (url: string): { icon: React.ElementType; name: string; color: string } => {
  const hostname = url.toLowerCase();
  if (hostname.includes('github.com') || hostname.includes('github.io')) {
    return { icon: Github, name: 'GitHub', color: 'text-white' };
  }
  if (hostname.includes('linkedin.com')) {
    return { icon: Linkedin, name: 'LinkedIn', color: 'text-blue-400' };
  }
  if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
    return { icon: Twitter, name: 'X / Twitter', color: 'text-sky-400' };
  }
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
    return { icon: Youtube, name: 'YouTube', color: 'text-red-500' };
  }
  if (hostname.includes('dribbble.com')) {
    return { icon: Dribbble, name: 'Dribbble', color: 'text-pink-400' };
  }
  if (hostname.includes('figma.com')) {
    return { icon: Figma, name: 'Figma', color: 'text-purple-400' };
  }
  if (hostname.includes('instagram.com')) {
    return { icon: Instagram, name: 'Instagram', color: 'text-pink-500' };
  }
  if (hostname.includes('facebook.com')) {
    return { icon: Facebook, name: 'Facebook', color: 'text-blue-500' };
  }
  if (hostname.includes('behance.net')) {
    return { icon: Globe, name: 'Behance', color: 'text-blue-400' };
  }
  if (hostname.includes('codepen.io')) {
    return { icon: Code, name: 'CodePen', color: 'text-yellow-400' };
  }
  if (hostname.includes('medium.com')) {
    return { icon: FileText, name: 'Medium', color: 'text-green-400' };
  }
  if (hostname.includes('dev.to')) {
    return { icon: Code, name: 'Dev.to', color: 'text-white' };
  }
  if (hostname.includes('stackoverflow.com')) {
    return { icon: Code, name: 'Stack Overflow', color: 'text-orange-400' };
  }
  if (hostname.includes('kaggle.com')) {
    return { icon: Code, name: 'Kaggle', color: 'text-cyan-400' };
  }
  return { icon: Globe, name: 'Website', color: 'text-orange-400' };
};

// Check for authentication token
const hasAuthToken = () => typeof window !== 'undefined' && !!localStorage.getItem('token');

type Tab = 'profile' | 'generate' | 'history';

interface JobQueue {
  id: string;
  region: 'US' | 'EU' | 'GL';
  company: string;
  title: string;
  jd_text: string;
}

// Floating orb for background
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <motion.div 
      className={`floating-orb floating-orb-orange ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -30, 0]
      }}
      transition={{ 
        duration: 8,
        delay,
        y: { duration: 8, repeat: Infinity, ease: "easeInOut" }
      }}
    />
  );
}

// Animation variants
const tabContentVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4, ease: "easeOut" }
  })
};

// Derive region from location string
const getRegionFromLocation = (location: string | undefined): 'US' | 'EU' | 'GL' => {
  if (!location) return 'GL';
  const loc = location.toLowerCase();
  
  // US states and common US locations
  const usPatterns = [
    'united states', 'usa', 'u.s.a', 'u.s.', 'america',
    // States
    'california', 'texas', 'florida', 'new york', 'illinois', 'pennsylvania',
    'ohio', 'georgia', 'north carolina', 'michigan', 'new jersey', 'virginia',
    'washington', 'arizona', 'massachusetts', 'tennessee', 'indiana', 'missouri',
    'maryland', 'wisconsin', 'colorado', 'minnesota', 'south carolina', 'alabama',
    'louisiana', 'kentucky', 'oregon', 'oklahoma', 'connecticut', 'utah', 'iowa',
    'nevada', 'arkansas', 'mississippi', 'kansas', 'new mexico', 'nebraska',
    'idaho', 'hawaii', 'maine', 'montana', 'delaware', 'south dakota', 'alaska',
    'north dakota', 'vermont', 'wyoming', 'west virginia', 'rhode island',
    // Major cities
    'san francisco', 'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
    'san antonio', 'san diego', 'dallas', 'austin', 'seattle', 'denver', 'boston',
    'detroit', 'atlanta', 'miami', 'portland', 'las vegas', 'brooklyn', 'manhattan'
  ];
  
  // EU countries
  const euPatterns = [
    'germany', 'france', 'italy', 'spain', 'poland', 'romania', 'netherlands',
    'belgium', 'greece', 'czech', 'portugal', 'sweden', 'hungary', 'austria',
    'bulgaria', 'denmark', 'finland', 'slovakia', 'ireland', 'croatia', 'lithuania',
    'slovenia', 'latvia', 'estonia', 'cyprus', 'luxembourg', 'malta',
    // UK (post-Brexit but still often grouped)
    'united kingdom', 'uk', 'england', 'scotland', 'wales', 'london', 'manchester',
    'birmingham', 'liverpool', 'bristol',
    // Major EU cities
    'berlin', 'paris', 'madrid', 'rome', 'amsterdam', 'vienna', 'barcelona',
    'munich', 'milan', 'prague', 'brussels', 'stockholm', 'dublin', 'lisbon',
    'copenhagen', 'warsaw', 'budapest', 'zurich', 'geneva', 'switzerland'
  ];
  
  if (usPatterns.some(p => loc.includes(p))) return 'US';
  if (euPatterns.some(p => loc.includes(p))) return 'EU';
  return 'GL';
};

export default function AppPage() {
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<Tab>('generate');
  const [profile, setProfile] = useState<ProfileV3 | null>(null);
  const [completeness, setCompleteness] = useState(0);
  const [breakdown, setBreakdown] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Generate tab state
  const [jobQueue, setJobQueue] = useState<JobQueue[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRun, setCurrentRun] = useState<any>(null);

  // History tab state
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Profile upload state
  const [isUploadingResume, setIsUploadingResume] = useState(false);
  const profileFileInputRef = useRef<HTMLInputElement>(null);
  
  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Generation progress state
  const [generationProgress, setGenerationProgress] = useState<{current: number; total: number} | null>(null);
  // Delete profile state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [isDeleting, setIsDeleting] = useState(false);

  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeTrigger, setUpgradeTrigger] = useState<'limit_reached' | 'batch_upload' | 'zip_download' | 'general'>('general');

  // Skills modal state
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  
  // Section modal states
  const [showBasicsModal, setShowBasicsModal] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showEducationModal, setShowEducationModal] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showCertsModal, setShowCertsModal] = useState(false);
  const [showLanguagesModal, setShowLanguagesModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);

  // Inline editing state
  const [editedProfile, setEditedProfile] = useState<ProfileV3 | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Track which item index is being edited in each modal (-1 = none, -2 = adding new)
  const [editingBasics, setEditingBasics] = useState(false);
  const [editingExpIndex, setEditingExpIndex] = useState<number>(-1);
  const [editingEduIndex, setEditingEduIndex] = useState<number>(-1);
  const [editingProjIndex, setEditingProjIndex] = useState<number>(-1);
  const [editingCertIndex, setEditingCertIndex] = useState<number>(-1);
  const [editingLangIndex, setEditingLangIndex] = useState<number>(-1);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number>(-1);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number>(-1);

  // Helper to update a section and save to localStorage
  const updateProfileSection = <K extends keyof ProfileV3>(section: K, newData: ProfileV3[K]) => {
    const currentProfile = editedProfile || profile;
    if (!currentProfile) return;
    
    const updated = { ...currentProfile, [section]: newData };
    setEditedProfile(updated);
    // Auto-save to localStorage for crash recovery
    localStorage.setItem('profile_draft', JSON.stringify(updated));
  };

  // Save profile changes to database
  const saveProfileChanges = async () => {
    if (!editedProfile) return;
    
    setIsSavingProfile(true);
    try {
      const response = await profileApi.update(editedProfile);
      setProfile(editedProfile);
      setEditedProfile(null);
      setCompleteness(response.data.completeness);
      localStorage.removeItem('profile_draft');
      toast.success('Profile updated successfully!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to save profile');
      return false;
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Cancel edits and revert
  const cancelProfileEdits = () => {
    setEditedProfile(null);
    localStorage.removeItem('profile_draft');
    // Reset all editing indices
    setEditingBasics(false);
    setEditingExpIndex(-1);
    setEditingEduIndex(-1);
    setEditingProjIndex(-1);
    setEditingCertIndex(-1);
    setEditingLangIndex(-1);
    setEditingLinkIndex(-1);
    setEditingSkillIndex(-1);
  };

  // Get the current working profile (edited or original)
  const workingProfile = editedProfile || profile;

  useEffect(() => {
    setMounted(true);
    
    // Check authentication - require token
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in');
      router.push('/');
      return;
    }
    
    // Check for unsaved draft and offer recovery
    const savedDraft = localStorage.getItem('profile_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft && draft.basics) {
          setEditedProfile(draft);
          toast('Recovered unsaved changes from your last session', {
            icon: '💾',
            duration: 4000
          });
        }
      } catch (e) {
        localStorage.removeItem('profile_draft');
      }
    }
    
    loadProfile();
    loadHistory();
    loadSubscriptionStatus();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await profileApi.get();
      setProfile(response.data.profile);
      setCompleteness(response.data.completeness);
      const compResponse = await profileApi.getCompleteness();
      setBreakdown(compResponse.data.breakdown);
      
      // Load avatar
      try {
        const avatarResponse = await avatarApi.get();
        setAvatarUrl(avatarResponse.data.avatar_url);
      } catch (e) {
        // No avatar set - that's fine
      }
      
      if (response.data.completeness < 50) {
        toast('Your profile is incomplete. Consider completing it for better results!', {
          icon: '⚠️',
          duration: 5000
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        const savedDraft = localStorage.getItem('onboarding_draft');
        if (savedDraft) {
          try {
            const parsedProfile = JSON.parse(savedDraft);
            if (parsedProfile.basics?.full_name && parsedProfile.basics?.email) {
              toast.loading('Recovering your saved profile...');
              try {
                const syncResponse = await profileApi.update(parsedProfile);
                toast.dismiss();
                toast.success('Profile recovered successfully!');
                setProfile(parsedProfile);
                setCompleteness(syncResponse.data.completeness);
                try {
                  const compResponse = await profileApi.getCompleteness();
                  setBreakdown(compResponse.data.breakdown);
                } catch (e) {}
                setIsLoading(false);
                return;
              } catch (syncError: any) {
                toast.dismiss();
                toast('Could not sync profile. Redirecting to complete setup...', { icon: '⚠️' });
              }
            }
          } catch (e) {
            toast('Please complete your profile to get started.', { icon: '���' });
          }
        }
        router.push('/onboarding');
      } else {
        toast.error('Failed to load profile. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async (page = 1) => {
    setIsLoadingHistory(true);
    try {
      const response = await historyApi.list(page, 10);
      setHistoryItems(response.data.runs);
      setHistoryTotal(response.data.total);
      setHistoryPage(page);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const loadSubscriptionStatus = async () => {
    try {
      const response = await subscriptionApi.getStatus();
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error loading subscription status:', error);
    }
  };

  // Avatar upload handler
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Please upload a JPEG, PNG, WebP, or GIF image');
      return;
    }

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image too large. Maximum 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    try {
      toast.loading('Uploading...', { id: 'avatar-upload' });
      const response = await avatarApi.upload(file);
      setAvatarUrl(response.data.avatar_url);
      toast.success('Profile picture updated!', { id: 'avatar-upload' });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload image', { id: 'avatar-upload' });
    } finally {
      setIsUploadingAvatar(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  };

  const handleLogout = async () => {
    // Clear auth tokens
    localStorage.removeItem('token');
    localStorage.removeItem('userProfile');
    
    // Sign out from Supabase if configured
    try {
      const { signOut } = await import('../lib/supabase');
      await signOut();
    } catch (e) {
      // Supabase not configured or signout failed - continue anyway
    }
    
    toast.success('Logged out successfully');
    router.push('/');
  };

  const handleAddJob = (job: JobQueue) => {
    // Check if user is trying to add multiple jobs without batch permission
    if (jobQueue.length >= 1 && subscriptionStatus?.is_live && !subscriptionStatus?.features?.batch_upload) {
      // User is trying batch upload but doesn't have permission
      setUpgradeTrigger('batch_upload');
      setShowUpgradeModal(true);
      return;
    }
    
    setJobQueue([...jobQueue, job]);
  };

  const handleRemoveJob = (index: number) => {
    setJobQueue(jobQueue.filter((_, i) => i !== index));
    toast.success('Job removed from queue');
  };

  // Navigate to landing page
  const handleGoHome = () => {
    router.push('/');
  };

  const handleGenerate = async () => {
    if (jobQueue.length === 0) {
      toast.error('Please add at least one job to the queue');
      return;
    }
    if (!profile) {
      toast.error('Profile not loaded');
      return;
    }

    // Check generation limit before proceeding
    if (subscriptionStatus?.is_live && !subscriptionStatus?.can_generate) {
      setUpgradeTrigger('limit_reached');
      setShowUpgradeModal(true);
      return;
    }

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: jobQueue.length });
    
    try {
      // Show progress during generation
      const progressToast = toast.loading(
        `Processing ${jobQueue.length} job${jobQueue.length > 1 ? 's' : ''}...`,
        { id: 'generation-progress' }
      );
      
      const response = await generationApi.generate(null, jobQueue);
      
      // Update progress to complete
      setGenerationProgress({ current: jobQueue.length, total: jobQueue.length });
      
      toast.dismiss('generation-progress');
      toast.success(`Generated ${response.data.artifacts?.length || jobQueue.length} resumes!`);
      
      setCurrentRun(response.data);
      setJobQueue([]);
      loadHistory();
    } catch (error: any) {
      toast.dismiss('generation-progress');
      toast.error(error.response?.data?.detail || 'Failed to generate documents');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(null);
    }
  };

  const handleRegenerate = async (runId: string) => {
    toast.loading('Regenerating...');
    try {
      const response = await historyApi.regenerate(runId);
      setCurrentRun(response.data);
      toast.dismiss();
      toast.success('Regenerated successfully!');
      loadHistory();
      setActiveTab('generate');
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.response?.data?.detail || 'Regeneration failed');
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    // Check if this is a ZIP download and if user has permission
    const isZipDownload = filename.includes('.zip') || url.includes('.zip');
    
    if (isZipDownload && subscriptionStatus?.is_live && !subscriptionStatus?.features?.zip_download) {
      // User is trying to download ZIP but doesn't have permission
      setUpgradeTrigger('zip_download');
      setShowUpgradeModal(true);
      return;
    }
    
    // Force download on all devices (including mobile)
    const fullUrl = url.startsWith('http') ? url : `${config.apiUrl}${url}`;
    
    try {
      toast.loading(`Downloading ${filename}...`, { id: 'download' });
      
      // Fetch as blob to force download behavior
      const response = await fetch(fullUrl);
      if (!response.ok) throw new Error('Download failed');
      
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      // Create temporary anchor with download attribute
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      
      toast.success(`Downloaded ${filename}`, { id: 'download' });
    } catch (error) {
      console.error('Download error:', error);
      // Fallback: open in new tab
      window.open(fullUrl, '_blank');
      toast.success(`Opening ${filename}...`, { id: 'download' });
    }
  };

  // Handle resume upload to update profile
  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      await profileApi.delete();
      toast.success('Your profile has been deleted');
      localStorage.removeItem('token');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('onboarding_draft');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to delete profile');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleProfileResumeUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    const validExtensions = ['.pdf', '.docx', '.txt'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!validExtensions.includes(extension)) {
      toast.error('Invalid file type. Please upload PDF, DOCX, or TXT.');
      return;
    }

    setIsUploadingResume(true);
    try {
      toast.loading('Extracting profile data...', { id: 'profile-upload' });
      const response = await uploadApi.resume(file);
      
      if (response.data.success && response.data.profile) {
        const extracted = response.data.profile;
        
        // Sanitize skills to ensure valid levels
        const sanitizedSkills = (extracted.skills || []).map((skill: any) => ({
          ...skill,
          name: skill.name || '',
          level: ['beginner', 'intermediate', 'expert'].includes(skill.level?.toLowerCase()?.trim()) 
            ? skill.level.toLowerCase().trim() 
            : 'intermediate',
          keywords: skill.keywords || [],
        }));
        
        const updatedProfile: ProfileV3 = {
          ...profile!,
          basics: {
            full_name: extracted.basics?.full_name || profile?.basics.full_name || '',
            headline: extracted.basics?.headline || '',
            summary: extracted.basics?.summary || '',
            location: extracted.basics?.location || '',
            email: extracted.basics?.email || profile?.basics.email || '',
            phone: extracted.basics?.phone || '',
            website: extracted.basics?.website || '',
            links: extracted.basics?.links || [],
          },
          skills: sanitizedSkills,
          experience: extracted.experience || [],
          education: extracted.education || [],
          projects: extracted.projects || [],
          certifications: extracted.certifications || [],
          awards: extracted.awards || [],
          languages: extracted.languages || [],
          preferences: profile?.preferences || { regions: ['US'], templates: ['minimal'] },
        };
        
        // Save to server
        const saveResponse = await profileApi.update(updatedProfile);
        setProfile(updatedProfile);
        setCompleteness(saveResponse.data.completeness);
        
        const confidence = Math.round((response.data.extraction_confidence || 0) * 100);
        toast.success(`Profile updated from resume! (${confidence}% confidence)`, { id: 'profile-upload' });
      } else {
        toast.error(response.data.message || 'Failed to extract profile', { id: 'profile-upload' });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Upload timed out. Render server may be waking up - please try again.', { id: 'profile-upload' });
      } else {
        toast.error(error.response?.data?.detail || 'Failed to upload resume', { id: 'profile-upload' });
      }
    } finally {
      setIsUploadingResume(false);
      if (profileFileInputRef.current) {
        profileFileInputRef.current.value = '';
      }
    }
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
          <p className="text-stone-400">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as Tab, label: 'Profile', icon: User },
    { id: 'generate' as Tab, label: 'Generate', icon: FileText },
    { id: 'history' as Tab, label: 'History', icon: History }
  ];

  return (
    <div className={`min-h-screen bg-[#0c0a09] relative transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <FloatingOrb className="w-[500px] h-[500px] -top-32 -right-32" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bottom-0 -left-20" delay={3} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-heavy border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={handleGoHome}
              className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
              title="Go to Home"
            >
              <HeaderLogo size="md" />
            </button>

            <div className="flex items-center gap-2 sm:gap-3">
              {/* Home button for mobile */}
              <button
                onClick={handleGoHome}
                className="btn-icon sm:hidden"
                title="Home"
              >
                <Home className="h-5 w-5" />
              </button>
              {(profile as any)?.is_admin && (
                <button
                  onClick={() => router.push('/admin')}
                  className="btn-ghost flex items-center gap-2"
                >
                  <Shield className="h-4 w-4" />
                  <span className="hidden md:inline">Admin</span>
                </button>
              )}
              <ThemeToggle />
              <button
                onClick={() => router.push('/settings')}
                className="btn-icon"
                title="Settings"
              >
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={handleLogout}
                className="btn-icon"
                title="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Completeness Banner */}
      {completeness < 80 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-500/20">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <AlertCircle className="h-4 w-4 text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-white">Profile {completeness}% complete</p>
                  <p className="text-xs text-stone-400">Complete your profile for better tailored resumes</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/onboarding')}
                className="text-sm text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1"
              >
                Complete <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabs - Enhanced */}
      <div className="glass-subtle border-b border-white/5 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex items-center gap-2 px-6 py-4 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-orange-400'
                    : 'text-stone-400 hover:text-white'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  animate={activeTab === tab.id ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <tab.icon className="h-4 w-4" />
                </motion.div>
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div 
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <AnimatePresence mode="wait">
        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <motion.div 
            key="profile"
            className="space-y-6"
            variants={tabContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {/* Profile Header */}
            <motion.div 
              className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              {/* Decorative gradient */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl" />
              
              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                {/* Clickable Avatar */}
                <motion.div 
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl cursor-pointer group"
                  title="Click to upload profile picture"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  ) : (
                    <div className="neu-raised w-full h-full rounded-2xl flex items-center justify-center text-3xl font-bold text-gradient">
                      {profile.basics.full_name?.charAt(0) || '?'}
                    </div>
                  )}
                  {/* Upload overlay on hover */}
                  <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    {isUploadingAvatar ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </motion.div>
                <div 
                  className="flex-1 cursor-pointer group/info"
                  onClick={() => setShowBasicsModal(true)}
                >
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 group-hover/info:text-orange-400 transition">
                      {profile.basics.full_name || 'Complete Your Profile'}
                    </h2>
                    <Pencil className="h-4 w-4 text-stone-500 opacity-0 group-hover/info:opacity-100 transition" />
                  </div>
                  <p className="text-stone-400 mb-3 text-sm sm:text-base">{profile.basics.email}</p>
                  {profile.basics.location && (
                    <p className="text-stone-500 text-sm flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {profile.basics.location}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                <button
                  onClick={() => profileFileInputRef.current?.click()}
                  disabled={isUploadingResume}
                  className="btn-secondary flex items-center gap-2 flex-1 sm:flex-none justify-center"
                >
                  {isUploadingResume ? (
                    <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  <span className="hidden sm:inline">{isUploadingResume ? 'Uploading...' : 'Upload Resume'}</span>
                </button>
                <input
                  ref={profileFileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleProfileResumeUpload}
                  className="hidden"
                />
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn-icon text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                  title="Delete Profile"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                </div>
              </div>
              
              {/* Progress */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-stone-400">Profile Completeness</span>
                  <span className="text-orange-400 font-medium">{completeness}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${completeness}%` }} />
                </div>
              </div>
            </motion.div>

            {/* Profile Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience - Clickable */}
              <motion.div 
                className="glass-card p-6 cursor-pointer hover:border-orange-500/30 transition-all group"
                onClick={() => setShowExperienceModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-orange-500/20 transition">
                      <Briefcase className="h-5 w-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Experience ({profile.experience?.length || 0})
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-500 group-hover:text-orange-400 transition" />
                </div>
                <div className="space-y-3">
                  {profile.experience?.slice(0, 3).map((exp, idx) => (
                    <div key={idx} className="glass-subtle p-3 rounded-lg">
                      <p className="font-medium text-white">{exp.title}</p>
                      <p className="text-sm text-stone-400">{exp.company}</p>
                    </div>
                  ))}
                  {(!profile.experience || profile.experience.length === 0) && (
                    <p className="text-stone-500 text-sm">No experience added yet</p>
                  )}
                </div>
              </motion.div>

              {/* Education - Clickable */}
              <motion.div 
                className="glass-card p-6 cursor-pointer hover:border-amber-500/30 transition-all group"
                onClick={() => setShowEducationModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition">
                      <GraduationCap className="h-5 w-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Education ({profile.education?.length || 0})
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-500 group-hover:text-amber-400 transition" />
                </div>
                <div className="space-y-3">
                  {profile.education?.slice(0, 3).map((edu, idx) => (
                    <div key={idx} className="glass-subtle p-3 rounded-lg">
                      <p className="font-medium text-white">{edu.degree}</p>
                      <p className="text-sm text-stone-400">{edu.school}</p>
                    </div>
                  ))}
                  {(!profile.education || profile.education.length === 0) && (
                    <p className="text-stone-500 text-sm">No education added yet</p>
                  )}
                </div>
              </motion.div>

              {/* Projects - Clickable */}
              <motion.div 
                className="glass-card p-6 cursor-pointer hover:border-blue-500/30 transition-all group"
                onClick={() => setShowProjectsModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition">
                      <FolderKanban className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Projects ({profile.projects?.length || 0})
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-500 group-hover:text-blue-400 transition" />
                </div>
                <div className="space-y-3">
                  {profile.projects?.slice(0, 3).map((project, idx) => (
                    <div key={idx} className="glass-subtle p-3 rounded-lg">
                      <p className="font-medium text-white">{project.name}</p>
                      {project.stack && project.stack.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.stack.slice(0, 4).map((tech, tidx) => (
                            <span key={tidx} className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-300">{tech}</span>
                          ))}
                          {project.stack.length > 4 && (
                            <span className="px-2 py-0.5 text-xs rounded bg-stone-700 text-stone-400">+{project.stack.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!profile.projects || profile.projects.length === 0) && (
                    <p className="text-stone-500 text-sm">No projects added yet</p>
                  )}
                </div>
              </motion.div>

              {/* Certifications - Clickable */}
              <motion.div 
                className="glass-card p-6 cursor-pointer hover:border-purple-500/30 transition-all group"
                onClick={() => setShowCertsModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-purple-500/20 transition">
                      <Award className="h-5 w-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Certifications ({profile.certifications?.length || 0})
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-500 group-hover:text-purple-400 transition" />
                </div>
                <div className="space-y-3">
                  {profile.certifications?.slice(0, 3).map((cert, idx) => (
                    <div key={idx} className="glass-subtle p-3 rounded-lg">
                      <p className="font-medium text-white">{cert.name}</p>
                      <p className="text-sm text-stone-400">{cert.issuer}</p>
                    </div>
                  ))}
                  {(!profile.certifications || profile.certifications.length === 0) && (
                    <p className="text-stone-500 text-sm">No certifications added yet</p>
                  )}
                </div>
              </motion.div>

              {/* Languages - Clickable */}
              <motion.div 
                className="glass-card p-6 cursor-pointer hover:border-green-500/30 transition-all group"
                onClick={() => setShowLanguagesModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-green-500/20 transition">
                      <Languages className="h-5 w-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Languages ({profile.languages?.length || 0})
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-500 group-hover:text-green-400 transition" />
                </div>
                <div className="space-y-2">
                  {profile.languages?.slice(0, 5).map((lang, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-white">{lang.name}</span>
                      <span className="text-stone-400 text-xs">{lang.level}</span>
                    </div>
                  ))}
                  {(!profile.languages || profile.languages.length === 0) && (
                    <p className="text-stone-500 text-sm">No languages added yet</p>
                  )}
                </div>
              </motion.div>

              {/* Links - Clickable with Platform Icons */}
              <motion.div 
                className="glass-card p-6 cursor-pointer hover:border-cyan-500/30 transition-all group"
                onClick={() => setShowLinksModal(true)}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-cyan-500/20 transition">
                      <Globe className="h-5 w-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Links ({profile.basics?.links?.filter(l => l && l.trim()).length || 0})
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-500 group-hover:text-cyan-400 transition" />
                </div>
                <div className="space-y-2">
                  {profile.basics?.links?.filter(l => l && l.trim()).slice(0, 5).map((link, idx) => {
                    const platform = getPlatformInfo(link);
                    const PlatformIcon = platform.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-sm p-2 rounded-lg bg-stone-800/30"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PlatformIcon className={`h-4 w-4 ${platform.color}`} />
                        <span className="text-stone-300">{platform.name}</span>
                      </div>
                    );
                  })}
                  {(!profile.basics?.links || profile.basics.links.filter(l => l && l.trim()).length === 0) && (
                    <p className="text-stone-500 text-sm">No links added yet</p>
                  )}
                </div>
              </motion.div>

              {/* Skills - Clickable */}
              <motion.div 
                className="glass-card p-6 md:col-span-2 cursor-pointer hover:border-emerald-500/30 transition-all group"
                onClick={() => setShowSkillsModal(true)}
                whileHover={{ scale: 1.005 }}
                whileTap={{ scale: 0.995 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center group-hover:bg-emerald-500/20 transition">
                      <Code className="h-5 w-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">
                      Skills ({profile.skills?.length || 0} categories)
                    </h3>
                  </div>
                  <ChevronRight className="h-5 w-5 text-stone-500 group-hover:text-emerald-400 transition" />
                </div>
                <div className="space-y-4">
                  {profile.skills?.slice(0, 3).map((skill, idx) => (
                    <div key={idx}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${
                          skill.level === 'expert' ? 'text-orange-400' : 
                          skill.level === 'intermediate' ? 'text-amber-400' : 
                          'text-stone-400'
                        }`}>
                          {skill.name}
                        </span>
                        <span className="text-xs text-stone-500">• {skill.level}</span>
                        {skill.keywords && skill.keywords.length > 0 && (
                          <span className="text-xs text-stone-600">({skill.keywords.length})</span>
                        )}
                      </div>
                      {skill.keywords && skill.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skill.keywords.slice(0, 8).map((keyword, kidx) => (
                            <span 
                              key={kidx} 
                              className="px-2 py-1 text-xs rounded-lg bg-stone-800/50 text-stone-300 border border-stone-700"
                            >
                              {keyword}
                            </span>
                          ))}
                          {skill.keywords.length > 8 && (
                            <span className="px-2 py-1 text-xs rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                              +{skill.keywords.length - 8} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {profile.skills && profile.skills.length > 3 && (
                    <div className="w-full py-3 text-sm text-orange-400 rounded-lg flex items-center justify-center gap-2">
                      <span>+{profile.skills.length - 3} more skill categories</span>
                    </div>
                  )}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <p className="text-stone-500 text-sm">No skills added yet. Click to add your first skill category.</p>
                  )}
                </div>
              </motion.div>

              {/* Share Profile */}
              <div className="md:col-span-2">
                <ShareButtons />
              </div>
            </div>
          </motion.div>
        )}

        {/* Generate Tab */}
        {activeTab === 'generate' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            {/* Left: JD Input */}
            <div className="space-y-6">
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="neu-raised w-12 h-12 rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Add Job Descriptions</h2>
                    <p className="text-sm text-stone-400">Paste job postings to tailor your resume</p>
                  </div>
                </div>
                <JDComposer
                  onAddJob={handleAddJob}
                  defaultRegion={getRegionFromLocation(profile?.basics.location)}
                />
              </div>

              {/* Job Queue */}
              {jobQueue.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center text-sm text-orange-400">
                      {jobQueue.length}
                    </span>
                    Jobs in Queue
                  </h3>
                  <div className="space-y-3">
                    {jobQueue.map((job, idx) => (
                      <div 
                        key={idx} 
                        className="glass-subtle p-4 rounded-xl flex justify-between items-center group hover:border-orange-500/30 transition-all"
                      >
                        <div>
                          <div className="font-medium text-white">{job.title}</div>
                          <div className="text-sm text-stone-400 flex items-center gap-2">
                            <span>{job.company}</span>
                            <span className="w-1 h-1 rounded-full bg-stone-600" />
                            <span className="badge badge-orange text-xs">{job.region}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveJob(idx)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="btn-primary w-full mt-6 flex items-center justify-center gap-3"
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>
                          {generationProgress 
                            ? `Processing ${generationProgress.current}/${generationProgress.total}...`
                            : 'Generating...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5" />
                        <span>Generate {jobQueue.length} Resume{jobQueue.length > 1 ? 's' : ''}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Right: Results */}
            <div className="glass-card p-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
                <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-green-400" />
                </div>
                Generated Documents
              </h2>
              
              {currentRun && currentRun.artifacts ? (
                <div className="space-y-4">
                  {/* Download Bundle Button - Only show ZIP for Pro users */}
                  {currentRun.zip && (
                    <div className="glass-subtle p-4 rounded-xl border border-green-500/20 bg-green-500/5">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="neu-flat w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center">
                            <Download className="w-5 h-5 text-green-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-white font-medium">Documents Ready!</p>
                            <p className="text-xs text-stone-400">
                              {currentRun.artifacts.length} job{currentRun.artifacts.length > 1 ? 's' : ''} • Download PDFs below
                            </p>
                          </div>
                        </div>
                        {/* Show ZIP button only if user has zip_download permission */}
                        {(!subscriptionStatus?.is_live || subscriptionStatus?.features?.zip_download) ? (
                          <button
                            onClick={() => handleDownload(currentRun.zip, 'documents_bundle.zip')}
                            className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto"
                          >
                            <Download className="h-4 w-4" />
                            Download ZIP
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-stone-400">
                            <span className="badge badge-stone">ZIP bundling is Pro</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {currentRun.artifacts.map((artifact: any, idx: number) => (
                    <JobCard key={idx} data={artifact} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="neu-raised w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <FileText className="h-10 w-10 text-stone-600" />
                  </div>
                  <p className="text-stone-400 mb-2">No documents generated yet</p>
                  <p className="text-sm text-stone-500">Add jobs and click Generate to get started!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="animate-fade-in-up">
            <div className="glass-card p-6 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="neu-raised w-12 h-12 rounded-xl flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Generation History</h2>
                    <p className="text-sm text-stone-400">{historyTotal} total runs</p>
                  </div>
                </div>
              </div>
            </div>

            {isLoadingHistory ? (
              <div className="text-center py-16">
                <div className="w-12 h-12 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-stone-400">Loading history...</p>
              </div>
            ) : historyItems.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {historyItems.map((run) => (
                    <RunCard
                      key={run.run_id}
                      run={run}
                      onRegenerate={handleRegenerate}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>

                {historyTotal > 10 && (
                  <div className="flex justify-center gap-3 mt-8">
                    <button
                      onClick={() => loadHistory(historyPage - 1)}
                      disabled={historyPage === 1}
                      className="btn-secondary px-6 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="flex items-center px-4 text-stone-400">
                      Page {historyPage} of {Math.ceil(historyTotal / 10)}
                    </span>
                    <button
                      onClick={() => loadHistory(historyPage + 1)}
                      disabled={historyPage >= Math.ceil(historyTotal / 10)}
                      className="btn-secondary px-6 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="glass-card p-16 text-center">
                <div className="neu-raised w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <History className="h-10 w-10 text-stone-600" />
                </div>
                <p className="text-stone-400 mb-2">No generation history yet</p>
                <p className="text-sm text-stone-500 mb-6">Generate your first resume to see it here</p>
                <button
                  onClick={() => setActiveTab('generate')}
                  className="btn-primary"
                >
                  Generate Your First Resume
                </button>
              </div>
            )}
          </div>
        )}
        </AnimatePresence>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-card p-6 max-w-md w-full animate-scale-in">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Profile?</h3>
                <p className="text-sm text-stone-400">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-stone-300 mb-6">
              Your profile, account, and all generated documents will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary flex-1"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteProfile}
                disabled={isDeleting}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-medium py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Forever
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Basics Modal - Edit Name, Email, Location */}
      <AnimatePresence>
        {showBasicsModal && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { cancelProfileEdits(); setShowBasicsModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <User className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Basic Info</h2>
                    <p className="text-sm text-stone-400">Edit your name, email, and location</p>
                  </div>
                </div>
                <button
                  onClick={() => { cancelProfileEdits(); setShowBasicsModal(false); }}
                  className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                  {editingBasics ? (
                    /* Edit Mode */
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs text-stone-500 uppercase tracking-wide">Full Name</label>
                        <input 
                          type="text" 
                          value={workingProfile?.basics?.full_name || ''} 
                          onChange={(e) => { 
                            const current = workingProfile || profile;
                            updateProfileSection('basics', { ...current.basics, full_name: e.target.value }); 
                          }} 
                          placeholder="John Doe" 
                          className="w-full bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-stone-500 uppercase tracking-wide">Email Address</label>
                        <input 
                          type="email" 
                          value={workingProfile?.basics?.email || ''} 
                          onChange={(e) => { 
                            const current = workingProfile || profile;
                            updateProfileSection('basics', { ...current.basics, email: e.target.value }); 
                          }} 
                          placeholder="john@example.com" 
                          className="w-full bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-stone-500 uppercase tracking-wide">Location</label>
                        <input 
                          type="text" 
                          value={workingProfile?.basics?.location || ''} 
                          onChange={(e) => { 
                            const current = workingProfile || profile;
                            updateProfileSection('basics', { ...current.basics, location: e.target.value }); 
                          }} 
                          placeholder="San Francisco, CA" 
                          className="w-full bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none" 
                        />
                      </div>
                      <button 
                        onClick={() => setEditingBasics(false)} 
                        className="w-full py-2 text-green-400 hover:bg-green-500/10 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Done Editing
                      </button>
                    </div>
                  ) : (
                    /* View Mode */
                    <div className="flex justify-between items-start">
                      <div className="flex-1 space-y-3">
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Full Name</p>
                          <p className="text-white font-medium">{workingProfile?.basics?.full_name || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Email Address</p>
                          <p className="text-stone-300">{workingProfile?.basics?.email || 'Not set'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Location</p>
                          <p className="text-stone-300 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {workingProfile?.basics?.location || 'Not set'}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setEditingBasics(true)} 
                        className="p-2 text-stone-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition" 
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-stone-950/50 flex gap-3">
                <button
                  onClick={() => { cancelProfileEdits(); setShowBasicsModal(false); }}
                  className="flex-1 py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium"
                >
                  {editedProfile ? 'Cancel' : 'Close'}
                </button>
                {editedProfile && (
                  <button 
                    onClick={async () => { const success = await saveProfileChanges(); if (success) setShowBasicsModal(false); }}
                    disabled={isSavingProfile}
                    className="flex-1 py-3 text-white bg-orange-500 hover:bg-orange-600 disabled:bg-stone-700 disabled:text-stone-500 rounded-xl transition font-medium"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skills Modal - Editable */}
      <AnimatePresence>
        {showSkillsModal && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { cancelProfileEdits(); setShowSkillsModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Code className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Skills</h2>
                    <p className="text-sm text-stone-400">
                      {(workingProfile?.skills?.length || 0)} categories • {workingProfile?.skills?.reduce((acc, s) => acc + (s.keywords?.length || 0), 0) || 0} total skills
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { cancelProfileEdits(); setShowSkillsModal(false); }}
                  className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Add New Skill Category */}
                <button
                  onClick={() => {
                    const newSkill: Skill = { name: '', level: 'intermediate', keywords: [] };
                    updateProfileSection('skills', [newSkill, ...(workingProfile?.skills || [])]);
                    setEditingSkillIndex(0);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-emerald-500/50 text-stone-400 hover:text-emerald-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add New Skill Category
                </button>
                
                {workingProfile?.skills?.map((skill, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                    {editingSkillIndex === idx ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <input type="text" value={skill.name} onChange={(e) => { const updated = [...(workingProfile.skills || [])]; updated[idx] = { ...updated[idx], name: e.target.value }; updateProfileSection('skills', updated); }} placeholder="Category Name (e.g., Frontend)" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-emerald-500 focus:outline-none" />
                            <select value={skill.level} onChange={(e) => { const updated = [...(workingProfile.skills || [])]; updated[idx] = { ...updated[idx], level: e.target.value as 'beginner' | 'intermediate' | 'expert' }; updateProfileSection('skills', updated); }} className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white focus:border-emerald-500 focus:outline-none">
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="expert">Expert</option>
                            </select>
                          </div>
                          <div className="ml-3 flex flex-col gap-2">
                            <button onClick={() => setEditingSkillIndex(-1)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Done editing"><CheckCircle className="h-4 w-4" /></button>
                            <button onClick={() => { const updated = workingProfile.skills?.filter((_, i) => i !== idx) || []; updateProfileSection('skills', updated); setEditingSkillIndex(-1); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-stone-500">Skills/Keywords (comma-separated)</p>
                          <input type="text" value={(skill.keywords || []).join(', ')} onChange={(e) => { const updated = [...(workingProfile.skills || [])]; updated[idx] = { ...updated[idx], keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) }; updateProfileSection('skills', updated); }} placeholder="React, TypeScript, Node.js..." className="w-full bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-emerald-500 focus:outline-none text-sm" />
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`font-medium ${
                              skill.level === 'expert' ? 'text-orange-400' : 
                              skill.level === 'intermediate' ? 'text-amber-400' : 
                              'text-stone-400'
                            }`}>{skill.name || 'Skill Category'}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                              skill.level === 'expert' ? 'bg-orange-500/20 text-orange-400' : 
                              skill.level === 'intermediate' ? 'bg-amber-500/20 text-amber-400' : 
                              'bg-stone-700 text-stone-400'
                            }`}>{skill.level}</span>
                          </div>
                          {skill.keywords && skill.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {skill.keywords.slice(0, 6).map((keyword, kidx) => (
                                <span key={kidx} className="px-2 py-0.5 text-xs rounded bg-stone-700/50 text-stone-300">{keyword}</span>
                              ))}
                              {skill.keywords.length > 6 && <span className="text-xs text-stone-500">+{skill.keywords.length - 6} more</span>}
                            </div>
                          )}
                        </div>
                        <button onClick={() => setEditingSkillIndex(idx)} className="p-2 text-stone-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {(!workingProfile?.skills || workingProfile.skills.length === 0) && (
                  <p className="text-stone-500 text-center py-4">No skills added yet. Click the button above to add your first skill category.</p>
                )}
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-white/10 bg-stone-950/50 flex gap-3">
                <button
                  onClick={() => { cancelProfileEdits(); setShowSkillsModal(false); }}
                  className="flex-1 py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium"
                >
                  {editedProfile ? 'Cancel' : 'Close'}
                </button>
                {editedProfile && (
                  <button 
                    onClick={async () => { const success = await saveProfileChanges(); if (success) setShowSkillsModal(false); }}
                    disabled={isSavingProfile}
                    className="flex-1 py-3 text-white bg-emerald-500 hover:bg-emerald-600 disabled:bg-stone-700 disabled:text-stone-500 rounded-xl transition font-medium"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Experience Modal */}
      <AnimatePresence>
        {showExperienceModal && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { cancelProfileEdits(); setShowExperienceModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Experience</h2>
                    <p className="text-sm text-stone-400">{(workingProfile?.experience?.length || 0)} positions</p>
                  </div>
                </div>
                <button onClick={() => { cancelProfileEdits(); setShowExperienceModal(false); }} className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Add New Experience Button */}
                <button
                  onClick={() => {
                    const newExp: Experience = { title: '', company: '', location: '', start: '', end: '', employment_type: 'Full-time', bullets: [] };
                    updateProfileSection('experience', [newExp, ...(workingProfile?.experience || [])]);
                    setEditingExpIndex(0);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-orange-500/50 text-stone-400 hover:text-orange-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add New Experience
                </button>
                
                {workingProfile?.experience?.map((exp, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                    {editingExpIndex === idx ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <input type="text" value={exp.title} onChange={(e) => { const updated = [...(workingProfile.experience || [])]; updated[idx] = { ...updated[idx], title: e.target.value }; updateProfileSection('experience', updated); }} placeholder="Job Title" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none" />
                            <input type="text" value={exp.company} onChange={(e) => { const updated = [...(workingProfile.experience || [])]; updated[idx] = { ...updated[idx], company: e.target.value }; updateProfileSection('experience', updated); }} placeholder="Company" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none" />
                            <input type="text" value={exp.location || ''} onChange={(e) => { const updated = [...(workingProfile.experience || [])]; updated[idx] = { ...updated[idx], location: e.target.value }; updateProfileSection('experience', updated); }} placeholder="Location" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none" />
                            <select value={exp.employment_type || 'Full-time'} onChange={(e) => { const updated = [...(workingProfile.experience || [])]; updated[idx] = { ...updated[idx], employment_type: e.target.value }; updateProfileSection('experience', updated); }} className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white focus:border-orange-500 focus:outline-none">
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time</option>
                              <option value="Contract">Contract</option>
                              <option value="Freelance">Freelance</option>
                              <option value="Internship">Internship</option>
                            </select>
                            <input type="text" value={exp.start} onChange={(e) => { const updated = [...(workingProfile.experience || [])]; updated[idx] = { ...updated[idx], start: e.target.value }; updateProfileSection('experience', updated); }} placeholder="Start (e.g., 2022-01)" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none" />
                            <input type="text" value={exp.end || ''} onChange={(e) => { const updated = [...(workingProfile.experience || [])]; updated[idx] = { ...updated[idx], end: e.target.value }; updateProfileSection('experience', updated); }} placeholder="End (or 'Present')" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none" />
                          </div>
                          <div className="ml-3 flex flex-col gap-2">
                            <button onClick={() => setEditingExpIndex(-1)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Done editing"><CheckCircle className="h-4 w-4" /></button>
                            <button onClick={() => { const updated = workingProfile.experience?.filter((_, i) => i !== idx) || []; updateProfileSection('experience', updated); setEditingExpIndex(-1); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs text-stone-500">Bullet points (one per line)</p>
                          <textarea value={(exp.bullets || []).join('\n')} onChange={(e) => { const updated = [...(workingProfile.experience || [])]; updated[idx] = { ...updated[idx], bullets: e.target.value.split('\n').filter(b => b.trim()) }; updateProfileSection('experience', updated); }} placeholder="• Achieved X by doing Y...\n• Led team of Z..." rows={3} className="w-full bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-orange-500 focus:outline-none text-sm resize-none" />
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{exp.title || 'Untitled Position'}</h3>
                            {exp.employment_type && <span className="text-xs px-2 py-0.5 rounded bg-stone-700 text-stone-400">{exp.employment_type}</span>}
                          </div>
                          <p className="text-orange-400 text-sm">{exp.company || 'Company'}</p>
                          <p className="text-stone-500 text-xs mt-1">{exp.location && `${exp.location} • `}{exp.start}{exp.end ? ` - ${exp.end}` : ' - Present'}</p>
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {exp.bullets.slice(0, 2).map((bullet, bidx) => (
                                <li key={bidx} className="text-stone-400 text-sm flex items-start gap-2">
                                  <span className="text-orange-400 mt-1">•</span>
                                  <span className="line-clamp-1">{bullet}</span>
                                </li>
                              ))}
                              {exp.bullets.length > 2 && <li className="text-stone-500 text-xs">+{exp.bullets.length - 2} more</li>}
                            </ul>
                          )}
                        </div>
                        <button onClick={() => setEditingExpIndex(idx)} className="p-2 text-stone-400 hover:text-orange-400 hover:bg-orange-500/10 rounded-lg transition" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {(!workingProfile?.experience || workingProfile.experience.length === 0) && (
                  <p className="text-stone-500 text-center py-4">No experience added yet. Click the button above to add your first position.</p>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-stone-950/50 flex gap-3">
                <button onClick={() => { cancelProfileEdits(); setShowExperienceModal(false); }} className="flex-1 py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium">{editedProfile ? 'Cancel' : 'Close'}</button>
                {editedProfile && (
                  <button 
                    onClick={async () => { const success = await saveProfileChanges(); if (success) setShowExperienceModal(false); }}
                    disabled={isSavingProfile}
                    className="flex-1 py-3 text-white bg-orange-500 hover:bg-orange-600 disabled:bg-stone-700 disabled:text-stone-500 rounded-xl transition font-medium"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Education Modal */}
      <AnimatePresence>
        {showEducationModal && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { cancelProfileEdits(); setShowEducationModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Education</h2>
                    <p className="text-sm text-stone-400">{(workingProfile?.education?.length || 0)} entries</p>
                  </div>
                </div>
                <button onClick={() => { cancelProfileEdits(); setShowEducationModal(false); }} className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <button
                  onClick={() => {
                    const newEdu: Education = { school: '', degree: '', start: '', end: '', gpa: null };
                    updateProfileSection('education', [newEdu, ...(workingProfile?.education || [])]);
                    setEditingEduIndex(0);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-amber-500/50 text-stone-400 hover:text-amber-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add New Education
                </button>
                
                {workingProfile?.education?.map((edu, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                    {editingEduIndex === idx ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <input type="text" value={edu.degree} onChange={(e) => { const updated = [...(workingProfile.education || [])]; updated[idx] = { ...updated[idx], degree: e.target.value }; updateProfileSection('education', updated); }} placeholder="Degree" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none" />
                            <input type="text" value={edu.school} onChange={(e) => { const updated = [...(workingProfile.education || [])]; updated[idx] = { ...updated[idx], school: e.target.value }; updateProfileSection('education', updated); }} placeholder="School" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none" />
                            <input type="text" value={edu.start} onChange={(e) => { const updated = [...(workingProfile.education || [])]; updated[idx] = { ...updated[idx], start: e.target.value }; updateProfileSection('education', updated); }} placeholder="Start Year" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none" />
                            <input type="text" value={edu.end} onChange={(e) => { const updated = [...(workingProfile.education || [])]; updated[idx] = { ...updated[idx], end: e.target.value }; updateProfileSection('education', updated); }} placeholder="End Year" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none" />
                            <input type="text" value={edu.gpa || ''} onChange={(e) => { const updated = [...(workingProfile.education || [])]; updated[idx] = { ...updated[idx], gpa: e.target.value || null }; updateProfileSection('education', updated); }} placeholder="GPA (optional)" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-amber-500 focus:outline-none col-span-2" />
                          </div>
                          <div className="ml-3 flex flex-col gap-2">
                            <button onClick={() => setEditingEduIndex(-1)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Done editing"><CheckCircle className="h-4 w-4" /></button>
                            <button onClick={() => { const updated = workingProfile.education?.filter((_, i) => i !== idx) || []; updateProfileSection('education', updated); setEditingEduIndex(-1); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{edu.degree || 'Degree'}</h3>
                          <p className="text-amber-400 text-sm">{edu.school || 'School'}</p>
                          <p className="text-stone-500 text-xs mt-1">{edu.start}{edu.end ? ` - ${edu.end}` : ''}{edu.gpa ? ` • GPA: ${edu.gpa}` : ''}</p>
                        </div>
                        <button onClick={() => setEditingEduIndex(idx)} className="p-2 text-stone-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {(!workingProfile?.education || workingProfile.education.length === 0) && (
                  <p className="text-stone-500 text-center py-4">No education added yet.</p>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-stone-950/50 flex gap-3">
                <button onClick={() => { cancelProfileEdits(); setShowEducationModal(false); }} className="flex-1 py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium">{editedProfile ? 'Cancel' : 'Close'}</button>
                {editedProfile && (
                  <button 
                    onClick={async () => { const success = await saveProfileChanges(); if (success) setShowEducationModal(false); }}
                    disabled={isSavingProfile}
                    className="flex-1 py-3 text-white bg-amber-500 hover:bg-amber-600 disabled:bg-stone-700 disabled:text-stone-500 rounded-xl transition font-medium"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
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
            onClick={() => { cancelProfileEdits(); setShowProjectsModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Projects</h2>
                    <p className="text-sm text-stone-400">{(workingProfile?.projects?.length || 0)} projects</p>
                  </div>
                </div>
                <button onClick={() => { cancelProfileEdits(); setShowProjectsModal(false); }} className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <button
                  onClick={() => {
                    const newProj: Project = { name: '', url: '', stack: [], bullets: [] };
                    updateProfileSection('projects', [newProj, ...(workingProfile?.projects || [])]);
                    setEditingProjIndex(0);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-blue-500/50 text-stone-400 hover:text-blue-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add New Project
                </button>
                
                {workingProfile?.projects?.map((project, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                    {editingProjIndex === idx ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <input type="text" value={project.name} onChange={(e) => { const updated = [...(workingProfile.projects || [])]; updated[idx] = { ...updated[idx], name: e.target.value }; updateProfileSection('projects', updated); }} placeholder="Project Name" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-blue-500 focus:outline-none" />
                            <input type="text" value={project.url} onChange={(e) => { const updated = [...(workingProfile.projects || [])]; updated[idx] = { ...updated[idx], url: e.target.value }; updateProfileSection('projects', updated); }} placeholder="Project URL" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-blue-500 focus:outline-none" />
                            <input type="text" value={(project.stack || []).join(', ')} onChange={(e) => { const updated = [...(workingProfile.projects || [])]; updated[idx] = { ...updated[idx], stack: e.target.value.split(',').map(s => s.trim()).filter(s => s) }; updateProfileSection('projects', updated); }} placeholder="Tech Stack (comma-separated)" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-blue-500 focus:outline-none col-span-2" />
                          </div>
                          <div className="ml-3 flex flex-col gap-2">
                            <button onClick={() => setEditingProjIndex(-1)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Done editing"><CheckCircle className="h-4 w-4" /></button>
                            <button onClick={() => { const updated = workingProfile.projects?.filter((_, i) => i !== idx) || []; updateProfileSection('projects', updated); setEditingProjIndex(-1); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                        <textarea value={(project.bullets || []).join('\n')} onChange={(e) => { const updated = [...(workingProfile.projects || [])]; updated[idx] = { ...updated[idx], bullets: e.target.value.split('\n').filter(b => b.trim()) }; updateProfileSection('projects', updated); }} placeholder="Description bullets (one per line)" rows={2} className="w-full bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-blue-500 focus:outline-none text-sm resize-none" />
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{project.name || 'Untitled Project'}</h3>
                            {project.url && <a href={project.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-blue-400 hover:text-blue-300"><ExternalLink className="h-3 w-3" /></a>}
                          </div>
                          {project.stack && project.stack.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {project.stack.slice(0, 5).map((tech, tidx) => (
                                <span key={tidx} className="px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-300">{tech}</span>
                              ))}
                              {project.stack.length > 5 && <span className="text-xs text-stone-500">+{project.stack.length - 5}</span>}
                            </div>
                          )}
                          {project.bullets && project.bullets.length > 0 && (
                            <p className="text-stone-400 text-sm mt-2 line-clamp-2">{project.bullets[0]}</p>
                          )}
                        </div>
                        <button onClick={() => setEditingProjIndex(idx)} className="p-2 text-stone-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {(!workingProfile?.projects || workingProfile.projects.length === 0) && (
                  <p className="text-stone-500 text-center py-4">No projects added yet.</p>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-stone-950/50 flex gap-3">
                <button onClick={() => { cancelProfileEdits(); setShowProjectsModal(false); }} className="flex-1 py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium">{editedProfile ? 'Cancel' : 'Close'}</button>
                {editedProfile && (
                  <button 
                    onClick={async () => { const success = await saveProfileChanges(); if (success) setShowProjectsModal(false); }}
                    disabled={isSavingProfile}
                    className="flex-1 py-3 text-white bg-blue-500 hover:bg-blue-600 disabled:bg-stone-700 disabled:text-stone-500 rounded-xl transition font-medium"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Certifications Modal */}
      <AnimatePresence>
        {showCertsModal && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { cancelProfileEdits(); setShowCertsModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Award className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Certifications</h2>
                    <p className="text-sm text-stone-400">{(workingProfile?.certifications?.length || 0)} certifications</p>
                  </div>
                </div>
                <button onClick={() => { cancelProfileEdits(); setShowCertsModal(false); }} className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <button
                  onClick={() => {
                    const newCert: Certification = { name: '', issuer: '', date: '' };
                    updateProfileSection('certifications', [newCert, ...(workingProfile?.certifications || [])]);
                    setEditingCertIndex(0);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-purple-500/50 text-stone-400 hover:text-purple-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add New Certification
                </button>
                
                {workingProfile?.certifications?.map((cert, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                    {editingCertIndex === idx ? (
                      /* Edit Mode */
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-3 gap-3">
                          <input type="text" value={cert.name} onChange={(e) => { const updated = [...(workingProfile.certifications || [])]; updated[idx] = { ...updated[idx], name: e.target.value }; updateProfileSection('certifications', updated); }} placeholder="Certification Name" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-purple-500 focus:outline-none" />
                          <input type="text" value={cert.issuer} onChange={(e) => { const updated = [...(workingProfile.certifications || [])]; updated[idx] = { ...updated[idx], issuer: e.target.value }; updateProfileSection('certifications', updated); }} placeholder="Issuing Organization" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-purple-500 focus:outline-none" />
                          <input type="text" value={cert.date} onChange={(e) => { const updated = [...(workingProfile.certifications || [])]; updated[idx] = { ...updated[idx], date: e.target.value }; updateProfileSection('certifications', updated); }} placeholder="Date (e.g., 2023)" className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-purple-500 focus:outline-none" />
                        </div>
                        <div className="ml-3 flex flex-col gap-2">
                          <button onClick={() => setEditingCertIndex(-1)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Done editing"><CheckCircle className="h-4 w-4" /></button>
                          <button onClick={() => { const updated = workingProfile.certifications?.filter((_, i) => i !== idx) || []; updateProfileSection('certifications', updated); setEditingCertIndex(-1); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white">{cert.name || 'Certification'}</h3>
                          <p className="text-purple-400 text-sm">{cert.issuer || 'Issuer'}</p>
                          {cert.date && <p className="text-stone-500 text-xs mt-1">{cert.date}</p>}
                        </div>
                        <button onClick={() => setEditingCertIndex(idx)} className="p-2 text-stone-400 hover:text-purple-400 hover:bg-purple-500/10 rounded-lg transition" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {(!workingProfile?.certifications || workingProfile.certifications.length === 0) && (
                  <p className="text-stone-500 text-center py-4">No certifications added yet.</p>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-stone-950/50 flex gap-3">
                <button onClick={() => { cancelProfileEdits(); setShowCertsModal(false); }} className="flex-1 py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium">{editedProfile ? 'Cancel' : 'Close'}</button>
                {editedProfile && (
                  <button 
                    onClick={async () => { const success = await saveProfileChanges(); if (success) setShowCertsModal(false); }}
                    disabled={isSavingProfile}
                    className="flex-1 py-3 text-white bg-purple-500 hover:bg-purple-600 disabled:bg-stone-700 disabled:text-stone-500 rounded-xl transition font-medium"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Languages Modal */}
      <AnimatePresence>
        {showLanguagesModal && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { cancelProfileEdits(); setShowLanguagesModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Languages className="h-5 w-5 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Languages</h2>
                    <p className="text-sm text-stone-400">{(workingProfile?.languages?.length || 0)} languages</p>
                  </div>
                </div>
                <button onClick={() => { cancelProfileEdits(); setShowLanguagesModal(false); }} className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <button
                  onClick={() => {
                    const newLang: Language = { name: '', level: 'Intermediate' };
                    updateProfileSection('languages', [newLang, ...(workingProfile?.languages || [])]);
                    setEditingLangIndex(0);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-green-500/50 text-stone-400 hover:text-green-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add New Language
                </button>
                
                {workingProfile?.languages?.map((lang, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                    {editingLangIndex === idx ? (
                      /* Edit Mode */
                      <div className="flex items-center gap-3">
                        <input type="text" value={lang.name} onChange={(e) => { const updated = [...(workingProfile.languages || [])]; updated[idx] = { ...updated[idx], name: e.target.value }; updateProfileSection('languages', updated); }} placeholder="Language" className="flex-1 bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-green-500 focus:outline-none" />
                        <select value={lang.level} onChange={(e) => { const updated = [...(workingProfile.languages || [])]; updated[idx] = { ...updated[idx], level: e.target.value }; updateProfileSection('languages', updated); }} className="bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white focus:border-green-500 focus:outline-none">
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Advanced">Advanced</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Basic">Basic</option>
                        </select>
                        <button onClick={() => setEditingLangIndex(-1)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Done"><CheckCircle className="h-4 w-4" /></button>
                        <button onClick={() => { const updated = workingProfile.languages?.filter((_, i) => i !== idx) || []; updateProfileSection('languages', updated); setEditingLangIndex(-1); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-white">{lang.name || 'Language'}</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">{lang.level}</span>
                        </div>
                        <button onClick={() => setEditingLangIndex(idx)} className="p-2 text-stone-400 hover:text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {(!workingProfile?.languages || workingProfile.languages.length === 0) && (
                  <p className="text-stone-500 text-center py-4">No languages added yet.</p>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-stone-950/50 flex gap-3">
                <button onClick={() => { cancelProfileEdits(); setShowLanguagesModal(false); }} className="flex-1 py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium">{editedProfile ? 'Cancel' : 'Close'}</button>
                {editedProfile && (
                  <button 
                    onClick={async () => { const success = await saveProfileChanges(); if (success) setShowLanguagesModal(false); }}
                    disabled={isSavingProfile}
                    className="flex-1 py-3 text-white bg-green-500 hover:bg-green-600 disabled:bg-stone-700 disabled:text-stone-500 rounded-xl transition font-medium"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Links Modal */}
      <AnimatePresence>
        {showLinksModal && profile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => { cancelProfileEdits(); setShowLinksModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] bg-stone-900 border border-white/10 rounded-2xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Links</h2>
                    <p className="text-sm text-stone-400">{(workingProfile?.basics?.links?.filter(l => l && l.trim()).length || 0)} links</p>
                  </div>
                </div>
                <button onClick={() => { cancelProfileEdits(); setShowLinksModal(false); }} className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-lg transition">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                <button
                  onClick={() => {
                    const currentLinks = workingProfile?.basics?.links || [];
                    const updatedBasics = { ...workingProfile?.basics, links: ['', ...currentLinks] };
                    updateProfileSection('basics', updatedBasics as any);
                    setEditingLinkIndex(0);
                  }}
                  className="w-full p-4 rounded-xl border-2 border-dashed border-stone-700 hover:border-cyan-500/50 text-stone-400 hover:text-cyan-400 transition flex items-center justify-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  Add New Link
                </button>
                
                {workingProfile?.basics?.links?.map((link, idx) => {
                  const platform = link ? getPlatformInfo(link) : { icon: Globe, name: 'Website', color: 'text-cyan-400' };
                  const PlatformIcon = platform.icon;
                  return (
                    <div key={idx} className="p-4 rounded-xl bg-stone-800/50 border border-stone-700/50">
                      {editingLinkIndex === idx ? (
                        /* Edit Mode */
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-stone-700/50 flex items-center justify-center">
                            <PlatformIcon className={`h-5 w-5 ${platform.color}`} />
                          </div>
                          <input type="url" value={link} onChange={(e) => { const updated = [...(workingProfile.basics?.links || [])]; updated[idx] = e.target.value; const updatedBasics = { ...workingProfile.basics, links: updated }; updateProfileSection('basics', updatedBasics as any); }} placeholder="https://github.com/username" className="flex-1 bg-stone-700/50 border border-stone-600 rounded-lg px-3 py-2 text-white placeholder:text-stone-500 focus:border-cyan-500 focus:outline-none" />
                          <button onClick={() => setEditingLinkIndex(-1)} className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition" title="Done"><CheckCircle className="h-4 w-4" /></button>
                          <button onClick={() => { const updated = workingProfile.basics?.links?.filter((_, i) => i !== idx) || []; const updatedBasics = { ...workingProfile.basics, links: updated }; updateProfileSection('basics', updatedBasics as any); setEditingLinkIndex(-1); }} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition" title="Delete"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      ) : (
                        /* View Mode */
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-stone-700/50 flex items-center justify-center">
                              <PlatformIcon className={`h-5 w-5 ${platform.color}`} />
                            </div>
                            <div>
                              <span className="font-medium text-white">{platform.name}</span>
                              {link && <p className="text-stone-500 text-xs truncate max-w-[200px]">{link}</p>}
                            </div>
                          </div>
                          <button onClick={() => setEditingLinkIndex(idx)} className="p-2 text-stone-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition" title="Edit">
                            <Pencil className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!workingProfile?.basics?.links || workingProfile.basics.links.length === 0) && (
                  <p className="text-stone-500 text-center py-4">No links added yet.</p>
                )}
              </div>
              <div className="p-4 border-t border-white/10 bg-stone-950/50 flex gap-3">
                <button onClick={() => { cancelProfileEdits(); setShowLinksModal(false); }} className="flex-1 py-3 text-white bg-stone-800 hover:bg-stone-700 rounded-xl transition font-medium">{editedProfile ? 'Cancel' : 'Close'}</button>
                {editedProfile && (
                  <button 
                    onClick={async () => { const success = await saveProfileChanges(); if (success) setShowLinksModal(false); }}
                    disabled={isSavingProfile}
                    className="flex-1 py-3 text-white bg-cyan-500 hover:bg-cyan-600 disabled:bg-stone-700 disabled:text-stone-500 rounded-xl transition font-medium"
                  >
                    {isSavingProfile ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        trigger={upgradeTrigger}
        remaining={subscriptionStatus?.generations_remaining ?? 0}
      />
    </div>
  );
}
