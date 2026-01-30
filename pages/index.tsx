"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { profile as profileApi, auth } from "../lib/api";
import { signInWithGoogle, isSupabaseConfigured } from "../lib/supabase";
import { cn } from "../lib/utils";
import { motion, useInView, AnimatePresence } from "framer-motion";
import SEOHead from "../components/SEOHead";
import { 
  Zap, Target, CheckCircle, Sparkles, ArrowRight, Shield, Clock, 
  FileText, Globe, FileCheck, Briefcase, Rocket, Mail, Lock, Eye, 
  EyeOff, ChevronLeft, ChevronRight, Star, Users, TrendingUp,
  Layers, Award, Play
} from "lucide-react";
import toast from 'react-hot-toast';

// ============================================
// ANIMATED HERO BACKGROUND (Optimized)
// ============================================
function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Static gradient background - removed animation to prevent jitter */}
      <div
        className="absolute inset-[-50%]"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 20%, 
              rgba(249, 115, 22, 0.15) 0%, 
              rgba(251, 146, 60, 0.08) 40%, 
              transparent 70%)
          `,
        }}
      />
      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(249, 115, 22, 0.5) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(249, 115, 22, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 0%, #000 70%, transparent 110%)",
        }}
      />
      {/* Static orbs - using CSS animation instead of JS for better performance */}
      <div 
        className="absolute top-20 left-10 w-96 h-96 rounded-full bg-orange-500/20 blur-[100px] animate-pulse-slow"
        style={{ animationDuration: '8s' }}
      />
      <div 
        className="absolute bottom-20 right-10 w-[500px] h-[500px] rounded-full bg-amber-500/15 blur-[120px] animate-pulse-slow"
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />
    </div>
  );
}

// ============================================
// ANIMATED LETTER TITLE (Optimized - word-by-word instead of letter-by-letter)
// ============================================
function AnimatedTitle({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  
  return (
    <h1 className={cn("text-5xl md:text-6xl lg:text-7xl font-bold leading-tight", className)}>
      {words.map((word, wordIndex) => (
        <motion.span
          key={wordIndex}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: wordIndex * 0.15,
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94], // easeOutQuad - smoother than spring
          }}
          className="inline-block mr-4 last:mr-0"
        >
          {word}
        </motion.span>
      ))}
    </h1>
  );
}

// ============================================
// COMPANY LOGOS (from /media folder)
// ============================================
const companyLogos = [
  { name: "Google", src: "/media/google-new.svg", dark: false },
  { name: "Microsoft", src: "/media/microsoft-6.svg", dark: false },
  { name: "Apple", src: "/media/apple-11.svg", dark: true },
  { name: "Meta", src: "/media/meta-3.svg", dark: false },
  { name: "OpenAI", src: "/media/openai-wordmark.svg", dark: true },
  { name: "Anthropic", src: "/media/anthropic-1.svg", dark: false },
  { name: "NVIDIA", src: "/media/nvidia.svg", dark: false },
  { name: "Tesla", src: "/media/tesla-motors.svg", dark: false },
  { name: "SpaceX", src: "/media/spacex.svg", dark: true },
  { name: "NASA", src: "/media/nasa-6.svg", dark: false },
  { name: "JP Morgan", src: "/media/jp-morgan.svg", dark: true },
  { name: "Bank of America", src: "/media/bank-of-america.svg", dark: false },
  { name: "Coca-Cola", src: "/media/coca-cola-2021.svg", dark: false },
];

// ============================================
// INFINITE LOGO SLIDER
// ============================================
function LogoMarquee() {
  return (
    <div className="relative overflow-hidden py-8">
      {/* Marquee container */}
      <div className="marquee-container">
        <div className="marquee-track">
          {/* First set of logos */}
          {companyLogos.map((logo, idx) => (
            <div
              key={`first-${idx}`}
              className="marquee-item"
              title={logo.name}
            >
              <img 
                src={logo.src} 
                alt={logo.name} 
                className={cn(
                  "h-8 w-auto max-w-[140px] object-contain",
                  logo.dark && "invert brightness-0 invert"
                )}
              />
            </div>
          ))}
          {/* Duplicate set for seamless loop */}
          {companyLogos.map((logo, idx) => (
            <div
              key={`second-${idx}`}
              className="marquee-item"
              title={logo.name}
            >
              <img 
                src={logo.src} 
                alt={logo.name} 
                className={cn(
                  "h-8 w-auto max-w-[140px] object-contain",
                  logo.dark && "invert brightness-0 invert"
                )}
              />
            </div>
          ))}
        </div>
      </div>
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0c0a09] to-transparent pointer-events-none z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0c0a09] to-transparent pointer-events-none z-10" />
    </div>
  );
}

// ============================================
// BENTO GRID FEATURE CARD
// ============================================
function BentoCard({ 
  icon: Icon, 
  title, 
  description, 
  className,
  delay = 0 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={cn(
        "group relative overflow-hidden rounded-3xl",
        "bg-gradient-to-br from-white/[0.05] to-white/[0.02]",
        "border border-white/10 hover:border-orange-500/30",
        "backdrop-blur-xl transition-all duration-500",
        "hover:shadow-[0_0_60px_rgba(249,115,22,0.15)]",
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent" />
      </div>

      <div className="relative p-8">
        <div className="mb-6 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/20 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-orange-400" />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-300 transition-colors">
          {title}
        </h3>
        
        <p className="text-stone-400 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ============================================
// ANIMATED STAT COUNTER
// ============================================
function AnimatedCounter({ end, suffix = "", label }: { end: number; suffix?: string; label: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    
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
  }, [end, isInView]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-400 to-amber-400 bg-clip-text text-transparent">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-stone-500 mt-2">{label}</p>
    </motion.div>
  );
}

// ============================================
// TESTIMONIAL CARD
// ============================================
function TestimonialCard({ 
  quote, 
  name, 
  role, 
  company,
  image,
  isActive 
}: { 
  quote: string;
  name: string;
  role: string;
  company: string;
  image?: string;
  isActive: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative p-8 rounded-3xl transition-all duration-300",
        "bg-gradient-to-br from-white/[0.06] to-white/[0.02]",
        "border",
        isActive ? "border-orange-500/30 shadow-[0_0_40px_rgba(249,115,22,0.1)]" : "border-white/5"
      )}
    >
      {/* Quote icon */}
      <div className="absolute top-6 right-6 text-6xl text-orange-500/10 font-serif">"</div>
      
      <div className="relative">
        {/* Stars */}
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
          ))}
        </div>
        
        <p className="text-lg text-stone-300 leading-relaxed mb-6 italic">
          "{quote}"
        </p>
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold">
            {name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-white">{name}</p>
            <p className="text-sm text-stone-500">{role} at {company}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// MAIN LANDING PAGE
// ============================================
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
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Testimonials data
  const testimonials = [
    {
      quote: "I landed 3 interviews in my first week. The AI understands exactly what recruiters are looking for.",
      name: "Audrey K.",
      role: "Software Engineer",
      company: "Google"
    },
    {
      quote: "Went from zero callbacks to 5 interview requests in 2 weeks. This tool is a game-changer.",
      name: "Jonathan T.",
      role: "Product Manager",
      company: "Microsoft"
    },
    {
      quote: "The ATS optimization is incredible. My resume finally gets past the bots and into human hands.",
      name: "Medina S.",
      role: "Data Scientist",
      company: "Meta"
    }
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

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
    } catch {
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
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
      setIsGoogleLoading(false);
    }
  };

  // Loading state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="relative w-16 h-16 mx-auto mb-6">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-orange-500/20"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-t-orange-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-orange-400" />
          </div>
          <p className="text-stone-400">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen bg-[#0c0a09] relative overflow-hidden transition-opacity duration-500",
      mounted ? 'opacity-100' : 'opacity-0'
    )}>
      {/* SEO & Social Sharing Meta Tags */}
      <SEOHead />

      {/* Aurora Background */}
      <AuroraBackground />

      {/* ============================================ */}
      {/* HEADER / NAVBAR */}
      {/* ============================================ */}
      <header className="relative z-20 w-full py-6 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg shadow-orange-500/20">
              <img 
                src="/media/umukozi-logo.png" 
                alt="UmukoziHR" 
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">UmukoziHR</h1>
              <p className="text-sm text-orange-400 font-medium">Tailor</p>
            </div>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setAuthMode('sign-in'); setShowAuthModal(true); }}
              className="px-4 py-2 text-sm font-medium text-stone-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => { setAuthMode('sign-up'); setShowAuthModal(true); }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              Land Your Role
            </button>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* HERO SECTION */}
      {/* ============================================ */}
      <section className="relative z-10 flex flex-col items-center justify-center px-6 pt-8 pb-16">
        <div className="max-w-6xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full border border-orange-500/30 bg-orange-500/10 backdrop-blur-sm"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-medium text-orange-300">AI-Powered Resume Tailoring</span>
            <ArrowRight className="w-4 h-4 text-orange-400" />
          </motion.div>

          {/* Animated Title */}
          <div className="mb-6">
            <AnimatedTitle 
              text="Land Your Dream Job" 
              className="text-white"
            />
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="block text-5xl md:text-6xl lg:text-7xl font-bold mt-2 bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent"
            >
              In Seconds
            </motion.span>
          </div>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-xl text-stone-400 max-w-2xl mx-auto mb-8"
          >
            Stop applying into the void. Our AI tailors your resume to beat ATS systems 
            and catch recruiters' eyes in seconds—not hours.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <motion.button
              onClick={() => { setAuthMode('sign-up'); setShowAuthModal(true); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 overflow-hidden rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.5)] transition-all"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                Land Your Dream Role Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.button>
            
            <motion.button
              onClick={() => { setAuthMode('sign-in'); setShowAuthModal(true); }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-lg text-white border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
            >
              Sign In
            </motion.button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            <AnimatedCounter end={15000} suffix="+" label="Resumes Created" />
            <AnimatedCounter end={98} suffix="%" label="Success Rate" />
            <AnimatedCounter end={30} suffix="s" label="Avg. Generation" />
          </motion.div>
        </div>
      </section>

      {/* ============================================ */}
      {/* LOGO MARQUEE (Social Proof) */}
      {/* ============================================ */}
      <section className="relative z-10 py-12 border-y border-white/5">
        <div className="text-center mb-8">
          <p className="text-sm text-stone-500 uppercase tracking-widest">
            Trusted by professionals from
          </p>
        </div>
        <LogoMarquee />
      </section>

      {/* ============================================ */}
      {/* TEMPLATE PREVIEW SECTION */}
      {/* ============================================ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border border-white/10 bg-white/5">
              <FileText className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-stone-400">Professional Templates</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your <span className="text-gradient">Perfect Format</span>
            </h2>
            <p className="text-lg text-stone-400 max-w-2xl mx-auto">
              Region-specific templates optimized for local hiring practices
            </p>
          </motion.div>

          {/* Template Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* US Template */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 hover:border-orange-500/30 bg-gradient-to-br from-stone-900/80 to-stone-950 transition-all duration-500 hover:shadow-[0_0_60px_rgba(249,115,22,0.15)]"
            >
              {/* Resume Preview */}
              <div className="relative p-6 pb-0">
                <div className="relative bg-stone-950 rounded-2xl p-6 overflow-hidden border border-white/5">
                  {/* Region Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
                    US
                  </div>
                  {/* Skeleton Resume Lines */}
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-orange-500/60 to-orange-500/30 rounded w-3/4" />
                    <div className="h-2 bg-white/20 rounded w-full" />
                    <div className="h-2 bg-white/15 rounded w-5/6" />
                    <div className="mt-6 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/4" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-11/12" />
                      <div className="h-2 bg-white/10 rounded w-4/5" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/3" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-3/4" />
                      <div className="h-2 bg-white/10 rounded w-5/6" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/4" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-2/3" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">US One-Page</h3>
                <p className="text-stone-400 text-sm mb-4">
                  Concise, achievement-focused format preferred by American recruiters.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">1 Page Max</span>
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">No Photo</span>
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">ATS Friendly</span>
                </div>
              </div>
            </motion.div>

            {/* EU Template */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 hover:border-orange-500/30 bg-gradient-to-br from-stone-900/80 to-stone-950 transition-all duration-500 hover:shadow-[0_0_60px_rgba(249,115,22,0.15)]"
            >
              {/* Resume Preview */}
              <div className="relative p-6 pb-0">
                <div className="relative bg-stone-950 rounded-2xl p-6 overflow-hidden border border-white/5">
                  {/* Region Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
                    EU
                  </div>
                  {/* Skeleton Resume Lines */}
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-orange-500/60 to-orange-500/30 rounded w-4/5" />
                    <div className="h-2 bg-white/20 rounded w-full" />
                    <div className="h-2 bg-white/15 rounded w-3/4" />
                    <div className="mt-6 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/3" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-5/6" />
                      <div className="h-2 bg-white/10 rounded w-11/12" />
                      <div className="h-2 bg-white/10 rounded w-3/4" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/4" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-4/5" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/3" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-5/6" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">EU Two-Page</h3>
                <p className="text-stone-400 text-sm mb-4">
                  Detailed format with space for comprehensive experience and skills.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">2 Pages</span>
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">Optional Photo</span>
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">GDPR Ready</span>
                </div>
              </div>
            </motion.div>

            {/* Global Template */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 hover:border-orange-500/30 bg-gradient-to-br from-stone-900/80 to-stone-950 transition-all duration-500 hover:shadow-[0_0_60px_rgba(249,115,22,0.15)]"
            >
              {/* Resume Preview */}
              <div className="relative p-6 pb-0">
                <div className="relative bg-stone-950 rounded-2xl p-6 overflow-hidden border border-white/5">
                  {/* Region Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-orange-500 text-white text-xs font-bold">
                    GL
                  </div>
                  {/* Skeleton Resume Lines */}
                  <div className="space-y-4">
                    <div className="h-4 bg-gradient-to-r from-orange-500/60 to-orange-500/30 rounded w-full" />
                    <div className="h-2 bg-white/20 rounded w-11/12" />
                    <div className="h-2 bg-white/15 rounded w-4/5" />
                    <div className="mt-6 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/4" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-3/4" />
                      <div className="h-2 bg-white/10 rounded w-5/6" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/3" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-2/3" />
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="h-3 bg-orange-500/40 rounded w-1/4" />
                      <div className="h-2 bg-white/15 rounded w-full" />
                      <div className="h-2 bg-white/10 rounded w-4/5" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">Global Standard</h3>
                <p className="text-stone-400 text-sm mb-4">
                  Versatile format suitable for international applications.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">Flexible Length</span>
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">Universal</span>
                  <span className="px-3 py-1 rounded-full border border-white/10 text-stone-400 text-xs">Multi-Language</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FEATURES BENTO GRID */}
      {/* ============================================ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border border-white/10 bg-white/5">
              <Layers className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-stone-400">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Everything You Need to <span className="text-gradient">Stand Out</span>
            </h2>
            <p className="text-lg text-stone-400 max-w-2xl mx-auto">
              Our AI-powered platform gives you the edge in today's competitive job market
            </p>
          </motion.div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <BentoCard
              icon={FileText}
              title="Smart Resume Tailoring"
              description="AI analyzes job descriptions and highlights your most relevant experience automatically."
              className="lg:col-span-2"
              delay={0}
            />
            <BentoCard
              icon={Zap}
              title="Lightning Fast"
              description="Generate ATS-optimized PDFs in under 30 seconds."
              delay={0.1}
            />
            <BentoCard
              icon={Target}
              title="ATS Optimized"
              description="Beat the bots with keyword optimization and proper formatting."
              delay={0.2}
            />
            <BentoCard
              icon={Globe}
              title="Region-Specific Templates"
              description="US, EU, and Global templates with cultural nuances built in."
              className="lg:col-span-2"
              delay={0.3}
            />
            <BentoCard
              icon={Briefcase}
              title="Cover Letters Included"
              description="Every resume comes with a perfectly matched cover letter."
              delay={0.4}
            />
            <BentoCard
              icon={Shield}
              title="Privacy First"
              description="Your data is encrypted and never shared with third parties."
              delay={0.5}
            />
            <BentoCard
              icon={Clock}
              title="Save Hours"
              description="Profile once, generate unlimited tailored applications."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* TESTIMONIALS */}
      {/* ============================================ */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 rounded-full border border-white/10 bg-white/5">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-stone-400">Success Stories</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Loved by <span className="text-gradient">Job Seekers</span>
            </h2>
          </motion.div>

          {/* Testimonial Cards */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <TestimonialCard
                key={activeTestimonial}
                {...testimonials[activeTestimonial]}
                isActive={true}
              />
            </AnimatePresence>

            {/* Navigation Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === activeTestimonial 
                      ? "w-8 bg-orange-500" 
                      : "bg-white/20 hover:bg-white/40"
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* FINAL CTA */}
      {/* ============================================ */}
      <section className="relative z-10 py-24 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <div className="relative p-12 rounded-3xl overflow-hidden border border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-amber-500/5">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-transparent blur-3xl" />
            
            <div className="relative">
              <Award className="w-12 h-12 text-orange-400 mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Stop Getting Ghosted. Start Getting Hired.
              </h2>
              <p className="text-lg text-stone-400 mb-8 max-w-xl mx-auto">
                Your dream job is one tailored resume away. Join thousands who landed roles at top companies.
              </p>
              <motion.button
                onClick={() => { setAuthMode('sign-up'); setShowAuthModal(true); }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-2xl font-bold text-lg text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:shadow-[0_0_60px_rgba(249,115,22,0.5)] transition-all"
              >
                <Rocket className="w-5 h-5" />
                Build My Winning Resume
                <ArrowRight className="w-5 h-5" />
              </motion.button>
              <p className="text-sm text-stone-500 mt-4">Free to start • No credit card required</p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* AUTH MODAL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center"
            onClick={() => setShowAuthModal(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setShowAuthModal(false)} 
                className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors text-2xl"
              >
                ×
              </button>

              {/* Tab Switcher */}
              <div className="flex mb-4 bg-stone-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
                <button 
                  onClick={() => setAuthMode('sign-in')} 
                  className={cn(
                    "flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300",
                    authMode === 'sign-in' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25' 
                      : 'text-stone-400 hover:text-white'
                  )}
                >
                  Sign In
                </button>
                <button 
                  onClick={() => setAuthMode('sign-up')} 
                  className={cn(
                    "flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300",
                    authMode === 'sign-up' 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25' 
                      : 'text-stone-400 hover:text-white'
                  )}
                >
                  Create Account
                </button>
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
                        {isGoogleLoading ? 'Redirecting...' : (
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
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="you@example.com" 
                        className="w-full pl-10 pr-4 py-3 bg-stone-800 border border-stone-600 text-white placeholder-stone-500 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" 
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-stone-300 text-sm font-medium mb-2">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-500" />
                      <input 
                        type={showPassword ? 'text' : 'password'} 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="••••••••" 
                        className="w-full pl-10 pr-12 py-3 bg-stone-800 border border-stone-600 text-white placeholder-stone-500 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all" 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <button 
                    type="submit" 
                    disabled={isLoading} 
                    className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Please wait...' : (authMode === 'sign-up' ? 'Create Account' : 'Sign In')}
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add custom CSS for marquee animation */}
      <style jsx global>{`
        .marquee-container {
          width: 100%;
          overflow: hidden;
        }
        
        .marquee-track {
          display: flex;
          width: fit-content;
          animation: marquee-scroll 40s linear infinite;
        }
        
        .marquee-item {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3rem;
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }
        
        .marquee-item:hover {
          opacity: 1;
        }
        
        @keyframes marquee-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #f97316 0%, #fb923c 50%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
    </div>
  );
}
