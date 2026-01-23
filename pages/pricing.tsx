import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { Check, X, Sparkles, Crown, Zap, ArrowLeft, Lock, HelpCircle, CreditCard, Shield, Globe } from "lucide-react";
import { HeaderLogo } from "../components/Logo";
import { subscription, SubscriptionPlan, PlansResponse } from "../lib/api";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

interface PricingPageState {
  loading: boolean;
  error: string | null;
  plans: SubscriptionPlan[];
  isLive: boolean;
  paymentConfigured: boolean;
  userRegion: string;
  isRegionalPricing: boolean;
  upgradeLoading: boolean;
}

export default function PricingPage() {
  const router = useRouter();
  const [state, setState] = useState<PricingPageState>({
    loading: true,
    error: null,
    plans: [],
    isLive: false,
    paymentConfigured: false,
    userRegion: "global",
    isRegionalPricing: false,
    upgradeLoading: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await subscription.getPlans();
      setState(prev => ({
        ...prev,
        loading: false,
        plans: response.data.plans,
        isLive: response.data.is_live,
        paymentConfigured: response.data.payment_configured,
        userRegion: response.data.user_region,
        isRegionalPricing: response.data.is_regional_pricing,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: "Failed to load pricing plans",
      }));
    }
  };

  const handleUpgrade = async (tier: string) => {
    setState(prev => ({ ...prev, upgradeLoading: true }));
    try {
      const response = await subscription.createUpgradeIntent(tier);
      if (response.data.redirect_url) {
        window.location.href = response.data.redirect_url;
      } else {
        // Show message (payment not configured yet)
        alert(response.data.message);
      }
    } catch (error) {
      alert("Failed to start upgrade process. Please try again.");
    } finally {
      setState(prev => ({ ...prev, upgradeLoading: false }));
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return plan.monthly_price;
  };

  // System is dormant - show greyed out version
  const isDormant = !state.isLive;

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
        <meta name="description" content="Choose your plan - UmukoziHR Tailor pricing" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -right-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        {/* Navigation */}
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
            className="max-w-5xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="text-center mb-12">
              {isDormant && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm mb-6">
                  <Lock className="w-4 h-4" />
                  <span>Payment system coming soon</span>
                </div>
              )}
              
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Simple, <span className="text-gradient">Transparent</span> Pricing
              </h1>
              <p className="text-stone-400 text-lg max-w-2xl mx-auto">
                Choose the plan that fits your job search. Upgrade anytime.
              </p>
            </motion.div>

            {/* Plans grid */}
            <div className={`grid md:grid-cols-2 gap-8 max-w-4xl mx-auto ${isDormant ? "opacity-70" : ""}`}>
              {state.plans.map((plan, index) => {
                const isFree = plan.tier === "free";
                const isPro = plan.tier === "pro";
                const price = getPrice(plan);

                return (
                  <motion.div
                    key={plan.tier}
                    variants={itemVariants}
                    className={`relative rounded-3xl border overflow-hidden ${
                      isPro
                        ? "border-orange-500/50 bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-transparent"
                        : "border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90"
                    } backdrop-blur-xl`}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                  >
                    {/* Popular badge */}
                    {isPro && (
                      <div className="absolute -top-px left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500" />
                    )}
                    
                    <div className="p-8">
                      {isPro && (
                        <div className="absolute top-6 right-6">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-orange-500/30">
                            <Crown className="w-3 h-3" />
                            POPULAR
                          </span>
                        </div>
                      )}

                      <div className="mb-6">
                        <div className={`inline-flex p-3 rounded-2xl mb-4 ${
                          isPro ? "bg-gradient-to-br from-orange-500/30 to-amber-500/20 border border-orange-500/30" : "bg-stone-800 border border-stone-700"
                        }`}>
                          {isPro ? (
                            <Sparkles className="w-7 h-7 text-orange-400" />
                          ) : (
                            <Zap className="w-7 h-7 text-stone-400" />
                          )}
                        </div>
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <p className="text-stone-400 text-sm mt-1">{plan.description}</p>
                      </div>

                      {/* Price */}
                      <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold text-white">
                            ${price === 0 ? "0" : price.toFixed(0)}
                          </span>
                          {price > 0 && (
                            <span className="text-stone-400 text-lg">/month</span>
                          )}
                        </div>
                        {isPro && !isDormant && (
                          <p className="text-stone-500 text-sm mt-2">Billed monthly • Cancel anytime</p>
                        )}
                      </div>

                      {/* Features */}
                      <ul className="space-y-4 mb-8">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isPro ? "bg-orange-500/20" : "bg-green-500/20"
                            }`}>
                              <Check className={`w-3 h-3 ${
                                isPro ? "text-orange-400" : "text-green-400"
                              }`} />
                            </div>
                            <span className="text-stone-300 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA */}
                      <motion.button
                        onClick={() => !isFree && !isDormant && handleUpgrade(plan.tier)}
                        disabled={isFree || isDormant || state.upgradeLoading}
                        className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 ${
                          isFree
                            ? "bg-stone-800 text-stone-400 cursor-default border border-stone-700"
                            : isPro && !isDormant
                            ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20 hover:shadow-xl hover:shadow-orange-500/30"
                            : "bg-stone-800 text-stone-400 cursor-not-allowed border border-stone-700"
                        }`}
                        whileHover={isPro && !isDormant ? { scale: 1.02 } : {}}
                        whileTap={isPro && !isDormant ? { scale: 0.98 } : {}}
                      >
                        {isFree ? (
                          <><Check className="w-4 h-4" /> Current Plan</>
                        ) : isDormant ? (
                          <><Lock className="w-4 h-4" /> Coming Soon</>
                        ) : state.upgradeLoading ? (
                          <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                        ) : (
                          <><Sparkles className="w-4 h-4" /> Upgrade to Pro</>
                        )}
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* FAQ section */}
            <motion.div variants={itemVariants} className="mt-20">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-stone-800/50 rounded-full border border-stone-700 mb-4">
                  <HelpCircle className="w-4 h-4 text-orange-400" />
                  <span className="text-stone-400 text-sm">Got Questions?</span>
                </div>
                <h2 className="text-2xl font-bold text-white">Frequently Asked Questions</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {[
                  {
                    icon: Shield,
                    q: "Can I cancel anytime?",
                    a: "Yes! You can cancel your subscription at any time. You'll keep Pro features until your billing period ends."
                  },
                  {
                    icon: CreditCard,
                    q: "What payment methods do you accept?",
                    a: "We accept all major credit cards, mobile money (for Africa), and bank transfers via our secure payment partners."
                  },
                  {
                    icon: Globe,
                    q: "Why is pricing different for Africa?",
                    a: "We believe in making our tools accessible. Regional pricing ensures everyone can access quality resume tailoring."
                  },
                  {
                    icon: Zap,
                    q: "What happens when I hit my limit?",
                    a: "Free users get 5 tailored resumes per month. After that, you can upgrade to Pro for unlimited access or wait for the next month."
                  }
                ].map((faq, i) => (
                  <motion.div 
                    key={i} 
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

            {/* Dormant notice */}
            {isDormant && (
              <motion.div 
                variants={itemVariants} 
                className="mt-16 p-8 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent backdrop-blur-xl text-center max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  Payment System Coming Soon
                </h3>
                <p className="text-stone-400">
                  We're setting up secure payment processing. In the meantime, enjoy unlimited access to all features for free! 
                  We'll notify you when Pro subscriptions become available.
                </p>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </>
  );
}
