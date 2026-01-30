/**
 * TypeScript types for UmukoziHR Resume Tailor v1.3
 */

// v1.3 Profile Schema

export interface Basics {
  full_name: string;
  headline: string;
  summary: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  links: string[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  keywords: string[];
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  start: string; // YYYY-MM format
  end: string; // YYYY-MM or "present"
  employment_type: string;
  bullets: string[];
}

export interface Education {
  school: string;
  degree: string;
  start: string;
  end: string;
  gpa: string | null;
}

export interface Project {
  name: string;
  url: string;
  stack: string[];
  bullets: string[];
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
}

export interface Award {
  name: string;
  by: string;
  date: string;
}

export interface Language {
  name: string;
  level: string;
}

export interface Preferences {
  regions: ('US' | 'EU' | 'GL')[];
  templates: string[];
}

// LinkedIn-enriched talent data (UmukoziHR Talent Rich!)
export interface Volunteering {
  organization: string;
  role: string;
  cause?: string;
  start?: string;
  end?: string;
  description?: string;
}

export interface Publication {
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  description?: string;
}

export interface Course {
  name: string;
  number?: string;
  associated_with?: string;
}

export interface LinkedInMeta {
  linkedin_url?: string;
  linkedin_id?: string;
  photo_url?: string;
  open_to_work?: boolean;
  hiring?: boolean;
  premium?: boolean;
  verified?: boolean;
  influencer?: boolean;
  connections_count?: number;
  followers_count?: number;
  registered_at?: string;
  current_company?: string;
  industry?: string;
}

export interface ProfileV3 {
  basics: Basics;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
  awards: Award[];
  languages: Language[];
  // LinkedIn-enriched sections
  volunteering?: Volunteering[];
  publications?: Publication[];
  courses?: Course[];
  linkedin_meta?: LinkedInMeta;
  // Standard fields
  preferences: Preferences;
  version?: number;
  updated_at?: string;
}

// API Response types

export interface ProfileResponse {
  profile: ProfileV3;
  version: number;
  completeness: number;
  updated_at: string;
}

export interface ProfileUpdateResponse {
  success: boolean;
  version: number;
  completeness: number;
  message: string;
}

export interface CompletenessResponse {
  completeness: number;
  breakdown: {
    basics: number;
    experience: number;
    education: number;
    projects: number;
    skills: number;
    links: number;
  };
  missing_fields: string[];
}

export interface JDFetchResponse {
  success: boolean;
  jd_text?: string;
  company?: string;
  title?: string;
  region?: string;
  message: string;
}

export interface HistoryItem {
  run_id: string;
  job_id: string;
  company: string;
  title: string;
  job_title?: string; // Alias for title
  region: string;
  status: string;
  profile_version?: number;
  artifacts_urls: {
    resume_pdf?: string;
    cover_letter_pdf?: string;
    resume_tex?: string;
    cover_letter_tex?: string;
    resume_docx?: string;  // Word document for editing
    cover_letter_docx?: string;  // Word document for editing
    pdf_compilation?: {
      resume_success: boolean;
      cover_letter_success: boolean;
    };
    [key: string]: any;
  };
  created_at: string;
  // Job landing celebration fields
  job_landed?: boolean;
  landed_at?: string;
  // Gamification: Interview & Offer tracking (v1.6)
  got_interview?: boolean;
  interview_at?: string;
  got_offer?: boolean;
  offer_at?: string;
}

export interface HistoryResponse {
  runs: HistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

// Helper function to create empty profile
export const createEmptyProfile = (): ProfileV3 => ({
  basics: {
    full_name: '',
    headline: '',
    summary: '',
    location: '',
    email: '',
    phone: '',
    website: '',
    links: []
  },
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  awards: [],
  languages: [],
  volunteering: [],
  publications: [],
  courses: [],
  linkedin_meta: undefined,
  preferences: {
    regions: ['US'],
    templates: ['minimal']
  }
});


// =============================================
// Gamification System Types (v1.6)
// =============================================

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  tier: 'tier_1' | 'tier_2' | 'tier_3';
  xp: number;
  color: string;
  unlocked: boolean;
  unlocked_at?: string;
  pro_only: boolean;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  target: number;
  current: number;
  xp: number;
  period: 'weekly' | 'monthly';
  ends_at: string;
  completed: boolean;
  pro_only: boolean;
}

export interface JourneyStats {
  applications: number;
  interviews: number;
  offers: number;
  landed: number;
  current_streak: number;
  longest_streak: number;
  total_xp: number;
}

export interface JourneyResponse {
  stats: JourneyStats;
  achievements: Achievement[];
  active_challenges: Challenge[];
  recently_unlocked: Achievement[];
}

export interface MarkMilestoneResponse {
  success: boolean;
  company: string;
  title: string;
  milestone_type: 'interview' | 'offer';
  marked_at: string;
  total_count: number;
  new_achievements: Achievement[];
  xp_earned: number;
  message: string;
  linkedin_share_url: string;
  linkedin_share_text: string;
}
