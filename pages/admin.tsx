import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { admin as adminApi } from '@/lib/api';
import ThemeToggle from '@/components/ThemeToggle';
import { 
  Users, FileText, AlertTriangle, Activity, 
  TrendingUp, Clock, CheckCircle, XCircle,
  ArrowLeft, RefreshCw
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
  signups_trend: Array<{ date: string; count: number }>;
  generations_trend: Array<{ date: string; count: number }>;
}

function StatCard({ title, value, subtitle, icon: Icon, color = 'blue' }: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-neutral-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-neutral-50 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 dark:text-neutral-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function TrendChart({ data, label }: { data: Array<{ date: string; count: number }>; label: string }) {
  const maxCount = Math.max(...data.map(d => d.count), 1);
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4">{label}</h3>
      <div className="flex items-end gap-2 h-32">
        {data.map((item, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div 
              className="w-full bg-orange-500 rounded-t"
              style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: item.count > 0 ? '4px' : '0' }}
            />
            <span className="text-xs text-gray-500 mt-1">{item.date.slice(5)}</span>
            <span className="text-xs font-medium text-gray-700 dark:text-neutral-300">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DistributionChart({ data, title }: { data: Record<string, number>; title: string }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
  const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500', 'bg-red-500', 'bg-yellow-500'];
  
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4">{title}</h3>
      <div className="space-y-2">
        {Object.entries(data).slice(0, 5).map(([key, value], idx) => (
          <div key={key} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-neutral-400 w-24 truncate capitalize">{key}</span>
            <div className="flex-1 bg-gray-200 dark:bg-neutral-700 rounded-full h-4">
              <div 
                className={`${colors[idx % colors.length]} h-4 rounded-full`}
                style={{ width: `${(value / total) * 100}%` }}
              />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-neutral-300 w-12 text-right">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'generations' | 'errors'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsRefreshing(true);
    try {
      const response = await adminApi.getDashboard();
      setDashboard(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      if (err.response?.status === 403) {
        setError('Admin access required. You do not have permission to view this page.');
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
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-neutral-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle size={48} className="mx-auto text-red-500 mb-4" />
          <h1 className="text-xl font-bold text-gray-900 dark:text-neutral-50 mb-2">Access Denied</h1>
          <p className="text-gray-600 dark:text-neutral-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/app')}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Back to App
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard) return null;

  const { user_activity, generation, jd_insights, system_health, signups_trend, generations_trend } = dashboard;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-900">
      {/* Header */}
      <div className="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/app')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-neutral-700 rounded-lg"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-neutral-50">Admin Dashboard</h1>
                <p className="text-sm text-gray-600 dark:text-neutral-400">UmukoziHR Resume Tailor Analytics</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={loadDashboard}
                disabled={isRefreshing}
                className="px-4 py-2 bg-gray-100 dark:bg-neutral-700 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-600 flex items-center gap-2"
              >
                <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                Refresh
              </button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-800 border-b border-gray-200 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            {(['overview', 'users', 'generations', 'errors'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-3 font-medium capitalize ${
                  activeTab === tab
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-600 dark:text-neutral-400 hover:text-gray-900 dark:hover:text-neutral-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* User Activity Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
                <Users size={20} /> User Activity
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Users" value={user_activity.total_users} icon={Users} color="blue" />
                <StatCard title="Signups Today" value={user_activity.signups_today} subtitle={`This week: ${user_activity.signups_this_week}`} icon={TrendingUp} color="green" />
                <StatCard title="Onboarding Completed" value={user_activity.onboarding_completed} subtitle={`In progress: ${user_activity.onboarding_in_progress}`} icon={CheckCircle} color="purple" />
                <StatCard title="Active Today" value={user_activity.active_today} subtitle={`This week: ${user_activity.active_this_week}`} icon={Activity} color="orange" />
              </div>
            </div>

            {/* Generation Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
                <FileText size={20} /> Tailoring Analytics
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Total Generations" value={generation.total_generations} icon={FileText} color="blue" />
                <StatCard title="Success Rate" value={`${generation.success_rate}%`} subtitle={`${generation.failed_generations} failed`} icon={CheckCircle} color="green" />
                <StatCard title="Avg. Duration" value={`${generation.avg_total_duration}s`} subtitle={`LLM: ${generation.avg_llm_duration}s`} icon={Clock} color="purple" />
                <StatCard title="Today" value={generation.generations_today} subtitle={`This week: ${generation.generations_this_week}`} icon={TrendingUp} color="orange" />
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TrendChart data={signups_trend} label="Signups (Last 7 Days)" />
              <TrendChart data={generations_trend} label="Generations (Last 7 Days)" />
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DistributionChart data={jd_insights.by_region} title="By Region" />
              <DistributionChart data={jd_insights.by_industry} title="By Industry" />
              <DistributionChart data={jd_insights.by_role_type} title="By Role Type" />
            </div>

            {/* System Health */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4 flex items-center gap-2">
                <AlertTriangle size={20} /> System Health
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard title="Errors Today" value={system_health.total_errors_today} icon={XCircle} color="red" />
                <StatCard title="Errors This Week" value={system_health.total_errors_this_week} icon={AlertTriangle} color="orange" />
                <StatCard title="Avg Response Time" value={`${system_health.avg_response_time_ms}ms`} icon={Clock} color="blue" />
                <StatCard title="Error Rate" value={`${system_health.error_rate}%`} icon={Activity} color="purple" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4">User Management</h2>
            <p className="text-gray-600 dark:text-neutral-400">View and manage users. Coming in detailed view...</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-neutral-400">Total Users</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-neutral-50">{user_activity.total_users}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-neutral-400">Onboarding Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-neutral-50">
                  {user_activity.total_users > 0 ? Math.round((user_activity.onboarding_completed / user_activity.total_users) * 100) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'generations' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4">Generation History</h2>
            <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-neutral-400">Total</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-neutral-50">{generation.total_generations}</p>
              </div>
              <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <p className="text-sm text-green-600 dark:text-green-400">Successful</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{generation.successful_generations}</p>
              </div>
              <div className="p-4 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">Failed</p>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">{generation.failed_generations}</p>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <p className="text-sm text-blue-600 dark:text-blue-400">Avg. JD Length</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{Math.round(jd_insights.avg_jd_length)} chars</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'errors' && (
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-neutral-50 mb-4">System Errors</h2>
            <DistributionChart data={system_health.errors_by_type} title="Errors by Type (This Week)" />
          </div>
        )}
      </div>
    </div>
  );
}
