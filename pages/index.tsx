import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { profile as profileApi } from "../lib/api";
import AuthModal from "../components/AuthModal";
import ThemeToggle from "../components/ThemeToggle";
import { HeroLogo } from "../components/Logo";
import { Zap, Target, CheckCircle, Sparkles, ArrowRight, Shield, Clock, FileText, Globe, FileCheck, Briefcase, Rocket } from "lucide-react";
import Image from "next/image";
import { useAuth } from '@clerk/nextjs';

// Check if Clerk is configured
const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your_publishable_key');

// Floating orb component
function FloatingOrb({ className, delay = 0, color = "orange" }: { className: string; delay?: number; color?: "orange" | "amber" | "gold" }) {
  const colorClass = {
    orange: "floating-orb-orange",
    amber: "floating-orb-amber", 
    gold: "floating-orb-gold"
  }[color];
  
  return (
    <div 
      className={`floating-orb ${colorClass} ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

// Animated counter
function AnimatedCounter({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = end / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [end]);
  
  return <>{count.toLocaleString()}{suffix}</>;
}

// Template preview card
function TemplatePreview({ 
  name, 
  region, 
  description, 
  features,
  delay 
}: { 
  name: string; 
  region: string; 
  description: string;
  features: string[];
  delay: number;
}) {
  return (
    <div 
      className="glass-card p-6 group hover:border-orange-500/30 transition-all animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Mock Template Preview */}
      <div className="aspect-[8.5/11] bg-white/5 rounded-lg mb-4 overflow-hidden relative group-hover:scale-[1.02] transition-transform">
        {/* Simulated resume layout */}
        <div className="absolute inset-3 flex flex-col">
          {/* Header */}
          <div className="bg-orange-500/20 h-6 w-3/4 mx-auto rounded mb-3" />
          <div className="bg-white/10 h-2 w-1/2 mx-auto rounded mb-4" />
          
          {/* Horizontal line */}
          <div className="bg-white/20 h-px w-full mb-3" />
          
          {/* Section */}
          <div className="bg-orange-400/30 h-3 w-1/4 rounded mb-2" />
          <div className="bg-white/10 h-2 w-full rounded mb-1" />
          <div className="bg-white/10 h-2 w-5/6 rounded mb-1" />
          <div className="bg-white/10 h-2 w-4/6 rounded mb-3" />
          
          {/* Section */}
          <div className="bg-orange-400/30 h-3 w-1/3 rounded mb-2" />
          <div className="flex gap-2 mb-1">
            <div className="bg-white/10 h-2 flex-1 rounded" />
            <div className="bg-white/5 h-2 w-16 rounded" />
          </div>
          <div className="bg-white/5 h-2 w-full rounded mb-1" />
          <div className="bg-white/5 h-2 w-5/6 rounded mb-3" />
          
          {/* Section */}
          <div className="bg-orange-400/30 h-3 w-1/4 rounded mb-2" />
          <div className="flex gap-2 mb-1">
            <div className="bg-white/10 h-2 flex-1 rounded" />
            <div className="bg-white/5 h-2 w-16 rounded" />
          </div>
          <div className="bg-white/5 h-2 w-full rounded mb-1" />
          <div className="bg-white/5 h-2 w-4/6 rounded" />
        </div>
        
        {/* Region badge */}
        <div className="absolute top-2 right-2 px-2 py-1 bg-orange-500/80 text-white text-xs font-bold rounded">
          {region}
        </div>
      </div>
      
      {/* Template info */}
      <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gradient transition-all">
        {name}
      </h3>
      <p className="text-stone-400 text-sm mb-3">{description}</p>
      
      {/* Features */}
      <div className="flex flex-wrap gap-2">
        {features.map((feature, idx) => (
          <span key={idx} className="text-xs px-2 py-1 bg-white/5 text-stone-400 rounded-full">
            {feature}
          </span>
        ))}
      </div>
    </div>
  );
}

// Feature card
function FeatureCard({ icon: Icon, title, description, delay }: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
  delay: number;
}) {
  return (
    <div 
      className="glass-card p-8 text-center group animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:animate-pulse-glow transition-all duration-300">
        <Icon className="h-8 w-8 text-orange-400 group-hover:text-orange-300 transition-colors" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-gradient transition-all">
        {title}
      </h3>
      <p className="text-stone-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'sign-in' | 'sign-up'>('sign-up');
  
  // Try to use Clerk auth if configured
  let clerkAuth: { isSignedIn?: boolean; isLoaded?: boolean } = { isSignedIn: false, isLoaded: true };
  if (isClerkConfigured) {
    try {
      clerkAuth = useAuth();
    } catch (e) {
      // Clerk not available
    }
  }

  useEffect(() => {
    setMounted(true);
    
    // If Clerk user is signed in, redirect
    if (isClerkConfigured && clerkAuth.isLoaded && clerkAuth.isSignedIn) {
      checkAuthAndRedirect();
      return;
    }
    
    // Check legacy auth
    checkAuthAndRedirect();
  }, [clerkAuth.isLoaded, clerkAuth.isSignedIn]);

  const checkAuthAndRedirect = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setIsCheckingAuth(false);
      return;
    }

    try {
      const response = await profileApi.get();
      if (response.data.profile) {
        router.push('/app');
      } else {
        router.push('/onboarding');
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        router.push('/onboarding');
      } else {
        localStorage.removeItem('token');
        setIsCheckingAuth(false);
      }
    }
  };

  const handleLogin = async (token: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      const response = await profileApi.get();
      if (response.data && response.data.profile) {
        await router.push('/app');
      } else {
        await router.push('/onboarding');
      }
    } catch (error: any) {
      await router.push('/onboarding');
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 animate-spin" />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-orange-400" />
          </div>
          <p className="text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: FileText,
      title: "Smart Tailoring",
      description: "AI analyzes job descriptions and highlights your most relevant experience for each application"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Generate professional PDFs and LaTeX files in seconds with our optimized engine"
    },
    {
      icon: Target,
      title: "Region-Specific",
      description: "Templates optimized for US, EU, and Global job markets with cultural nuances"
    }
  ];

  const stats = [
    { value: 15000, suffix: "+", label: "Resumes Created" },
    { value: 98, suffix: "%", label: "Success Rate" },
    { value: 30, suffix: "s", label: "Avg Generation" }
  ];

  const benefits = [
    { icon: CheckCircle, text: "Profile Once, Reuse Forever" },
    { icon: Shield, text: "ATS-Optimized Output" },
    { icon: Clock, text: "Save Hours Per Application" }
  ];

  return (
    <div className={`min-h-screen bg-[#0c0a09] relative overflow-hidden transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background elements */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <FloatingOrb className="w-[600px] h-[600px] -top-40 -left-40" delay={0} color="orange" />
      <FloatingOrb className="w-[500px] h-[500px] top-1/2 -right-32" delay={2} color="amber" />
      <FloatingOrb className="w-[400px] h-[400px] bottom-20 left-1/4" delay={4} color="gold" />

      {/* Theme Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 pt-20 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Logo & Header */}
          <div className="text-center mb-16 animate-fade-in-down">
            <div className="inline-flex items-center gap-3 mb-8 glass-subtle px-6 py-3 rounded-full">
              <HeroLogo />
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">AI-Powered </span>
              <span className="text-gradient">Resume</span>
              <br />
              <span className="text-gradient-gold">& Cover Letter</span>
              <span className="text-white"> Generation</span>
            </h1>
            
            <p className="text-xl text-stone-400 max-w-2xl mx-auto mb-8">
              Tailor your resume to any job posting in seconds. Stand out from the crowd with 
              perfectly matched applications.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button
                onClick={() => { setAuthMode('sign-up'); setShowAuthModal(true); }}
                className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Rocket className="h-5 w-5" />
                <span>Get Hired Today</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                onClick={() => { setAuthMode('sign-in'); setShowAuthModal(true); }}
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-semibold text-lg rounded-2xl border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <span>I have an account</span>
              </button>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 mb-12">
              {stats.map((stat, index) => (
                <div 
                  key={stat.label}
                  className="text-center animate-fade-in-up"
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-sm text-stone-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                delay={400 + index * 150}
              />
            ))}
          </div>

          {/* Template Preview Section */}
          <div className="mb-16">
            <div className="text-center mb-10 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-subtle rounded-full mb-4">
                <FileCheck className="h-4 w-4 text-orange-400" />
                <span className="text-sm text-stone-400">Professional Templates</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                ATS-Optimized <span className="text-gradient">Resume Templates</span>
              </h2>
              <p className="text-stone-400 max-w-xl mx-auto">
                Choose from region-specific templates designed to pass Applicant Tracking Systems 
                and impress recruiters worldwide.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <TemplatePreview
                name="US One-Page"
                region="US"
                description="Concise, achievement-focused format preferred by American recruiters."
                features={["1 Page Max", "No Photo", "ATS Friendly"]}
                delay={700}
              />
              <TemplatePreview
                name="EU Two-Page"
                region="EU"
                description="Detailed format with space for comprehensive experience and skills."
                features={["2 Pages", "Optional Photo", "GDPR Ready"]}
                delay={800}
              />
              <TemplatePreview
                name="Global Standard"
                region="GL"
                description="Versatile format suitable for international applications."
                features={["Flexible Length", "Universal", "Multi-Language"]}
                delay={900}
              />
            </div>
            
            {/* Cover Letter Highlight */}
            <div className="mt-10 glass-subtle p-6 rounded-2xl text-center animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
              <div className="flex items-center justify-center gap-3 mb-3">
                <Briefcase className="h-6 w-6 text-orange-400" />
                <h3 className="text-xl font-semibold text-white">Cover Letters Included</h3>
              </div>
              <p className="text-stone-400 max-w-2xl mx-auto">
                Every resume comes with a professionally tailored cover letter — something most competitors don&apos;t offer. 
                Both documents are perfectly aligned to highlight your relevant experience for each position.
              </p>
            </div>
          </div>

          {/* Login Form Section - REMOVED, using modal instead */}
          
          {/* Auth Modal */}
          {isClerkConfigured && (
            <AuthModal
              isOpen={showAuthModal}
              onClose={() => setShowAuthModal(false)}
              defaultMode={authMode}
            />
          )}

          {/* Benefits Footer */}
          <div 
            className="mt-16 animate-fade-in-up"
            style={{ animationDelay: '1000ms' }}
          >
            <div className="flex flex-wrap justify-center gap-6 md:gap-12">
              {benefits.map((benefit, index) => (
                <div 
                  key={benefit.text}
                  className="flex items-center gap-3 text-stone-400 hover:text-white transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                    <benefit.icon className="h-4 w-4 text-green-400" />
                  </div>
                  <span className="text-sm font-medium">{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0c0a09] to-transparent pointer-events-none" />
    </div>
  );
}
