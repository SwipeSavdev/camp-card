'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageLayout from '../components/PageLayout';
import { api } from '@/lib/api';

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  text: '#1f2937',
  primary50: '#eff6ff',
  primary100: '#dbeafe',
  primary300: '#93c5fd',
  primary600: '#2563eb',
  primary800: '#1e40af',
  primary900: '#1e3a8a',
  success50: '#f0fdf4',
  success200: '#bbf7d0',
  success600: '#16a34a',
  warning50: '#fefce8',
  warning600: '#eab308',
  info50: '#f0f9ff',
  info600: '#0284c7',
  error400: '#f87171',
  error500: '#ef4444',
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px',
};
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: Record<string, JSX.Element> = {
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H17" />
           </svg>,
    creditCard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
                </svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>,
    checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
                 </svg>,
  };
  return icons[name] || null;
}

// Mock data available for testing
const _mockSubscriptionData = {
  total_subscriptions: { value: 8932, change: 12.3 },
  active_subscriptions: { value: 7654, change: 9.8 },
  monthly_plan: { value: 3421, change: 15.2 },
  annual_plan: { value: 4233, change: 8.1 },
  trial_users: { value: 1278, change: 22.5 },
  cancellations: { value: 247, change: -5.3 },
  mrr: { value: '$47,829', change: 14.2 },
  arr: { value: '$573,948', change: 18.5 },
  churn_rate: { value: '2.1%', change: -0.8 },
  retention_rate: { value: '97.9%', change: 0.8 },
  upgrade_rate: { value: '6.2%', change: 3.1 },
  downgrade_rate: { value: '1.8%', change: -0.5 },
};

interface SubscriptionData {
  totalSubscriptions: number;
  activeSubscriptions: number;
  monthlyPlans: number;
  annualPlans: number;
  trialUsers: number;
  cancellations: number;
  mrr: number;
  arr: number;
  churnRate: number;
  retentionRate: number;
  upgradeRate: number;
  downgradeRate: number;
}

export default function SubscriptionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<SubscriptionData>({
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    monthlyPlans: 0,
    annualPlans: 0,
    trialUsers: 0,
    cancellations: 0,
    mrr: 0,
    arr: 0,
    churnRate: 0,
    retentionRate: 0,
    upgradeRate: 0,
    downgradeRate: 0,
  });

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  useEffect(() => {
    if (session) {
      loadSubscriptionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, dateRange]);

  const loadSubscriptionData = async () => {
    try {
      setLoading(true);
      // Try to get subscription analytics from dashboard summary
      const dashboardData = await api.getDashboardSummary(session);
      if (dashboardData) {
        setData({
          totalSubscriptions: dashboardData.totalSubscriptions || 0,
          activeSubscriptions: dashboardData.activeSubscriptions || 0,
          monthlyPlans: dashboardData.monthlyPlans || 0,
          annualPlans: dashboardData.annualPlans || 0,
          trialUsers: dashboardData.trialUsers || 0,
          cancellations: dashboardData.cancellations || 0,
          mrr: dashboardData.mrr || 0,
          arr: dashboardData.arr || 0,
          churnRate: dashboardData.churnRate || 0,
          retentionRate: dashboardData.retentionRate || 100,
          upgradeRate: dashboardData.upgradeRate || 0,
          downgradeRate: dashboardData.downgradeRate || 0,
        });
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => num.toLocaleString();
  const formatCurrency = (num: number) => `$${num.toLocaleString()}`;
  const formatPercent = (num: number) => `${num.toFixed(1)}%`;

  if (status === 'loading') return null;
  if (!session) return null;

  const subscriptionStats = [
    {
      label: 'Total Subscriptions', value: loading ? '...' : formatNumber(data.totalSubscriptions), change: '+12.3%', icon: 'creditCard', color: themeColors.primary50, trend: 'up',
    },
    {
      label: 'Active Subscriptions', value: loading ? '...' : formatNumber(data.activeSubscriptions), change: '+9.8%', icon: 'checkCircle', color: themeColors.success50, trend: 'up',
    },
    {
      label: 'Monthly Plans', value: loading ? '...' : formatNumber(data.monthlyPlans), change: '+15.2%', icon: 'chart', color: themeColors.info50, trend: 'up',
    },
    {
      label: 'Annual Plans', value: loading ? '...' : formatNumber(data.annualPlans), change: '+8.1%', icon: 'chart', color: themeColors.warning50, trend: 'up',
    },
  ];

  const total = data.monthlyPlans + data.annualPlans + data.trialUsers || 1;
  const subscriptionBreakdown = [
    {
      plan: 'Monthly', count: data.monthlyPlans, revenue: formatCurrency(data.monthlyPlans * 10), percentage: ((data.monthlyPlans / total) * 100), color: themeColors.info600,
    },
    {
      plan: 'Annual', count: data.annualPlans, revenue: formatCurrency(data.annualPlans * 30), percentage: ((data.annualPlans / total) * 100), color: themeColors.primary600,
    },
    {
      plan: 'Trial', count: data.trialUsers, revenue: '$0', percentage: ((data.trialUsers / total) * 100), color: themeColors.gray400,
    },
  ];

  const statusTotal = data.activeSubscriptions + data.trialUsers + data.cancellations || 1;
  const statusBreakdown = [
    {
      status: 'Active', count: data.activeSubscriptions, percentage: ((data.activeSubscriptions / statusTotal) * 100), color: themeColors.success600,
    },
    {
      status: 'Trial', count: data.trialUsers, percentage: ((data.trialUsers / statusTotal) * 100), color: themeColors.warning600,
    },
    {
      status: 'Cancelled', count: data.cancellations, percentage: ((data.cancellations / statusTotal) * 100), color: themeColors.error500,
    },
  ];

  const churnMetrics = [
    {
      metric: 'Churn Rate', value: loading ? '...' : formatPercent(data.churnRate), change: '-0.8%', type: 'negative' as const,
    },
    {
      metric: 'Retention Rate', value: loading ? '...' : formatPercent(data.retentionRate), change: '+0.8%', type: 'positive' as const,
    },
    {
      metric: 'Upgrade Rate', value: loading ? '...' : formatPercent(data.upgradeRate), change: '+3.1%', type: 'positive' as const,
    },
    {
      metric: 'Downgrade Rate', value: loading ? '...' : formatPercent(data.downgradeRate), change: '-0.5%', type: 'positive' as const,
    },
  ];

  const avgRevPerUser = data.totalSubscriptions > 0 ? data.mrr / data.totalSubscriptions : 0;
  const revenueMetrics = [
    { metric: 'MRR (Monthly Recurring Revenue)', value: loading ? '...' : formatCurrency(data.mrr), change: '+14.2%' },
    { metric: 'ARR (Annual Recurring Revenue)', value: loading ? '...' : formatCurrency(data.arr), change: '+18.5%' },
    { metric: 'Avg Revenue Per User', value: loading ? '...' : formatCurrency(avgRevPerUser), change: '+5.2%' },
  ];

  return (
    <PageLayout title="Subscriptions" currentPath="/subscriptions">
      {/* Header */}
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: themeSpace.md, marginBottom: themeSpace.lg,
        }}
        >
          <p style={{ fontSize: '13px', color: themeColors.gray600, margin: 0 }}>Subscription levels, terms, and performance metrics</p>
        </div>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          style={{
            padding: `${themeSpace.sm} ${themeSpace.md}`,
            border: `1px solid ${themeColors.gray200}`,
            borderRadius: themeRadius.sm,
            fontSize: '14px',
            backgroundColor: themeColors.white,
            cursor: 'pointer',
          }}
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </select>
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: themeSpace.xl, overflowY: 'auto' }}>
        {/* Summary Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl,
        }}
        >
          {subscriptionStats.map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: themeColors.white,
                borderRadius: themeRadius.card,
                border: `1px solid ${themeColors.gray200}`,
                padding: themeSpace.lg,
                boxShadow: themeShadow.sm,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.md,
              }}
              >
                <div style={{ padding: `${themeSpace.md}`, backgroundColor: stat.color, borderRadius: themeRadius.sm }}>
                  <Icon name={stat.icon} size={20} color={themeColors.primary600} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: '600', color: stat.trend === 'up' ? themeColors.success600 : themeColors.error500 }}>
                  {stat.change}
                </span>
              </div>
              <div style={{
                fontSize: '32px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.xs,
              }}
              >
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: themeColors.gray600 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Plan Breakdown */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl,
        }}
        >
          {/* Subscription Plans */}
          <div
            style={{
              backgroundColor: themeColors.white,
              borderRadius: themeRadius.card,
              border: `1px solid ${themeColors.gray200}`,
              padding: themeSpace.lg,
              boxShadow: themeShadow.sm,
            }}
          >
            <h2 style={{
              fontSize: '16px', fontWeight: '700', color: themeColors.text, margin: 0, marginBottom: themeSpace.lg,
            }}
            >
              Subscription Plans Distribution
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg }}>
              {subscriptionBreakdown.map((plan) => (
                <div key={plan.plan}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: themeSpace.sm }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: themeColors.text }}>{plan.plan}</span>
                    <span style={{ fontSize: '13px', color: themeColors.gray600 }}>
                     {plan.count.toLocaleString()}
                     {' '}
                     subscribers
</span>
                  </div>
                  <div style={{
                    height: '8px', backgroundColor: themeColors.gray200, borderRadius: themeRadius.sm, overflow: 'hidden',
                  }}
                  >
                    <div
                     style={{
                     height: '100%',
                     backgroundColor: plan.color,
                     width: `${plan.percentage}%`,
                     transition: 'width 300ms',
                   }}
                   />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: themeSpace.xs }}>
                    <span style={{ fontSize: '11px', color: themeColors.gray500 }}>{plan.revenue}</span>
                    <span style={{ fontSize: '11px', color: themeColors.gray500 }}>
                     {plan.percentage}
                     %
</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Status Breakdown */}
          <div
            style={{
              backgroundColor: themeColors.white,
              borderRadius: themeRadius.card,
              border: `1px solid ${themeColors.gray200}`,
              padding: themeSpace.lg,
              boxShadow: themeShadow.sm,
            }}
          >
            <h2 style={{
              fontSize: '16px', fontWeight: '700', color: themeColors.text, margin: 0, marginBottom: themeSpace.lg,
            }}
            >
              Subscription Status
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg }}>
              {statusBreakdown.map((item) => (
                <div key={item.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: themeSpace.sm }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: themeColors.text }}>{item.status}</span>
                    <span style={{ fontSize: '13px', color: themeColors.gray600 }}>{item.count.toLocaleString()}</span>
                  </div>
                  <div style={{
                    height: '8px', backgroundColor: themeColors.gray200, borderRadius: themeRadius.sm, overflow: 'hidden',
                  }}
                  >
                    <div
                     style={{
                     height: '100%',
                     backgroundColor: item.color,
                     width: `${item.percentage}%`,
                     transition: 'width 300ms',
                   }}
                   />
                  </div>
                  <span style={{
                    fontSize: '11px', color: themeColors.gray500, marginTop: themeSpace.xs, display: 'block',
                  }}
                  >
                    {item.percentage}
                    % of total
</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Churn & Retention Metrics */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl,
        }}
        >
          {churnMetrics.map((metric) => (
            <div
              key={metric.metric}
              style={{
                backgroundColor: themeColors.white,
                borderRadius: themeRadius.card,
                border: `1px solid ${themeColors.gray200}`,
                padding: themeSpace.lg,
                boxShadow: themeShadow.sm,
              }}
            >
              <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.sm }}>{metric.metric}</div>
              <div style={{
                fontSize: '28px', fontWeight: '700', color: themeColors.text, marginBottom: themeSpace.xs,
              }}
              >
                {metric.value}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  color: { positive: themeColors.success600, negative: themeColors.error500 }[metric.type] || themeColors.warning600,
                }}
              >
                {metric.change}
                {' '}
                {{ positive: '', negative: '' }[metric.type] || ''}
              </div>
            </div>
          ))}
        </div>

        {/* Revenue Metrics */}
        <div
          style={{
            backgroundColor: themeColors.white,
            borderRadius: themeRadius.card,
            border: `1px solid ${themeColors.gray200}`,
            padding: themeSpace.lg,
            boxShadow: themeShadow.sm,
          }}
        >
          <h2 style={{
            fontSize: '16px', fontWeight: '700', color: themeColors.text, margin: 0, marginBottom: themeSpace.lg,
          }}
          >
            Revenue Metrics
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: themeSpace.lg }}>
            {revenueMetrics.map((metric, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <div key={idx} style={{ paddingBottom: themeSpace.lg, borderBottom: idx < revenueMetrics.length - 1 ? `1px solid ${themeColors.gray200}` : 'none' }}>
                <div style={{ fontSize: '13px', color: themeColors.gray600, marginBottom: themeSpace.sm }}>{metric.metric}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.text }}>{metric.value}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: themeColors.success600 }}>
                    {metric.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
