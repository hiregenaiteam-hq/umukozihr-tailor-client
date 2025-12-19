import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
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
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, Save, Upload, FileText, PenLine, AlertCircle, Home, ArrowLeft, Cloud, CloudOff, RefreshCw, Wifi, WifiOff } from 'lucide-react';

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

function FloatingOrb({ className, delay = 0, color = "orange" }: { className?: string; delay?: number; color?: string }) {
  const colorClass = color === "amber" ? "bg-amber-500/20" : color === "gold" ? "bg-yellow-500/15" : "bg-orange-500/20";
  return (
    <div 
      className={`absolute rounded-full blur-3xl animate-float pointer-events-none ${colorClass} ${className}`}
      style={{ animationDelay: `${delay}s` }}
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
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

  // Render the choice screen
  const renderChoiceScreen = () => (
    <div className="glass-card rounded-3xl p-8 md:p-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          Let's Build Your Profile
        </h2>
        <p className="text-stone-400 max-w-md mx-auto">
          Upload your existing resume for instant extraction, or fill in your details manually.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {/* Upload Option */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`group relative p-6 rounded-2xl border-2 border-dashed border-stone-700 hover:border-orange-500/50 bg-stone-800/30 hover:bg-stone-800/50 cursor-pointer transition-all duration-300 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            onChange={handleFileUpload}
            className="hidden"
          />
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors">
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-orange-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isUploading ? 'Extracting...' : 'Upload Resume'}
            </h3>
            <p className="text-sm text-stone-400">
              PDF, DOCX, or TXT (max 10MB)
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Works with LinkedIn exports too!
            </p>
          </div>
        </div>

        {/* Manual Option */}
        <div
          onClick={() => setShowChoice(false)}
          className="group relative p-6 rounded-2xl border-2 border-stone-700 hover:border-amber-500/50 bg-stone-800/30 hover:bg-stone-800/50 cursor-pointer transition-all duration-300"
        >
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-amber-500/20 flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
              <PenLine className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Fill Manually
            </h3>
            <p className="text-sm text-stone-400">
              Enter your details step by step
            </p>
            <p className="text-xs text-stone-500 mt-2">
              Takes about 5-10 minutes
            </p>
          </div>
        </div>
      </div>

      {/* Decorative sparkle */}
      <div className="flex justify-center mt-8">
        <div className="flex items-center gap-2 text-stone-500 text-sm">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>AI-powered extraction saves you time</span>
        </div>
      </div>
    </div>
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

        {/* Step content */}
        <div className="glass-card rounded-3xl p-8 md:p-12">
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
              {STEPS[currentStep - 1]}
            </h2>
            <p className="text-stone-400">
              {STEP_DESCRIPTIONS[STEPS[currentStep - 1]]}
            </p>
          </div>

          {renderStep()}
        </div>

        {/* Progress indicator */}
        <div className="mt-8 flex items-center justify-center gap-2">
          {STEPS.map((step, index) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index + 1 === currentStep
                  ? "w-8 bg-gradient-to-r from-orange-500 to-amber-500"
                  : index + 1 < currentStep
                  ? "w-4 bg-orange-500/50"
                  : "w-4 bg-stone-700"
              }`}
            />
          ))}
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center">
          {currentStep === 1 ? (
            <button
              onClick={goToChoice}
              className="flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Change Method
            </button>
          ) : (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          )}

          {currentStep < STEPS.length ? (
            <button
              onClick={saveAndContinue}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={completeOnboarding}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-green-500/25 transition-all disabled:opacity-50"
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
                </>
              )}
            </button>
          )}
        </div>
          </>
        )}
      </main>
    </div>
  );
}
