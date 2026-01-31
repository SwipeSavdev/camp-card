/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import PageLayout from '../components/PageLayout';
import { api } from '@/lib/api';

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
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

const CHART_COLORS = [
  themeColors.primary600,
  themeColors.success600,
  themeColors.warning600,
  themeColors.info600,
  themeColors.error500,
  themeColors.primary300,
];

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
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
          </svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
       </svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" />
              </svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
         </svg>,
    checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
                 </svg>,
  };
  return icons[name] || null;
}

interface Widget {
  id: string;
  type: 'metric' | 'line' | 'area' | 'bar' | 'pie' | 'drilldown';
  title: string;
  metric: string;
  visible: boolean;
  order: number;
  drilldownType?: 'troop' | 'scout' | 'referral' | 'customer';
}

interface AvailableMetric {
  id: string;
  name: string;
  category: string;
  chartType: 'metric' | 'line' | 'area' | 'bar' | 'pie' | 'drilldown';
  drilldownType?: 'troop' | 'scout' | 'referral' | 'customer';
}

const availableMetrics: AvailableMetric[] = [
  {
    id: 'total_users', name: 'Total Users', category: 'Users', chartType: 'metric',
  },
  {
    id: 'active_users', name: 'Active Users', category: 'Users', chartType: 'metric',
  },
  {
    id: 'new_users', name: 'New Users (30d)', category: 'Users', chartType: 'metric',
  },
  {
    id: 'user_growth', name: 'User Growth %', category: 'Users', chartType: 'metric',
  },
  {
    id: 'user_trend', name: 'User Trend', category: 'Users', chartType: 'line',
  },
  {
    id: 'total_merchants', name: 'Total Merchants', category: 'Merchants', chartType: 'metric',
  },
  {
    id: 'active_merchants', name: 'Active Merchants', category: 'Merchants', chartType: 'metric',
  },
  {
    id: 'merchant_onboarding', name: 'Merchants Onboarded', category: 'Merchants', chartType: 'bar',
  },
  {
    id: 'total_offers', name: 'Total Offers', category: 'Offers', chartType: 'metric',
  },
  {
    id: 'active_offers', name: 'Active Offers', category: 'Offers', chartType: 'metric',
  },
  {
    id: 'offer_redemptions', name: 'Offer Redemptions', category: 'Offers', chartType: 'area',
  },
  {
    id: 'redemption_rate', name: 'Redemption Rate %', category: 'Offers', chartType: 'metric',
  },
  {
    id: 'offer_distribution', name: 'Offer Distribution', category: 'Offers', chartType: 'pie',
  },
  {
    id: 'total_cards', name: 'Total Cards Issued', category: 'Cards', chartType: 'metric',
  },
  {
    id: 'active_cards', name: 'Active Cards', category: 'Cards', chartType: 'metric',
  },
  {
    id: 'cards_redeemed', name: 'Cards Redeemed', category: 'Cards', chartType: 'bar',
  },
  {
    id: 'total_subscriptions', name: 'Total Subscriptions', category: 'Subscriptions', chartType: 'metric',
  },
  {
    id: 'active_subscriptions', name: 'Active Subscriptions', category: 'Subscriptions', chartType: 'metric',
  },
  {
    id: 'subscription_trend', name: 'Subscription Trend', category: 'Subscriptions', chartType: 'area',
  },
  {
    id: 'plan_distribution', name: 'Plan Distribution', category: 'Subscriptions', chartType: 'pie',
  },
  {
    id: 'churn_rate', name: 'Churn Rate %', category: 'Subscriptions', chartType: 'metric',
  },
  {
    id: 'retention_rate', name: 'Retention Rate %', category: 'Subscriptions', chartType: 'metric',
  },
  {
    id: 'mrr', name: 'MRR (Monthly Recurring Revenue)', category: 'Revenue', chartType: 'metric',
  },
  {
    id: 'arr', name: 'ARR (Annual Recurring Revenue)', category: 'Revenue', chartType: 'metric',
  },
  {
    id: 'total_revenue', name: 'Total Revenue', category: 'Revenue', chartType: 'metric',
  },
  {
    id: 'revenue_trend', name: 'Revenue Trend', category: 'Revenue', chartType: 'area',
  },
  {
    id: 'avg_transaction', name: 'Avg Transaction Value', category: 'Revenue', chartType: 'metric',
  },
  {
    id: 'transaction_volume', name: 'Transaction Volume', category: 'Transactions', chartType: 'bar',
  },
  {
    id: 'failed_transactions', name: 'Failed Transactions', category: 'Transactions', chartType: 'metric',
  },
  {
    id: 'system_uptime', name: 'System Uptime %', category: 'System', chartType: 'metric',
  },
  // BSA Troop & Scout Reporting
  {
    id: 'troop_sales', name: 'Troop Unit Sales', category: 'Troops', chartType: 'drilldown', drilldownType: 'troop',
  },
  {
    id: 'troop_recruiting', name: 'Scout Recruiting by Troop', category: 'Troops', chartType: 'drilldown', drilldownType: 'troop',
  },
  {
    id: 'scout_sales', name: 'Scout Sales (Individual)', category: 'Scouts', chartType: 'drilldown', drilldownType: 'scout',
  },
  {
    id: 'scout_referrals', name: 'Scout Referrals', category: 'Scouts', chartType: 'drilldown', drilldownType: 'referral',
  },
  {
    id: 'customer_referrals', name: 'Customer Referrals', category: 'Referrals', chartType: 'drilldown', drilldownType: 'customer',
  },
  {
    id: 'troop_sales_trend', name: 'Troop Sales Trend', category: 'Troops', chartType: 'area',
  },
  {
    id: 'total_troops', name: 'Total Troops', category: 'Troops', chartType: 'metric',
  },
  {
    id: 'active_scouts', name: 'Active Scouts', category: 'Scouts', chartType: 'metric',
  },
  {
    id: 'total_referrals', name: 'Total Referrals', category: 'Referrals', chartType: 'metric',
  },
  {
    id: 'referral_conversion', name: 'Referral Conversion Rate', category: 'Referrals', chartType: 'metric',
  },
];

const defaultWidgets: Widget[] = [
  // BSA Troop & Scout Reporting Widgets
  {
    id: '1', type: 'drilldown', title: 'Troop Unit Sales', metric: 'troop_sales', visible: true, order: 1, drilldownType: 'troop',
  },
  {
    id: '2', type: 'drilldown', title: 'Scout Recruiting by Troop', metric: 'troop_recruiting', visible: true, order: 2, drilldownType: 'troop',
  },
  {
    id: '3', type: 'drilldown', title: 'Scout Sales (Individual)', metric: 'scout_sales', visible: true, order: 3, drilldownType: 'scout',
  },
  {
    id: '4', type: 'drilldown', title: 'Scout Referrals', metric: 'scout_referrals', visible: true, order: 4, drilldownType: 'referral',
  },
  {
    id: '5', type: 'drilldown', title: 'Customer Referrals', metric: 'customer_referrals', visible: true, order: 5, drilldownType: 'customer',
  },
  // Summary Metrics
  {
    id: '6', type: 'metric', title: 'Total Troops', metric: 'total_troops', visible: true, order: 6,
  },
  {
    id: '7', type: 'metric', title: 'Active Scouts', metric: 'active_scouts', visible: true, order: 7,
  },
  {
    id: '8', type: 'area', title: 'Troop Sales Trend', metric: 'troop_sales_trend', visible: true, order: 8,
  },
];

const getMetricColor = (change: number) => {
  if (change > 10) return themeColors.success600;
  if (change > 0) return themeColors.info600;
  if (change < -5) return themeColors.error500;
  return themeColors.warning600;
};

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: themeColors.white,
        border: `1px solid ${themeColors.gray200}`,
        borderRadius: themeRadius.sm,
        padding: themeSpace.sm,
        boxShadow: themeShadow.md,
      }}
      >
        <p style={{ margin: 0, fontWeight: '600', color: themeColors.text }}>{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ margin: '4px 0 0 0', color: entry.color, fontSize: '14px' }}>
            {entry.name}
            :
            {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(new Set());
  const [detailsModal, setDetailsModal] = useState<{ widget: Widget; data: any } | null>(null);
  const [drilldownModal, setDrilldownModal] = useState<{ widget: Widget; data: any[]; selectedItem: any | null } | null>(null);

  // Real-time data states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Fetch dashboard data from API
  const fetchDashboardData = useCallback(async () => {
    if (!session) return;
    try {
      const data = await api.getDashboard(session);
      if (data) {
        setDashboardData(data);
        setLastUpdate(new Date());
        setIsConnected(true);
      }
    } catch (error) {
      console.error('[Analytics] Failed to fetch dashboard data:', error);
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Fetch data on mount and set up polling for updates
  useEffect(() => {
    if (session) {
      fetchDashboardData();

      // Set up polling every 30 seconds for real-time updates
      const pollInterval = setInterval(() => {
        fetchDashboardData();
      }, 30000);

      return () => clearInterval(pollInterval);
    }
    return undefined;
  }, [session, fetchDashboardData]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return null;
  if (!session) return null;

  // Get real chart/drilldown data from the dashboard API
  const getRealChartData = (metricId: string) => {
    if (!dashboardData) return [];

    const d = dashboardData;
    switch (metricId) {
      // Drilldown tables (real backend data)
      case 'troop_sales':
        return d.troopSales || [];
      case 'troop_recruiting':
        return d.troopRecruiting || [];
      case 'scout_sales':
        return d.scoutSales || [];
      case 'scout_referrals':
        return d.scoutReferrals || [];
      case 'customer_referrals':
        return d.customerReferrals || [];
      // Time-series charts (real backend data)
      case 'troop_sales_trend':
      case 'subscription_trend':
      case 'revenue_trend':
        return d.salesTrend30Days || [];
      // Pie charts (derived from real backend data)
      case 'plan_distribution': {
        const monthly = d.monthlyPlans || 0;
        const annual = d.annualPlans || 0;
        if (monthly === 0 && annual === 0) return [];
        return [
          { name: 'Monthly Plans', value: monthly },
          { name: 'Annual Plans', value: annual },
        ];
      }
      case 'offer_distribution':
        return d.offerDistribution || [];
      // Charts without backend time-series data yet — return empty
      case 'user_trend':
      case 'offer_redemptions':
      case 'merchant_onboarding':
      case 'cards_redeemed':
      case 'transaction_volume':
      default:
        return [];
    }
  };

  const getRealMetricData = (metricId: string) => {
    if (!dashboardData) return { value: 0, change: 0 };

    const d = dashboardData;
    switch (metricId) {
      // Users
      case 'total_users':
        return { value: d.totalUsers || 0, change: 0 };
      case 'active_users':
        return { value: d.activeUsers || 0, change: 0 };
      case 'new_users':
        return { value: d.newUsersLast30Days || 0, change: 0 };
      case 'user_growth': {
        const growth = d.totalUsers > 0 ? ((d.newUsersLast30Days || 0) / d.totalUsers * 100) : 0;
        return { value: `${growth.toFixed(1)}%`, change: 0 };
      }
      // Merchants
      case 'total_merchants':
        return { value: d.totalMerchants || 0, change: 0 };
      case 'active_merchants':
        return { value: d.activeMerchants || 0, change: 0 };
      // Offers
      case 'total_offers':
        return { value: d.totalOffers || 0, change: 0 };
      case 'active_offers':
        return { value: d.activeOffers || 0, change: 0 };
      case 'offer_redemptions':
        return { value: d.totalRedemptions || 0, change: 0 };
      case 'redemption_rate': {
        const rate = d.activeSubscriptions > 0 ? ((d.totalRedemptions || 0) / d.activeSubscriptions * 100) : 0;
        return { value: `${rate.toFixed(1)}%`, change: 0 };
      }
      // Cards
      case 'total_cards':
        return { value: d.totalCards || d.totalCardsSold || 0, change: 0 };
      case 'active_cards':
        return { value: d.activeCards || 0, change: 0 };
      case 'cards_redeemed':
        return { value: d.totalRedemptions || 0, change: 0 };
      // Subscriptions
      case 'total_subscriptions':
        return { value: d.totalSubscriptions || 0, change: 0 };
      case 'active_subscriptions':
        return { value: d.activeSubscriptions || 0, change: 0 };
      case 'churn_rate':
        return { value: `${d.churnRate || 0}%`, change: 0 };
      case 'retention_rate':
        return { value: `${d.retentionRate || 0}%`, change: 0 };
      // Revenue
      case 'mrr':
        return { value: `$${(d.mrr || 0).toLocaleString()}`, change: 0 };
      case 'arr':
        return { value: `$${(d.arr || 0).toLocaleString()}`, change: 0 };
      case 'total_revenue': {
        const revDollars = Math.round((d.totalRevenueCents || 0) / 100);
        return { value: `$${revDollars.toLocaleString()}`, change: d.salesTrend || 0 };
      }
      case 'avg_transaction': {
        const avgDollars = ((d.avgTransactionCents || 0) / 100).toFixed(2);
        return { value: `$${avgDollars}`, change: 0 };
      }
      // Transactions
      case 'transaction_volume':
        return { value: d.totalTransactions || 0, change: 0 };
      case 'failed_transactions':
        return { value: d.failedTransactions || 0, change: 0 };
      // System
      case 'system_uptime':
        return { value: `${d.systemUptime || 99.9}%`, change: 0 };
      // BSA Troops & Scouts
      case 'total_troops':
        return { value: d.totalTroops || 0, change: d.troopsTrend || 0 };
      case 'active_scouts':
        return { value: d.activeScouts || 0, change: d.scoutsTrend || 0 };
      case 'troop_sales':
        return { value: `$${(d.totalSales || 0).toLocaleString()}`, change: d.salesTrend || 0 };
      case 'troop_recruiting':
        return { value: d.activeScouts || 0, change: d.scoutsTrend || 0 };
      case 'scout_sales':
        return { value: `$${(d.totalSales || 0).toLocaleString()}`, change: d.salesTrend || 0 };
      case 'scout_referrals':
        return { value: d.successfulReferrals || 0, change: d.referralsTrend || 0 };
      case 'customer_referrals':
        return { value: d.totalReferrals || 0, change: d.referralsTrend || 0 };
      case 'total_referrals':
        return { value: d.totalReferrals || 0, change: d.referralsTrend || 0 };
      case 'referral_conversion':
        return { value: `${d.referralConversionRate || 0}%`, change: 0 };
      default:
        return { value: 0, change: 0 };
    }
  };

  const handleAddWidget = (metric: AvailableMetric) => {
    const newWidget: Widget = {
      id: Math.random().toString(),
      type: metric.chartType,
      title: metric.name,
      metric: metric.id,
      visible: true,
      order: Math.max(...widgets.map((w) => w.order), 0) + 1,
      drilldownType: metric.drilldownType,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleDrilldown = (widget: Widget) => {
    const data = getRealChartData(widget.metric);
    setDrilldownModal({ widget, data, selectedItem: null });
  };

  const handleDrilldownItemClick = (item: any) => {
    if (drilldownModal) {
      setDrilldownModal({ ...drilldownModal, selectedItem: item });
    }
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter((w) => w.id !== id));
    setSelectedWidgets((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const handleReorderWidgets = (fromIdx: number, toIdx: number) => {
    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(fromIdx, 1);
    newWidgets.splice(toIdx, 0, removed);
    setWidgets(newWidgets.map((w, idx) => ({ ...w, order: idx + 1 })));
  };

  const handleSelectWidget = (id: string) => {
    setSelectedWidgets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleShowDetails = (widget: Widget) => {
    const data = getMetricData(widget.metric);
    setDetailsModal({ widget, data });
  };

  const handleExport = (widget: Widget) => {
    const data = getMetricData(widget.metric);
    const chartData = getRealChartData(widget.metric);
    let csv = '';

    if (chartData && Array.isArray(chartData) && chartData.length > 0) {
      const headers = Object.keys(chartData[0]).join(',');
      const rows = chartData.map((row: any) => Object.values(row).join(',')).join('\n');
      csv = `${headers}\n${rows}`;
    } else {
      csv = `Metric,Value\n${widget.title},${data.value}`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${widget.title.replace(/\s+/g, '-')}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const handleExportSelected = () => {
    if (selectedWidgets.size === 0) return;
    const selectedData = visibleWidgets
      .filter((w) => selectedWidgets.has(w.id))
      .map((w) => `${w.title},${getMetricData(w.metric).value}`)
      .join('\n');
    const csv = `Metric,Value\n${selectedData}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const visibleWidgets = widgets.filter((w) => w.visible).sort((a, b) => a.order - b.order);
  // Use real data helper functions
  const getMetricData = (metricId: string) => getRealMetricData(metricId);

  const renderChart = (widget: Widget) => {
    const chartData = getRealChartData(widget.metric);
    const data = getMetricData(widget.metric);

    switch (widget.type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gray200} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: themeColors.gray600 }} />
              <YAxis tick={{ fontSize: 11, fill: themeColors.gray600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke={themeColors.primary600}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: themeColors.primary600 }}
                name="Users"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={themeColors.primary600} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={themeColors.primary600} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gray200} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: themeColors.gray600 }} />
              <YAxis tick={{ fontSize: 11, fill: themeColors.gray600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke={themeColors.primary600}
                strokeWidth={2}
                fill={`url(#gradient-${widget.id})`}
                name="Value"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gray200} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: themeColors.gray600 }} />
              <YAxis tick={{ fontSize: 11, fill: themeColors.gray600 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill={themeColors.primary600}
                radius={[4, 4, 0, 0]}
                name="Count"
              />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {chartData?.map((_entry: any, index: number) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'drilldown': {
        // Show a preview table with top items and a "View All" button
        const previewData = (chartData || []).slice(0, 3);
        const totalItems = (chartData || []).length;
        const metricKeyMap: Record<string, string> = { troop_sales: 'sales', troop_recruiting: 'newScouts', scout_sales: 'sales', scout_referrals: 'referrals' };
        const primaryKey = metricKeyMap[widget.metric] || 'referrals';

        return (
          <div style={{ display: 'flex', flexDirection: 'column', height: '200px' }}>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {previewData.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: `${themeSpace.sm} 0`,
                    borderBottom: idx < previewData.length - 1 ? `1px solid ${themeColors.gray100}` : 'none',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: themeColors.text }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '11px', color: themeColors.gray600 }}>
                      {item.troop || item.council || item.email || ''}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: themeColors.primary600 }}>
                      {primaryKey === 'sales' ? `$${item[primaryKey]?.toLocaleString()}` : item[primaryKey]?.toLocaleString()}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: item.trend >= 0 ? themeColors.success600 : themeColors.error500,
                    }}
                    >
                      {item.trend >= 0 ? '↑' : '↓'}
                      {' '}
                      {Math.abs(item.trend)}
                      %
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {totalItems > 3 && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleDrilldown(widget); }}
                style={{
                  marginTop: themeSpace.sm,
                  padding: `${themeSpace.xs} ${themeSpace.sm}`,
                  backgroundColor: themeColors.primary50,
                  color: themeColors.primary600,
                  border: `1px solid ${themeColors.primary600}`,
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              >
                View All
                {' '}
                {totalItems}
                {' '}
                Items →
              </button>
            )}
          </div>
        );
      }

      default: {
        const isPositive = data.change >= 0;
        return (
          <>
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: themeSpace.md,
            }}
            >
              <div style={{
                fontSize: '32px', fontWeight: '700', color: themeColors.primary600, marginBottom: themeSpace.sm,
              }}
              >
                {data.value}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: themeSpace.xs, fontSize: '13px', fontWeight: '600', color: getMetricColor(data.change),
              }}
              >
                <span>
                  {isPositive ? '↑' : '↓'}
                  {' '}
                  {Math.abs(data.change)}
                  %
                </span>
                <span style={{ color: themeColors.gray600, fontWeight: '500' }}>
                  vs
                  {dateRange}
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={[0, 1, 2, 3, 4, 5, 6].map((i) => ({ date: i, value: typeof data.value === 'number' ? data.value : 0 }))}>
                <defs>
                  <linearGradient id={`mini-gradient-${widget.id}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getMetricColor(data.change)} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={getMetricColor(data.change)} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={getMetricColor(data.change)}
                  strokeWidth={2}
                  fill={`url(#mini-gradient-${widget.id})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        );
      }
    }
  };

  return (
    <PageLayout title="Analytics Dashboard" currentPath="/analytics">
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: themeSpace.lg,
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
            <p style={{ margin: 0, color: themeColors.gray600, fontSize: '14px' }}>
              {isLoading ? 'Loading data...' : 'Interactive charts and customizable metrics'}
            </p>
            {/* Real-time connection status */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: isConnected ? themeColors.success50 : themeColors.gray100, borderRadius: '12px', fontSize: '12px',
            }}
            >
              <span style={{
                width: '8px', height: '8px', borderRadius: '50%', backgroundColor: isConnected ? themeColors.success600 : themeColors.gray500,
              }}
              />
              <span style={{ color: isConnected ? themeColors.success600 : themeColors.gray600 }}>
                {isConnected ? 'Live' : 'Offline'}
              </span>
            </div>
            {lastUpdate && (
              <span style={{ fontSize: '12px', color: themeColors.gray500 }}>
                Updated:
                {' '}
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: themeSpace.md }}>
            {selectedWidgets.size > 0 && (
            <button
              type="button"
              onClick={handleExportSelected}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.success600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: themeSpace.sm,
              }}
            >
              <Icon name="download" size={16} />
              Export (
              {selectedWidgets.size}
              )
            </button>
            )}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, fontSize: '14px', backgroundColor: themeColors.white, cursor: 'pointer',
              }}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
            <button
              type="button"
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: editMode ? themeColors.primary600 : themeColors.white, color: editMode ? themeColors.white : themeColors.primary600, border: `1px solid ${themeColors.primary600}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: themeSpace.sm,
              }}
            >
              <Icon name="settings" size={16} />
              {editMode ? 'Done' : 'Customize'}
            </button>
            <button
              type="button"
              onClick={() => setShowWidgetSelector(!showWidgetSelector)}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.primary600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: themeSpace.sm,
              }}
            >
              <Icon name="plus" size={16} />
              Add Widget
            </button>
          </div>
        </div>
      </div>

      {showWidgetSelector && (
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, maxHeight: '400px', overflowY: 'auto',
      }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
        }}
        >
          <h2 style={{
            margin: 0, fontSize: '18px', fontWeight: '700', color: themeColors.text,
          }}
          >
            Available Metrics
          </h2>
          <button
            type="button"
            onClick={() => setShowWidgetSelector(false)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer', color: themeColors.gray600,
            }}
          >
            <Icon name="x" size={20} />
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: themeSpace.md }}>
          {availableMetrics.map((metric) => {
            const isAdded = widgets.some((w) => w.metric === metric.id);
            const chartTypeLabel = metric.chartType === 'metric' ? 'KPI' : metric.chartType.charAt(0).toUpperCase() + metric.chartType.slice(1);
            return (
              <button
                type="button"
                key={metric.id}
                onClick={() => !isAdded && handleAddWidget(metric)}
                disabled={isAdded}
                style={{
                  padding: themeSpace.md, backgroundColor: isAdded ? themeColors.gray100 : themeColors.white, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.card, cursor: isAdded ? 'default' : 'pointer', textAlign: 'left', opacity: isAdded ? 0.5 : 1,
                }}
              >
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.xs,
                }}
                >
                  <p style={{
                    margin: 0, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase',
                  }}
                  >
                    {metric.category}
                  </p>
                  <span style={{
                    fontSize: '10px', fontWeight: '600', color: themeColors.primary600, backgroundColor: themeColors.primary50, padding: '2px 6px', borderRadius: '4px',
                  }}
                  >
                    {chartTypeLabel}
                  </span>
                </div>
                <p style={{
                  margin: 0, fontSize: '14px', fontWeight: '600', color: themeColors.text,
                }}
                >
                  {metric.name}
                </p>
                {isAdded && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: themeColors.success600 }}>✓ Added</p>}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {visibleWidgets.length === 0 ? (
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `2px dashed ${themeColors.gray200}`, padding: themeSpace.xl, textAlign: 'center',
        }}
        >
          <Icon name="chart" size={48} color={themeColors.gray200} />
          <p style={{
            fontSize: '18px', fontWeight: '600', color: themeColors.text, marginTop: themeSpace.lg, marginBottom: themeSpace.sm,
          }}
          >
            No widgets selected
          </p>
          <p style={{
            fontSize: '14px', color: themeColors.gray600, margin: 0, marginBottom: themeSpace.lg,
          }}
          >
            Click &quot;Add Widget&quot; to start building your dashboard
          </p>
          <button
            type="button"
            onClick={() => setShowWidgetSelector(true)}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.lg}`, backgroundColor: themeColors.primary600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600',
            }}
          >
            Add Your First Widget
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: themeSpace.lg }}>
          {visibleWidgets.map((widget, idx) => {
            const isSelected = selectedWidgets.has(widget.id);
            const isChartWidget = widget.type !== 'metric';
            return (
              <div
                key={widget.id}
                onClick={() => !editMode && handleSelectWidget(widget.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                style={{
                  backgroundColor: isSelected ? `${themeColors.primary600}08` : themeColors.white,
                  borderRadius: themeRadius.card,
                  border: isSelected ? `2px solid ${themeColors.primary600}` : `1px solid ${themeColors.gray200}`,
                  padding: themeSpace.lg,
                  boxShadow: themeShadow.sm,
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: editMode ? 'default' : 'pointer',
                  gridColumn: isChartWidget ? 'span 1' : 'span 1',
                }}
              >
                {!editMode && isSelected && (
                  <div style={{
                    position: 'absolute', top: themeSpace.md, right: themeSpace.md, color: themeColors.primary600,
                  }}
                  >
                    <Icon name="checkCircle" size={20} />
                  </div>
                )}
                {editMode && (
                  <div style={{
                    display: 'flex', gap: themeSpace.sm, position: 'absolute', top: themeSpace.md, right: themeSpace.md,
                  }}
                  >
                    {idx > 0 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleReorderWidgets(idx, idx - 1); }}
                      style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                          }}
                      title="Move up"
                    >
                      <Icon name="chart" size={16} color={themeColors.primary600} />
                    </button>
                    )}
                    {idx < visibleWidgets.length - 1 && (
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleReorderWidgets(idx, idx + 1); }}
                      style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                          }}
                      title="Move down"
                    >
                      <Icon name="chart" size={16} color={themeColors.primary600} />
                    </button>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleRemoveWidget(widget.id); }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs, color: themeColors.error500,
                      }}
                    >
                      <Icon name="x" size={16} />
                    </button>
                  </div>
                )}
                <div style={{ marginBottom: themeSpace.md }}>
                  <h3 style={{
                    margin: 0, fontSize: '16px', fontWeight: '700', color: themeColors.text, paddingRight: editMode ? '100px' : 0,
                  }}
                  >
                    {widget.title}
                  </h3>
                </div>

                {renderChart(widget)}

                <div style={{
                  display: 'flex', gap: themeSpace.sm, paddingTop: themeSpace.md, borderTop: `1px solid ${themeColors.gray200}`, marginTop: 'auto',
                }}
                >
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleShowDetails(widget); }}
                    style={{
                      flex: 1, padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: 'transparent', border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}
                  >
                    <Icon name="eye" size={14} />
                    Details
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleExport(widget); }}
                    style={{
                      flex: 1, padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: 'transparent', border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}
                  >
                    <Icon name="download" size={14} />
                    Export
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {detailsModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setDetailsModal(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
        >
          <div
            style={{
              backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, maxWidth: '600px', width: '90%', boxShadow: themeShadow.md,
            }}
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: themeSpace.lg,
            }}
            >
              <h2 style={{
                margin: 0, fontSize: '20px', fontWeight: '700', color: themeColors.text,
              }}
              >
                Metric Details
              </h2>
              <button
                type="button"
                onClick={() => setDetailsModal(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer', color: themeColors.gray600,
                }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            <div style={{ marginBottom: themeSpace.lg }}>
              <p style={{
                margin: `0 0 ${themeSpace.xs} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase',
              }}
              >
                Metric Name
              </p>
              <p style={{
                margin: 0, fontSize: '18px', fontWeight: '700', color: themeColors.text,
              }}
              >
                {detailsModal.widget.title}
              </p>
            </div>

            <div style={{ marginBottom: themeSpace.lg }}>
              <p style={{
                margin: `0 0 ${themeSpace.xs} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase',
              }}
              >
                Current Value
              </p>
              <p style={{
                margin: 0, fontSize: '36px', fontWeight: '700', color: themeColors.primary600,
              }}
              >
                {detailsModal.data.value}
              </p>
            </div>

            {getRealChartData(detailsModal.widget.metric).length > 0 && (
              <div style={{ marginBottom: themeSpace.lg }}>
                <p style={{
                  margin: `0 0 ${themeSpace.md} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase',
                }}
                >
                  Trend
                </p>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={getRealChartData(detailsModal.widget.metric)}>
                    <defs>
                      <linearGradient id="detail-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={themeColors.primary600} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={themeColors.primary600} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gray200} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: themeColors.gray600 }} />
                    <YAxis tick={{ fontSize: 10, fill: themeColors.gray600 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke={themeColors.primary600} fill="url(#detail-gradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: themeSpace.md, marginBottom: themeSpace.lg,
            }}
            >
              <div>
                <p style={{
                  margin: `0 0 ${themeSpace.xs} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase',
                }}
                >
                  Change
                </p>
                <p style={{
                  margin: 0, fontSize: '18px', fontWeight: '700', color: getMetricColor(detailsModal.data.change),
                }}
                >
                  {detailsModal.data.change >= 0 ? '↑' : '↓'}
                  {' '}
                  {Math.abs(detailsModal.data.change)}
                  %
                </p>
              </div>
              <div>
                <p style={{
                  margin: `0 0 ${themeSpace.xs} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase',
                }}
                >
                  Period
                </p>
                <p style={{
                  margin: 0, fontSize: '18px', fontWeight: '700', color: themeColors.text,
                }}
                >
                  {dateRange}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: themeSpace.md }}>
              <button
                type="button"
                onClick={() => { handleExport(detailsModal.widget); setDetailsModal(null); }}
                style={{
                  flex: 1, padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.primary600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: themeSpace.sm,
                }}
              >
                <Icon name="download" size={16} />
                Export Data
              </button>
              <button
                type="button"
                onClick={() => setDetailsModal(null)}
                style={{
                  flex: 1, padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: 'transparent', color: themeColors.primary600, border: `1px solid ${themeColors.primary600}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drilldown Modal for BSA Reports */}
      {drilldownModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setDrilldownModal(null)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
        >
          <div
            style={{
              backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, maxWidth: drilldownModal.selectedItem ? '900px' : '700px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: themeShadow.md,
            }}
            onClick={(e) => e.stopPropagation()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: themeSpace.lg,
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
                {drilldownModal.selectedItem && (
                  <button
                    type="button"
                    onClick={() => setDrilldownModal({ ...drilldownModal, selectedItem: null })}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', color: themeColors.primary600, display: 'flex', alignItems: 'center', gap: themeSpace.xs, fontSize: '14px', fontWeight: '600',
                    }}
                  >
                    <Icon name="back" size={16} />
                    Back
                  </button>
                )}
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: themeColors.text }}>
                  {drilldownModal.selectedItem ? drilldownModal.selectedItem.name : drilldownModal.widget.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDrilldownModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.gray600 }}
              >
                <Icon name="x" size={20} />
              </button>
            </div>

            {/* Detail View for Selected Item */}
            {drilldownModal.selectedItem ? (
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {/* Troop Sales Detail */}
                {drilldownModal.widget.metric === 'troop_sales' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: themeSpace.md, marginBottom: themeSpace.xl }}>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.primary50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Total Sales</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.primary600 }}>${drilldownModal.selectedItem.sales?.toLocaleString()}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.success50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Active Scouts</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.success600 }}>{drilldownModal.selectedItem.scouts}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.info50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Avg Per Scout</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.info600 }}>${drilldownModal.selectedItem.avgPerScout?.toFixed(2)}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.warning50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Trend</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: drilldownModal.selectedItem.trend >= 0 ? themeColors.success600 : themeColors.error500 }}>
                          {drilldownModal.selectedItem.trend >= 0 ? '↑' : '↓'} {Math.abs(drilldownModal.selectedItem.trend)}%
                        </div>
                      </div>
                    </div>
                    <div style={{ marginBottom: themeSpace.lg }}>
                      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: themeSpace.md, color: themeColors.text }}>Scout Sales Breakdown</h3>
                      <div style={{ border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm }}>
                        {(getRealChartData('scout_sales') || [])
                          .filter((s: any) => s.troop === drilldownModal.selectedItem.name)
                          .map((scout: any, _idx: number) => (
                            <div key={scout.id} style={{ display: 'flex', justifyContent: 'space-between', padding: themeSpace.md, borderBottom: `1px solid ${themeColors.gray100}` }}>
                              <div>
                                <div style={{ fontWeight: '600', color: themeColors.text }}>{scout.name}</div>
                                <div style={{ fontSize: '12px', color: themeColors.gray600 }}>{scout.rank} • {scout.cards} cards sold</div>
                              </div>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontWeight: '700', color: themeColors.primary600 }}>${scout.sales?.toLocaleString()}</div>
                                <div style={{ fontSize: '12px', color: scout.trend >= 0 ? themeColors.success600 : themeColors.error500 }}>
                                  {scout.trend >= 0 ? '↑' : '↓'} {Math.abs(scout.trend)}%
                                </div>
                              </div>
                            </div>
                          ))}
                        {(getRealChartData('scout_sales') || []).filter((s: any) => s.troop === drilldownModal.selectedItem.name).length === 0 && (
                          <div style={{ padding: themeSpace.lg, textAlign: 'center', color: themeColors.gray600 }}>No scout data available for this troop</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scout Sales Detail */}
                {drilldownModal.widget.metric === 'scout_sales' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: themeSpace.md, marginBottom: themeSpace.xl }}>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.primary50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Total Sales</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.primary600 }}>${drilldownModal.selectedItem.sales?.toLocaleString()}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.success50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Cards Sold</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.success600 }}>{drilldownModal.selectedItem.cards}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.info50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Referrals</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.info600 }}>{drilldownModal.selectedItem.referrals}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.warning50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Rank</div>
                        <div style={{ fontSize: '18px', fontWeight: '700', color: themeColors.warning600 }}>{drilldownModal.selectedItem.rank}</div>
                      </div>
                    </div>
                    <div style={{ padding: themeSpace.md, backgroundColor: themeColors.gray50, borderRadius: themeRadius.sm }}>
                      <div style={{ fontSize: '14px', color: themeColors.gray600 }}>Troop: <span style={{ fontWeight: '600', color: themeColors.text }}>{drilldownModal.selectedItem.troop}</span></div>
                    </div>
                  </div>
                )}

                {/* Scout Referrals Detail */}
                {drilldownModal.widget.metric === 'scout_referrals' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: themeSpace.md, marginBottom: themeSpace.xl }}>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.primary50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Total Referrals</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.primary600 }}>{drilldownModal.selectedItem.referrals}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.success50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Conversions</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.success600 }}>{drilldownModal.selectedItem.conversions}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.info50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Revenue</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.info600 }}>${drilldownModal.selectedItem.revenue}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.warning50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Conversion Rate</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.warning600 }}>{drilldownModal.selectedItem.conversionRate}%</div>
                      </div>
                    </div>
                    <div style={{ padding: themeSpace.md, backgroundColor: themeColors.gray50, borderRadius: themeRadius.sm }}>
                      <div style={{ fontSize: '14px', color: themeColors.gray600 }}>Troop: <span style={{ fontWeight: '600', color: themeColors.text }}>{drilldownModal.selectedItem.troop}</span></div>
                    </div>
                  </div>
                )}

                {/* Customer Referrals Detail */}
                {drilldownModal.widget.metric === 'customer_referrals' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: themeSpace.md, marginBottom: themeSpace.xl }}>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.primary50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Total Referrals</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.primary600 }}>{drilldownModal.selectedItem.referrals}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.success50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Conversions</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.success600 }}>{drilldownModal.selectedItem.conversions}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.info50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Total Revenue</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.info600 }}>${drilldownModal.selectedItem.totalRevenue}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.warning50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Avg Order Value</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.warning600 }}>${drilldownModal.selectedItem.avgOrderValue}</div>
                      </div>
                    </div>
                    <div style={{ padding: themeSpace.md, backgroundColor: themeColors.gray50, borderRadius: themeRadius.sm, marginBottom: themeSpace.md }}>
                      <div style={{ fontSize: '14px', color: themeColors.gray600 }}>Email: <span style={{ fontWeight: '600', color: themeColors.text }}>{drilldownModal.selectedItem.email}</span></div>
                      <div style={{ fontSize: '14px', color: themeColors.gray600, marginTop: themeSpace.xs }}>Last Referral: <span style={{ fontWeight: '600', color: themeColors.text }}>{drilldownModal.selectedItem.lastReferral}</span></div>
                    </div>
                  </div>
                )}

                {/* Troop Recruiting Detail */}
                {drilldownModal.widget.metric === 'troop_recruiting' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: themeSpace.md, marginBottom: themeSpace.xl }}>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.primary50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>New Scouts</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.primary600 }}>{drilldownModal.selectedItem.newScouts}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.success50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Total Scouts</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.success600 }}>{drilldownModal.selectedItem.totalScouts}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.info50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>Goal</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.info600 }}>{drilldownModal.selectedItem.recruitingGoal}</div>
                      </div>
                      <div style={{ padding: themeSpace.md, backgroundColor: themeColors.warning50, borderRadius: themeRadius.sm }}>
                        <div style={{ fontSize: '12px', color: themeColors.gray600, marginBottom: themeSpace.xs }}>% of Goal</div>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: drilldownModal.selectedItem.percentOfGoal >= 80 ? themeColors.success600 : themeColors.warning600 }}>{drilldownModal.selectedItem.percentOfGoal}%</div>
                      </div>
                    </div>
                    <div style={{ padding: themeSpace.md, backgroundColor: themeColors.gray50, borderRadius: themeRadius.sm }}>
                      <div style={{ fontSize: '14px', color: themeColors.gray600 }}>Council: <span style={{ fontWeight: '600', color: themeColors.text }}>{drilldownModal.selectedItem.council}</span></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* List View */
              <div style={{ overflowY: 'auto', flex: 1 }}>
                <div style={{ border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm }}>
                  {/* Table Header */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                    padding: themeSpace.md,
                    backgroundColor: themeColors.gray50,
                    borderBottom: `1px solid ${themeColors.gray200}`,
                    fontWeight: '600',
                    fontSize: '12px',
                    color: themeColors.gray600,
                    textTransform: 'uppercase',
                  }}
                  >
                    <div>Name</div>
                    {drilldownModal.widget.metric === 'troop_sales' && (
                      <>
                        <div>Sales</div>
                        <div>Scouts</div>
                        <div>Avg/Scout</div>
                      </>
                    )}
                    {drilldownModal.widget.metric === 'troop_recruiting' && (
                      <>
                        <div>New Scouts</div>
                        <div>Total</div>
                        <div>% of Goal</div>
                      </>
                    )}
                    {drilldownModal.widget.metric === 'scout_sales' && (
                      <>
                        <div>Sales</div>
                        <div>Cards</div>
                        <div>Rank</div>
                      </>
                    )}
                    {drilldownModal.widget.metric === 'scout_referrals' && (
                      <>
                        <div>Referrals</div>
                        <div>Conversions</div>
                        <div>Rate</div>
                      </>
                    )}
                    {drilldownModal.widget.metric === 'customer_referrals' && (
                      <>
                        <div>Referrals</div>
                        <div>Revenue</div>
                        <div>Last Active</div>
                      </>
                    )}
                    <div>Trend</div>
                  </div>
                  {/* Table Body */}
                  {drilldownModal.data.map((item: any, idx: number) => (
                    <div
                      key={item.id || idx}
                      onClick={() => handleDrilldownItemClick(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 1fr 80px',
                        padding: themeSpace.md,
                        borderBottom: idx < drilldownModal.data.length - 1 ? `1px solid ${themeColors.gray100}` : 'none',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                        backgroundColor: themeColors.white,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = themeColors.gray50; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = themeColors.white; }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: themeColors.text }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: themeColors.gray600 }}>{item.troop || item.council || item.email || ''}</div>
                      </div>
                      {drilldownModal.widget.metric === 'troop_sales' && (
                        <>
                          <div style={{ fontWeight: '600', color: themeColors.primary600 }}>${item.sales?.toLocaleString()}</div>
                          <div>{item.scouts}</div>
                          <div>${item.avgPerScout?.toFixed(2)}</div>
                        </>
                      )}
                      {drilldownModal.widget.metric === 'troop_recruiting' && (
                        <>
                          <div style={{ fontWeight: '600', color: themeColors.primary600 }}>{item.newScouts}</div>
                          <div>{item.totalScouts}</div>
                          <div style={{ color: item.percentOfGoal >= 80 ? themeColors.success600 : themeColors.warning600 }}>{item.percentOfGoal}%</div>
                        </>
                      )}
                      {drilldownModal.widget.metric === 'scout_sales' && (
                        <>
                          <div style={{ fontWeight: '600', color: themeColors.primary600 }}>${item.sales?.toLocaleString()}</div>
                          <div>{item.cards}</div>
                          <div style={{ fontSize: '12px' }}>{item.rank}</div>
                        </>
                      )}
                      {drilldownModal.widget.metric === 'scout_referrals' && (
                        <>
                          <div style={{ fontWeight: '600', color: themeColors.primary600 }}>{item.referrals}</div>
                          <div>{item.conversions}</div>
                          <div>{item.conversionRate}%</div>
                        </>
                      )}
                      {drilldownModal.widget.metric === 'customer_referrals' && (
                        <>
                          <div style={{ fontWeight: '600', color: themeColors.primary600 }}>{item.referrals}</div>
                          <div>${item.totalRevenue}</div>
                          <div style={{ fontSize: '12px' }}>{item.lastReferral}</div>
                        </>
                      )}
                      <div style={{ color: item.trend >= 0 ? themeColors.success600 : themeColors.error500, fontWeight: '600' }}>
                        {item.trend >= 0 ? '↑' : '↓'} {Math.abs(item.trend)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: themeSpace.md, marginTop: themeSpace.lg, borderTop: `1px solid ${themeColors.gray200}`, paddingTop: themeSpace.lg }}>
              <button
                type="button"
                onClick={() => {
                  const chartData = drilldownModal.data;
                  const headers = Object.keys(chartData[0] || {}).join(',');
                  const rows = chartData.map((row: any) => Object.values(row).join(',')).join('\n');
                  const csv = `${headers}\n${rows}`;
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `${drilldownModal.widget.title.replace(/\s+/g, '-')}.csv`;
                  link.click();
                  window.URL.revokeObjectURL(url);
                }}
                style={{
                  flex: 1, padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.primary600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: themeSpace.sm,
                }}
              >
                <Icon name="download" size={16} />
                Export Report
              </button>
              <button
                type="button"
                onClick={() => setDrilldownModal(null)}
                style={{
                  flex: 1, padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: 'transparent', color: themeColors.primary600, border: `1px solid ${themeColors.primary600}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
