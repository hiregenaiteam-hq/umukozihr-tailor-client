import axios from 'axios';

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
      return 'https://umukozihr-tailor-api.onrender.com';
    }

    // Preview deployments on Vercel (e.g., umukozihr-tailor-xxx.vercel.app)
    if (hostname.endsWith('.vercel.app')) {
      return 'https://umukozihr-tailor-api-staging.onrender.com';
    }
  }

  // Server-side rendering fallback - always use production
  if (process.env.VERCEL_ENV === 'production') {
    return 'https://umukozihr-tailor-api.onrender.com';
  } else if (process.env.VERCEL_ENV === 'preview') {
    return 'https://umukozihr-tailor-api-staging.onrender.com';
  }

  // Default to production Render URL (no localhost)
  return 'https://umukozihr-tailor-api.onrender.com';
}

// Create axios instance with dynamic baseURL and timeout
export const api = axios.create({
  baseURL: '/api/v1',  // Will be set dynamically
  timeout: 120000,  // 2 minute timeout for slow Render free tier
});

// Add request interceptor for auth and logging
api.interceptors.request.use(
  (config) => {
    // Set baseURL dynamically on each request
    const apiBaseUrl = getApiBaseUrl();
    config.baseURL = `${apiBaseUrl}/api/v1`;

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log outgoing request
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      data: config.data,
      params: config.params,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? '[REDACTED]' : undefined
      }
    });

    return config;
  },
  (error) => {
    console.error('❌ API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  (response) => {
    // Log successful response
    console.log('✅ API Response:', {
      method: response.config.method?.toUpperCase(),
      url: response.config.url,
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    // Log error response
    console.error('❌ API Error Response:', {
      method: error.config?.method?.toUpperCase(),
      url: error.config?.url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorMessage: error.message,
      responseData: error.response?.data,
      requestData: error.config?.data
    });
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  signup: (email: string, password: string) =>
    api.post('/auth/signup', { email, password }),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password })
};

// Profile endpoints (v1.3)
export const profile = {
  // v1.3: Get saved profile from database
  get: () =>
    api.get('/profile'),

  // v1.3: Update profile with versioning
  update: (profileData: any) =>
    api.put('/profile', { profile: profileData }),

  // v1.3: Get completeness score
  getCompleteness: () =>
    api.get('/profile/me/completeness'),

  // v1.5: Delete profile and account permanently
  delete: () =>
    api.delete('/profile'),

  // Legacy v1.2: Save profile to file (deprecated)
  save: (profileData: any) =>
    api.post('/profile/profile', profileData)
};

// Generation endpoints
export const generation = {
  // Generate documents (v1.3: uses database profile for authenticated users)
  generate: (profile: any, jobs: any[]) =>
    api.post('/generate/', { profile, jobs, prefs: {} }),

  // Get generation status
  getStatus: (runId: string) =>
    api.get(`/generate/status/${runId}`)
};

// Job Description endpoints (v1.3)
export const jd = {
  // Fetch JD from URL
  fetchFromUrl: (url: string) =>
    api.post('/jd/fetch', { url })
};

// History endpoints (v1.3)
export const history = {
  // Get past runs with pagination
  list: (page: number = 1, pageSize: number = 10) =>
    api.get('/history', { params: { page, page_size: pageSize } }),

  // Re-generate from a past run
  regenerate: (runId: string) =>
    api.post(`/history/${runId}/regenerate`)
};

// Admin endpoints (v1.3 final)
export const admin = {
  // Get dashboard analytics
  getDashboard: () =>
    api.get('/admin/dashboard'),
  
  // List all users
  getUsers: (page: number = 1, pageSize: number = 20) =>
    api.get('/admin/users', { params: { page, page_size: pageSize } }),
  
  // List all generation runs
  getGenerations: (page: number = 1, pageSize: number = 20, status?: string) =>
    api.get('/admin/generations', { params: { page, page_size: pageSize, status } }),
  
  // List system errors
  getErrors: (page: number = 1, pageSize: number = 20, level: string = 'ERROR') =>
    api.get('/admin/errors', { params: { page, page_size: pageSize, level } }),
  
  // Make user admin
  makeAdmin: (userId: string) =>
    api.post(`/admin/users/${userId}/make-admin`)
};

// v1.4 Public Profile & Share endpoints
export const publicProfile = {
  // Fetch public profile by username (NO AUTH required)
  get: (username: string) =>
    api.get(`/p/${username}`),
};

export const share = {
  // Get share links and settings
  getLinks: () =>
    api.get('/profile/share'),
  
  // Get current share settings
  getSettings: () =>
    api.get('/profile/share/settings'),
  
  // Update privacy settings
  updateSettings: (isPublic: boolean) =>
    api.put('/profile/share', { is_public: isPublic }),
};

// v1.5 Resume Upload endpoint
export const upload = {
  // Upload resume file (PDF, DOCX, TXT) and extract profile data
  resume: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/profile/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// v1.4 Subscription endpoints
export interface SubscriptionStatus {
  is_live: boolean;
  tier: string;
  status: string;
  is_pro: boolean;
  started_at: string | null;
  expires_at: string | null;
  generations_used: number;
  generations_limit: number;
  generations_remaining: number;
  can_generate: boolean;
  usage_resets_at: string | null;
  features: {
    batch_upload: boolean;
    zip_download: boolean;
    priority_queue: boolean;
    profile_sharing: boolean;
    ats_keywords: boolean;
    cover_letter: boolean;
    unlimited_generations: boolean;
  };
  should_show_upgrade: boolean;
  upgrade_reason: string | null;
}

export interface SubscriptionPlan {
  tier: string;
  name: string;
  description: string;
  features: string[];
  monthly_price: number;
  is_regional_pricing: boolean;
  currency: string;
  limits: {
    monthly_generations: number;
    batch_upload: boolean;
    zip_download: boolean;
    priority_queue: boolean;
  };
}

export interface PlansResponse {
  is_live: boolean;
  payment_configured: boolean;
  plans: SubscriptionPlan[];
  user_region: string;
  is_regional_pricing: boolean;
}

export const subscription = {
  // Get current subscription status
  getStatus: () =>
    api.get<SubscriptionStatus>('/subscription/status'),
  
  // Get available plans with regional pricing
  getPlans: () =>
    api.get<PlansResponse>('/subscription/plans'),
  
  // Check if user can generate
  canGenerate: (count: number = 1) =>
    api.get<{ can_generate: boolean; is_limited: boolean; remaining: number; message: string | null }>(
      '/subscription/can-generate',
      { params: { count } }
    ),
  
  // Create upgrade intent (will return checkout URL when payment is live)
  createUpgradeIntent: (tier: string = 'pro') =>
    api.post<{ success: boolean; redirect_url: string | null; message: string; requires_payment_setup: boolean }>(
      '/subscription/upgrade-intent',
      null,
      { params: { tier } }
    ),
};