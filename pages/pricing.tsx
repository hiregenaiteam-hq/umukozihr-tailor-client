import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Check, X, Sparkles, Crown, Zap, ArrowLeft, Lock, Globe, MapPin } from "lucide-react";
import { HeaderLogo } from "../components/Logo";
import { subscription, SubscriptionPlan, PlansResponse } from "../lib/api";

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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pricing | UmukoziHR Tailor</title>
        <meta name="description" content="Choose your plan - UmukoziHR Tailor pricing" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <HeaderLogo size="md" />
              <div className="w-20" /> {/* Spacer */}
            </div>
          </div>
        </nav>

        <main className="pt-24 pb-16 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              {isDormant && (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm mb-6">
                  <Lock className="w-4 h-4" />
                  <span>Payment system coming soon</span>
                </div>
              )}
              
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Simple, Transparent Pricing
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Choose the plan that fits your job search. Upgrade anytime.
              </p>

              {/* Regional pricing badge */}
              {state.isRegionalPricing && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Special Africa pricing applied</span>
                </div>
              )}
            </div>

            {/* Plans grid */}
            <div className={`grid md:grid-cols-2 gap-8 max-w-4xl mx-auto ${isDormant ? "opacity-60" : ""}`}>
              {state.plans.map((plan) => {
                const isFree = plan.tier === "free";
                const isPro = plan.tier === "pro";
                const price = getPrice(plan);

                return (
                  <div
                    key={plan.tier}
                    className={`relative rounded-2xl border p-8 ${
                      isPro
                        ? "border-orange-500/50 bg-gradient-to-br from-orange-500/10 to-amber-500/5"
                        : "border-gray-700 bg-gray-800/50"
                    }`}
                  >
                    {/* Popular badge */}
                    {isPro && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-full">
                          <Crown className="w-4 h-4" />
                          Most Popular
                        </span>
                      </div>
                    )}

                    <div className="text-center mb-6">
                      <div className={`inline-flex p-3 rounded-xl mb-4 ${
                        isPro ? "bg-orange-500/20" : "bg-gray-700"
                      }`}>
                        {isPro ? (
                          <Sparkles className="w-6 h-6 text-orange-400" />
                        ) : (
                          <Zap className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                      <p className="text-gray-400 text-sm mt-1">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <div className="flex items-baseline justify-center gap-1">
                        <span className="text-4xl font-bold text-white">
                          ${price === 0 ? "0" : price.toFixed(2)}
                        </span>
                        {price > 0 && (
                          <span className="text-gray-400">
                            /mo
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                            isPro ? "text-orange-400" : "text-green-400"
                          }`} />
                          <span className="text-gray-300 text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <button
                      onClick={() => !isFree && !isDormant && handleUpgrade(plan.tier)}
                      disabled={isFree || isDormant || state.upgradeLoading}
                      className={`w-full py-3 px-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        isFree
                          ? "bg-gray-700 text-gray-400 cursor-default"
                          : isPro && !isDormant
                          ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600"
                          : "bg-gray-600 text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {isFree ? (
                        "Current Plan"
                      ) : isDormant ? (
                        <>
                          <Lock className="w-4 h-4" />
                          Coming Soon
                        </>
                      ) : state.upgradeLoading ? (
                        <span className="animate-pulse">Processing...</span>
                      ) : (
                        "Upgrade to Pro"
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* FAQ / Trust section */}
            <div className="mt-16 text-center">
              <h2 className="text-xl font-semibold text-white mb-8">Frequently Asked Questions</h2>
              <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto text-left">
                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                  <h3 className="font-medium text-white mb-2">Can I cancel anytime?</h3>
                  <p className="text-gray-400 text-sm">
                    Yes! You can cancel your subscription at any time. You'll keep Pro features until your billing period ends.
                  </p>
                </div>
                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                  <h3 className="font-medium text-white mb-2">What payment methods do you accept?</h3>
                  <p className="text-gray-400 text-sm">
                    We accept all major credit cards, mobile money (for Africa), and bank transfers via our secure payment partners.
                  </p>
                </div>
                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                  <h3 className="font-medium text-white mb-2">Why is pricing different for Africa?</h3>
                  <p className="text-gray-400 text-sm">
                    We believe in making our tools accessible. Regional pricing ensures everyone can access quality resume tailoring.
                  </p>
                </div>
                <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                  <h3 className="font-medium text-white mb-2">What happens when I hit my limit?</h3>
                  <p className="text-gray-400 text-sm">
                    Free users get 5 tailored resumes per month. After that, you can upgrade to Pro for unlimited access or wait for the next month.
                  </p>
                </div>
              </div>
            </div>

            {/* Dormant notice */}
            {isDormant && (
              <div className="mt-12 p-6 bg-gray-800/50 rounded-xl border border-gray-700 text-center max-w-2xl mx-auto">
                <Lock className="w-8 h-8 text-amber-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Payment System Coming Soon
                </h3>
                <p className="text-gray-400 text-sm">
                  We're setting up secure payment processing. In the meantime, enjoy unlimited access to all features for free! 
                  We'll notify you when Pro subscriptions become available.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
