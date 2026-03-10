import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  Crown,
  Zap,
  ArrowLeft,
  HelpCircle,
  CreditCard,
  Shield,
  Layers,
  Mail,
} from "lucide-react";
import { HeaderLogo } from "../components/Logo";
import { subscription, SubscriptionPlan } from "../lib/api";
import {
  PLAN_ORDER,
  buildDisplayPlan,
  normalizeSubscriptionTier,
  sortSubscriptionPlans,
} from "../lib/subscription-ui";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

interface PricingPageState {
  loading: boolean;
  error: string | null;
  plans: SubscriptionPlan[];
  checkoutReady: boolean;
  upgradeLoadingTier: string | null;
  currentTier: "free" | "launch" | "bounty" | null;
  isVerified: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [state, setState] = useState<PricingPageState>({
    loading: true,
    error: null,
    plans: [],
    checkoutReady: true,
    upgradeLoadingTier: null,
    currentTier: null,
    isVerified: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    fetchPricingData();
  }, [router]);

  const fetchPricingData = async () => {
    const [plansResult, statusResult] = await Promise.allSettled([
      subscription.getPlans(),
      subscription.getStatus(),
    ]);

    const nextState: Partial<PricingPageState> = {
      loading: false,
      error: null,
      checkoutReady: true,
    };

    if (plansResult.status === "fulfilled") {
      nextState.plans = sortSubscriptionPlans(plansResult.value.data.plans);
      nextState.checkoutReady = plansResult.value.data.payment_configured !== false;
    } else {
      nextState.error = "We could not load live pricing details. Showing the current plan lineup instead.";
    }

    if (statusResult.status === "fulfilled") {
      nextState.currentTier = normalizeSubscriptionTier(
        statusResult.value.data.tier,
        statusResult.value.data.is_pro
      );
      nextState.isVerified = statusResult.value.data.is_verified !== false;
    }

    setState((prev) => ({
      ...prev,
      ...nextState,
    }));
  };

  const displayPlans = useMemo(() => {
    const planMap = new Map(
      state.plans.map((plan) => [normalizeSubscriptionTier(plan.tier), plan] as const)
    );

    return PLAN_ORDER.map((tier) => buildDisplayPlan(planMap.get(tier), tier));
  }, [state.plans]);

  const handleUpgrade = async (tier: "launch" | "bounty") => {
    if (!state.checkoutReady) {
      setState((prev) => ({
        ...prev,
        error: "Checkout is temporarily unavailable. Please try again shortly.",
      }));
      return;
    }

    setState((prev) => ({ ...prev, upgradeLoadingTier: tier, error: null }));

    try {
      const response = await subscription.createUpgradeIntent(tier);
      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
        return;
      }

      setState((prev) => ({
        ...prev,
        error: "We could not start checkout right now. Please try again shortly.",
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: "We could not start checkout right now. Please try again shortly.",
      }));
    } finally {
      setState((prev) => ({ ...prev, upgradeLoadingTier: null }));
    }
  };

  if (state.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-orange-500/30 border-t-orange-500 animate-spin" />
          <Sparkles className="absolute inset-0 m-auto w-6 h-6 text-orange-400" />
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pricing | UmukoziHR Tailor</title>
        <meta name="description" content="Choose your UmukoziHR Tailor plan" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        <nav className="fixed top-0 left-0 right-0 bg-stone-900/80 backdrop-blur-xl border-b border-white/5 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <motion.button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors group"
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back</span>
              </motion.button>
              <HeaderLogo size="md" />
              <div className="w-20" />
            </div>
          </div>
        </nav>

        <main className="relative z-10 pt-24 pb-16 px-4">
          <motion.div
            className="max-w-6xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants} className="text-center mb-12">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Simple, <span className="text-gradient">clear</span> pricing
              </h1>
              <p className="text-stone-400 text-lg max-w-2xl mx-auto">
                Start free, move to Launch when you need more output, and switch to Bounty for the full application workflow.
              </p>
              {state.currentTier && (
                <p className="text-stone-500 text-sm mt-4">
                  Your current plan:{" "}
                  <span className="text-white font-medium capitalize">{state.currentTier}</span>
                </p>
              )}
            </motion.div>

            {(state.error || !state.isVerified) && (
              <motion.div
                variants={itemVariants}
                className="max-w-3xl mx-auto mb-8 space-y-3"
              >
                {state.error && (
                  <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-4 text-sm text-amber-300">
                    {state.error}
                  </div>
                )}
                {!state.isVerified && (
                  <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-5 py-4 text-sm text-sky-200 flex items-start gap-3">
                    <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Verify your email before using Free, Launch, or Bounty document generations.
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {displayPlans.map((plan) => {
                const isFree = plan.tier === "free";
                const isLaunch = plan.tier === "launch";
                const isBounty = plan.tier === "bounty";
                const isCurrent = state.currentTier === plan.tier;

                return (
                  <motion.div
                    key={plan.tier}
                    variants={itemVariants}
                    className={`relative rounded-3xl border overflow-hidden backdrop-blur-xl ${
                      isLaunch
                        ? "border-orange-500/50 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent"
                        : isBounty
                        ? "border-amber-400/30 bg-gradient-to-br from-amber-500/10 via-stone-900/80 to-stone-950/90"
                        : "border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90"
                    }`}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    {isLaunch && (
                      <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                    )}

                    <div className="p-8">
                      {isLaunch && (
                        <div className="absolute top-6 right-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-orange-500/30">
                            <Sparkles className="w-3 h-3" />
                            MOST POPULAR
                          </span>
                        </div>
                      )}

                      {isBounty && (
                        <div className="absolute top-6 right-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/15 border border-amber-400/20 text-amber-200 text-xs font-semibold rounded-full">
                            <Crown className="w-3 h-3" />
                            FULL WORKFLOW
                          </span>
                        </div>
                      )}

                      <div className="mb-6">
                        <div
                          className={`inline-flex p-3 rounded-2xl mb-4 ${
                            isLaunch
                              ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20 border border-orange-500/30"
                              : isBounty
                              ? "bg-amber-500/15 border border-amber-400/20"
                              : "bg-stone-800 border border-stone-700"
                          }`}
                        >
                          {isFree ? (
                            <Zap className="w-7 h-7 text-stone-300" />
                          ) : isLaunch ? (
                            <Sparkles className="w-7 h-7 text-orange-400" />
                          ) : (
                            <Crown className="w-7 h-7 text-amber-300" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <p className="text-stone-400 text-sm mt-1">{plan.description}</p>
                      </div>

                      <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold text-white">
                            ${plan.monthlyPrice === 0 ? "0" : plan.monthlyPrice.toFixed(0)}
                          </span>
                          {plan.monthlyPrice > 0 && (
                            <span className="text-stone-400 text-lg">/month</span>
                          )}
                        </div>
                        <p className="text-stone-500 text-sm mt-2">
                          {isFree
                            ? "1 generation every 30 days"
                            : isLaunch
                            ? "10 generations every 30 days"
                            : "Unlimited generations"}
                        </p>
                      </div>

                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3">
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isFree ? "bg-green-500/20" : isLaunch ? "bg-orange-500/20" : "bg-amber-500/20"
                              }`}
                            >
                              <Check
                                className={`w-3 h-3 ${
                                  isFree ? "text-green-400" : isLaunch ? "text-orange-400" : "text-amber-300"
                                }`}
                              />
                            </div>
                            <span className="text-stone-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <motion.button
                        onClick={() => {
                          if (!isFree && !isCurrent) {
                            handleUpgrade(plan.tier as "launch" | "bounty");
                          }
                        }}
                        disabled={
                          isFree ||
                          isCurrent ||
                          state.upgradeLoadingTier !== null ||
                          !state.checkoutReady
                        }
                        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                          isCurrent || isFree
                            ? "bg-stone-800 text-stone-400 cursor-default border border-stone-700"
                            : !state.checkoutReady
                            ? "bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700"
                            : isLaunch
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                            : "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/20 hover:shadow-xl hover:shadow-amber-500/30"
                        }`}
                        whileHover={!isCurrent && !isFree && state.checkoutReady ? { scale: 1.02 } : {}}
                        whileTap={!isCurrent && !isFree && state.checkoutReady ? { scale: 0.98 } : {}}
                      >
                        {isCurrent ? (
                          <>
                            <Check className="w-4 h-4" />
                            Current Plan
                          </>
                        ) : isFree ? (
                          <>
                            <Shield className="w-4 h-4" />
                            Included
                          </>
                        ) : !state.checkoutReady ? (
                          <>
                            <CreditCard className="w-4 h-4" />
                            Unavailable right now
                          </>
                        ) : state.upgradeLoadingTier === plan.tier ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            {isBounty ? <Crown className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                            {plan.cta}
                          </>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <motion.div variants={itemVariants} className="mt-20">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800/50 rounded-full border border-stone-700 mb-4">
                  <HelpCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-stone-400 text-sm">Questions</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Frequently asked questions</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {[
                  {
                    icon: Shield,
                    q: "Do I need to verify my email first?",
                    a: "Yes. Verified accounts are required before any document generation on Free, Launch, or Bounty.",
                  },
                  {
                    icon: CreditCard,
                    q: "Can I cancel anytime?",
                    a: "Yes. Paid plans are billed monthly and you can cancel before the next renewal cycle.",
                  },
                  {
                    icon: Layers,
                    q: "Which plan includes batch upload and ZIP download?",
                    a: "Those workflow features are part of Bounty. Free and Launch stay on the single-job flow.",
                  },
                  {
                    icon: Sparkles,
                    q: "What happens when I hit my limit?",
                    a: "Free users can move to Launch or Bounty. Launch users can move to Bounty for unlimited generations.",
                  },
                ].map((faq) => (
                  <motion.div
                    key={faq.q}
                    className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl"
                    whileHover={{ y: -3 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-stone-800 border border-stone-700">
                        <faq.icon className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                        <p className="text-stone-400 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
