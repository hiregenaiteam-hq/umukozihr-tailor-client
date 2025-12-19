import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { 
  ArrowLeft, 
  User, 
  CreditCard, 
  Lock, 
  Shield, 
  Bell, 
  Globe, 
  Trash2, 
  ChevronRight,
  Crown,
  Sparkles,
  Zap,
  Calendar,
  RefreshCw,
  ExternalLink,
  AlertTriangle
} from "lucide-react";
import { HeaderLogo } from "../components/Logo";
import { subscription, SubscriptionStatus, profile } from "../lib/api";

interface SettingsState {
  loading: boolean;
  subscription: SubscriptionStatus | null;
  email: string;
  showDeleteConfirm: boolean;
  deleteLoading: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [state, setState] = useState<SettingsState>({
    loading: true,
    subscription: null,
    email: "",
    showDeleteConfirm: false,
    deleteLoading: false,
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    
    // Get email from token (simple decode)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setState(prev => ({ ...prev, email: payload.email || "" }));
    } catch (e) {
      console.error("Failed to decode token");
    }
    
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await subscription.getStatus();
      setState(prev => ({
        ...prev,
        loading: false,
        subscription: response.data,
      }));
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteAccount = async () => {
    setState(prev => ({ ...prev, deleteLoading: true }));
    try {
      await profile.delete();
      localStorage.removeItem("token");
      router.push("/");
    } catch (error) {
      alert("Failed to delete account. Please try again.");
      setState(prev => ({ ...prev, deleteLoading: false }));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
  };

  const sub = state.subscription;
  const isDormant = !sub?.is_live;

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
        <title>Settings | UmukoziHR Tailor</title>
        <meta name="description" content="Account settings - UmukoziHR Tailor" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => router.push("/app")}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to App</span>
              </button>
              <HeaderLogo size="md" />
              <div className="w-20" />
            </div>
          </div>
        </nav>

        <main className="pt-24 pb-16 px-4">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-8">Settings</h1>

            {/* Account Section */}
            <section className="mb-8">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Account
              </h2>
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 divide-y divide-gray-700">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-gray-400 text-sm">{state.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/onboarding")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-white font-medium">Edit Profile</p>
                    <p className="text-gray-400 text-sm">Update your resume information</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </section>

            {/* Subscription Section */}
            <section className="mb-8">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Subscription
              </h2>
              <div className={`bg-gray-800/50 rounded-xl border border-gray-700 ${isDormant ? "opacity-70" : ""}`}>
                {/* Current Plan */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {sub?.is_pro ? (
                        <div className="p-2 bg-orange-500/20 rounded-lg">
                          <Crown className="w-5 h-5 text-orange-400" />
                        </div>
                      ) : (
                        <div className="p-2 bg-gray-700 rounded-lg">
                          <Zap className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {sub?.is_pro ? "Pro Plan" : "Free Plan"}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {sub?.is_pro ? "Unlimited tailored resumes" : "5 resumes per month"}
                        </p>
                      </div>
                    </div>
                    {isDormant && (
                      <span className="px-2 py-1 bg-amber-500/10 text-amber-400 text-xs rounded-full flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>

                {/* Usage */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-gray-400 text-sm">Monthly Usage</p>
                    {sub?.usage_resets_at && (
                      <p className="text-gray-500 text-xs flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Resets {new Date(sub.usage_resets_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          sub?.generations_remaining === 0 
                            ? "bg-red-500" 
                            : sub?.generations_remaining && sub.generations_remaining <= 2
                            ? "bg-amber-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: sub?.generations_limit === -1 
                            ? "10%" 
                            : `${Math.min(100, ((sub?.generations_used || 0) / (sub?.generations_limit || 5)) * 100)}%`
                        }}
                      />
                    </div>
                    <span className="text-sm text-gray-300 whitespace-nowrap">
                      {sub?.features.unlimited_generations ? (
                        <span className="text-green-400">Unlimited</span>
                      ) : (
                        `${sub?.generations_used || 0} / ${sub?.generations_limit || 5}`
                      )}
                    </span>
                  </div>
                </div>

                {/* Upgrade CTA */}
                {!sub?.is_pro && (
                  <button
                    onClick={() => router.push("/pricing")}
                    disabled={isDormant}
                    className={`w-full p-4 flex items-center justify-between transition-colors ${
                      isDormant 
                        ? "cursor-not-allowed" 
                        : "hover:bg-gray-700/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                      <div className="text-left">
                        <p className="text-white font-medium">Upgrade to Pro</p>
                        <p className="text-gray-400 text-sm">
                          {isDormant 
                            ? "Payment system coming soon" 
                            : "Unlimited resumes, batch upload, and more"
                          }
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-orange-500" />
                  </button>
                )}

                {/* Pro features */}
                {sub?.is_pro && sub.expires_at && (
                  <div className="p-4">
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Renews {new Date(sub.expires_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dormant notice */}
              {isDormant && (
                <p className="mt-3 text-sm text-gray-500 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Subscription features are greyed out until payment system is live. 
                  Enjoy unlimited access for now!
                </p>
              )}
            </section>

            {/* Privacy Section */}
            <section className="mb-8">
              <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy
              </h2>
              <div className="bg-gray-800/50 rounded-xl border border-gray-700 divide-y divide-gray-700">
                <button
                  onClick={() => router.push("/app")}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-700/30 transition-colors"
                >
                  <div className="text-left">
                    <p className="text-white font-medium">Profile Visibility</p>
                    <p className="text-gray-400 text-sm">Manage your public profile settings</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </section>

            {/* Danger Zone */}
            <section>
              <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </h2>
              <div className="bg-gray-800/50 rounded-xl border border-red-500/30">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">Delete Account</p>
                      <p className="text-gray-400 text-sm">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    {!state.showDeleteConfirm ? (
                      <button
                        onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: true }))}
                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: false }))}
                          className="px-3 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={state.deleteLoading}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm flex items-center gap-1"
                        >
                          {state.deleteLoading ? "Deleting..." : "Confirm Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Logout Button */}
            <div className="mt-8 text-center">
              <button
                onClick={handleLogout}
                className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                Log Out
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
