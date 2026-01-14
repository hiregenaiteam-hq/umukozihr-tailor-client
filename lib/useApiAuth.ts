/**
 * useApiAuth hook - Syncs Clerk authentication with our API
 * 
 * Usage: Call this hook in any component that needs authenticated API access.
 * It will automatically:
 * 1. Get the Clerk token
 * 2. Set it for API requests
 * 3. Sync the user with our backend (create/link user record)
 * 
 * Gracefully handles when Clerk is not configured (legacy mode).
 */

import { useEffect, useCallback, useState } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { setAuthToken, auth } from './api';

// Check if Clerk is properly configured (not placeholder keys)
const isClerkConfigured = typeof window !== 'undefined' && 
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_') &&
  !process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.includes('your_publishable_key');

export function useApiAuth() {
  const [isSynced, setIsSynced] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Only use Clerk hooks if configured (prevents errors when Clerk isn't set up)
  let clerkAuth: any = { getToken: null, isSignedIn: false, isLoaded: true };
  let clerkUser: any = { user: null };
  
  try {
    clerkAuth = useAuth();
    clerkUser = useUser();
  } catch (e) {
    // Clerk not configured - use fallback values
  }
  
  const { getToken, isSignedIn, isLoaded } = clerkAuth;
  const { user } = clerkUser;

  // Sync Clerk token to API client
  const syncToken = useCallback(async () => {
    // If Clerk isn't configured, use legacy auth
    if (!isClerkConfigured) {
      setIsLoading(false);
      setIsSynced(true);
      return;
    }
    
    if (!isLoaded) return;
    
    if (isSignedIn) {
      try {
        const token = await getToken();
        setAuthToken(token);
        
        // Sync user with our backend (creates user if not exists, links if email matches)
        if (!isSynced) {
          try {
            await auth.clerkSync();
            setIsSynced(true);
          } catch (error) {
            console.error('Failed to sync user with backend:', error);
            // Don't block - user might still work
            setIsSynced(true);
          }
        }
      } catch (error) {
        console.error('Failed to get Clerk token:', error);
        setAuthToken(null);
      }
    } else {
      setAuthToken(null);
      setIsSynced(false);
    }
    setIsLoading(false);
  }, [getToken, isSignedIn, isLoaded, isSynced]);

  useEffect(() => {
    syncToken();
  }, [syncToken]);

  // Re-sync when user changes (e.g., after sign-in)
  useEffect(() => {
    if (user?.id) {
      setIsSynced(false);
      syncToken();
    }
  }, [user?.id, syncToken]);

  return {
    isLoaded,
    isSignedIn,
    isSynced,
    isLoading,
    user,
    refreshToken: syncToken,
  };
}

export default useApiAuth;
