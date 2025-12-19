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
  Globe, Briefcase, Sparkles, DollarSign, Crown
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
    basic_users: number;
    pro_users: number;
    enterprise_users: number;
    trial_users: number;
    total_paid: number;
    monthly_revenue_estimate: number;
    conversion_rate: number;
  };
  signups_trend: { date: string; count: number }[];
  generations_trend: { date: string; count: number }[];
}

type TabType = 'overview' | 'users' | 'generations' | 'errors';

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

export default function AdminPage() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [mounted, setMounted] = useState(false);

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
    { id: 'errors' as TabType, label: 'Errors', icon: AlertTriangle }
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

            {/* Subscription & Revenue */}
            {dashboard.subscription && (
              <section>
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-orange-400" />
                  Subscription & Revenue
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard title="Free Users" value={dashboard.subscription.free_users} icon={Users} color="blue" />
                  <StatCard title="Paid Users" value={dashboard.subscription.total_paid} subtitle={`${dashboard.subscription.conversion_rate}% conversion`} icon={Crown} color="green" />
                  <StatCard title="Monthly Revenue" value={`$${dashboard.subscription.monthly_revenue_estimate}`} subtitle="Estimated" icon={DollarSign} color="purple" />
                  <StatCard title="Trial Users" value={dashboard.subscription.trial_users} icon={Clock} color="orange" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <div className="glass-subtle p-4 rounded-xl text-center">
                    <p className="text-xs text-stone-400 mb-1">Basic</p>
                    <p className="text-xl font-bold text-blue-400">{dashboard.subscription.basic_users}</p>
                  </div>
                  <div className="glass-subtle p-4 rounded-xl text-center">
                    <p className="text-xs text-stone-400 mb-1">Pro</p>
                    <p className="text-xl font-bold text-purple-400">{dashboard.subscription.pro_users}</p>
                  </div>
                  <div className="glass-subtle p-4 rounded-xl text-center">
                    <p className="text-xs text-stone-400 mb-1">Enterprise</p>
                    <p className="text-xl font-bold text-amber-400">{dashboard.subscription.enterprise_users}</p>
                  </div>
                  <div className="glass-subtle p-4 rounded-xl text-center">
                    <p className="text-xs text-stone-400 mb-1">Conversion Rate</p>
                    <p className="text-xl font-bold text-green-400">{dashboard.subscription.conversion_rate}%</p>
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
      </main>
    </div>
  );
}
