import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { admin as adminApi } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import { HeaderLogo } from '@/components/Logo';
import {
  Users, FileText, AlertTriangle, Activity,
  TrendingUp, Clock, CheckCircle, XCircle,
  ArrowLeft, RefreshCw, Shield, Zap, BarChart3,
  Globe, Briefcase, Sparkles, DollarSign, Crown,
  MapPin, Target, Percent, Building2, Flag, Trophy, PartyPopper,
  Flame, Phone, Gift, Medal, Star, Mail, Send, FileEdit, Trash2, ChevronDown, History
} from 'lucide-react';

interface DashboardData {
  user_activity: {
    total_users: number;
    signups_today: number;
    signups_this_week: number;
    signups_this_month: number;
    verified_users: number;
    onboarding_completed: number;
    onboarding_in_progress: number;
    active_today: number;
    active_this_week: number;
  };
  generation: {
    total_generations: number;
    successful_generations: number;
    failed_generations: number;
    success_rate: number;
    generations_today: number;
    generations_this_week: number;
    avg_total_duration: number;
    avg_llm_duration: number;
    resumes_generated: number;
    cover_letters_generated: number;
  };
  jd_insights: {
    total_jobs: number;
    by_region: Record<string, number>;
    by_industry: Record<string, number>;
    by_role_type: Record<string, number>;
    avg_jd_length: number;
  };
  system_health: {
    total_errors_today: number;
    total_errors_this_week: number;
    errors_by_type: Record<string, number>;
    avg_response_time_ms: number;
    error_rate: number;
  };
  subscription: {
    free_users: number;
    pro_users: number;
    total_paid: number;
    africa_users: number;
    global_users: number;
    active_subscriptions: number;
    cancelled_subscriptions: number;
    expired_subscriptions: number;
    monthly_revenue_estimate: number;
    potential_revenue: number;
    conversion_rate: number;
    africa_conversion_rate: number;
    global_conversion_rate: number;
    total_generations_used: number;
    users_at_limit: number;
    avg_generations_per_user: number;
  };
  geolocation: {
    by_country: Record<string, number>;
    by_city: Record<string, number>;
    top_countries: { name: string; code: string; count: number }[];
    top_cities: { city: string; country: string; count: number }[];
    unknown_location: number;
  };
  job_landing: {
    total_landed: number;
    landed_today: number;
    landed_this_week: number;
    landed_this_month: number;
    users_with_landed_jobs: number;
    top_companies: { company: string; count: number }[];
    landing_rate: number;
  };
  gamification: {
    total_interviews: number;
    total_offers: number;
    interviews_today: number;
    offers_today: number;
    interviews_this_week: number;
    offers_this_week: number;
    users_with_interviews: number;
    users_with_offers: number;
    interview_rate: number;
    offer_rate: number;
    total_xp_awarded: number;
    achievements_unlocked: number;
    avg_streak_days: number;
    max_streak_days: number;
    users_with_streaks: number;
  };
  signups_trend: { date: string; count: number }[];
  generations_trend: { date: string; count: number }[];
}

type TabType = 'overview' | 'users' | 'generations' | 'errors' | 'broadcast';

// StatCard Component
function StatCard({ title, value, subtitle, icon: Icon, color }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
}) {
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    orange: 'text-orange-400 bg-orange-500/10',
    red: 'text-red-400 bg-red-500/10'
  };

  return (
    <div className="glass-card p-5 group hover:border-orange-500/30">
      <div className="flex items-start justify-between mb-3">
        <div className={`neu-flat w-10 h-10 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm text-stone-400 mb-1">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
      {subtitle && <p className="text-xs text-stone-500 mt-1">{subtitle}</p>}
    </div>
  );
}

// TrendChart Component
function TrendChart({ data, label }: { data: { date: string; count: number }[]; label: string }) {
  const maxVal = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-medium text-stone-300 mb-4">{label}</h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1">
            <div 
              className="w-full bg-gradient-to-t from-orange-500/80 to-amber-400/80 rounded-t-lg transition-all hover:from-orange-400 hover:to-amber-300"
              style={{ height: `${(item.count / maxVal) * 100}%`, minHeight: '4px' }}
            />
            <span className="text-xs text-stone-500">
              {new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex justify-between text-xs text-stone-500">
        <span>7 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

// DistributionChart Component
function DistributionChart({ data, title }: { data: Record<string, number>; title: string }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 5);
  
  return (
    <div className="glass-card p-6">
      <h3 className="text-sm font-medium text-stone-300 mb-4">{title}</h3>
      <div className="space-y-3">
        {entries.length > 0 ? entries.map(([key, value], idx) => (
          <div key={key}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-stone-400 truncate">{key}</span>
              <span className="text-white font-medium">{value}</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all"
                style={{ width: `${(value / total) * 100}%` }}
              />
            </div>
          </div>
        )) : (
          <p className="text-stone-500 text-sm">No data available</p>
        )}
      </div>
    </div>
  );
}

// Floating Orb
function FloatingOrb({ className, delay = 0 }: { className: string; delay?: number }) {
  return (
    <div 
      className={`floating-orb floating-orb-orange ${className}`}
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

// Country flag emoji from ISO code
function getCountryFlag(countryCode: string): string {
  if (!countryCode || countryCode.length !== 2) return '🌍';
  const code = countryCode.toUpperCase();
  const offset = 127397;
  const chars = code.split('');
  return String.fromCodePoint(chars[0].charCodeAt(0) + offset, chars[1].charCodeAt(0) + offset);
}

export default function AdminPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mounted, setMounted] = useState(false);
  
  // Broadcast state
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTestMode, setBroadcastTestMode] = useState(true);
  const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);
  const [emailStats, setEmailStats] = useState<{ total_users: number; subscribed_users: number; unsubscribed_users: number; emailed_today: number; emailed_this_week: number } | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [broadcastHistory, setBroadcastHistory] = useState<{ subject: string; date: string; recipients: number }[]>([]);

  // Email templates
  const emailTemplates = [
    {
      name: 'New Feature Announcement',
      subject: 'New Feature: [Feature Name] is here!',
      body: `Hey there!

We're excited to announce a brand new feature that's going to make your job search even easier.

[Describe the feature here]

Head over to UmukoziHR Resume Tailor to try it out!

Happy job hunting,
The UmukoziHR Team`
    },
    {
      name: 'Weekly Tips',
      subject: 'Your Weekly Job Search Tips',
      body: `Hey there!

Here are this week's tips to boost your job search:

1. [Tip 1]
2. [Tip 2]
3. [Tip 3]

Remember, every tailored resume brings you closer to your dream job!

Keep pushing,
The UmukoziHR Team`
    },
    {
      name: 'Maintenance Notice',
      subject: 'Scheduled Maintenance Notice',
      body: `Hey there!

We wanted to give you a heads up that we'll be performing scheduled maintenance on [DATE] from [TIME] to [TIME].

During this time, the platform may be briefly unavailable.

We apologize for any inconvenience and thank you for your patience!

Best,
The UmukoziHR Team`
    },
    {
      name: 'Success Story',
      subject: 'Inspiring Success: [Name] Landed Their Dream Job!',
      body: `Hey there!

We love sharing success stories from our community!

[Name] just landed a role as [Job Title] at [Company] using UmukoziHR Resume Tailor.

Here's what they said:
"[Quote from user]"

You could be next! Keep tailoring those resumes.

Cheers,
The UmukoziHR Team`
    }
  ];

  // Load draft from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('broadcast_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        if (draft.subject) setBroadcastSubject(draft.subject);
        if (draft.body) setBroadcastBody(draft.body);
      } catch (e) {}
    }
    
    const savedHistory = localStorage.getItem('broadcast_history');
    if (savedHistory) {
      try {
        setBroadcastHistory(JSON.parse(savedHistory));
      } catch (e) {}
    }
  }, []);

  // Auto-save draft
  useEffect(() => {
    if (broadcastSubject || broadcastBody) {
      localStorage.setItem('broadcast_draft', JSON.stringify({
        subject: broadcastSubject,
        body: broadcastBody,
        savedAt: new Date().toISOString()
      }));
    }
  }, [broadcastSubject, broadcastBody]);

  const clearDraft = () => {
    setBroadcastSubject('');
    setBroadcastBody('');
    localStorage.removeItem('broadcast_draft');
    toast.success('Draft cleared');
  };

  const applyTemplate = (template: typeof emailTemplates[0]) => {
    setBroadcastSubject(template.subject);
    setBroadcastBody(template.body);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" loaded`);
  };

  useEffect(() => {
    setMounted(true);
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsRefreshing(true);
    try {
      const response = await adminApi.getDashboard();
      setDashboard(response.data);
      setError(null);
      
      // Also load email stats
      try {
        const statsResponse = await adminApi.getEmailStats();
        setEmailStats(statsResponse.data);
      } catch (e) {
        console.log('Email stats not available');
      }
    } catch (err: any) {
      if (err.response?.status === 403) {
        setError('Admin access required.');
      } else if (err.response?.status === 401) {
        toast.error('Please log in first');
        router.push('/');
      } else {
        setError('Failed to load dashboard data');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleSendBroadcast = async () => {
    if (!broadcastSubject.trim() || !broadcastBody.trim()) {
      toast.error('Please enter subject and message');
      return;
    }

    setIsSendingBroadcast(true);
    try {
      const response = await adminApi.sendBroadcast({
        subject: broadcastSubject,
        body: broadcastBody,
        test_mode: broadcastTestMode
      });
      
      const data = response.data;
      if (data.success) {
        toast.success(
          broadcastTestMode 
            ? 'Test email sent to your inbox!' 
            : `Broadcast sent to ${data.successful_sends} users!`
        );
        
        // Save to history if not test mode
        if (!broadcastTestMode) {
          const newHistory = [
            { subject: broadcastSubject, date: new Date().toISOString(), recipients: data.successful_sends || 0 },
            ...broadcastHistory.slice(0, 9) // Keep last 10
          ];
          setBroadcastHistory(newHistory);
          localStorage.setItem('broadcast_history', JSON.stringify(newHistory));
          
          // Clear form after successful live send
          setBroadcastSubject('');
          setBroadcastBody('');
          setBroadcastTestMode(true);
          localStorage.removeItem('broadcast_draft');
        }
      } else {
        toast.error(data.message || 'Failed to send broadcast');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to send broadcast');
    } finally {
      setIsSendingBroadcast(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-t-orange-500 animate-spin" />
            <Shield className="absolute inset-0 m-auto h-6 w-6 text-orange-400" />
          </div>
          <p className="text-stone-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0c0a09] flex items-center justify-center">
        <div className="text-center glass-card p-12 max-w-md">
          <div className="neu-raised w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-stone-400 mb-6">{error}</p>
          <button onClick={() => router.push('/app')} className="btn-primary">
            Back to App
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { user_activity, generation, jd_insights, system_health, signups_trend, generations_trend } = dashboard;

  const tabs = [
    { id: 'overview' as TabType, label: 'Overview', icon: BarChart3 },
    { id: 'users' as TabType, label: 'Users', icon: Users },
    { id: 'generations' as TabType, label: 'Generations', icon: FileText },
    { id: 'errors' as TabType, label: 'Errors', icon: AlertTriangle },
    { id: 'broadcast' as TabType, label: 'Broadcast', icon: Mail }
  ];

  return (
    <div className={`min-h-screen bg-[#0c0a09] relative transition-opacity duration-500 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      {/* Background */}
      <div className="fixed inset-0 bg-mesh pointer-events-none" />
      <FloatingOrb className="w-[500px] h-[500px] -top-32 -right-32" delay={0} />
      <FloatingOrb className="w-[400px] h-[400px] bottom-0 -left-20" delay={3} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-heavy border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/app')}
                className="btn-icon"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <HeaderLogo size="md" />
              <div className="border-l border-white/10 pl-3">
                <p className="text-sm font-medium text-white">Admin Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboard}
                disabled={isRefreshing}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="glass-subtle border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 font-medium transition-all relative ${
                  activeTab === tab.id ? 'text-orange-400' : 'text-stone-400 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-in-up">
            {/* User Activity */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-orange-400" />
                User Activity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={user_activity.total_users} icon={Users} color="blue" />
                <StatCard title="Signups Today" value={user_activity.signups_today} subtitle={`This week: ${user_activity.signups_this_week}`} icon={TrendingUp} color="green" />
                <StatCard title="Onboarding Done" value={user_activity.onboarding_completed} subtitle={`In progress: ${user_activity.onboarding_in_progress}`} icon={CheckCircle} color="purple" />
                <StatCard title="Active Today" value={user_activity.active_today} subtitle={`This week: ${user_activity.active_this_week}`} icon={Activity} color="orange" />
              </div>
            </section>

            {/* Generation Stats */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-400" />
                Tailoring Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Generations" value={generation.total_generations} icon={FileText} color="blue" />
                <StatCard title="Success Rate" value={`${generation.success_rate}%`} subtitle={`${generation.failed_generations} failed`} icon={CheckCircle} color="green" />
                <StatCard title="Avg. Duration" value={`${generation.avg_total_duration}s`} subtitle={`LLM: ${generation.avg_llm_duration}s`} icon={Clock} color="purple" />
                <StatCard title="Today" value={generation.generations_today} subtitle={`This week: ${generation.generations_this_week}`} icon={TrendingUp} color="orange" />
              </div>
            </section>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart data={signups_trend} label="Signups (Last 7 Days)" />
              <TrendChart data={generations_trend} label="Generations (Last 7 Days)" />
            </div>

            {/* Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DistributionChart data={jd_insights.by_region} title="By Region" />
              <DistributionChart data={jd_insights.by_industry} title="By Industry" />
              <DistributionChart data={jd_insights.by_role_type} title="By Role Type" />
            </div>

            {/* System Health */}
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                System Health
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Errors Today" value={system_health.total_errors_today} icon={XCircle} color="red" />
                <StatCard title="Errors This Week" value={system_health.total_errors_this_week} icon={AlertTriangle} color="orange" />
                <StatCard title="Avg Response" value={`${system_health.avg_response_time_ms}ms`} icon={Clock} color="blue" />
                <StatCard title="Error Rate" value={`${system_health.error_rate}%`} icon={Activity} color="purple" />
              </div>
            </section>

            {/* User Geolocation - Real location for product analytics */}
            {dashboard.geolocation && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-orange-400" />
                  User Geolocation
                  <span className="text-xs text-stone-500 font-normal">(Real locations for product analytics)</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Countries */}
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                      <Flag className="h-4 w-4 text-orange-400" />
                      Top Countries
                    </h3>
                    <div className="space-y-3">
                      {dashboard.geolocation.top_countries.length > 0 ? (
                        dashboard.geolocation.top_countries.map((country, idx) => (
                          <div key={country.code} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{getCountryFlag(country.code)}</span>
                              <span className="text-stone-300">{country.name}</span>
                            </div>
                            <span className="text-white font-medium">{country.count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone-500 text-sm">No location data yet</p>
                      )}
                    </div>
                    {dashboard.geolocation.unknown_location > 0 && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between text-stone-500">
                          <span className="text-sm">Unknown location</span>
                          <span>{dashboard.geolocation.unknown_location}</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Top Cities */}
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-orange-400" />
                      Top Cities
                    </h3>
                    <div className="space-y-3">
                      {dashboard.geolocation.top_cities.length > 0 ? (
                        dashboard.geolocation.top_cities.map((item, idx) => (
                          <div key={`${item.city}-${item.country}`} className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-stone-300">{item.city}</span>
                              <span className="text-xs text-stone-500">{item.country}</span>
                            </div>
                            <span className="text-white font-medium">{item.count}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-stone-500 text-sm">No city data yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* Subscription & Revenue - v1.4 Updated */}
            {dashboard.subscription && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-400" />
                  Subscription & Revenue
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Free Users" value={dashboard.subscription.free_users} icon={Users} color="blue" />
                  <StatCard title="Pro Users" value={dashboard.subscription.pro_users} subtitle={`${dashboard.subscription.conversion_rate}% conversion`} icon={Crown} color="green" />
                  <StatCard title="Monthly Revenue" value={`$${dashboard.subscription.monthly_revenue_estimate}`} subtitle={`Potential: $${dashboard.subscription.potential_revenue}`} icon={DollarSign} color="purple" />
                  <StatCard title="At Usage Limit" value={dashboard.subscription.users_at_limit} subtitle="Free users at 5/5" icon={Target} color="orange" />
                </div>
                
                {/* Region Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-400" />
                      Region Breakdown
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-subtle p-4 rounded-xl text-center">
                        <p className="text-xs text-stone-400 mb-1">Africa</p>
                        <p className="text-2xl font-bold text-amber-400">{dashboard.subscription.africa_users}</p>
                        <p className="text-xs text-green-400 mt-1">{dashboard.subscription.africa_conversion_rate}% Pro</p>
                      </div>
                      <div className="glass-subtle p-4 rounded-xl text-center">
                        <p className="text-xs text-stone-400 mb-1">Global</p>
                        <p className="text-2xl font-bold text-blue-400">{dashboard.subscription.global_users}</p>
                        <p className="text-xs text-green-400 mt-1">{dashboard.subscription.global_conversion_rate}% Pro</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-400" />
                      Usage Stats
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-subtle p-4 rounded-xl text-center">
                        <p className="text-xs text-stone-400 mb-1">Total Used</p>
                        <p className="text-2xl font-bold text-purple-400">{dashboard.subscription.total_generations_used}</p>
                        <p className="text-xs text-stone-500 mt-1">generations</p>
                      </div>
                      <div className="glass-subtle p-4 rounded-xl text-center">
                        <p className="text-xs text-stone-400 mb-1">Avg/User</p>
                        <p className="text-2xl font-bold text-green-400">{dashboard.subscription.avg_generations_per_user}</p>
                        <p className="text-xs text-stone-500 mt-1">per month</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Subscription Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div className="glass-subtle p-4 rounded-xl text-center border border-green-500/20">
                    <p className="text-xs text-stone-400 mb-1">Active Subs</p>
                    <p className="text-xl font-bold text-green-400">{dashboard.subscription.active_subscriptions}</p>
                  </div>
                  <div className="glass-subtle p-4 rounded-xl text-center border border-amber-500/20">
                    <p className="text-xs text-stone-400 mb-1">Cancelled</p>
                    <p className="text-xl font-bold text-amber-400">{dashboard.subscription.cancelled_subscriptions}</p>
                  </div>
                  <div className="glass-subtle p-4 rounded-xl text-center border border-red-500/20">
                    <p className="text-xs text-stone-400 mb-1">Expired</p>
                    <p className="text-xl font-bold text-red-400">{dashboard.subscription.expired_subscriptions}</p>
                  </div>
                </div>
              </section>
            )}

            {/* Job Landing Celebration Stats - v1.5 */}
            {dashboard.job_landing && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-orange-400" />
                  Job Landing Celebrations
                  <span className="text-xs text-emerald-400 font-normal ml-2">Users who got hired!</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Total Jobs Landed" 
                    value={dashboard.job_landing.total_landed} 
                    subtitle={`${dashboard.job_landing.landing_rate}% landing rate`}
                    icon={Trophy} 
                    color="green" 
                  />
                  <StatCard 
                    title="Landed Today" 
                    value={dashboard.job_landing.landed_today} 
                    subtitle={`This week: ${dashboard.job_landing.landed_this_week}`}
                    icon={PartyPopper} 
                    color="purple" 
                  />
                  <StatCard 
                    title="Users with Jobs" 
                    value={dashboard.job_landing.users_with_landed_jobs} 
                    subtitle="Users who landed at least 1 job"
                    icon={Users} 
                    color="blue" 
                  />
                  <StatCard 
                    title="This Month" 
                    value={dashboard.job_landing.landed_this_month} 
                    icon={TrendingUp} 
                    color="orange" 
                  />
                </div>
                
                {/* Top Companies */}
                {dashboard.job_landing.top_companies.length > 0 && (
                  <div className="mt-4">
                    <div className="glass-card p-6">
                      <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-emerald-400" />
                        Top Companies Where Users Landed
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {dashboard.job_landing.top_companies.slice(0, 10).map((item, idx) => (
                          <div 
                            key={item.company} 
                            className="glass-subtle p-3 rounded-xl text-center border border-emerald-500/20"
                          >
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-2 text-lg font-bold text-emerald-400">
                              {item.company.charAt(0)}
                            </div>
                            <p className="text-white font-medium text-sm truncate">{item.company}</p>
                            <p className="text-emerald-400 text-xs">{item.count} landed</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Gamification Stats - v1.6 */}
            {dashboard.gamification && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-400" />
                  Gamification & Engagement
                  <span className="text-xs text-amber-400 font-normal ml-2">Drive user retention & Pro conversions</span>
                </h2>
                
                {/* Interview & Offer Pipeline */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <StatCard 
                    title="Total Interviews" 
                    value={dashboard.gamification.total_interviews} 
                    subtitle={`${dashboard.gamification.interview_rate}% of applications`}
                    icon={Phone} 
                    color="blue" 
                  />
                  <StatCard 
                    title="Total Offers" 
                    value={dashboard.gamification.total_offers} 
                    subtitle={`${dashboard.gamification.offer_rate}% of interviews`}
                    icon={Gift} 
                    color="green" 
                  />
                  <StatCard 
                    title="Interviews Today" 
                    value={dashboard.gamification.interviews_today} 
                    subtitle={`This week: ${dashboard.gamification.interviews_this_week}`}
                    icon={TrendingUp} 
                    color="purple" 
                  />
                  <StatCard 
                    title="Offers Today" 
                    value={dashboard.gamification.offers_today} 
                    subtitle={`This week: ${dashboard.gamification.offers_this_week}`}
                    icon={Star} 
                    color="orange" 
                  />
                </div>
                
                {/* XP & Achievements */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                      <Star className="h-4 w-4 text-amber-400" />
                      XP System
                    </h3>
                    <div className="text-center">
                      <p className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                        {dashboard.gamification.total_xp_awarded.toLocaleString()}
                      </p>
                      <p className="text-stone-500 text-sm mt-2">Total XP awarded</p>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                      <Medal className="h-4 w-4 text-purple-400" />
                      Achievements
                    </h3>
                    <div className="text-center">
                      <p className="text-4xl font-bold text-purple-400">
                        {dashboard.gamification.achievements_unlocked}
                      </p>
                      <p className="text-stone-500 text-sm mt-2">Badges unlocked</p>
                    </div>
                  </div>
                  
                  <div className="glass-card p-6">
                    <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                      <Flame className="h-4 w-4 text-orange-400" />
                      Streak Champions
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="glass-subtle p-3 rounded-xl text-center">
                        <p className="text-2xl font-bold text-orange-400">{dashboard.gamification.max_streak_days}</p>
                        <p className="text-xs text-stone-500">Max Streak</p>
                      </div>
                      <div className="glass-subtle p-3 rounded-xl text-center">
                        <p className="text-2xl font-bold text-amber-400">{dashboard.gamification.avg_streak_days}</p>
                        <p className="text-xs text-stone-500">Avg Streak</p>
                      </div>
                    </div>
                    <p className="text-stone-500 text-xs text-center mt-2">
                      {dashboard.gamification.users_with_streaks} users with active streaks
                    </p>
                  </div>
                </div>
                
                {/* User Engagement Funnel */}
                <div className="glass-card p-6">
                  <h3 className="text-sm font-medium text-stone-300 mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-400" />
                    User Journey Funnel
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="glass-subtle p-4 rounded-xl text-center border-t-4 border-blue-500">
                      <p className="text-xs text-stone-400 mb-1">Applied</p>
                      <p className="text-2xl font-bold text-blue-400">{dashboard.generation.total_generations}</p>
                    </div>
                    <div className="glass-subtle p-4 rounded-xl text-center border-t-4 border-purple-500">
                      <p className="text-xs text-stone-400 mb-1">Interviews</p>
                      <p className="text-2xl font-bold text-purple-400">{dashboard.gamification.users_with_interviews}</p>
                      <p className="text-xs text-stone-500 mt-1">{dashboard.gamification.interview_rate}%</p>
                    </div>
                    <div className="glass-subtle p-4 rounded-xl text-center border-t-4 border-amber-500">
                      <p className="text-xs text-stone-400 mb-1">Offers</p>
                      <p className="text-2xl font-bold text-amber-400">{dashboard.gamification.users_with_offers}</p>
                      <p className="text-xs text-stone-500 mt-1">{dashboard.gamification.offer_rate}%</p>
                    </div>
                    <div className="glass-subtle p-4 rounded-xl text-center border-t-4 border-emerald-500">
                      <p className="text-xs text-stone-400 mb-1">Landed</p>
                      <p className="text-2xl font-bold text-emerald-400">{dashboard.job_landing?.users_with_landed_jobs || 0}</p>
                      <p className="text-xs text-stone-500 mt-1">{dashboard.job_landing?.landing_rate || 0}%</p>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="glass-card p-8 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-4">User Management</h2>
            <p className="text-stone-400 mb-6">View and manage users. Detailed view coming soon...</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="glass-subtle p-6 rounded-xl">
                <p className="text-sm text-stone-400 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gradient">{user_activity.total_users}</p>
              </div>
              <div className="glass-subtle p-6 rounded-xl">
                <p className="text-sm text-stone-400 mb-1">Onboarding Rate</p>
                <p className="text-3xl font-bold text-gradient">
                  {user_activity.total_users > 0 ? Math.round((user_activity.onboarding_completed / user_activity.total_users) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generations' && (
          <div className="glass-card p-8 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-4">Generation History</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-subtle p-5 rounded-xl">
                <p className="text-sm text-stone-400 mb-1">Total</p>
                <p className="text-2xl font-bold text-white">{generation.total_generations}</p>
              </div>
              <div className="glass-subtle p-5 rounded-xl border border-green-500/20">
                <p className="text-sm text-green-400 mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-400">{generation.successful_generations}</p>
              </div>
              <div className="glass-subtle p-5 rounded-xl border border-red-500/20">
                <p className="text-sm text-red-400 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-400">{generation.failed_generations}</p>
              </div>
              <div className="glass-subtle p-5 rounded-xl border border-blue-500/20">
                <p className="text-sm text-blue-400 mb-1">Avg. JD Length</p>
                <p className="text-2xl font-bold text-blue-400">{Math.round(jd_insights.avg_jd_length)} chars</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="glass-card p-8 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-6">System Errors</h2>
            <DistributionChart data={system_health.errors_by_type} title="Errors by Type (This Week)" />
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Email Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="neu-flat w-10 h-10 rounded-xl flex items-center justify-center bg-blue-500/10">
                    <Users className="h-5 w-5 text-blue-400" />
                  </div>
                  <p className="text-sm text-stone-400">Total Users</p>
                </div>
                <p className="text-2xl font-bold text-white">{emailStats?.total_users || user_activity.total_users}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="neu-flat w-10 h-10 rounded-xl flex items-center justify-center bg-green-500/10">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                  </div>
                  <p className="text-sm text-stone-400">Subscribed</p>
                </div>
                <p className="text-2xl font-bold text-green-400">{emailStats?.subscribed_users || user_activity.total_users}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="neu-flat w-10 h-10 rounded-xl flex items-center justify-center bg-red-500/10">
                    <XCircle className="h-5 w-5 text-red-400" />
                  </div>
                  <p className="text-sm text-stone-400">Unsubscribed</p>
                </div>
                <p className="text-2xl font-bold text-red-400">{emailStats?.unsubscribed_users || 0}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="neu-flat w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/10">
                    <Mail className="h-5 w-5 text-purple-400" />
                  </div>
                  <p className="text-sm text-stone-400">Emailed Today</p>
                </div>
                <p className="text-2xl font-bold text-purple-400">{emailStats?.emailed_today || 0}</p>
              </div>
              <div className="glass-card p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="neu-flat w-10 h-10 rounded-xl flex items-center justify-center bg-orange-500/10">
                    <TrendingUp className="h-5 w-5 text-orange-400" />
                  </div>
                  <p className="text-sm text-stone-400">This Week</p>
                </div>
                <p className="text-2xl font-bold text-orange-400">{emailStats?.emailed_this_week || 0}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Broadcast Form */}
              <div className="lg:col-span-2 glass-card p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="neu-raised w-12 h-12 rounded-2xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">Send Broadcast Email</h2>
                      <p className="text-sm text-stone-400">Send an email to all subscribed users</p>
                    </div>
                  </div>
                  
                  {/* Templates Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setShowTemplates(!showTemplates)}
                      className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-stone-300 hover:bg-white/10 transition-colors"
                    >
                      <FileEdit className="h-4 w-4" />
                      Templates
                      <ChevronDown className={`h-4 w-4 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
                    </button>
                    {showTemplates && (
                      <div className="absolute right-0 mt-2 w-64 bg-stone-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden">
                        {emailTemplates.map((template, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyTemplate(template)}
                            className="w-full px-4 py-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                          >
                            <p className="text-sm font-medium text-white">{template.name}</p>
                            <p className="text-xs text-stone-500 truncate">{template.subject}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-5">
                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-medium text-stone-300 mb-2">Subject</label>
                    <input
                      type="text"
                      value={broadcastSubject}
                      onChange={(e) => setBroadcastSubject(e.target.value)}
                      placeholder="Exciting News from UmukoziHR!"
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50"
                    />
                  </div>

                  {/* Body */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-stone-300">Message</label>
                      <span className="text-xs text-stone-500">{broadcastBody.length} characters</span>
                    </div>
                    <textarea
                      value={broadcastBody}
                      onChange={(e) => setBroadcastBody(e.target.value)}
                      placeholder="Hey everyone! We're excited to announce..."
                      rows={10}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 resize-none font-mono text-sm"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-stone-500">Line breaks preserved. Styled with UmukoziHR branding.</p>
                      {(broadcastSubject || broadcastBody) && (
                        <button
                          onClick={clearDraft}
                          className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-3 w-3" />
                          Clear Draft
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Test Mode Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div>
                      <p className="text-sm font-medium text-white">Test Mode</p>
                      <p className="text-xs text-stone-400">Send only to your admin email first</p>
                    </div>
                    <button
                      onClick={() => setBroadcastTestMode(!broadcastTestMode)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        broadcastTestMode ? 'bg-orange-500' : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          broadcastTestMode ? 'left-8' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Warning for live mode */}
                  {!broadcastTestMode && (
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-400">Live Mode Enabled</p>
                          <p className="text-xs text-amber-400/80 mt-1">
                            This will send to all {emailStats?.subscribed_users || user_activity.total_users} subscribed users. Make sure you've tested first!
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Send Button */}
                  <button
                    onClick={handleSendBroadcast}
                    disabled={isSendingBroadcast || !broadcastSubject.trim() || !broadcastBody.trim()}
                    className={`w-full py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                      broadcastTestMode
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white'
                        : 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isSendingBroadcast ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        {broadcastTestMode ? 'Send Test Email' : `Send to ${emailStats?.subscribed_users || user_activity.total_users} Users`}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Broadcast History */}
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <History className="h-5 w-5 text-orange-400" />
                  <h3 className="text-sm font-medium text-white">Sent History</h3>
                </div>
                
                {broadcastHistory.length > 0 ? (
                  <div className="space-y-3">
                    {broadcastHistory.map((item, idx) => (
                      <div key={idx} className="p-3 bg-white/5 rounded-lg border border-white/5">
                        <p className="text-sm text-white font-medium truncate">{item.subject}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-stone-500">
                            {new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-green-400">{item.recipients} sent</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Mail className="h-8 w-8 text-stone-600 mx-auto mb-2" />
                    <p className="text-sm text-stone-500">No broadcasts sent yet</p>
                    <p className="text-xs text-stone-600 mt-1">Your sent broadcasts will appear here</p>
                  </div>
                )}

                {/* Quick Info */}
                <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <p className="text-xs text-blue-400 font-medium mb-2">Auto Emails (Automatic)</p>
                  <ul className="text-xs text-blue-400/70 space-y-1">
                    <li>• Welcome email on signup</li>
                    <li>• 48h inactivity nudge</li>
                    <li>• Weekly digest (Mondays 9am)</li>
                    <li>• Achievement celebrations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}