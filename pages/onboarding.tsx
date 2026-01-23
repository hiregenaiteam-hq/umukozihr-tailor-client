import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { profile as profileApi, upload as uploadApi } from '@/lib/api';
import { ProfileV3, createEmptyProfile } from '@/lib/types';
import OnboardingStepper from '@/components/onboarding/OnboardingStepper';
import BasicsSection from '@/components/onboarding/BasicsSection';
import ExperienceSection from '@/components/onboarding/ExperienceSection';
import EducationSection from '@/components/onboarding/EducationSection';
import { ProjectsSection, SkillsSection, LinksExtrasSection } from '@/components/onboarding/ProjectsSkillsSection';
import ReviewSection from '@/components/onboarding/ReviewSection';
import { HeaderLogo } from '@/components/Logo';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, Save, Upload, FileText, PenLine, AlertCircle, Home, ArrowLeft, Cloud, CloudOff, RefreshCw, Wifi, WifiOff, Link, Info, Linkedin, Zap, ArrowRight, Check } from 'lucide-react';

const STEPS = ['Basics', 'Experience', 'Education', 'Projects', 'Skills', 'Extras', 'Review'];
const ONBOARDING_STORAGE_KEY = 'onboarding_draft';
const ONBOARDING_STEP_KEY = 'onboarding_step';
const SYNC_DEBOUNCE_MS = 2000; // 2 seconds after last change

// Sync status types
type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

// Step descriptions for display
const STEP_DESCRIPTIONS: { [key: string]: string } = {
  'Basics': 'Basic info',
  'Experience': 'Work history',
  'Education': 'Academic background',
  'Projects': 'Your portfolio',
  'Skills': 'Your expertise',
  'Extras': 'Additional info',
  'Review': 'Final check'
};

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

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

function FloatingOrb({ className, delay = 0, color = "orange" }: { className?: string; delay?: number; color?: string }) {
  const colorClass = color === "amber" ? "bg-amber-500/20" : color === "gold" ? "bg-yellow-500/15" : "bg-orange-500/20";
  return (
    <motion.div 
      className={`absolute rounded-full blur-3xl pointer-events-none ${colorClass} ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        y: [0, -20, 0],
      }}
      transition={{ 
        duration: 6,
        delay,
        y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
      }}
    />
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [profile, setProfile] = useState<ProfileV3>(createEmptyProfile());
  const [completeness, setCompleteness] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChoice, setShowChoice] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadWarnings, setUploadWarnings] = useState<string[]>([]);
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [isExtractingLinkedIn, setIsExtractingLinkedIn] = useState(false);
  const [showUploadTooltip, setShowUploadTooltip] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Background sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingProfileRef = useRef<ProfileV3 | null>(null);
  const maxRetries = 3;

  // Debounced background sync function
  const triggerBackgroundSync = useCallback((profileData: ProfileV3) => {
    // Clear any existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    
    // Store the pending profile
    pendingProfileRef.current = profileData;
    setSyncStatus('syncing');
    
    // Schedule sync after debounce period
    syncTimeoutRef.current = setTimeout(async () => {
      await performSync(profileData);
    }, SYNC_DEBOUNCE_MS);
  }, []);

  // Actual sync to server
  const performSync = async (profileData: ProfileV3, isRetry = false) => {
    if (!isRetry) {
      setSyncStatus('syncing');
    }
    
    try {
      const response = await profileApi.update(profileData);
      setCompleteness(response.data.completeness || 0);
      setSyncStatus('synced');
      setLastSyncError(null);
      setRetryCount(0);
      pendingProfileRef.current = null;
      
      // Clear synced status after 3 seconds
      setTimeout(() => {
        setSyncStatus(prev => prev === 'synced' ? 'idle' : prev);
      }, 3000);
      
      return true;
    } catch (error: any) {
      console.error('Background sync error:', error);
      
      // Check if offline
      if (!navigator.onLine) {
        setSyncStatus('offline');
        setLastSyncError('No internet connection');
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setSyncStatus('error');
        setLastSyncError('Connection timeout - slow network');
      } else {
        setSyncStatus('error');
        setLastSyncError(error.response?.data?.detail || 'Sync failed');
      }
      
      // Auto-retry logic (up to maxRetries)
      if (retryCount < maxRetries && pendingProfileRef.current) {
        setRetryCount(prev => prev + 1);
        setTimeout(() => {
          if (pendingProfileRef.current) {
            performSync(pendingProfileRef.current, true);
          }
        }, 3000 * (retryCount + 1)); // Exponential backoff: 3s, 6s, 9s
      }
      
      return false;
    }
  };

  // Manual retry function
  const retrySync = async () => {
    if (pendingProfileRef.current || profile) {
      setRetryCount(0);
      await performSync(pendingProfileRef.current || profile);
    }
  };

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      if (syncStatus === 'offline' && pendingProfileRef.current) {
        toast.success('Back online! Syncing...');
        performSync(pendingProfileRef.current);
      }
    };
    
    const handleOffline = () => {
      setSyncStatus('offline');
      setLastSyncError('No internet connection');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus]);

  useEffect(() => {
    setMounted(true);
    
    // Check authentication - require token
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      router.push('/');
      return;
    }

    const isEditMode = router.query.edit === 'true';
    const savedDraft = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);
    let hasLocalDraft = false;
    let restoredStep = 1;

    // Restore draft data if exists
    if (savedDraft) {
      try {
        const parsedProfile = JSON.parse(savedDraft);
        if (parsedProfile.basics || parsedProfile.experience?.length > 0) {
          // Sanitize skills to ensure valid levels before setting state
          if (parsedProfile.skills) {
            parsedProfile.skills = parsedProfile.skills.map((skill: any) => ({
              ...skill,
              name: skill.name || '',
              level: ['beginner', 'intermediate', 'expert'].includes(skill.level?.toLowerCase()?.trim()) 
                ? skill.level.toLowerCase().trim() 
                : 'intermediate',
              keywords: skill.keywords || [],
            }));
          }
          setProfile(parsedProfile);
          hasLocalDraft = true;
        }
      } catch (error) {
        console.error('Failed to parse saved draft:', error);
      }
    }

    // Restore step position
    if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (step >= 1 && step <= STEPS.length) {
        restoredStep = step;
        setCurrentStep(step);
      }
    }

    // Decision: show choice screen or skip to form?
    // Skip choice ONLY if: step > 1 (user already started filling)
    if (restoredStep > 1) {
      setShowChoice(false);
      toast.success('Restored your progress from last session');
    }
    // If step === 1 with draft, still show choice (user can pick "Fill Manually" to see their data)

    loadExistingProfile(hasLocalDraft, isEditMode);
  }, [router.query.edit]);

  const loadExistingProfile = async (hasLocalDraft: boolean = false, isEditMode: boolean = false) => {
    try {
      const response = await profileApi.get();
      if (response.data?.profile) {
        const serverProfile = response.data.profile;
        
        // Sanitize skills from server profile
        if (serverProfile.skills) {
          serverProfile.skills = serverProfile.skills.map((skill: any) => ({
            ...skill,
            name: skill.name || '',
            level: ['beginner', 'intermediate', 'expert'].includes(skill.level?.toLowerCase()?.trim()) 
              ? skill.level.toLowerCase().trim() 
              : 'intermediate',
            keywords: skill.keywords || [],
          }));
        }
        
        // If we have a server profile and no local draft, use server version
        if (!hasLocalDraft) {
          setProfile(serverProfile);
          setCompleteness(response.data.completeness || 0);
          // If profile has data, skip choice screen
          if (serverProfile.basics?.full_name) {
            setShowChoice(false);
          }
        }
        // If server profile is complete and NOT in edit mode, redirect to app
        if (response.data.completeness > 80 && !isEditMode) {
          router.push('/app');
          return;
        }
        // If in edit mode, skip choice screen
        if (isEditMode) {
          setShowChoice(false);
        }
      }
    } catch (error: any) {
      // 404 means no profile yet - that's fine for onboarding
      if (error.response?.status !== 404) {
        console.error('Error loading profile:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-save draft to localStorage AND trigger background sync
  useEffect(() => {
    if (mounted && profile.basics?.full_name) {
      // Always save locally immediately (instant)
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(ONBOARDING_STEP_KEY, currentStep.toString());
      
      // Trigger background sync (debounced)
      triggerBackgroundSync(profile);
    }
  }, [profile, currentStep, mounted, triggerBackgroundSync]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const updateProfile = (section: keyof ProfileV3, data: any) => {
    setProfile(prev => ({ ...prev, [section]: data }));
    // Background sync will be triggered by the useEffect
  };

  // INSTANT navigation - no blocking on server sync
  const saveAndContinue = () => {
    // Mark step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps([...completedSteps, currentStep]);
    }
    // Navigate immediately - sync happens in background
    nextStep();
  };

  // Final step - ensure sync is complete before redirecting
  const completeOnboarding = async () => {
    setIsSaving(true);
    
    // If there's pending sync, wait for it
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = null;
    }
    
    try {
      // Force a final sync to ensure everything is saved
      const response = await profileApi.update(profile);
      setCompleteness(response.data.completeness || 0);
      
      // Clear local storage
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      localStorage.removeItem(ONBOARDING_STEP_KEY);
      
      toast.success('Profile complete! Redirecting...');
      router.push('/app');
    } catch (error: any) {
      console.error('Error completing onboarding:', error);
      
      // Check if offline or network error
      if (!navigator.onLine) {
        toast.error('No internet connection. Please connect and try again.', {
          duration: 5000,
          icon: '📡'
        });
      } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        toast.error('Connection timeout. Please check your network and try again.', {
          duration: 5000,
          icon: '⏱️'
        });
      } else {
        toast.error('Failed to save profile. Please try again.', {
          duration: 5000
        });
      }
      
      // Keep data in localStorage for safety
    } finally {
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Go back to choice screen from step 1 (keeps data)
  const goToChoice = () => {
    setShowChoice(true);
  };

  // Handle resume file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 10MB.');
      return;
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const extension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    
    if (!validTypes.includes(file.type) && !validExtensions.includes(extension)) {
      toast.error('Invalid file type. Please upload PDF, DOCX, or TXT.');
      return;
    }

    setIsUploading(true);
    setUploadWarnings([]);
    
    try {
      toast.loading('Extracting profile data...', { id: 'upload' });
      const response = await uploadApi.resume(file);
      
      if (response.data.success && response.data.profile) {
        // Map extracted data to ProfileV3 structure
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
        
        setProfile(prev => ({
          ...prev,
          basics: {
            full_name: extracted.basics?.full_name || '',
            headline: extracted.basics?.headline || '',
            summary: extracted.basics?.summary || '',
            location: extracted.basics?.location || '',
            email: extracted.basics?.email || '',
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
        }));
        
        // Show confidence info
        const confidence = Math.round((response.data.extraction_confidence || 0) * 100);
        if (response.data.warnings?.length > 0) {
          setUploadWarnings(response.data.warnings);
        }
        
        toast.success(`Profile extracted! (${confidence}% confidence)`, { id: 'upload' });
        setShowChoice(false); // Move to form review
      } else {
        toast.error(response.data.message || 'Failed to extract profile', { id: 'upload' });
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload resume', { id: 'upload' });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle LinkedIn URL extraction
  const handleLinkedInExtract = async () => {
    if (!linkedInUrl.trim()) {
      toast.error('Please enter your LinkedIn URL');
      return;
    }

    // Basic LinkedIn URL validation
    if (!linkedInUrl.includes('linkedin.com/in/') && !linkedInUrl.match(/^[a-zA-Z0-9\-]+$/)) {
      toast.error('Please enter a valid LinkedIn profile URL');
      return;
    }

    setIsExtractingLinkedIn(true);
    
    try {
      toast.loading('Extracting your LinkedIn profile...', { id: 'linkedin' });
      const response = await uploadApi.linkedin(linkedInUrl);
      
      if (response.data.success && response.data.profile) {
        const extracted = response.data.profile;
        
        // Sanitize skills
        const sanitizedSkills = (extracted.skills || []).map((skill: any) => ({
          ...skill,
          name: skill.name || '',
          level: ['beginner', 'intermediate', 'expert'].includes(skill.level?.toLowerCase()?.trim()) 
            ? skill.level.toLowerCase().trim() 
            : 'intermediate',
          keywords: skill.keywords || [],
        }));
        
        setProfile(prev => ({
          ...prev,
          basics: {
            full_name: extracted.basics?.full_name || '',
            headline: extracted.basics?.headline || '',
            summary: extracted.basics?.summary || '',
            location: extracted.basics?.location || '',
            email: extracted.basics?.email || prev.basics.email || '',
            phone: extracted.basics?.phone || prev.basics.phone || '',
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
        }));
        
        // Show warnings about email/phone
        if (response.data.warnings?.length > 0) {
          setUploadWarnings(response.data.warnings);
        }
        
        toast.success('Profile imported from LinkedIn!', { id: 'linkedin' });
        setShowChoice(false);
      } else {
        toast.error(response.data.message || 'Failed to extract profile', { id: 'linkedin' });
      }
    } catch (error: any) {
      console.error('LinkedIn extraction error:', error);
      toast.error(error.response?.data?.detail || 'Failed to fetch LinkedIn profile', { id: 'linkedin' });
    } finally {
      setIsExtractingLinkedIn(false);
    }
  };

  // Render the choice screen
  const renderChoiceScreen = () => (
    <motion.div 
      className="relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main card */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl shadow-2xl">
        {/* Decorative gradient orbs */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
        
        <div className="relative p-8 md:p-12">
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-10">
            <motion.div 
              className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-2xl shadow-orange-500/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <FileText className="w-10 h-10 text-white" />
            </motion.div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Let's Build Your Profile
            </h2>
            <p className="text-stone-400 max-w-md mx-auto text-lg">
              Choose how you'd like to import your professional details
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-6">
            {/* LinkedIn URL Option - Primary */}
            <motion.div 
              variants={itemVariants}
              className="group relative p-6 rounded-2xl border-2 border-[#0A66C2]/40 bg-gradient-to-br from-[#0A66C2]/15 via-[#0A66C2]/10 to-transparent hover:border-[#0A66C2]/60 transition-all duration-300"
            >
              {/* Recommended badge */}
              <div className="absolute -top-3 left-6">
                <span className="px-3 py-1 text-xs font-semibold bg-[#0A66C2] text-white rounded-full shadow-lg shadow-[#0A66C2]/30 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Fastest
                </span>
              </div>
              
              <div className="flex items-start gap-4">
                <motion.div 
                  className="w-14 h-14 shrink-0 rounded-xl bg-[#0A66C2] flex items-center justify-center shadow-lg shadow-[#0A66C2]/30"
                  whileHover={{ scale: 1.1 }}
                >
                  <Linkedin className="w-7 h-7 text-white" />
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-1">Import from LinkedIn</h3>
                  <p className="text-sm text-stone-400 mb-4">
                    Instantly extract your experience, education, skills, and certifications
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={linkedInUrl}
                        onChange={(e) => setLinkedInUrl(e.target.value)}
                        placeholder="linkedin.com/in/yourname"
                        className="w-full px-4 py-3 bg-stone-800/60 border border-stone-700/50 rounded-xl text-white placeholder:text-stone-500 focus:outline-none focus:border-[#0A66C2]/60 focus:ring-2 focus:ring-[#0A66C2]/20 transition-all"
                        disabled={isExtractingLinkedIn}
                      />
                    </div>
                    <motion.button
                      onClick={handleLinkedInExtract}
                      disabled={isExtractingLinkedIn || !linkedInUrl.trim()}
                      className="px-6 py-3 bg-[#0A66C2] hover:bg-[#004182] disabled:bg-stone-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#0A66C2]/20 hover:shadow-xl hover:shadow-[#0A66C2]/30"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isExtractingLinkedIn ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Extracting...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          <span>Extract Profile</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                  <p className="text-xs text-stone-500 mt-3 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    <span>You can review and edit all imported data in the next step</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
              <span className="text-sm text-stone-500 font-medium">or choose another method</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-stone-700 to-transparent" />
            </motion.div>

            {/* Other Options - Grid */}
            <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-4">
              {/* Upload Resume Option */}
              <div className="relative">
                <motion.div
                  onClick={() => !isUploading && fileInputRef.current?.click()}
                  className={`group h-full p-5 rounded-2xl border-2 border-dashed border-stone-700/70 hover:border-orange-500/50 bg-stone-800/30 hover:bg-stone-800/50 cursor-pointer transition-all duration-300 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-orange-500/30 to-amber-500/20 flex items-center justify-center group-hover:from-orange-500/40 group-hover:to-amber-500/30 transition-colors border border-orange-500/20">
                      {isUploading ? (
                        <div className="w-5 h-5 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-orange-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-lg">
                          {isUploading ? 'Extracting...' : 'Upload Resume'}
                        </h3>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowUploadTooltip(!showUploadTooltip);
                          }}
                          className="p-1 text-stone-500 hover:text-orange-400 transition-colors"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm text-stone-400">PDF, DOCX, or TXT • Max 10MB</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        <span>AI-powered extraction</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Tooltip */}
                <AnimatePresence>
                  {showUploadTooltip && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 top-full left-0 right-0 mt-2 p-4 bg-stone-800 border border-stone-700 rounded-xl shadow-xl"
                    >
                      <button
                        onClick={() => setShowUploadTooltip(false)}
                        className="absolute top-2 right-2 p-1.5 text-stone-500 hover:text-white rounded-lg hover:bg-stone-700 transition-colors"
                      >
                        ×
                      </button>
                      <h4 className="font-semibold text-orange-400 mb-3 flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                        Pro Tip: Export from LinkedIn
                      </h4>
                      <ol className="text-sm text-stone-300 space-y-2">
                        {[
                          'Go to your LinkedIn profile',
                          'Click "More" button below your name',
                          'Select "Save to PDF"',
                          'Upload that PDF here!'
                        ].map((step, i) => (
                          <li key={i} className="flex gap-3 items-start">
                            <span className="w-5 h-5 flex-shrink-0 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-medium">{i + 1}</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Manual Option */}
              <motion.div
                onClick={() => setShowChoice(false)}
                className="group h-full p-5 rounded-2xl border-2 border-stone-700/70 hover:border-amber-500/50 bg-stone-800/30 hover:bg-stone-800/50 cursor-pointer transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br from-amber-500/30 to-yellow-500/20 flex items-center justify-center group-hover:from-amber-500/40 group-hover:to-yellow-500/30 transition-colors border border-amber-500/20">
                    <PenLine className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg">Start from Scratch</h3>
                    <p className="text-sm text-stone-400">Enter your details step by step</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        ~5 minutes
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div variants={itemVariants} className="flex justify-center mt-10">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-stone-800/50 border border-stone-700/50">
              <div className="flex -space-x-1">
                {['bg-green-500', 'bg-blue-500', 'bg-purple-500'].map((color, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full ${color} border-2 border-stone-900 flex items-center justify-center`}>
                    <Check className="w-3 h-3 text-white" />
                  </div>
                ))}
              </div>
              <span className="text-sm text-stone-400">Trusted by 10,000+ professionals</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicsSection
            data={profile.basics}
            onChange={(data) => updateProfile('basics', data)}
          />
        );
      case 2:
        return (
          <ExperienceSection
            data={profile.experience}
            onChange={(data) => updateProfile('experience', data)}
          />
        );
      case 3:
        return (
          <EducationSection
            data={profile.education}
            onChange={(data) => updateProfile('education', data)}
          />
        );
      case 4:
        return (
          <ProjectsSection
            data={profile.projects}
            onChange={(data) => updateProfile('projects', data)}
          />
        );
      case 5:
        return (
          <SkillsSection
            data={profile.skills}
            onChange={(data) => updateProfile('skills', data)}
          />
        );
      case 6:
        return (
          <LinksExtrasSection
            certifications={profile.certifications}
            awards={profile.awards}
            languages={profile.languages}
            onCertificationsChange={(data) => updateProfile('certifications', data)}
            onAwardsChange={(data) => updateProfile('awards', data)}
            onLanguagesChange={(data) => updateProfile('languages', data)}
          />
        );
      case 7:
        return (
          <ReviewSection
            profile={profile}
            completeness={completeness}
          />
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-orange-500/20 blur-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 relative overflow-hidden">
      {/* Floating orbs */}
      <FloatingOrb className="w-96 h-96 -top-48 -left-48" delay={0} color="orange" />
      <FloatingOrb className="w-80 h-80 top-1/3 -right-40" delay={2} color="amber" />
      <FloatingOrb className="w-64 h-64 bottom-20 left-1/4" delay={4} color="gold" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Back button */}
              <button
                onClick={() => {
                  // Check if user has an existing profile (edit mode) or token
                  const token = localStorage.getItem('token');
                  if (token) {
                    router.push('/app');
                  } else {
                    router.push('/');
                  }
                }}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-800/50 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-orange-500/50 transition-all"
                title="Go Back"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <HeaderLogo size="md" />
            </div>

            <div className="flex items-center gap-2">
              {/* Sync Status Indicator */}
              {syncStatus !== 'idle' && (
                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                  syncStatus === 'syncing' ? 'bg-blue-500/20 text-blue-400' :
                  syncStatus === 'synced' ? 'bg-green-500/20 text-green-400' :
                  syncStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                  syncStatus === 'offline' ? 'bg-amber-500/20 text-amber-400' : ''
                }`}>
                  {syncStatus === 'syncing' && (
                    <>
                      <div className="w-3 h-3 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                      <span className="hidden sm:inline">Syncing</span>
                    </>
                  )}
                  {syncStatus === 'synced' && (
                    <>
                      <Cloud className="w-3 h-3" />
                      <span className="hidden sm:inline">Saved</span>
                    </>
                  )}
                  {syncStatus === 'error' && (
                    <button 
                      onClick={retrySync}
                      className="flex items-center gap-1.5 hover:opacity-80"
                      title="Click to retry"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span className="hidden sm:inline">Retry</span>
                    </button>
                  )}
                  {syncStatus === 'offline' && (
                    <button 
                      onClick={retrySync}
                      className="flex items-center gap-1.5 hover:opacity-80"
                      title="No internet - click to retry"
                    >
                      <WifiOff className="w-3 h-3" />
                      <span className="hidden sm:inline">Offline</span>
                    </button>
                  )}
                </div>
              )}
              
              {/* Home button for mobile */}
              <button
                onClick={() => router.push('/')}
                className="w-9 h-9 rounded-xl bg-stone-800/50 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-orange-500/50 transition-all sm:hidden"
                title="Home"
              >
                <Home className="w-4 h-4" />
              </button>
              {isSaving && (
                <div className="flex items-center gap-2 text-orange-400 text-sm">
                  <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                  <span className="hidden sm:inline">Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {showChoice ? (
          /* Upload/Manual Choice Screen */
          renderChoiceScreen()
        ) : (
          /* Regular Onboarding Flow */
          <>
            {/* Extraction warnings banner */}
            {uploadWarnings.length > 0 && (
              <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-amber-400 font-medium text-sm">Some fields may need review:</p>
                    <ul className="mt-1 text-stone-400 text-sm list-disc list-inside">
                      {uploadWarnings.map((warning, i) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper */}
            <div className="mb-12">
              <OnboardingStepper steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />
            </div>

        {/* Step content with animations */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentStep}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl shadow-2xl"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl" />
            
            <div className="relative p-8 md:p-12">
              <div className="mb-8">
                <motion.div 
                  className="flex items-center gap-3 mb-4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <span className="text-white font-bold">{currentStep}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">
                      {STEPS[currentStep - 1]}
                    </h2>
                    <p className="text-stone-400 text-sm">
                      {STEP_DESCRIPTIONS[STEPS[currentStep - 1]]}
                    </p>
                  </div>
                </motion.div>
              </div>

              {renderStep()}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons - Enhanced */}
        <motion.div 
          className="mt-8 flex justify-between items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {currentStep === 1 ? (
            <motion.button
              onClick={goToChoice}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 transition-all"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Change Method
            </motion.button>
          ) : (
            <motion.button
              onClick={prevStep}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800/50 transition-all"
              whileHover={{ x: -3 }}
              whileTap={{ scale: 0.98 }}
            >
              <ChevronLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
              Back
            </motion.button>
          )}

          {currentStep < STEPS.length ? (
            <motion.button
              onClick={saveAndContinue}
              className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30 transition-all"
              whileHover={{ scale: 1.02, x: 3 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          ) : (
            <motion.button
              onClick={completeOnboarding}
              disabled={isSaving}
              className="group flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg shadow-green-500/20 hover:shadow-xl hover:shadow-green-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isSaving ? 1 : 1.02 }}
              whileTap={{ scale: isSaving ? 1 : 0.98 }}
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Finishing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Complete Profile
                  <Sparkles className="w-4 h-4 ml-1" />
                </>
              )}
            </motion.button>
          )}
        </motion.div>
          </>
        )}
      </main>
    </div>
  );
}
