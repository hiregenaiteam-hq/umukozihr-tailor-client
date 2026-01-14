import { useState, useEffect } from 'react';
import { SignIn, SignUp } from '@clerk/nextjs';
import { X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'sign-in' | 'sign-up';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'sign-in' }: AuthModalProps) {
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>(defaultMode);

  useEffect(() => {
    setMode(defaultMode);
  }, [defaultMode]);

  // Prevent scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      
      {/* Modal Container */}
      <div 
        className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/60 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Tab Switcher */}
        <div className="flex mb-4 bg-stone-900/80 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
          <button
            onClick={() => setMode('sign-in')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              mode === 'sign-in'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('sign-up')}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-300 ${
              mode === 'sign-up'
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Clerk Component */}
        <div className="bg-stone-900/95 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          {mode === 'sign-in' ? (
            <SignIn
              routing="path"
              path="/sign-in"
              afterSignInUrl="/app"
              appearance={{
                layout: {
                  socialButtonsPlacement: 'top',
                  showOptionalFields: false,
                  logoPlacement: 'none',
                },
                elements: {
                  rootBox: 'w-full flex justify-center',
                  card: 'bg-transparent shadow-none border-none p-6 pt-8 w-full',
                  main: 'w-full',
                  form: 'w-full gap-4',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtons: 'gap-3 w-full',
                  socialButtonsBlockButton: 'bg-stone-800 border border-stone-600 text-white hover:bg-stone-700 hover:border-stone-500 transition-all rounded-xl py-3 w-full',
                  socialButtonsBlockButtonText: 'font-medium',
                  socialButtonsProviderIcon: 'w-5 h-5',
                  dividerLine: 'bg-stone-700',
                  dividerText: 'text-stone-500 bg-stone-900',
                  dividerRow: 'w-full',
                  formFieldLabel: 'text-stone-300 font-medium',
                  formFieldInput: 'bg-stone-800 border-stone-600 text-white placeholder-stone-500 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 w-full',
                  formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 rounded-xl py-3 w-full',
                  footerActionLink: 'text-orange-400 hover:text-orange-300',
                  footerActionText: 'text-stone-400',
                  identityPreviewEditButton: 'text-orange-400',
                  formFieldInputShowPasswordButton: 'text-stone-400 hover:text-white',
                  footer: 'hidden',
                  logoBox: 'hidden',
                  logoImage: 'hidden',
                  formFieldRow: 'mb-4 w-full',
                  formField: 'w-full',
                }
              }}
            />
          ) : (
            <SignUp
              routing="path"
              path="/sign-up"
              afterSignUpUrl="/onboarding"
              appearance={{
                layout: {
                  socialButtonsPlacement: 'top',
                  showOptionalFields: false,
                  logoPlacement: 'none',
                },
                elements: {
                  rootBox: 'w-full flex justify-center',
                  card: 'bg-transparent shadow-none border-none p-6 pt-8 w-full',
                  main: 'w-full',
                  form: 'w-full gap-4',
                  headerTitle: 'hidden',
                  headerSubtitle: 'hidden',
                  socialButtons: 'gap-3 w-full',
                  socialButtonsBlockButton: 'bg-stone-800 border border-stone-600 text-white hover:bg-stone-700 hover:border-stone-500 transition-all rounded-xl py-3 w-full',
                  socialButtonsBlockButtonText: 'font-medium',
                  socialButtonsProviderIcon: 'w-5 h-5',
                  dividerLine: 'bg-stone-700',
                  dividerText: 'text-stone-500 bg-stone-900',
                  dividerRow: 'w-full',
                  formFieldLabel: 'text-stone-300 font-medium',
                  formFieldInput: 'bg-stone-800 border-stone-600 text-white placeholder-stone-500 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 w-full',
                  formButtonPrimary: 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 rounded-xl py-3 w-full',
                  footerActionLink: 'text-orange-400 hover:text-orange-300',
                  footerActionText: 'text-stone-400',
                  identityPreviewEditButton: 'text-orange-400',
                  formFieldInputShowPasswordButton: 'text-stone-400 hover:text-white',
                  footer: 'hidden',
                  logoBox: 'hidden',
                  logoImage: 'hidden',
                  formFieldRow: 'mb-4 w-full',
                  formField: 'w-full',
                }
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
