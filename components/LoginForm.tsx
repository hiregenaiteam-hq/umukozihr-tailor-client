import { useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/api';
import { signInWithGoogle, isSupabaseConfigured } from '../lib/supabase';
import toast from 'react-hot-toast';
import { Mail, Lock, UserPlus, LogIn, Sparkles, ArrowRight, Eye, EyeOff } from 'lucide-react';

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Handle Google OAuth via Supabase
  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      toast.error('Google Sign-In is not configured');
      return;
    }
    
    setIsGoogleLoading(true);
    try {
      await signInWithGoogle();
      // Redirect happens automatically via Supabase
    } catch (error: any) {
      toast.error(error.message || 'Google Sign-In failed');
      setIsGoogleLoading(false);
    }
  };

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

      {/* Google OAuth Button */}
      {isSupabaseConfigured && (
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-xl font-semibold transition-all duration-300 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200"
        >
          {isGoogleLoading ? (
            <div className="w-5 h-5 border-2 border-stone-400 border-t-stone-800 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{isGoogleLoading ? 'Connecting...' : 'Continue with Google'}</span>
        </button>
      )}
    </div>
  );
}
