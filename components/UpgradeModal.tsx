import { useState } from "react";
import { X, Crown, Sparkles, Check, Lock, Zap } from "lucide-react";
import { useRouter } from "next/router";
import { subscription } from "../lib/api";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  trigger?: "limit_reached" | "batch_upload" | "zip_download" | "general";
  remaining?: number;
}

export function UpgradeModal({ isOpen, onClose, trigger = "general", remaining = 0 }: UpgradeModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDormant, setIsDormant] = useState(true);

  // Check if system is live on mount
  useState(() => {
    subscription.getStatus().then(res => {
      setIsDormant(!res.data.is_live);
    }).catch(() => {});
  });

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      const response = await subscription.createUpgradeIntent("pro", "monthly");
      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      } else {
        // Payment not configured - go to pricing page for info
        router.push("/pricing");
        onClose();
      }
    } catch (error) {
      router.push("/pricing");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const getMessage = () => {
    switch (trigger) {
      case "limit_reached":
        return {
          title: "You've Hit Your Limit",
          subtitle: "Upgrade to Pro for unlimited tailored resumes",
          icon: <Zap className="w-8 h-8 text-amber-400" />,
        };
      case "batch_upload":
        return {
          title: "Batch Upload is a Pro Feature",
          subtitle: "Upload multiple job descriptions at once",
          icon: <Sparkles className="w-8 h-8 text-orange-400" />,
        };
      case "zip_download":
        return {
          title: "ZIP Download is a Pro Feature",
          subtitle: "Download all your documents in one click",
          icon: <Sparkles className="w-8 h-8 text-orange-400" />,
        };
      default:
        return {
          title: "Upgrade to Pro",
          subtitle: "Unlock the full power of UmukoziHR Tailor",
          icon: <Crown className="w-8 h-8 text-orange-400" />,
        };
    }
  };

  const message = getMessage();

  const proFeatures = [
    "Unlimited tailored resumes",
    "Batch job description upload",
    "Download all as ZIP",
    "Priority generation queue",
    "All resume templates",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gray-800 rounded-2xl border border-gray-700 max-w-md w-full p-6 shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-orange-500/20 rounded-2xl mb-4">
            {message.icon}
          </div>
          <h2 className="text-xl font-bold text-white mb-2">{message.title}</h2>
          <p className="text-gray-400">{message.subtitle}</p>
          
          {trigger === "limit_reached" && remaining !== undefined && remaining <= 0 && (
            <p className="mt-2 text-sm text-red-400">
              You've used all 5 free resumes this month
            </p>
          )}
        </div>

        {/* Pro Features */}
        <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-5 h-5 text-orange-400" />
            <span className="font-medium text-white">Pro includes:</span>
          </div>
          <ul className="space-y-2">
            {proFeatures.map((feature, i) => (
              <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Dormant notice */}
        {isDormant && (
          <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-amber-400 text-sm">
              Payment system coming soon. Enjoy unlimited access for now!
            </p>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all ${
              isDormant
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
            }`}
          >
            {isDormant ? (
              <>
                <Lock className="w-4 h-4" />
                Coming Soon
              </>
            ) : loading ? (
              "Processing..."
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Upgrade to Pro
              </>
            )}
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 text-gray-400 hover:text-white transition-colors"
          >
            {isDormant ? "Continue with Free" : "Maybe Later"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easy usage
export function useUpgradeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<"limit_reached" | "batch_upload" | "zip_download" | "general">("general");
  const [remaining, setRemaining] = useState<number>(0);

  const showUpgrade = (
    triggerType: "limit_reached" | "batch_upload" | "zip_download" | "general" = "general",
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
