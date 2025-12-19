import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { profile as profileApi } from "../lib/api";
import LoginForm from "../components/LoginForm";
import ThemeToggle from "../components/ThemeToggle";
import { HeroLogo } from "../components/Logo";
import { Zap, Target, CheckCircle, Sparkles, ArrowRight, Shield, Clock, FileText } from "lucide-react";
import Image from "next/image";

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

          {/* Login Form Section */}
          <div 
            className="max-w-md mx-auto animate-fade-in-up"
            style={{ animationDelay: '800ms' }}
          >
            <div className="glass-heavy p-8 rounded-3xl relative">
              {/* Gradient accent line */}
              <div className="absolute top-0 left-8 right-8 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent rounded-full" />
              
              <div className="text-center mb-8">
                <div className="neu-raised w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-7 w-7 text-orange-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Get Started
                </h2>
                <p className="text-stone-400">
                  Create your account or sign in to continue
                </p>
              </div>
              
              <LoginForm onLogin={handleLogin} />
            </div>
          </div>

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
