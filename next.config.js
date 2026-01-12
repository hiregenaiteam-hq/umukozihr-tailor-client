/** @type {import('next').NextConfig} */

// Auto-detect API URL based on environment
function getApiBaseUrl() {
  // If explicitly set, use that
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Vercel environment detection
  const vercelEnv = process.env.VERCEL_ENV || process.env.NODE_ENV;
  
  if (vercelEnv === 'production') {
    return 'https://rj9pxkmkmn.eu-west-1.awsapprunner.com';
  } else if (vercelEnv === 'preview') {
    return 'https://rj9pxkmkmn.eu-west-1.awsapprunner.com';
  }
  
  // Default to AWS App Runner (no localhost)
  return 'https://rj9pxkmkmn.eu-west-1.awsapprunner.com';
}

const nextConfig = {
    // Enable standalone output for Docker deployments
    output: 'standalone',
    
    async rewrites() {
      const apiUrl = getApiBaseUrl();
      return [
        { source: '/api/:path*', destination: `${apiUrl}/api/:path*` },
        { source: '/artifacts/:path*', destination: `${apiUrl}/artifacts/:path*` },
      ];
    },
  };
  module.exports = nextConfig;
  