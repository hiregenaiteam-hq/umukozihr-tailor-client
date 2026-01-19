import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
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
  Clock, CheckCircle, AlertCircle, Zap, Shield, Share2, Upload, AlertTriangle, Home, ArrowLeft, Camera
} from 'lucide-react';

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
    <div 
      className={`floating-orb floating-orb-orange ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

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

  useEffect(() => {
    setMounted(true);
    
    // Check authentication - require token
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in');
      router.push('/');
      return;
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

      {/* Tabs */}
      <div className="glass-subtle border-b border-white/5 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all relative ${
                  activeTab === tab.id
                    ? 'text-orange-400'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Profile Tab */}
        {activeTab === 'profile' && profile && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Profile Header */}
            <div className="glass-card p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Clickable Avatar */}
                <div 
                  onClick={() => avatarInputRef.current?.click()}
                  className="relative w-20 h-20 rounded-2xl cursor-pointer group"
                  title="Click to upload profile picture"
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
                </div>
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {profile.basics.full_name || 'Complete Your Profile'}
                  </h2>
                  <p className="text-stone-400 mb-3 text-sm sm:text-base">{profile.basics.email}</p>
                  <div className="flex flex-wrap gap-2">
                    {profile.preferences.regions.map((region) => (
                      <span key={region} className="badge badge-orange">
                        <MapPin className="h-3 w-3 mr-1" />
                        {region}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
                  <button
                    onClick={() => router.push('/onboarding?edit=true')}
                    className="btn-secondary flex items-center gap-2 flex-1 sm:flex-none justify-center"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Edit Profile</span>
                    <span className="sm:hidden">Edit</span>
                  </button>
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
            </div>

            {/* Profile Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Experience */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-orange-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Experience ({profile.experience?.length || 0})
                  </h3>
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
              </div>

              {/* Education */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Education ({profile.education?.length || 0})
                  </h3>
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
              </div>

              {/* Skills - Organized by Category */}
              <div className="glass-card p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neu-flat w-10 h-10 rounded-lg flex items-center justify-center">
                    <Code className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Skills ({profile.skills?.reduce((acc, s) => acc + (s.keywords?.length || 0), 0) || 0} total)
                  </h3>
                </div>
                <div className="space-y-4">
                  {profile.skills?.map((skill, idx) => (
                    <div key={idx}>
                      {/* Category header */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-sm font-medium ${
                          skill.level === 'expert' ? 'text-orange-400' : 
                          skill.level === 'intermediate' ? 'text-amber-400' : 
                          'text-stone-400'
                        }`}>
                          {skill.name}
                        </span>
                        <span className="text-xs text-stone-500">• {skill.level}</span>
                      </div>
                      {/* Keywords/actual skills */}
                      {skill.keywords && skill.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {skill.keywords.map((keyword, kidx) => (
                            <span 
                              key={kidx} 
                              className="px-2 py-1 text-xs rounded-lg bg-stone-800/50 text-stone-300 border border-stone-700"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {(!profile.skills || profile.skills.length === 0) && (
                    <p className="text-stone-500 text-sm">No skills added yet</p>
                  )}
                </div>
              </div>

              {/* Share Profile */}
              <div className="md:col-span-2">
                <ShareButtons />
              </div>
            </div>
          </div>
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
                  defaultRegion={profile?.preferences.regions[0] || 'US'}
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
