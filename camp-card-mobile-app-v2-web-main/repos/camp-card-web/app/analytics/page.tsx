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
  troop_sales_trend: generateTimeSeriesData(30, 45000, 8000),
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
  // Troop Unit Sales Data
  troop_sales: [
    { id: 'troop-101', name: 'Troop 101', council: 'Greater Los Angeles', sales: 12450, scouts: 24, avgPerScout: 518.75, trend: 15.2 },
    { id: 'troop-205', name: 'Troop 205', council: 'San Francisco Bay', sales: 9830, scouts: 18, avgPerScout: 546.11, trend: 8.5 },
    { id: 'troop-312', name: 'Troop 312', council: 'Denver Area', sales: 8920, scouts: 22, avgPerScout: 405.45, trend: 12.3 },
    { id: 'troop-418', name: 'Troop 418', council: 'Chicago Suburbs', sales: 7650, scouts: 15, avgPerScout: 510.00, trend: -2.1 },
    { id: 'troop-523', name: 'Troop 523', council: 'Dallas Metro', sales: 6890, scouts: 20, avgPerScout: 344.50, trend: 22.8 },
    { id: 'troop-634', name: 'Troop 634', council: 'Seattle Area', sales: 6450, scouts: 16, avgPerScout: 403.13, trend: 5.7 },
    { id: 'troop-742', name: 'Troop 742', council: 'Phoenix Valley', sales: 5980, scouts: 14, avgPerScout: 427.14, trend: 18.4 },
    { id: 'troop-856', name: 'Troop 856', council: 'Atlanta Metro', sales: 5420, scouts: 12, avgPerScout: 451.67, trend: 9.2 },
  ],
  // Scout Recruiting by Troop
  troop_recruiting: [
    { id: 'troop-101', name: 'Troop 101', council: 'Greater Los Angeles', newScouts: 8, totalScouts: 24, recruitingGoal: 10, percentOfGoal: 80, trend: 33.3 },
    { id: 'troop-205', name: 'Troop 205', council: 'San Francisco Bay', newScouts: 5, totalScouts: 18, recruitingGoal: 6, percentOfGoal: 83.3, trend: 25.0 },
    { id: 'troop-312', name: 'Troop 312', council: 'Denver Area', newScouts: 7, totalScouts: 22, recruitingGoal: 8, percentOfGoal: 87.5, trend: 16.7 },
    { id: 'troop-418', name: 'Troop 418', council: 'Chicago Suburbs', newScouts: 3, totalScouts: 15, recruitingGoal: 5, percentOfGoal: 60, trend: -25.0 },
    { id: 'troop-523', name: 'Troop 523', council: 'Dallas Metro', newScouts: 6, totalScouts: 20, recruitingGoal: 7, percentOfGoal: 85.7, trend: 50.0 },
    { id: 'troop-634', name: 'Troop 634', council: 'Seattle Area', newScouts: 4, totalScouts: 16, recruitingGoal: 5, percentOfGoal: 80, trend: 0 },
  ],
  // Individual Scout Sales Data
  scout_sales: [
    { id: 'scout-1', name: 'Michael Johnson', troop: 'Troop 101', sales: 1250, cards: 25, referrals: 8, rank: 'Eagle Scout', trend: 28.5 },
    { id: 'scout-2', name: 'David Chen', troop: 'Troop 101', sales: 980, cards: 19, referrals: 5, rank: 'Life Scout', trend: 15.2 },
    { id: 'scout-3', name: 'James Wilson', troop: 'Troop 205', sales: 875, cards: 17, referrals: 6, rank: 'Star Scout', trend: 22.1 },
    { id: 'scout-4', name: 'Robert Garcia', troop: 'Troop 312', sales: 820, cards: 16, referrals: 4, rank: 'First Class', trend: 8.7 },
    { id: 'scout-5', name: 'William Brown', troop: 'Troop 101', sales: 750, cards: 15, referrals: 7, rank: 'Eagle Scout', trend: 12.3 },
    { id: 'scout-6', name: 'Christopher Lee', troop: 'Troop 418', sales: 680, cards: 13, referrals: 3, rank: 'Life Scout', trend: -5.2 },
    { id: 'scout-7', name: 'Daniel Martinez', troop: 'Troop 523', sales: 645, cards: 12, referrals: 9, rank: 'Star Scout', trend: 35.8 },
    { id: 'scout-8', name: 'Matthew Taylor', troop: 'Troop 205', sales: 590, cards: 11, referrals: 2, rank: 'Second Class', trend: 18.4 },
    { id: 'scout-9', name: 'Andrew Anderson', troop: 'Troop 634', sales: 540, cards: 10, referrals: 5, rank: 'First Class', trend: 10.1 },
    { id: 'scout-10', name: 'Joshua Thomas', troop: 'Troop 742', sales: 485, cards: 9, referrals: 4, rank: 'Tenderfoot', trend: 45.2 },
  ],
  // Scout Referrals Data
  scout_referrals: [
    { id: 'scout-7', name: 'Daniel Martinez', troop: 'Troop 523', referrals: 9, conversions: 7, revenue: 350, conversionRate: 77.8, trend: 50.0 },
    { id: 'scout-1', name: 'Michael Johnson', troop: 'Troop 101', referrals: 8, conversions: 6, revenue: 300, conversionRate: 75.0, trend: 33.3 },
    { id: 'scout-5', name: 'William Brown', troop: 'Troop 101', referrals: 7, conversions: 5, revenue: 250, conversionRate: 71.4, trend: 16.7 },
    { id: 'scout-3', name: 'James Wilson', troop: 'Troop 205', referrals: 6, conversions: 5, revenue: 250, conversionRate: 83.3, trend: 20.0 },
    { id: 'scout-2', name: 'David Chen', troop: 'Troop 101', referrals: 5, conversions: 4, revenue: 200, conversionRate: 80.0, trend: 25.0 },
    { id: 'scout-9', name: 'Andrew Anderson', troop: 'Troop 634', referrals: 5, conversions: 3, revenue: 150, conversionRate: 60.0, trend: 0 },
    { id: 'scout-4', name: 'Robert Garcia', troop: 'Troop 312', referrals: 4, conversions: 3, revenue: 150, conversionRate: 75.0, trend: -20.0 },
    { id: 'scout-10', name: 'Joshua Thomas', troop: 'Troop 742', referrals: 4, conversions: 4, revenue: 200, conversionRate: 100.0, trend: 100.0 },
  ],
  // Customer Referrals Data
  customer_referrals: [
    { id: 'cust-1', name: 'Sarah Miller', email: 's.miller@email.com', referrals: 12, conversions: 9, totalRevenue: 1080, avgOrderValue: 120, lastReferral: '2 days ago', trend: 50.0 },
    { id: 'cust-2', name: 'Jennifer Davis', email: 'j.davis@email.com', referrals: 10, conversions: 8, totalRevenue: 960, avgOrderValue: 120, lastReferral: '1 week ago', trend: 25.0 },
    { id: 'cust-3', name: 'Emily Rodriguez', email: 'e.rodriguez@email.com', referrals: 8, conversions: 6, totalRevenue: 720, avgOrderValue: 120, lastReferral: '3 days ago', trend: 33.3 },
    { id: 'cust-4', name: 'Amanda Thompson', email: 'a.thompson@email.com', referrals: 7, conversions: 5, totalRevenue: 600, avgOrderValue: 120, lastReferral: '5 days ago', trend: 16.7 },
    { id: 'cust-5', name: 'Jessica White', email: 'j.white@email.com', referrals: 6, conversions: 5, totalRevenue: 600, avgOrderValue: 120, lastReferral: '1 day ago', trend: 20.0 },
    { id: 'cust-6', name: 'Ashley Harris', email: 'a.harris@email.com', referrals: 5, conversions: 4, totalRevenue: 480, avgOrderValue: 120, lastReferral: '2 weeks ago', trend: 0 },
    { id: 'cust-7', name: 'Michelle Clark', email: 'm.clark@email.com', referrals: 4, conversions: 3, totalRevenue: 360, avgOrderValue: 120, lastReferral: '4 days ago', trend: -25.0 },
    { id: 'cust-8', name: 'Stephanie Lewis', email: 's.lewis@email.com', referrals: 3, conversions: 3, totalRevenue: 360, avgOrderValue: 120, lastReferral: '6 days ago', trend: 50.0 },
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
  // BSA Troop & Scout Metrics
  troop_sales: { value: '$63,590', change: 14.8 },
  troop_recruiting: { value: 33, change: 22.2 },
  scout_sales: { value: '$7,615', change: 18.5 },
  scout_referrals: { value: 52, change: 28.4 },
  customer_referrals: { value: 55, change: 15.6 },
  troop_sales_trend: { value: '$45,230/mo', change: 12.3 },
  total_troops: { value: 156, change: 8.2 },
  active_scouts: { value: 2847, change: 15.4 },
  total_referrals: { value: 107, change: 21.8 },
  referral_conversion: { value: '72.4%', change: 5.3 },
};

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
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ margin: '4px 0 0 0', color: entry.color, fontSize: '14px' }}>
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
        console.log('[Analytics] Dashboard data loaded:', data);
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

  // Get real data or fall back to mock data
  const getRealChartData = (metricId: string) => {
    if (!dashboardData) return mockChartData[metricId] || [];

    switch (metricId) {
      case 'troop_sales':
        return dashboardData.troopSales || mockChartData.troop_sales;
      case 'troop_recruiting':
        return dashboardData.troopRecruiting || mockChartData.troop_recruiting;
      case 'scout_sales':
        return dashboardData.scoutSales || mockChartData.scout_sales;
      case 'scout_referrals':
        return dashboardData.scoutReferrals || mockChartData.scout_referrals;
      case 'customer_referrals':
        return dashboardData.customerReferrals || mockChartData.customer_referrals;
      case 'troop_sales_trend':
        return dashboardData.salesTrend30Days || mockChartData.troop_sales_trend;
      default:
        return mockChartData[metricId] || [];
    }
  };

  const getRealMetricData = (metricId: string) => {
    if (!dashboardData) return mockData[metricId] || { value: 0, change: 0 };

    switch (metricId) {
      case 'total_troops':
        return { value: dashboardData.totalTroops || 0, change: dashboardData.troopsTrend || 0 };
      case 'active_scouts':
        return { value: dashboardData.activeScouts || 0, change: dashboardData.scoutsTrend || 0 };
      case 'total_referrals':
        return { value: dashboardData.totalReferrals || 0, change: dashboardData.referralsTrend || 0 };
      case 'referral_conversion':
        return { value: `${dashboardData.referralConversionRate || 0}%`, change: 0 };
      case 'troop_sales':
        return { value: `$${(dashboardData.totalSales || 0).toLocaleString()}`, change: dashboardData.salesTrend || 0 };
      case 'troop_recruiting':
        return { value: dashboardData.activeScouts || 0, change: dashboardData.scoutsTrend || 0 };
      case 'scout_sales':
        return { value: `$${(dashboardData.totalSales || 0).toLocaleString()}`, change: dashboardData.salesTrend || 0 };
      case 'scout_referrals':
        return { value: dashboardData.successfulReferrals || 0, change: dashboardData.referralsTrend || 0 };
      case 'customer_referrals':
        return { value: dashboardData.totalReferrals || 0, change: dashboardData.referralsTrend || 0 };
      case 'total_merchants':
        return { value: dashboardData.totalMerchants || 0, change: 0 };
      case 'active_merchants':
        return { value: dashboardData.activeMerchants || 0, change: 0 };
      case 'total_offers':
        return { value: dashboardData.totalOffers || 0, change: 0 };
      case 'active_offers':
        return { value: dashboardData.activeOffers || 0, change: 0 };
      default:
        return mockData[metricId] || { value: 0, change: 0 };
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
                {chartData?.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'drilldown':
        // Show a preview table with top items and a "View All" button
        const previewData = (chartData || []).slice(0, 3);
        const totalItems = (chartData || []).length;
        const primaryKey = widget.metric === 'troop_sales' ? 'sales'
          : widget.metric === 'troop_recruiting' ? 'newScouts'
            : widget.metric === 'scout_sales' ? 'sales'
              : widget.metric === 'scout_referrals' ? 'referrals'
                : 'referrals';

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

      default:
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
              onClick={() => setEditMode(!editMode)}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: editMode ? themeColors.primary600 : themeColors.white, color: editMode ? themeColors.white : themeColors.primary600, border: `1px solid ${themeColors.primary600}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', gap: themeSpace.sm,
              }}
            >
              <Icon name="settings" size={16} />
              {editMode ? 'Done' : 'Customize'}
            </button>
            <button
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
            Click "Add Widget" to start building your dashboard
          </p>
          <button
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
                    onClick={(e) => { e.stopPropagation(); handleShowDetails(widget); }}
                    style={{
                      flex: 1, padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: 'transparent', border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}
                  >
                    <Icon name="eye" size={14} />
                    Details
                  </button>
                  <button
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
        >
          <div
            style={{
              backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, maxWidth: '600px', width: '90%', boxShadow: themeShadow.md,
            }}
            onClick={(e) => e.stopPropagation()}
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

            {mockChartData[detailsModal.widget.metric] && (
              <div style={{ marginBottom: themeSpace.lg }}>
                <p style={{
                  margin: `0 0 ${themeSpace.md} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase',
                }}
                >
                  Trend
                </p>
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
                onClick={() => { handleExport(detailsModal.widget); setDetailsModal(null); }}
                style={{
                  flex: 1, padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.primary600, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontWeight: '600', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: themeSpace.sm,
                }}
              >
                <Icon name="download" size={16} />
                Export Data
              </button>
              <button
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
        >
          <div
            style={{
              backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.xl, maxWidth: drilldownModal.selectedItem ? '900px' : '700px', width: '95%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: themeShadow.md,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: themeSpace.lg,
            }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
                {drilldownModal.selectedItem && (
                  <button
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
                        {mockChartData.scout_sales
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
                        {mockChartData.scout_sales.filter((s: any) => s.troop === drilldownModal.selectedItem.name).length === 0 && (
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
                    gridTemplateColumns: drilldownModal.widget.metric === 'troop_sales' ? '2fr 1fr 1fr 1fr 80px'
                      : drilldownModal.widget.metric === 'troop_recruiting' ? '2fr 1fr 1fr 1fr 80px'
                        : drilldownModal.widget.metric === 'scout_sales' ? '2fr 1fr 1fr 1fr 80px'
                          : drilldownModal.widget.metric === 'scout_referrals' ? '2fr 1fr 1fr 1fr 80px'
                            : '2fr 1fr 1fr 1fr 80px',
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
                      style={{
                        display: 'grid',
                        gridTemplateColumns: drilldownModal.widget.metric === 'troop_sales' ? '2fr 1fr 1fr 1fr 80px'
                          : drilldownModal.widget.metric === 'troop_recruiting' ? '2fr 1fr 1fr 1fr 80px'
                            : drilldownModal.widget.metric === 'scout_sales' ? '2fr 1fr 1fr 1fr 80px'
                              : drilldownModal.widget.metric === 'scout_referrals' ? '2fr 1fr 1fr 1fr 80px'
                                : '2fr 1fr 1fr 1fr 80px',
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
