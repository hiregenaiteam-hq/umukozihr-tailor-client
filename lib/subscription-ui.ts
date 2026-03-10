import { SubscriptionPlan, SubscriptionStatus } from './api';

export type NormalizedSubscriptionTier = 'free' | 'launch' | 'bounty';
export type UpgradeModalTrigger =
  | 'verification_required'
  | 'free_limit_reached'
  | 'launch_limit_reached'
  | 'batch_upload'
  | 'zip_download'
  | 'general';

export interface PlanDisplayMeta {
  tier: NormalizedSubscriptionTier;
  name: string;
  description: string;
  monthlyPrice: number;
  highlights: string[];
  cta: string;
}

export const PLAN_ORDER: NormalizedSubscriptionTier[] = ['free', 'launch', 'bounty'];

export const PLAN_DISPLAY: Record<NormalizedSubscriptionTier, PlanDisplayMeta> = {
  free: {
    tier: 'free',
    name: 'Free',
    description: 'For trying UmukoziHR Tailor before you commit.',
    monthlyPrice: 0,
    highlights: [
      '1 tailored document generation every 30 days',
      'Single job flow',
      'Profile building and imports included',
      'Email verification required before generation',
    ],
    cta: 'Stay on Free',
  },
  launch: {
    tier: 'launch',
    name: 'Launch',
    description: 'For consistent single-job applications without workflow extras.',
    monthlyPrice: 10,
    highlights: [
      '10 tailored document generations every 30 days',
      'Single job flow',
      'Fast, focused generation for active applicants',
      'Upgrade to Bounty for batch workflows and ZIP export',
    ],
    cta: 'Choose Launch',
  },
  bounty: {
    tier: 'bounty',
    name: 'Bounty',
    description: 'For heavy job search workflows and higher-volume output.',
    monthlyPrice: 20,
    highlights: [
      'Unlimited tailored document generations',
      'Batch upload for multi-job tailoring',
      'ZIP downloads, priority queue, and extra templates',
      'Built for full workflow usage',
    ],
    cta: 'Choose Bounty',
  },
};

export function normalizeSubscriptionTier(
  tier?: string | null,
  isPro?: boolean
): NormalizedSubscriptionTier {
  const normalizedTier = String(tier || '').toLowerCase();

  if (normalizedTier === 'free' || normalizedTier === 'launch' || normalizedTier === 'bounty') {
    return normalizedTier;
  }

  if (normalizedTier === 'pro' || isPro) {
    return 'bounty';
  }

  return 'free';
}

export function getSubscriptionTierMeta(
  statusOrTier?: Pick<SubscriptionStatus, 'tier' | 'is_pro'> | NormalizedSubscriptionTier | null
): PlanDisplayMeta {
  if (!statusOrTier) {
    return PLAN_DISPLAY.free;
  }

  if (typeof statusOrTier === 'string') {
    return PLAN_DISPLAY[normalizeSubscriptionTier(statusOrTier)];
  }

  return PLAN_DISPLAY[normalizeSubscriptionTier(statusOrTier.tier, statusOrTier.is_pro)];
}

export function getNextUpgradeTier(
  statusOrTier?: Pick<SubscriptionStatus, 'tier' | 'is_pro'> | NormalizedSubscriptionTier | null
): 'launch' | 'bounty' {
  const tierMeta = getSubscriptionTierMeta(statusOrTier);
  return tierMeta.tier === 'free' ? 'launch' : 'bounty';
}

export function sortSubscriptionPlans<T extends { tier: string }>(plans: T[]): T[] {
  const tierRank = new Map(PLAN_ORDER.map((tier, index) => [tier, index]));

  return [...plans].sort((a, b) => {
    const aRank = tierRank.get(normalizeSubscriptionTier(a.tier)) ?? Number.MAX_SAFE_INTEGER;
    const bRank = tierRank.get(normalizeSubscriptionTier(b.tier)) ?? Number.MAX_SAFE_INTEGER;
    return aRank - bRank;
  });
}

export function buildDisplayPlan(_plan: SubscriptionPlan | undefined, tier: NormalizedSubscriptionTier) {
  const fallback = PLAN_DISPLAY[tier];
  return {
    ...fallback,
    description: fallback.description,
    features: fallback.highlights,
    monthlyPrice: fallback.monthlyPrice,
  };
}
