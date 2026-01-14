import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/api';
import toast from 'react-hot-toast';
import { Mail, Lock, UserPlus, LogIn, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';

// Check if Clerk is configured
const isClerkConfigured = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your_publishable_key');

interface LoginFormProps {
  onLogin: (token: string) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // If Clerk is configured, show OAuth buttons that redirect to Clerk pages
  if (isClerkConfigured) {
    return (
      <div className="w-full">
        {/* Sign In / Sign Up Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => router.push('/sign-in')}
            className="btn-primary w-full flex items-center justify-center gap-3 group"
          >
            <LogIn className="h-5 w-5" />
            <span>Sign In</span>
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => router.push('/sign-up')}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 bg-white/5 hover:bg-white/10 text-white border border-white/10 hover:border-white/20"
          >
            <UserPlus className="h-5 w-5" />
            <span>Create Account</span>
          </button>
        </div>

        {/* OAuth providers hint */}
        <div className="mt-6 text-center">
          <p className="text-stone-400 text-sm">
            Sign in with Google, Apple, LinkedIn, or Email
          </p>
        </div>
      </div>
    );
  }

  // Legacy form for when Clerk is not configured

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading(
      isLogin ? 'Signing you in...' : 'Creating your account...'
    );

    try {
      const response = isLogin
        ? await auth.login(formData.email, formData.password)
        : await auth.signup(formData.email, formData.password);

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);

      toast.success(
        isLogin ? 'Welcome back!' : 'Account created successfully!',
        { id: loadingToast }
      );

      onLogin(access_token);

    } catch (error: any) {
      // User-friendly error messages based on status code
      const status = error?.response?.status;
      const detail = error?.response?.data?.detail;
      
      let errorMessage: string;
      
      if (status === 500 || status === 503) {
        // Server/DB errors - don't show technical details
        errorMessage = 'Our servers are temporarily unavailable. Please try again in a few minutes.';
      } else if (status === 401) {
        errorMessage = isLogin ? 'Invalid email or password' : 'Unable to create account';
      } else if (status === 409) {
        errorMessage = 'An account with this email already exists';
      } else if (status === 422) {
        errorMessage = detail || 'Please check your email and password format';
      } else if (status === 429) {
        errorMessage = 'Too many attempts. Please wait a moment and try again.';
      } else if (!error?.response) {
        // Network error
        errorMessage = 'Unable to connect. Please check your internet connection.';
      } else {
        errorMessage = detail || (isLogin ? 'Login failed' : 'Signup failed');
      }
      
      toast.error(errorMessage, { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Toggle Buttons */}
      <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl mb-8">
        <button
          type="button"
          onClick={() => setIsLogin(true)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
            isLogin
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <LogIn className="h-4 w-4" />
          <span>Sign In</span>
        </button>
        <button
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${
            !isLogin
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <UserPlus className="h-4 w-4" />
          <span>Sign Up</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-300">
            Email Address
          </label>
          <div className={`relative group transition-all duration-300 ${
            focusedField === 'email' ? 'scale-[1.02]' : ''
          }`}>
            <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
              focusedField === 'email' 
                ? 'opacity-100 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-xl' 
                : 'opacity-0'
            }`} />
            <div className="relative">
              <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                focusedField === 'email' ? 'text-orange-400' : 'text-stone-500'
              }`} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className="input-glass pl-12 pr-4"
                placeholder="your@email.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-stone-300">
            Password
          </label>
          <div className={`relative group transition-all duration-300 ${
            focusedField === 'password' ? 'scale-[1.02]' : ''
          }`}>
            <div className={`absolute inset-0 rounded-xl transition-opacity duration-300 ${
              focusedField === 'password' 
                ? 'opacity-100 bg-gradient-to-r from-orange-500/20 to-amber-500/20 blur-xl' 
                : 'opacity-0'
            }`} />
            <div className="relative">
              <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${
                focusedField === 'password' ? 'text-orange-400' : 'text-stone-500'
              }`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className="input-glass pl-12 pr-12"
                placeholder="Enter your password"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-stone-500 hover:text-orange-400 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
          {!isLogin && (
            <p className="text-xs text-stone-500 mt-1">
              Must be at least 6 characters
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`btn-primary w-full flex items-center justify-center gap-3 group ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{isLogin ? 'Signing In...' : 'Creating Account...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-8">
        <div className="divider" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#1c1917] px-4 text-sm text-stone-500">
          or continue with
        </span>
      </div>

      {/* Social hint */}
      <p className="text-center text-stone-500 text-sm">
        More login options coming soon
      </p>
    </div>
  );
}
