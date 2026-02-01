/**
 * Supabase OAuth Callback Handler
 * 
 * This page handles the redirect from Google OAuth.
 * It exchanges the auth code for a session and syncs with our backend.
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { auth, profile as profileApi } from '../../lib/api';
import { Sparkles } from 'lucide-react';

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState('Processing sign in...');
  const [error, setError] = useState<string | null>(null);
  const syncAttemptedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (!isSupabaseConfigured || !supabase) {
        setError('Authentication not configured');
        return;
      }

      try {
        // Get the session from URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }

        if (!session) {
          // No session yet, wait for redirect to complete
          setStatus('Completing authentication...');
          
          // Listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session && !syncAttemptedRef.current) {
              syncAttemptedRef.current = true;
              await syncUserAndRedirect(session);
              subscription.unsubscribe();
            }
          });
          
          return;
        }

        // Session exists, sync immediately (but only once)
        if (!syncAttemptedRef.current) {
          syncAttemptedRef.current = true;
          await syncUserAndRedirect(session);
        }
      } catch (err: any) {
        console.error('Auth callback error:', err);
        setError(err.message || 'Authentication failed');
      }
    };

    const syncUserAndRedirect = async (session: any) => {
      setStatus('Syncing your account...');

      try {
        // Use OAuth sync endpoint directly - it handles both new and existing users
        const syncResponse = await auth.oauthSync(session.access_token, 'google');
        localStorage.setItem('token', syncResponse.data.access_token);

        setStatus('Checking profile...');

        // Check if user has profile
        try {
          const profileResponse = await profileApi.get();
          if (profileResponse.data.profile) {
            router.push('/app');
          } else {
            router.push('/onboarding');
          }
        } catch (profileError: any) {
          if (profileError.response?.status === 404) {
            router.push('/onboarding');
          } else {
            router.push('/app');
          }
        }
      } catch (err: any) {
        console.error('Sync error:', err);
        setError(err.message || 'Failed to sync account');
      }
    };

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-3xl">!</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Authentication Failed</h1>
          <p className="text-stone-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
          <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 animate-spin" />
          <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-orange-400" />
        </div>
        <p className="text-stone-400">{status}</p>
      </div>
    </div>
  );
}
