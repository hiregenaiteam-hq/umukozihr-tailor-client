import { useEffect, useState, type ReactNode } from "react";
import { X, Crown, Sparkles, Check, Zap, Mail, Layers, Download } from "lucide-react";
import { useRouter } from "next/router";
import { subscription } from "../lib/api";
import { PLAN_DISPLAY, UpgradeModalTrigger } from "../lib/subscription-ui";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: UpgradeModalTrigger;
  remaining?: number;
}

interface ModalConfig {
  title: string;
  subtitle: string;
  description?: string;
  icon: ReactNode;
  featureTitle: string;
  features: string[];
  primaryLabel: string;
  secondaryLabel: string;
  primaryAction: "settings" | "pricing" | "upgrade";
  targetTier?: "launch" | "bounty";
}

function getModalConfig(trigger: UpgradeModalTrigger, remaining: number): ModalConfig {
  switch (trigger) {
    case "verification_required":
      return {
        title: "Verify your email to continue",
        subtitle: "Email verification is required before document generation is unlocked.",
        description: "Once verified, you can use your monthly generation allowance immediately.",
        icon: <Mail className="w-8 h-8 text-sky-400" />,
        featureTitle: "Before you generate",
        features: [
          "Check your inbox for the verification email",
          "Verified Free accounts can generate once every 30 days",
          "Paid plans also require a verified account before use",
        ],
        primaryLabel: "Open Settings",
        secondaryLabel: "Close",
        primaryAction: "settings",
      };
    case "free_limit_reached":
      return {
        title: "Your free generation is used",
        subtitle: "Free accounts include 1 completed generation every 30 days.",
        description: remaining > 0 ? `You still have ${remaining} generation available.` : "Upgrade for more room this month.",
        icon: <Zap className="w-8 h-8 text-amber-400" />,
        featureTitle: "Launch includes",
        features: PLAN_DISPLAY.launch.highlights,
        primaryLabel: "Upgrade to Launch",
        secondaryLabel: "Maybe later",
        primaryAction: "upgrade",
        targetTier: "launch",
      };
    case "launch_limit_reached":
      return {
        title: "You have reached your Launch limit",
        subtitle: "Launch is capped for focused single-job usage.",
        description: "Move to Bounty for unlimited generations and the full workflow toolkit.",
        icon: <Sparkles className="w-8 h-8 text-orange-400" />,
        featureTitle: "Bounty includes",
        features: PLAN_DISPLAY.bounty.highlights,
        primaryLabel: "Upgrade to Bounty",
        secondaryLabel: "Maybe later",
        primaryAction: "upgrade",
        targetTier: "bounty",
      };
    case "batch_upload":
      return {
        title: "Batch upload is part of Bounty",
        subtitle: "Upload and tailor multiple jobs at once on the top tier.",
        description: "Bounty is built for higher-volume application workflows.",
        icon: <Layers className="w-8 h-8 text-orange-400" />,
        featureTitle: "Bounty includes",
        features: PLAN_DISPLAY.bounty.highlights,
        primaryLabel: "Upgrade to Bounty",
        secondaryLabel: "Keep single-job flow",
        primaryAction: "upgrade",
        targetTier: "bounty",
      };
    case "zip_download":
      return {
        title: "ZIP downloads are part of Bounty",
        subtitle: "Bundle multiple tailored documents into one download.",
        description: "Use Bounty when you need batch output and faster workflow handling.",
        icon: <Download className="w-8 h-8 text-orange-400" />,
        featureTitle: "Bounty includes",
        features: PLAN_DISPLAY.bounty.highlights,
        primaryLabel: "Upgrade to Bounty",
        secondaryLabel: "Close",
        primaryAction: "upgrade",
        targetTier: "bounty",
      };
    default:
      return {
        title: "Choose a plan that fits your search",
        subtitle: "Launch covers steady single-job use. Bounty unlocks the full workflow.",
        description: "Upgrade whenever you need more output or advanced tools.",
        icon: <Crown className="w-8 h-8 text-orange-400" />,
        featureTitle: "Available paid plans",
        features: [
          "Launch: 10 generations every 30 days for $10/month",
          "Bounty: unlimited generations for $20/month",
          "Bounty adds batch upload, ZIP download, priority queue, and extra templates",
        ],
        primaryLabel: "View plans",
        secondaryLabel: "Close",
        primaryAction: "pricing",
      };
  }
}

export function UpgradeModal({
  isOpen,
  onClose,
  trigger = "general",
  remaining = 0,
}: UpgradeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    subscription.trackUpgradeImpression(trigger, remaining).catch(() => {
      // Non-blocking analytics
    });
  }, [isOpen, trigger, remaining]);

  if (!isOpen) return null;

  const config = getModalConfig(trigger, remaining);

  const handlePrimaryAction = async () => {
    if (config.primaryAction === "settings") {
      router.push("/settings");
      onClose();
      return;
    }

    if (config.primaryAction === "pricing" || !config.targetTier) {
      router.push("/pricing");
      onClose();
      return;
    }

    setLoading(true);

    try {
      const response = await subscription.createUpgradeIntent(config.targetTier);
      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
        return;
      }

      router.push("/pricing");
      onClose();
    } catch (error) {
      router.push("/pricing");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const targetTierMeta =
    config.targetTier === "launch"
      ? PLAN_DISPLAY.launch
      : config.targetTier === "bounty"
      ? PLAN_DISPLAY.bounty
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-orange-500/20 rounded-2xl mb-4">
            {config.icon}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{config.title}</h2>
          <p className="text-gray-300 mb-1">{config.subtitle}</p>
          {config.description && (
            <p className="text-gray-400 text-sm">{config.description}</p>
          )}
        </div>

        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-orange-400" />
              <span className="font-medium text-white">{config.featureTitle}</span>
            </div>
            {targetTierMeta && (
              <span className="text-xs text-stone-400">
                ${targetTierMeta.monthlyPrice}/month
              </span>
            )}
          </div>
          <ul className="space-y-2">
            {config.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handlePrimaryAction}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 disabled:opacity-70"
          >
            {loading ? (
              "Processing..."
            ) : config.targetTier === "bounty" ? (
              <>
                <Crown className="w-4 h-4" />
                {config.primaryLabel}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {config.primaryLabel}
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 text-gray-400 hover:text-white transition-colors"
          >
            {config.secondaryLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<UpgradeModalTrigger>("general");
  const [remaining, setRemaining] = useState<number>(0);

  const showUpgrade = (
    triggerType: UpgradeModalTrigger = "general",
    remainingCount: number = 0
  ) => {
    setTrigger(triggerType);
    setRemaining(remainingCount);
    setIsOpen(true);
  };

  const hideUpgrade = () => {
    setIsOpen(false);
  };

  return {
    isOpen,
    trigger,
    remaining,
    showUpgrade,
    hideUpgrade,
    UpgradeModalComponent: () => (
      <UpgradeModal
        isOpen={isOpen}
        onClose={hideUpgrade}
        trigger={trigger}
        remaining={remaining}
      />
    ),
  };
}
