import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import toast from 'react-hot-toast';
import { profile as profileApi } from '@/lib/api';
import { ProfileV3, createEmptyProfile } from '@/lib/types';
import OnboardingStepper from '@/components/onboarding/OnboardingStepper';
import BasicsSection from '@/components/onboarding/BasicsSection';
import ExperienceSection from '@/components/onboarding/ExperienceSection';
import EducationSection from '@/components/onboarding/EducationSection';
import { ProjectsSection, SkillsSection, LinksExtrasSection } from '@/components/onboarding/ProjectsSkillsSection';
import ReviewSection from '@/components/onboarding/ReviewSection';
import { ChevronLeft, ChevronRight, CheckCircle, Sparkles, Save } from 'lucide-react';

const STEPS = ['Basics', 'Experience', 'Education', 'Projects', 'Skills', 'Extras', 'Review'];
const ONBOARDING_STORAGE_KEY = 'onboarding_draft';
const ONBOARDING_STEP_KEY = 'onboarding_step';

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

  useEffect(() => {
    setMounted(true);
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to continue');
      router.push('/');
      return;
    }

    // Restore draft from localStorage
    const savedDraft = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY);
    let hasLocalDraft = false;

    if (savedDraft) {
      try {
        const parsedProfile = JSON.parse(savedDraft);
        if (parsedProfile.basics?.full_name || parsedProfile.experience?.length > 0) {
          setProfile(parsedProfile);
          hasLocalDraft = true;
          toast.success('Restored your progress from last session');
        }
      } catch (error) {
        console.error('Failed to parse saved draft:', error);
      }
    }

    if (savedStep) {
      const step = parseInt(savedStep, 10);
      if (step > 1 && step <= STEPS.length) {
        setCurrentStep(step);
      }
    }

    loadExistingProfile(hasLocalDraft);
  }, []);

  const loadExistingProfile = async (hasLocalDraft: boolean = false) => {
    try {
      const response = await profileApi.get();
      if (response.data?.profile) {
        // If we have a server profile and no local draft, use server version
        if (!hasLocalDraft) {
          setProfile(response.data.profile);
        }
        // If server profile is more complete, redirect to app
        if (response.data.completeness > 80) {
          router.push('/app');
          return;
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

  // Auto-save draft to localStorage
  useEffect(() => {
    if (mounted && profile.basics?.full_name) {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem(ONBOARDING_STEP_KEY, currentStep.toString());
    }
  }, [profile, currentStep, mounted]);

  const updateProfile = (section: keyof ProfileV3, data: any) => {
    setProfile(prev => ({ ...prev, [section]: data }));
  };

  const saveAndContinue = async () => {
    setIsSaving(true);
    try {
      const response = await profileApi.update(profile);
      setCompleteness(response.data.completeness);
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
      nextStep();
      toast.success('Progress saved!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Failed to save. Your progress is stored locally.');
      // Still allow navigation even if save fails
      nextStep();
    } finally {
      setIsSaving(false);
    }
  };

  const completeOnboarding = async () => {
    setIsSaving(true);
    try {
      await profileApi.update(profile);
      localStorage.removeItem(ONBOARDING_STORAGE_KEY);
      localStorage.removeItem(ONBOARDING_STEP_KEY);
      toast.success('Profile complete! Redirecting...');
      router.push('/app');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save profile. Please try again.');
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
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25">
                <span className="text-white font-bold text-lg">U</span>
              </div>
              <div>
                <h1 className="text-white font-semibold">UmukoziHR Tailor</h1>
                <p className="text-stone-500 text-xs">Profile Setup</p>
              </div>
            </div>

            {isSaving && (
              <div className="flex items-center gap-2 text-orange-400 text-sm">
                <div className="w-4 h-4 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
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
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-6 py-3 text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>

          {currentStep < STEPS.length ? (
            <button
              onClick={saveAndContinue}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
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
                  Saving...
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
      </main>
    </div>
  );
}
