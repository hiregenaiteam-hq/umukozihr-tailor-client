/**
 * Application configuration
 * Centralizes environment variables and configuration constants
 */

// Auto-detect API URL based on environment
function getApiBaseUrl(): string {
  // If explicitly set via env var, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  // Client-side detection using window.location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;

    // Production: custom domain or main Vercel domain
    if (hostname === 'tailor.umukozihr.com' || hostname === 'umukozihr-tailor.vercel.app') {
      return 'https://rj9pxkmkmn.eu-west-1.awsapprunner.com';
    }

    // Preview deployments on Vercel (e.g., umukozihr-tailor-xxx.vercel.app)
    if (hostname.endsWith('.vercel.app')) {
      return 'https://rj9pxkmkmn.eu-west-1.awsapprunner.com';
    }
  }

  // Server-side rendering fallback - always use production
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://rj9pxkmkmn.eu-west-1.awsapprunner.com';
  } else if (process.env.VERCEL_ENV === 'preview') {
    return 'https://rj9pxkmkmn.eu-west-1.awsapprunner.com';
  }

  // Default to AWS App Runner (no localhost)
  return 'https://rj9pxkmkmn.eu-west-1.awsapprunner.com';
}

export const config = {
  // API Base URL - call getApiBaseUrl() to get current value
  get apiUrl() {
    return getApiBaseUrl();
  },

  // Application version
  version: '1.3.0',

  // Feature flags (can be environment-based in future)
  features: {
    enableDarkMode: true,
    enableProfileVersioning: true,
    enableHistoryTracking: true,
  }
};

/**
 * Get full URL for an artifact path
 * @param path - Artifact path (e.g., "/artifacts/resume.pdf")
 * @returns Full URL including API base
 */
export function getArtifactUrl(path: string): string {
  return `${getApiBaseUrl()}${path}`;
}
