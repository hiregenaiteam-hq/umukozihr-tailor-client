import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { motion, AnimatePresence } from "framer-motion";
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
  AlertTriangle,
  LogOut,
  Settings,
  Eye,
  EyeOff,
  Copy,
  Check,
  Share2
} from "lucide-react";
import { HeaderLogo } from "../components/Logo";
import { subscription, SubscriptionStatus, profile, share } from "../lib/api";
import toast from "react-hot-toast";

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

interface SettingsState {
  loading: boolean;
  subscription: SubscriptionStatus | null;
  email: string;
  showDeleteConfirm: boolean;
  deleteLoading: boolean;
  isPublic: boolean;
  username: string;
  profileViews: number;
  visibilityLoading: boolean;
  copied: boolean;
}

export default function SettingsPage() {
  const router = useRouter();
  const [state, setState] = useState<SettingsState>({
    loading: true,
    subscription: null,
    email: "",
    showDeleteConfirm: false,
    deleteLoading: false,
    isPublic: true,
    username: "",
    profileViews: 0,
    visibilityLoading: false,
    copied: false,
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
    fetchShareSettings();
  }, []);

  const fetchShareSettings = async () => {
    try {
      const response = await share.getSettings();
      setState(prev => ({
        ...prev,
        isPublic: response.data.is_public ?? true,
        username: response.data.username || "",
        profileViews: response.data.profile_views || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch share settings");
    }
  };

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

  const handleToggleVisibility = async () => {
    setState(prev => ({ ...prev, visibilityLoading: true }));
    try {
      const newValue = !state.isPublic;
      await share.updateSettings(newValue);
      setState(prev => ({ ...prev, isPublic: newValue, visibilityLoading: false }));
      toast.success(newValue ? "Profile is now public" : "Profile is now private");
    } catch (error) {
      toast.error("Failed to update visibility");
      setState(prev => ({ ...prev, visibilityLoading: false }));
    }
  };

  const handleCopyProfileLink = () => {
    if (!state.username) {
      toast.error("No username set");
      return;
    }
    const profileUrl = `https://tailor.umukozihr.com/p/${state.username}`;
    navigator.clipboard.writeText(profileUrl);
    setState(prev => ({ ...prev, copied: true }));
    toast.success("Profile link copied!");
    setTimeout(() => setState(prev => ({ ...prev, copied: false })), 2000);
  };

  const sub = state.subscription;
  const isDormant = !sub?.is_live;

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
        <title>Settings | UmukoziHR Tailor</title>
        <meta name="description" content="Account settings - UmukoziHR Tailor" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950">
        {/* Decorative background */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </div>

        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 bg-stone-900/80 backdrop-blur-xl border-b border-white/5 z-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <motion.button
                onClick={() => router.push("/app")}
                className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors group"
                whileHover={{ x: -3 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline">Back to App</span>
              </motion.button>
              <HeaderLogo size="md" />
              <div className="w-20" />
            </div>
          </div>
        </nav>

        <main className="relative z-10 pt-24 pb-16 px-4">
          <motion.div 
            className="max-w-2xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
                <p className="text-stone-400 text-sm">Manage your account and preferences</p>
              </div>
            </motion.div>

            {/* Account Section */}
            <motion.section variants={itemVariants} className="mb-8">
              <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User className="w-4 h-4" />
                Account
              </h2>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl overflow-hidden">
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-stone-400 text-sm">{state.email}</p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">
                    Verified
                  </div>
                </div>
                <motion.button
                  onClick={() => router.push("/onboarding")}
                  className="w-full p-5 flex items-center justify-between hover:bg-white/5 transition-colors group"
                  whileHover={{ x: 3 }}
                >
                  <div className="text-left">
                    <p className="text-white font-medium">Edit Profile</p>
                    <p className="text-stone-400 text-sm">Update your resume information</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-stone-500 group-hover:text-orange-400 transition-colors" />
                </motion.button>
              </div>
            </motion.section>

            {/* Subscription Section */}
            <motion.section variants={itemVariants} className="mb-8">
              <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Subscription
              </h2>
              <div className={`rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl overflow-hidden ${isDormant ? "opacity-80" : ""}`}>
                {/* Current Plan */}
                <div className="p-5 border-b border-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {sub?.is_pro ? (
                        <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/20">
                          <Crown className="w-6 h-6 text-white" />
                        </div>
                      ) : (
                        <div className="p-3 bg-stone-800 rounded-xl border border-stone-700">
                          <Zap className="w-6 h-6 text-stone-400" />
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-lg">
                          {sub?.is_pro ? "Pro Plan" : "Free Plan"}
                        </p>
                        <p className="text-stone-400 text-sm">
                          {sub?.is_pro ? "Unlimited tailored resumes" : "5 resumes per month"}
                        </p>
                      </div>
                    </div>
                    {isDormant && (
                      <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-full flex items-center gap-1.5">
                        <Lock className="w-3 h-3" />
                        Coming Soon
                      </span>
                    )}
                  </div>
                </div>

                {/* Usage */}
                <div className="p-5 border-b border-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-stone-400 text-sm">Monthly Usage</p>
                    {sub?.usage_resets_at && (
                      <p className="text-stone-500 text-xs flex items-center gap-1">
                        <RefreshCw className="w-3 h-3" />
                        Resets {new Date(sub.usage_resets_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-stone-800 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full rounded-full ${
                          sub?.generations_remaining === 0 
                            ? "bg-red-500" 
                            : sub?.generations_remaining && sub.generations_remaining <= 2
                            ? "bg-amber-500"
                            : "bg-gradient-to-r from-green-500 to-emerald-400"
                        }`}
                        initial={{ width: 0 }}
                        animate={{
                          width: sub?.generations_limit === -1 
                            ? "10%" 
                            : `${Math.min(100, ((sub?.generations_used || 0) / (sub?.generations_limit || 5)) * 100)}%`
                        }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-sm text-stone-300 whitespace-nowrap font-medium">
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
                  <motion.button
                    onClick={() => router.push("/pricing")}
                    disabled={isDormant}
                    className={`w-full p-5 flex items-center justify-between transition-colors group ${
                      isDormant 
                        ? "cursor-not-allowed" 
                        : "hover:bg-white/5"
                    }`}
                    whileHover={!isDormant ? { x: 3 } : {}}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-orange-500/20 rounded-xl">
                        <Sparkles className="w-5 h-5 text-orange-400" />
                      </div>
                      <div className="text-left">
                        <p className="text-white font-medium">Upgrade to Pro</p>
                        <p className="text-stone-400 text-sm">
                          {isDormant 
                            ? "Payment system coming soon" 
                            : "Unlimited resumes, batch upload, and more"
                          }
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                )}

                {/* Pro features */}
                {sub?.is_pro && sub.expires_at && (
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-stone-400 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Renews {new Date(sub.expires_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Dormant notice */}
              {isDormant && (
                <p className="mt-4 text-sm text-stone-500 flex items-center gap-2 bg-stone-900/50 p-3 rounded-xl border border-stone-800">
                  <Lock className="w-4 h-4 flex-shrink-0" />
                  Subscription features are greyed out until payment system is live. 
                  Enjoy unlimited access for now!
                </p>
              )}
            </motion.section>

            {/* Privacy Section */}
            <motion.section variants={itemVariants} className="mb-8">
              <h2 className="text-sm font-medium text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Privacy & Profile
              </h2>
              <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-stone-900/90 via-stone-900/70 to-stone-950/90 backdrop-blur-xl overflow-hidden">
                {/* Profile Visibility Toggle */}
                <div className="p-5 flex items-center justify-between border-b border-white/5">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${state.isPublic ? 'bg-green-500/20' : 'bg-stone-800'}`}>
                      {state.isPublic ? (
                        <Eye className="w-5 h-5 text-green-400" />
                      ) : (
                        <EyeOff className="w-5 h-5 text-stone-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">Profile Visibility</p>
                      <p className="text-stone-400 text-sm">
                        {state.isPublic ? "Anyone can view your profile" : "Only you can see your profile"}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleToggleVisibility}
                    disabled={state.visibilityLoading}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      state.isPublic ? 'bg-green-500' : 'bg-stone-700'
                    }`}
                    whileTap={{ scale: 0.95 }}
                  >
                    {state.visibilityLoading ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </div>
                    ) : (
                      <motion.div
                        className="w-6 h-6 bg-white rounded-full shadow-md absolute top-1"
                        animate={{ left: state.isPublic ? 'calc(100% - 28px)' : '4px' }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </motion.button>
                </div>

                {/* Profile Link */}
                {state.username && (
                  <div className="p-5 flex items-center justify-between border-b border-white/5">
                    <div>
                      <p className="text-white font-medium">Your Profile Link</p>
                      <p className="text-stone-400 text-sm font-mono">tailor.umukozihr.com/p/{state.username}</p>
                    </div>
                    <div className="flex gap-2">
                      <motion.button
                        onClick={handleCopyProfileLink}
                        className="p-2.5 bg-stone-800 rounded-xl hover:bg-stone-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {state.copied ? (
                          <Check className="w-5 h-5 text-green-400" />
                        ) : (
                          <Copy className="w-5 h-5 text-stone-400" />
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => window.open(`/p/${state.username}`, '_blank')}
                        className="p-2.5 bg-stone-800 rounded-xl hover:bg-stone-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink className="w-5 h-5 text-stone-400" />
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* Profile Views */}
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-xl">
                      <Globe className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Profile Views</p>
                      <p className="text-stone-400 text-sm">Total views on your public profile</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-purple-400">{state.profileViews}</span>
                </div>
              </div>
            </motion.section>

            {/* Danger Zone */}
            <motion.section variants={itemVariants}>
              <h2 className="text-sm font-medium text-red-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Danger Zone
              </h2>
              <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-950/30 to-stone-950/90 backdrop-blur-xl overflow-hidden">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-white font-medium">Delete Account</p>
                      <p className="text-stone-400 text-sm">
                        Permanently delete your account and all data
                      </p>
                    </div>
                    <AnimatePresence mode="wait">
                      {!state.showDeleteConfirm ? (
                        <motion.button
                          key="delete-btn"
                          onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: true }))}
                          className="px-5 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2 font-medium"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Account
                        </motion.button>
                      ) : (
                        <motion.div 
                          key="confirm-btns"
                          className="flex gap-2"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                        >
                          <button
                            onClick={() => setState(prev => ({ ...prev, showDeleteConfirm: false }))}
                            className="px-4 py-2.5 bg-stone-800 border border-stone-700 text-stone-300 rounded-xl hover:bg-stone-700 transition-colors text-sm font-medium"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={state.deleteLoading}
                            className="px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors text-sm flex items-center gap-2 font-medium"
                          >
                            {state.deleteLoading ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                            {state.deleteLoading ? "Deleting..." : "Confirm Delete"}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Logout Button */}
            <motion.div variants={itemVariants} className="mt-10 text-center">
              <motion.button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-6 py-3 text-stone-400 hover:text-white border border-stone-800 hover:border-stone-700 rounded-xl transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </motion.button>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </>
  );
}
