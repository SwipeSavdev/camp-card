'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageLayout from '../components/PageLayout';
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
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

const themeSpace = { xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px' };
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

const Icon = ({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
  const icons: Record<string, JSX.Element> = {
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="2" x2="12" y2="22" /><path d="M17 5H9.5a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5H17" /></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m5.08 5.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m5.08-5.08l4.24-4.24" /></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke={color} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  };
  return icons[name] || null;
};

interface Widget {
  id: string;
  type: 'metric' | 'line' | 'area' | 'bar' | 'pie';
  title: string;
  metric: string;
  visible: boolean;
  order: number;
}

interface AvailableMetric {
  id: string;
  name: string;
  category: string;
  chartType: 'metric' | 'line' | 'area' | 'bar' | 'pie';
}

const availableMetrics: AvailableMetric[] = [
  { id: 'total_users', name: 'Total Users', category: 'Users', chartType: 'metric' },
  { id: 'active_users', name: 'Active Users', category: 'Users', chartType: 'metric' },
  { id: 'new_users', name: 'New Users (30d)', category: 'Users', chartType: 'metric' },
  { id: 'user_growth', name: 'User Growth %', category: 'Users', chartType: 'metric' },
  { id: 'user_trend', name: 'User Trend', category: 'Users', chartType: 'line' },
  { id: 'total_merchants', name: 'Total Merchants', category: 'Merchants', chartType: 'metric' },
  { id: 'active_merchants', name: 'Active Merchants', category: 'Merchants', chartType: 'metric' },
  { id: 'merchant_onboarding', name: 'Merchants Onboarded', category: 'Merchants', chartType: 'bar' },
  { id: 'total_offers', name: 'Total Offers', category: 'Offers', chartType: 'metric' },
  { id: 'active_offers', name: 'Active Offers', category: 'Offers', chartType: 'metric' },
  { id: 'offer_redemptions', name: 'Offer Redemptions', category: 'Offers', chartType: 'area' },
  { id: 'redemption_rate', name: 'Redemption Rate %', category: 'Offers', chartType: 'metric' },
  { id: 'offer_distribution', name: 'Offer Distribution', category: 'Offers', chartType: 'pie' },
  { id: 'total_cards', name: 'Total Cards Issued', category: 'Cards', chartType: 'metric' },
  { id: 'active_cards', name: 'Active Cards', category: 'Cards', chartType: 'metric' },
  { id: 'cards_redeemed', name: 'Cards Redeemed', category: 'Cards', chartType: 'bar' },
  { id: 'total_subscriptions', name: 'Total Subscriptions', category: 'Subscriptions', chartType: 'metric' },
  { id: 'active_subscriptions', name: 'Active Subscriptions', category: 'Subscriptions', chartType: 'metric' },
  { id: 'subscription_trend', name: 'Subscription Trend', category: 'Subscriptions', chartType: 'area' },
  { id: 'plan_distribution', name: 'Plan Distribution', category: 'Subscriptions', chartType: 'pie' },
  { id: 'churn_rate', name: 'Churn Rate %', category: 'Subscriptions', chartType: 'metric' },
  { id: 'retention_rate', name: 'Retention Rate %', category: 'Subscriptions', chartType: 'metric' },
  { id: 'mrr', name: 'MRR (Monthly Recurring Revenue)', category: 'Revenue', chartType: 'metric' },
  { id: 'arr', name: 'ARR (Annual Recurring Revenue)', category: 'Revenue', chartType: 'metric' },
  { id: 'total_revenue', name: 'Total Revenue', category: 'Revenue', chartType: 'metric' },
  { id: 'revenue_trend', name: 'Revenue Trend', category: 'Revenue', chartType: 'area' },
  { id: 'avg_transaction', name: 'Avg Transaction Value', category: 'Revenue', chartType: 'metric' },
  { id: 'transaction_volume', name: 'Transaction Volume', category: 'Transactions', chartType: 'bar' },
  { id: 'failed_transactions', name: 'Failed Transactions', category: 'Transactions', chartType: 'metric' },
  { id: 'system_uptime', name: 'System Uptime %', category: 'System', chartType: 'metric' },
];

// Generate time series data for charts
const generateTimeSeriesData = (days: number, baseValue: number, variance: number) => {
  const data = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(baseValue + (Math.random() - 0.5) * variance * 2),
    });
  }
  return data;
};

const mockChartData: Record<string, any> = {
  user_trend: generateTimeSeriesData(30, 12000, 1500),
  offer_redemptions: generateTimeSeriesData(30, 1500, 400),
  subscription_trend: generateTimeSeriesData(30, 8000, 500),
  revenue_trend: generateTimeSeriesData(30, 18000, 3000),
  merchant_onboarding: [
    { name: 'Jan', value: 18 },
    { name: 'Feb', value: 22 },
    { name: 'Mar', value: 19 },
    { name: 'Apr', value: 28 },
    { name: 'May', value: 32 },
    { name: 'Jun', value: 23 },
  ],
  cards_redeemed: [
    { name: 'Jan', value: 1850 },
    { name: 'Feb', value: 2100 },
    { name: 'Mar', value: 1920 },
    { name: 'Apr', value: 2450 },
    { name: 'May', value: 2680 },
    { name: 'Jun', value: 2702 },
  ],
  transaction_volume: [
    { name: 'Mon', value: 820 },
    { name: 'Tue', value: 932 },
    { name: 'Wed', value: 901 },
    { name: 'Thu', value: 934 },
    { name: 'Fri', value: 1290 },
    { name: 'Sat', value: 1330 },
    { name: 'Sun', value: 1214 },
  ],
  offer_distribution: [
    { name: 'Food & Dining', value: 35 },
    { name: 'Retail', value: 28 },
    { name: 'Entertainment', value: 18 },
    { name: 'Services', value: 12 },
    { name: 'Other', value: 7 },
  ],
  plan_distribution: [
    { name: 'Monthly Basic', value: 2100 },
    { name: 'Monthly Pro', value: 1321 },
    { name: 'Annual Basic', value: 2500 },
    { name: 'Annual Pro', value: 1733 },
  ],
};

const mockData: Record<string, any> = {
  total_users: { value: 12450, change: 8.5 },
  active_users: { value: 8932, change: 12.3 },
  new_users: { value: 2156, change: 15.8 },
  user_growth: { value: '8.5%', change: 2.1 },
  total_merchants: { value: 487, change: 5.2 },
  active_merchants: { value: 412, change: 3.8 },
  merchant_onboarding: { value: 23, change: 18.5 },
  total_offers: { value: 1243, change: 12.5 },
  active_offers: { value: 892, change: 9.2 },
  offer_redemptions: { value: 45230, change: 21.3 },
  redemption_rate: { value: '34.5%', change: 5.8 },
  total_cards: { value: 89245, change: 6.3 },
  active_cards: { value: 76543, change: 8.9 },
  cards_redeemed: { value: 12702, change: 16.2 },
  total_subscriptions: { value: 8932, change: 12.3 },
  active_subscriptions: { value: 7654, change: 9.8 },
  monthly_plans: { value: 3421, change: 15.2 },
  annual_plans: { value: 4233, change: 8.1 },
  churn_rate: { value: '2.1%', change: -0.8 },
  retention_rate: { value: '97.9%', change: 0.8 },
  mrr: { value: '$47,829', change: 14.2 },
  arr: { value: '$573,948', change: 18.5 },
  total_revenue: { value: '$245,678', change: 14.2 },
  revenue_trend: { value: '$18,935/day', change: 8.5 },
  avg_transaction: { value: '$124.56', change: 3.2 },
  transaction_volume: { value: 5421, change: 19.8 },
  failed_transactions: { value: 23, change: -45.2 },
  system_uptime: { value: '99.98%', change: 0.02 },
};

const defaultWidgets: Widget[] = [
  { id: '1', type: 'metric', title: 'Total Users', metric: 'total_users', visible: true, order: 1 },
  { id: '2', type: 'metric', title: 'Active Merchants', metric: 'active_merchants', visible: true, order: 2 },
  { id: '3', type: 'area', title: 'Revenue Trend', metric: 'revenue_trend', visible: true, order: 3 },
  { id: '4', type: 'bar', title: 'Transaction Volume', metric: 'transaction_volume', visible: true, order: 4 },
  { id: '5', type: 'line', title: 'User Trend', metric: 'user_trend', visible: true, order: 5 },
  { id: '6', type: 'pie', title: 'Offer Distribution', metric: 'offer_distribution', visible: true, order: 6 },
];

const getMetricColor = (change: number) => {
  if (change > 10) return themeColors.success600;
  if (change > 0) return themeColors.info600;
  if (change < -5) return themeColors.error500;
  return themeColors.warning600;
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: themeColors.white,
        border: `1px solid ${themeColors.gray200}`,
        borderRadius: themeRadius.sm,
        padding: themeSpace.sm,
        boxShadow: themeShadow.md,
      }}>
        <p style={{ margin: 0, fontWeight: '600', color: themeColors.text }}>{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0 0 0', color: entry.color, fontSize: '14px' }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [dateRange, setDateRange] = useState('30d');
  const [selectedWidgets, setSelectedWidgets] = useState<Set<string>>(new Set());
  const [detailsModal, setDetailsModal] = useState<{ widget: Widget; data: any } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  if (status === 'loading') return null;
  if (!session) return null;

  const handleAddWidget = (metric: AvailableMetric) => {
    const newWidget: Widget = {
      id: Math.random().toString(),
      type: metric.chartType,
      title: metric.name,
      metric: metric.id,
      visible: true,
      order: Math.max(...widgets.map(w => w.order), 0) + 1,
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleRemoveWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    setSelectedWidgets(prev => {
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
    setSelectedWidgets(prev => {
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
    const chartData = mockChartData[widget.metric];
    let csv = '';

    if (chartData && Array.isArray(chartData)) {
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
      .filter(w => selectedWidgets.has(w.id))
      .map(w => `${w.title},${getMetricData(w.metric).value}`)
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

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);
  const getMetricData = (metricId: string) => mockData[metricId] || { value: 0, change: 0 };

  const renderChart = (widget: Widget) => {
    const chartData = mockChartData[widget.metric];
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
                {chartData?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      default:
        const isPositive = data.change >= 0;
        return (
          <>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', marginBottom: themeSpace.md }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: themeColors.primary600, marginBottom: themeSpace.sm }}>{data.value}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.xs, fontSize: '13px', fontWeight: '600', color: getMetricColor(data.change) }}>
                <span>{isPositive ? '↑' : '↓'} {Math.abs(data.change)}%</span>
                <span style={{ color: themeColors.gray600, fontWeight: '500' }}>vs {dateRange}</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <AreaChart data={generateTimeSeriesData(7, typeof data.value === 'number' ? data.value : 100, 20)}>
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
  };

  return (
    <PageLayout title="Analytics Dashboard" currentPath="/analytics">
        <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: themeSpace.lg }}>
            <p style={{ margin: 0, color: themeColors.gray600, fontSize: '14px' }}>Interactive charts and customizable metrics</p>
            <div style={{ display: 'flex', gap: themeSpace.md }}>
              {selectedWidgets.size > 0 && (
                <button onClick={handleExportSelected} style={{ padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.success600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: themeSpace.sm }}>
                  <Icon name="download" size={16} />
                  Export ({selectedWidgets.size})
                </button>
              )}
              <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} style={{ padding: `${themeSpace.sm} ${themeSpace.md}`, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, fontSize: '14px', backgroundColor: themeColors.white, cursor: 'pointer' }}>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button onClick={() => setEditMode(!editMode)} style={{ padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: editMode ? themeColors.primary600 : themeColors.white, color: editMode ? themeColors.white : themeColors.primary600, border: `1px solid ${themeColors.primary600}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: themeSpace.sm }}>
                <Icon name="settings" size={16} />
                {editMode ? 'Done' : 'Customize'}
              </button>
              <button onClick={() => setShowWidgetSelector(!showWidgetSelector)} style={{ padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.primary600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: themeSpace.sm }}>
                <Icon name="plus" size={16} />
                Add Widget
              </button>
            </div>
          </div>
        </div>

        {showWidgetSelector && (
          <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, maxHeight: '400px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: themeColors.text }}>Available Metrics</h2>
              <button onClick={() => setShowWidgetSelector(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.gray600 }}>
                <Icon name="x" size={20} />
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: themeSpace.md }}>
              {availableMetrics.map((metric) => {
                const isAdded = widgets.some(w => w.metric === metric.id);
                const chartTypeLabel = metric.chartType === 'metric' ? 'KPI' : metric.chartType.charAt(0).toUpperCase() + metric.chartType.slice(1);
                return (
                  <button key={metric.id} onClick={() => !isAdded && handleAddWidget(metric)} disabled={isAdded} style={{ padding: themeSpace.md, backgroundColor: isAdded ? themeColors.gray100 : themeColors.white, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.card, cursor: isAdded ? 'default' : 'pointer', textAlign: 'left', opacity: isAdded ? 0.5 : 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.xs }}>
                      <p style={{ margin: 0, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>{metric.category}</p>
                      <span style={{ fontSize: '10px', fontWeight: '600', color: themeColors.primary600, backgroundColor: themeColors.primary50, padding: '2px 6px', borderRadius: '4px' }}>{chartTypeLabel}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: themeColors.text }}>{metric.name}</p>
                    {isAdded && <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: themeColors.success600 }}>✓ Added</p>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {visibleWidgets.length === 0 ? (
            <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `2px dashed ${themeColors.gray200}`, padding: themeSpace.xl, textAlign: 'center' }}>
              <Icon name="chart" size={48} color={themeColors.gray200} />
              <p style={{ fontSize: '18px', fontWeight: '600', color: themeColors.text, marginTop: themeSpace.lg, marginBottom: themeSpace.sm }}>No widgets selected</p>
              <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0, marginBottom: themeSpace.lg }}>Click "Add Widget" to start building your dashboard</p>
              <button onClick={() => setShowWidgetSelector(true)} style={{ padding: `${themeSpace.sm} ${themeSpace.lg}`, backgroundColor: themeColors.primary600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600' }}>Add Your First Widget</button>
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
                      <div style={{ position: 'absolute', top: themeSpace.md, right: themeSpace.md, color: themeColors.primary600 }}>
                        <Icon name="checkCircle" size={20} />
                      </div>
                    )}
                    {editMode && (
                      <div style={{ display: 'flex', gap: themeSpace.sm, position: 'absolute', top: themeSpace.md, right: themeSpace.md }}>
                        {idx > 0 && <button onClick={(e) => { e.stopPropagation(); handleReorderWidgets(idx, idx - 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs }} title="Move up"><Icon name="chart" size={16} color={themeColors.primary600} /></button>}
                        {idx < visibleWidgets.length - 1 && <button onClick={(e) => { e.stopPropagation(); handleReorderWidgets(idx, idx + 1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs }} title="Move down"><Icon name="chart" size={16} color={themeColors.primary600} /></button>}
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveWidget(widget.id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs, color: themeColors.error500 }}><Icon name="x" size={16} /></button>
                      </div>
                    )}
                    <div style={{ marginBottom: themeSpace.md }}>
                      <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: themeColors.text, paddingRight: editMode ? '100px' : 0 }}>{widget.title}</h3>
                    </div>

                    {renderChart(widget)}

                    <div style={{ display: 'flex', gap: themeSpace.sm, paddingTop: themeSpace.md, borderTop: `1px solid ${themeColors.gray200}`, marginTop: 'auto' }}>
                      <button onClick={(e) => { e.stopPropagation(); handleShowDetails(widget); }} style={{ flex: 1, padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: 'transparent', border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Icon name="eye" size={14} />
                        Details
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleExport(widget); }} style={{ flex: 1, padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: 'transparent', border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
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
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setDetailsModal(null)}>
          <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, maxWidth: '600px', width: '90%', boxShadow: themeShadow.md }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: themeSpace.lg }}>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: themeColors.text }}>Metric Details</h2>
              <button onClick={() => setDetailsModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.gray600 }}>
                <Icon name="x" size={20} />
              </button>
            </div>

            <div style={{ marginBottom: themeSpace.lg }}>
              <p style={{ margin: '0 0 ' + themeSpace.xs + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Metric Name</p>
              <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: themeColors.text }}>{detailsModal.widget.title}</p>
            </div>

            <div style={{ marginBottom: themeSpace.lg }}>
              <p style={{ margin: '0 0 ' + themeSpace.xs + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Current Value</p>
              <p style={{ margin: 0, fontSize: '36px', fontWeight: '700', color: themeColors.primary600 }}>{detailsModal.data.value}</p>
            </div>

            {mockChartData[detailsModal.widget.metric] && (
              <div style={{ marginBottom: themeSpace.lg }}>
                <p style={{ margin: '0 0 ' + themeSpace.md + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Trend</p>
                <ResponsiveContainer width="100%" height={150}>
                  <AreaChart data={mockChartData[detailsModal.widget.metric]}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: themeSpace.md, marginBottom: themeSpace.lg }}>
              <div>
                <p style={{ margin: '0 0 ' + themeSpace.xs + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Change</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: getMetricColor(detailsModal.data.change) }}>
                  {detailsModal.data.change >= 0 ? '↑' : '↓'} {Math.abs(detailsModal.data.change)}%
                </p>
              </div>
              <div>
                <p style={{ margin: '0 0 ' + themeSpace.xs + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Period</p>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: themeColors.text }}>{dateRange}</p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: themeSpace.md }}>
              <button onClick={() => { handleExport(detailsModal.widget); setDetailsModal(null); }} style={{ flex: 1, padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.primary600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: themeSpace.sm }}>
                <Icon name="download" size={16} />
                Export Data
              </button>
              <button onClick={() => setDetailsModal(null)} style={{ flex: 1, padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: 'transparent', color: themeColors.primary600, border: `1px solid ${themeColors.primary600}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
