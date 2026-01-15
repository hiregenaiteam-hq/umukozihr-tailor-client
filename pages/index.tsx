import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { profile as profileApi, auth } from "../lib/api";
import { signInWithGoogle, isSupabaseConfigured } from "../lib/supabase";
import ThemeToggle from "../components/ThemeToggle";
import { HeroLogo } from "../components/Logo";
import { Zap, Target, CheckCircle, Sparkles, ArrowRight, Shield, Clock, FileText, Globe, FileCheck, Briefcase, Rocket, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import toast from 'react-hot-toast';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthAndRedirect();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    try {
      if (authMode === 'sign-up') {
        const response = await auth.signup(email, password);
        localStorage.setItem('token', response.data.access_token);
        toast.success('Account created!');
        router.push('/onboarding');
      } else {
        const response = await auth.login(email, password);
        localStorage.setItem('token', response.data.access_token);
        toast.success('Welcome back!');
        handleLogin(response.data.access_token);
      }
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Authentication failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Will redirect to Google OAuth
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
      setIsGoogleLoading(false);
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
          {showAuthModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowAuthModal(false)}>
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
              <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setShowAuthModal(false)} className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors">
                  <span className="text-2xl">&times;</span>
                </button>

                {/* Tab Switcher */}
                <div className="flex mb-4 bg-stone-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
                  <button onClick={() => setAuthMode('sign-in')} className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${authMode === 'sign-in' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25' : 'text-stone-400 hover:text-white'}`}>Sign In</button>
                  <button onClick={() => setAuthMode('sign-up')} className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${authMode === 'sign-up' ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25' : 'text-stone-400 hover:text-white'}`}>Create Account</button>
                </div>

                {/* Auth Form */}
                <div className="bg-stone-900/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl p-8">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Google OAuth Button */}
                    {isSupabaseConfigured && (
                      <>
                        <button
                          type="button"
                          onClick={handleGoogleSignIn}
                          disabled={isGoogleLoading}
                          className="w-full py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                        >
                          {isGoogleLoading ? (
                            'Redirecting...'
                          ) : (
                            <>
                              <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              Continue with Google
                            </>
                          )}
                        </button>
                        <div className="relative my-4">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-stone-700"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-stone-900 text-stone-500">or continue with email</span>
                          </div>
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-stone-300 text-sm font-medium mb-2">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-600 text-white placeholder-stone-500 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-stone-300 text-sm font-medium mb-2">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500" />
                        <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-10 pr-12 py-3 bg-stone-800 border border-stone-600 text-white placeholder-stone-500 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white">
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={isLoading} className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                      {isLoading ? 'Please wait...' : (authMode === 'sign-up' ? 'Create Account' : 'Sign In')}
                    </button>
                  </form>
                </div>
              </div>
            </div>
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
