import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Check if Clerk is properly configured (not placeholder keys)
const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured = clerkPubKey && 
  clerkPubKey.startsWith('pk_') && 
  !clerkPubKey.includes('your_publishable_key');

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',                      // Landing page
  '/pricing',               // Pricing page
  '/sign-in(.*)',           // Sign in pages
  '/sign-up(.*)',           // Sign up pages
  '/p/(.*)',                // Public profile pages (/p/username)
  '/api/webhooks/(.*)',     // Webhook endpoints
]);

// Clerk middleware for when Clerk is configured
const clerkHandler = clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

// Fallback middleware for when Clerk is not configured (legacy mode)
function legacyMiddleware(request: NextRequest) {
  // In legacy mode, just pass through - auth is handled client-side
  return NextResponse.next();
}

// Export the appropriate middleware based on configuration
export default function middleware(request: NextRequest) {
  if (isClerkConfigured) {
    // Use Clerk middleware
    return clerkHandler(request as any, {} as any);
  }
  return legacyMiddleware(request);
}

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
