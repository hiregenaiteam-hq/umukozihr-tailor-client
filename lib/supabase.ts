/**
 * Supabase Client Configuration
 * 
 * For Google OAuth:
 * 1. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local
 * 2. Configure Google OAuth in Supabase Dashboard > Auth > Providers
 * 3. Add your redirect URL to Google Cloud Console
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase'));

// Create Supabase client (browser-side)
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// Sign in with Google OAuth
export async function signInWithGoogle() {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: typeof window !== 'undefined' 
        ? `${window.location.origin}/auth/callback`
        : undefined,
    },
  });
  
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
  localStorage.removeItem('token');
}

// Get current session
export async function getSession() {
  if (!supabase) return null;
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

// Get current user
export async function getUser() {
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
