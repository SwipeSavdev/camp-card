/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  useEffect, useState, useMemo, useCallback,
} from 'react';
import { api } from '@/lib/api';
import {
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
import PageLayout from '../components/PageLayout';

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  text: '#1f2937',
  primary50: '#eff6ff',
  primary100: '#dbeafe',
  primary200: '#bfdbfe',
  primary300: '#93c5fd',
  primary600: '#2563eb',
  primary700: '#1d4ed8',
  primary800: '#1e40af',
  primary900: '#1e3a8a',
  success50: '#f0fdf4',
  success100: '#dcfce7',
  success200: '#bbf7d0',
  success600: '#16a34a',
  success700: '#15803d',
  warning50: '#fefce8',
  warning100: '#fef9c3',
  warning200: '#fef08a',
  warning600: '#eab308',
  info50: '#f0f9ff',
  info100: '#e0f2fe',
  info200: '#bae6fd',
  info600: '#0284c7',
  error50: '#fef2f2',
  error100: '#fee2e2',
  error400: '#f87171',
  error500: '#ef4444',
  error600: '#dc2626',
  purple50: '#faf5ff',
  purple100: '#f3e8ff',
  purple600: '#9333ea',
  purple700: '#7c3aed',
};

const CHART_COLORS = [
  themeColors.primary600,
  themeColors.success600,
  themeColors.warning600,
  themeColors.info600,
  themeColors.purple600,
  themeColors.error500,
];

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px',
};
const themeRadius = {
  sm: '4px', md: '8px', card: '12px', lg: '16px',
};
const themeShadow = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
};

function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: Record<string, JSX.Element> = {
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    megaphone: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 11l18-5v12L3 13v-2z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
               </svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
           </svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>,
    store: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
           </svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
          </svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
           </svg>,
    play: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3" /></svg>,
    pause: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
           </svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
       </svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
    email: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
           </svg>,
    sms: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>,
    inbox: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
           </svg>,
    target: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>,
    gift: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>,
    zap: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
           </svg>,
    map: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
      <line x1="8" y1="2" x2="8" y2="18" />
      <line x1="16" y1="6" x2="16" y2="22" />
    </svg>,
    award: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
           </svg>,
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 2a4 4 0 0 1 4 4c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2a4 4 0 0 1 4-4z" />
      <path d="M8 8v2a6 6 0 0 0 8 0V8" />
      <path d="M6 12h12" />
      <path d="M6 16h12" />
      <path d="M10 20h4" />
    </svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" /></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
            </svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="6 9 12 15 18 9" /></svg>,
    chevronRight: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>,
    chevronLeft: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
         </svg>,
    trendingUp: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
                </svg>,
    trendingDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
      <polyline points="17 18 23 18 23 12" />
                  </svg>,
    location: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
              </svg>,
    globe: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>,
  };
  return icons[name] || null;
}

// Campaign Types
const CAMPAIGN_TYPES = [
  {
    id: 'reactivation', name: 'Reactivation', description: 'Bring back dormant users', icon: 'zap', color: themeColors.warning600,
  },
  {
    id: 'loyalty_boost', name: 'Loyalty Boost', description: 'Reward frequent users', icon: 'award', color: themeColors.purple600,
  },
  {
    id: 'weekend_special', name: 'Weekend Special', description: 'Weekend promotions', icon: 'clock', color: themeColors.info600,
  },
  {
    id: 'category_promo', name: 'Category Promo', description: 'Category-specific deals', icon: 'gift', color: themeColors.success600,
  },
  {
    id: 'location_based', name: 'Location Based', description: 'Geo-targeted campaigns', icon: 'location', color: themeColors.error500,
  },
  {
    id: 'new_user', name: 'New User Welcome', description: 'Onboarding campaigns', icon: 'users', color: themeColors.primary600,
  },
  {
    id: 'seasonal', name: 'Seasonal', description: 'Holiday promotions', icon: 'gift', color: themeColors.warning600,
  },
];

// Notification Channels
const NOTIFICATION_CHANNELS = [
  {
    id: 'email', name: 'Email', icon: 'email', color: themeColors.primary600,
  },
  {
    id: 'sms', name: 'SMS', icon: 'sms', color: themeColors.success600,
  },
  {
    id: 'push', name: 'Push', icon: 'bell', color: themeColors.warning600,
  },
  {
    id: 'in_app', name: 'In-App', icon: 'inbox', color: themeColors.purple600,
  },
];

// Behavioral Patterns
type TabType = 'campaigns' | 'segments' | 'analytics' | 'merchants';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: string;
  segments: string[];
  channels: string[];
  sent: number;
  opened: number;
  converted: number;
  roi: string;
  createdAt: string;
}

export default function AIMarketingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('campaigns');
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [segments, setSegments] = useState<{ id: string; name: string; description: string; count: number }[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedContent, setAiGeneratedContent] = useState<string | null>(null);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Campaign creation form state
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: '',
    segments: [] as string[],
    channels: [] as string[],
    message: '',
    scheduleDate: '',
    enableGeofencing: false,
    enableGamification: false,
    enableLearning: true,
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch campaigns from API
  const fetchCampaigns = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.getCampaigns({
        status: statusFilter || undefined,
        type: typeFilter || undefined,
        search: searchTerm || undefined,
      }, session);
      if (result?.content && Array.isArray(result.content)) {
        const mapped = result.content.map((c: any) => ({
          id: c.id?.toString() || String(Date.now()),
          name: c.name || c.campaignName || 'Unnamed',
          type: c.campaignType?.toLowerCase() || c.type || 'reactivation',
          status: c.status?.toLowerCase() || 'active',
          segments: c.targetAudience?.segments || c.segments || [],
          channels: c.channels || ['email'],
          sent: c.messagesSent || c.sent || 0,
          opened: c.opens || c.opened || 0,
          converted: c.conversions || c.converted || 0,
          roi: c.roi != null ? `+${c.roi}%` : '-',
          createdAt: c.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
        }));
        setCampaigns(mapped.length > 0 ? mapped : []);
      }
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
      // API fetch failed — campaigns remain empty
    } finally {
      setIsLoading(false);
    }
  }, [session, statusFilter, typeFilter, searchTerm]);

  // Fetch segments from API
  const fetchSegments = useCallback(async () => {
    try {
      const result = await api.getMarketingSegments(session);
      if (result && Array.isArray(result)) {
        const mapped = result.map((s: any) => ({
          id: s.segmentType?.toLowerCase() || s.id || 'unknown',
          name: s.name || 'Unknown Segment',
          description: s.description || '',
          count: s.userCount || s.count || 0,
        }));
        if (mapped.length > 0) {
          setSegments(mapped);
        }
      }
    } catch (error) {
      console.error('Failed to fetch segments:', error);
    }
  }, [session]);

  // Fetch merchants from API
  const fetchMerchants = useCallback(async () => {
    try {
      const result = await api.getMerchants(session);
      const list = result?.merchants || result?.content || [];
      if (Array.isArray(list)) {
        setMerchants(list.map((m: any) => ({
          id: m.id?.toString() || String(Date.now()),
          name: m.name || m.businessName || 'Unnamed',
          category: m.category || m.businessType || '-',
          location: m.city || m.address || '-',
          campaigns: m.campaignCount || 0,
          redemptions: m.redemptionCount || m.totalRedemptions || 0,
          rating: m.rating || 0,
          status: m.status?.toLowerCase() || 'active',
        })));
      }
    } catch (error) {
      console.error('Failed to fetch merchants:', error);
    }
  }, [session]);

  // Fetch dashboard summary for revenue metrics
  const fetchDashboard = useCallback(async () => {
    try {
      const result = await api.getDashboardSummary(session);
      if (result) {
        setDashboardData(result);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchCampaigns();
      fetchSegments();
      fetchMerchants();
      fetchDashboard();
    }
  }, [status, fetchCampaigns, fetchSegments, fetchMerchants, fetchDashboard]);

  // ---- Computed stats from real campaign data ----
  const campaignStats = useMemo(() => {
    const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
    const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
    const totalOpened = campaigns.reduce((sum, c) => sum + c.opened, 0);
    const totalConverted = campaigns.reduce((sum, c) => sum + c.converted, 0);
    const campaignsWithSent = campaigns.filter((c) => c.sent > 0);
    const avgOpenRate = campaignsWithSent.length > 0
      ? (totalOpened / totalSent * 100) : 0;
    const avgConversionRate = campaignsWithSent.length > 0
      ? (totalConverted / totalSent * 100) : 0;

    // Parse ROI values
    const roiValues = campaigns
      .map((c) => parseFloat(c.roi.replace(/[^0-9.-]/g, '')))
      .filter((v) => !Number.isNaN(v));
    const avgRoi = roiValues.length > 0
      ? roiValues.reduce((s, v) => s + v, 0) / roiValues.length : 0;

    // Revenue from dashboard
    const totalRevenueCents = dashboardData?.totalRevenueCents || 0;

    return {
      activeCampaigns,
      totalSent,
      totalOpened,
      totalConverted,
      avgOpenRate,
      avgConversionRate,
      avgRoi,
      totalRevenue: Math.round(totalRevenueCents / 100),
    };
  }, [campaigns, dashboardData]);

  // Computed analytics derived from campaign data
  const computedAnalytics = useMemo(() => {
    // Conversions by campaign type
    const typeMap: Record<string, number> = {};
    campaigns.forEach((c) => {
      const typeInfo = CAMPAIGN_TYPES.find((t) => t.id === c.type);
      const label = typeInfo?.name || c.type;
      typeMap[label] = (typeMap[label] || 0) + c.converted;
    });
    const conversionsByType = Object.entries(typeMap).map(([name, value]) => ({ name, value }));

    // Channel performance aggregated from campaigns
    const channelMap: Record<string, { sent: number; opened: number; converted: number }> = {};
    campaigns.forEach((c) => {
      c.channels.forEach((ch) => {
        const chName = NOTIFICATION_CHANNELS.find((nc) => nc.id === ch)?.name || ch;
        if (!channelMap[chName]) channelMap[chName] = { sent: 0, opened: 0, converted: 0 };
        // Distribute evenly across channels for this campaign
        const channelCount = c.channels.length || 1;
        channelMap[chName].sent += Math.round(c.sent / channelCount);
        channelMap[chName].opened += Math.round(c.opened / channelCount);
        channelMap[chName].converted += Math.round(c.converted / channelCount);
      });
    });
    const channelPerformance = Object.entries(channelMap).map(([name, d]) => ({
      name,
      sent: d.sent,
      opened: d.opened,
      converted: d.converted,
      rate: d.sent > 0 ? parseFloat((d.converted / d.sent * 100).toFixed(1)) : 0,
    }));

    // Segment performance from campaigns
    const segMap: Record<string, { campaigns: number; conversions: number; roiSum: number; roiCount: number }> = {};
    campaigns.forEach((c) => {
      const roiVal = parseFloat(c.roi.replace(/[^0-9.-]/g, ''));
      c.segments.forEach((sId) => {
        const seg = segments.find((s) => s.id === sId);
        const label = seg?.name || sId;
        if (!segMap[label]) segMap[label] = { campaigns: 0, conversions: 0, roiSum: 0, roiCount: 0 };
        segMap[label].campaigns += 1;
        segMap[label].conversions += c.converted;
        if (!Number.isNaN(roiVal)) { segMap[label].roiSum += roiVal; segMap[label].roiCount += 1; }
      });
    });
    const segmentPerformance = Object.entries(segMap).map(([segment, d]) => ({
      segment,
      campaigns: d.campaigns,
      conversions: d.conversions,
      roi: d.roiCount > 0 ? Math.round(d.roiSum / d.roiCount) : 0,
    }));

    // Campaign performance time series grouped by creation date
    const dateMap: Record<string, { value: number; conversions: number }> = {};
    campaigns.forEach((c) => {
      const d = c.createdAt;
      if (!dateMap[d]) dateMap[d] = { value: 0, conversions: 0 };
      dateMap[d].value += c.sent;
      dateMap[d].conversions += c.converted;
    });
    const campaignPerformance = Object.entries(dateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, d]) => ({ date, value: d.value, conversions: d.conversions }));

    return { conversionsByType, channelPerformance, segmentPerformance, campaignPerformance };
  }, [campaigns, segments]);

  // Filter campaigns
  const filteredCampaigns = useMemo(() => campaigns.filter((campaign) => {
    const matchesSearch = searchTerm === '' || campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || campaign.status === statusFilter;
    const matchesType = typeFilter === '' || campaign.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  }), [campaigns, searchTerm, statusFilter, typeFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const paginatedCampaigns = filteredCampaigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Generate AI content for campaign
  const handleGenerateAIContent = async () => {
    if (!newCampaign.type || newCampaign.segments.length === 0) {
      alert('Please select campaign type and target segments first');
      return;
    }
    try {
      setIsGeneratingAI(true);
      const typeInfo = getCampaignTypeInfo(newCampaign.type);
      const segmentNames = newCampaign.segments.map((s) => segments.find((seg) => seg.id === s)?.name || s).join(', ');

      // Determine content type based on selected channels (prefer push for multi-channel)
      const channelTypeMap: Record<string, string> = { push: 'PUSH_NOTIFICATION', email: 'EMAIL_BODY', sms: 'SMS' };
      const primaryChannel = channelTypeMap[newCampaign.channels.find((ch: string) => ch in channelTypeMap) || ''] || 'IN_APP_MESSAGE';

      const result = await api.generateAIContent({
        contentType: primaryChannel,
        campaignType: newCampaign.type.toUpperCase(),
        targetAudience: segmentNames,
        tone: 'FRIENDLY',
        additionalContext: typeInfo.description,
      }, session);

      // Handle response from backend (AIGeneratedContent DTO has bodyContent and rawContent)
      const generatedText = result?.bodyContent || result?.rawContent || result?.content || '';
      if (generatedText) {
        // Combine subject line if available (for email campaigns)
        const fullContent = result?.subjectLine
          ? `Subject: ${result.subjectLine}\n\n${generatedText}`
          : generatedText;
        setAiGeneratedContent(fullContent);
        setNewCampaign((prev) => ({ ...prev, message: fullContent }));
      }
    } catch (error) {
      console.error('Failed to generate AI content:', error);
      alert('Failed to generate AI content. Please try again.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.type || newCampaign.segments.length === 0 || newCampaign.channels.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      const campaignData = {
        name: newCampaign.name,
        campaignType: newCampaign.type.toUpperCase(),
        status: newCampaign.scheduleDate ? 'SCHEDULED' : 'ACTIVE',
        channels: newCampaign.channels,
        targetAudience: { segments: newCampaign.segments },
        contentJson: { message: newCampaign.message },
        scheduledAt: newCampaign.scheduleDate || null,
        aiGenerated: !!aiGeneratedContent,
        enableGeofencing: newCampaign.enableGeofencing,
        enableGamification: newCampaign.enableGamification,
        enableAiOptimization: newCampaign.enableLearning,
      };

      const result = await api.createCampaign(campaignData, session);

      // Add to local state
      const campaign: Campaign = {
        id: result?.id?.toString() || Date.now().toString(),
        name: newCampaign.name,
        type: newCampaign.type,
        status: newCampaign.scheduleDate ? 'scheduled' : 'active',
        segments: newCampaign.segments,
        channels: newCampaign.channels,
        sent: 0,
        opened: 0,
        converted: 0,
        roi: '-',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setCampaigns([campaign, ...campaigns]);
      setShowCreateForm(false);
      setAiGeneratedContent(null);
      setNewCampaign({
        name: '',
        type: '',
        segments: [],
        channels: [],
        message: '',
        scheduleDate: '',
        enableGeofencing: false,
        enableGamification: false,
        enableLearning: true,
      });
    } catch (error) {
      console.error('Failed to create campaign:', error);
      alert('Failed to create campaign. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Save campaign as draft
  const handleSaveDraft = async () => {
    if (!newCampaign.name) {
      alert('Please enter a campaign name');
      return;
    }

    try {
      setIsLoading(true);
      const draftData = {
        name: newCampaign.name,
        saveType: 'DRAFT',
        campaignType: newCampaign.type?.toUpperCase() || 'CUSTOM',
        channels: newCampaign.channels,
        targetAudience: { segments: newCampaign.segments },
        contentJson: { message: newCampaign.message },
        scheduledAt: newCampaign.scheduleDate || null,
        aiGenerated: !!aiGeneratedContent,
        enableGeofencing: newCampaign.enableGeofencing,
        enableGamification: newCampaign.enableGamification,
        enableAiOptimization: newCampaign.enableLearning,
      };

      await api.saveCampaign(draftData, session);

      alert('Campaign saved as draft!');
      setShowCreateForm(false);
      setAiGeneratedContent(null);
      setNewCampaign({
        name: '',
        type: '',
        segments: [],
        channels: [],
        message: '',
        scheduleDate: '',
        enableGeofencing: false,
        enableGamification: false,
        enableLearning: true,
      });
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Delete campaign
  const handleDeleteCampaign = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await api.deleteCampaign(id, session);
      setCampaigns(campaigns.filter((c) => c.id !== id));
    } catch (error) {
      console.error('Failed to delete campaign:', error);
    }
  };

  // Toggle campaign status (pause/resume)
  const handleToggleCampaignStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'PAUSED' : 'ACTIVE';
    try {
      await api.updateCampaignStatus(id, newStatus, session);
      setCampaigns(campaigns.map((c) => (c.id === id ? { ...c, status: newStatus.toLowerCase() } : c)));
    } catch (error) {
      console.error('Failed to update campaign status:', error);
    }
  };

  const toggleSegment = (segmentId: string) => {
    setNewCampaign((prev) => ({
      ...prev,
      segments: prev.segments.includes(segmentId)
        ? prev.segments.filter((s) => s !== segmentId)
        : [...prev.segments, segmentId],
    }));
  };

  const toggleChannel = (channelId: string) => {
    setNewCampaign((prev) => ({
      ...prev,
      channels: prev.channels.includes(channelId)
        ? prev.channels.filter((c) => c !== channelId)
        : [...prev.channels, channelId],
    }));
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'active': return { bg: themeColors.success50, text: themeColors.success600 };
      case 'scheduled': return { bg: themeColors.info50, text: themeColors.info600 };
      case 'completed': return { bg: themeColors.gray100, text: themeColors.gray600 };
      case 'paused': return { bg: themeColors.warning50, text: themeColors.warning600 };
      default: return { bg: themeColors.gray100, text: themeColors.gray600 };
    }
  };

  const getCampaignTypeInfo = (typeId: string) => CAMPAIGN_TYPES.find((t) => t.id === typeId) || CAMPAIGN_TYPES[0];

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <PageLayout title="AI Marketing" currentPath="/ai-marketing">
      {/* Header */}
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
        }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.sm }}>
            <div style={{ padding: themeSpace.sm, backgroundColor: themeColors.purple50, borderRadius: themeRadius.md }}>
              <Icon name="brain" size={24} color={themeColors.purple600} />
            </div>
            <p style={{ fontSize: '13px', color: themeColors.gray500, margin: 0 }}>Automated customer engagement & behavioral targeting</p>
          </div>
          {activeTab === 'campaigns' && (
          <button
            type="button"
            onClick={() => setShowCreateForm(true)}
            style={{
              background: `linear-gradient(135deg, ${themeColors.primary600} 0%, ${themeColors.purple600} 100%)`,
              color: themeColors.white,
              border: 'none',
              padding: `${themeSpace.sm} ${themeSpace.lg}`,
              borderRadius: themeRadius.md,
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              display: 'flex',
              gap: themeSpace.sm,
              alignItems: 'center',
              boxShadow: themeShadow.md,
            }}
          >
            <Icon name="plus" size={18} color={themeColors.white} />
            Create Campaign
          </button>
          )}
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: themeSpace.xs, backgroundColor: themeColors.gray100, padding: themeSpace.xs, borderRadius: themeRadius.md,
        }}
        >
          {[
            { id: 'campaigns', label: 'Campaigns', icon: 'megaphone' },
            { id: 'segments', label: 'Segments', icon: 'users' },
            { id: 'analytics', label: 'Analytics', icon: 'chart' },
            { id: 'merchants', label: 'Merchants', icon: 'store' },
          ].map((tab) => (
            <button
              type="button"
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              style={{
                flex: 1,
                padding: `${themeSpace.sm} ${themeSpace.md}`,
                border: 'none',
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: themeSpace.sm,
                backgroundColor: activeTab === tab.id ? themeColors.white : 'transparent',
                color: activeTab === tab.id ? themeColors.primary600 : themeColors.gray600,
                boxShadow: activeTab === tab.id ? themeShadow.sm : 'none',
                transition: 'all 200ms',
              }}
            >
              <Icon name={tab.icon} size={16} color={activeTab === tab.id ? themeColors.primary600 : themeColors.gray500} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Tab */}
      {activeTab === 'campaigns' && (
      <div>
        {/* Stats Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl,
        }}
        >
          {[
            {
              label: 'Active Campaigns', value: campaignStats.activeCampaigns, icon: 'play', color: themeColors.success600, bg: themeColors.success50,
            },
            {
              label: 'Total Sent', value: campaignStats.totalSent.toLocaleString(), icon: 'email', color: themeColors.primary600, bg: themeColors.primary50,
            },
            {
              label: 'Avg Open Rate', value: `${campaignStats.avgOpenRate.toFixed(1)}%`, icon: 'eye', color: themeColors.info600, bg: themeColors.info50,
            },
            {
              label: 'Avg Conversion', value: `${campaignStats.avgConversionRate.toFixed(1)}%`, icon: 'target', color: themeColors.purple600, bg: themeColors.purple50,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, border: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.sm,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.md,
              }}
              >
                <span style={{ fontSize: '13px', color: themeColors.gray500, fontWeight: '500' }}>{stat.label}</span>
                <div style={{ padding: themeSpace.sm, backgroundColor: stat.bg, borderRadius: themeRadius.sm }}>
                  <Icon name={stat.icon} size={16} color={stat.color} />
                </div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{
          display: 'flex', gap: themeSpace.md, marginBottom: themeSpace.lg, flexWrap: 'wrap',
        }}
        >
          <div style={{ position: 'relative', flex: '1', minWidth: '200px' }}>
            <div style={{
              position: 'absolute', left: themeSpace.md, top: '50%', transform: 'translateY(-50%)',
            }}
            >
              <Icon name="search" size={18} color={themeColors.gray500} />
            </div>
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${themeSpace.sm} ${themeSpace.md} ${themeSpace.sm} ${themeSpace.xl}`,
                paddingLeft: '40px',
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                fontSize: '14px',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, fontSize: '14px', backgroundColor: themeColors.white, cursor: 'pointer', minWidth: '140px',
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, fontSize: '14px', backgroundColor: themeColors.white, cursor: 'pointer', minWidth: '160px',
            }}
          >
            <option value="">All Types</option>
            {CAMPAIGN_TYPES.map((type) => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>

        {/* Campaigns List */}
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden',
        }}
        >
          {isLoading ? (
            <div style={{ padding: themeSpace.xl, textAlign: 'center', color: themeColors.gray500 }}>
              <div style={{ marginBottom: themeSpace.md }}>Loading campaigns...</div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: themeColors.gray50 }}>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'left', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          Campaign
                  </th>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'left', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          Type
                  </th>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'center', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          Status
                  </th>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'center', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          Channels
                  </th>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          Sent
                  </th>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          Opened
                  </th>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          Converted
                  </th>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          ROI
                  </th>
                  <th style={{
                    padding: themeSpace.md, textAlign: 'center', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                  }}
                  >
                          Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedCampaigns.map((campaign) => {
                  const typeInfo = getCampaignTypeInfo(campaign.type);
                  const statusColor = getStatusColor(campaign.status);
                  return (
                    <tr key={campaign.id} style={{ borderBottom: `1px solid ${themeColors.gray100}` }}>
                            <td style={{ padding: themeSpace.md }}>
                              <div style={{ fontWeight: '500', color: themeColors.text }}>{campaign.name}</div>
                              <div style={{ fontSize: '12px', color: themeColors.gray500 }}>{campaign.createdAt}</div>
                            </td>
                            <td style={{ padding: themeSpace.md }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.sm }}>
                                <div style={{ padding: themeSpace.xs, backgroundColor: `${typeInfo.color}15`, borderRadius: themeRadius.sm }}>
                                  <Icon name={typeInfo.icon} size={14} color={typeInfo.color} />
                                </div>
                                <span style={{ fontSize: '13px', color: themeColors.gray600 }}>{typeInfo.name}</span>
                              </div>
                            </td>
                            <td style={{ padding: themeSpace.md, textAlign: 'center' }}>
                              <span style={{
                                padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: statusColor.bg, color: statusColor.text, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '500', textTransform: 'capitalize',
                              }}
                              >
                                {campaign.status}
                              </span>
                            </td>
                            <td style={{ padding: themeSpace.md, textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: themeSpace.xs }}>
                                {campaign.channels.map((ch) => {
                                  const channel = NOTIFICATION_CHANNELS.find((c) => c.id === ch);
                                  return channel ? (
                                    <div key={ch} style={{ padding: themeSpace.xs, backgroundColor: `${channel.color}15`, borderRadius: themeRadius.sm }} title={channel.name}>
                                    <Icon name={channel.icon} size={12} color={channel.color} />
                                  </div>
                                  ) : null;
                                })}
                              </div>
                            </td>
                            <td style={{
                              padding: themeSpace.md, textAlign: 'right', fontSize: '14px', color: themeColors.text,
                            }}
                            >
                              {campaign.sent.toLocaleString()}
                            </td>
                            <td style={{
                              padding: themeSpace.md, textAlign: 'right', fontSize: '14px', color: themeColors.text,
                            }}
                            >
                              {campaign.opened.toLocaleString()}
                            </td>
                            <td style={{
                              padding: themeSpace.md, textAlign: 'right', fontSize: '14px', color: themeColors.text,
                            }}
                            >
                              {campaign.converted.toLocaleString()}
                            </td>
                            <td style={{
                              padding: themeSpace.md, textAlign: 'right', fontSize: '14px', fontWeight: '600', color: campaign.roi.startsWith('+') ? themeColors.success600 : themeColors.gray500,
                            }}
                            >
                              {campaign.roi}
                            </td>
                            <td style={{ padding: themeSpace.md, textAlign: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'center', gap: themeSpace.xs }}>
                                <button
                                  type="button"
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                                  }}
                                  title="Edit"
                                >
                                  <Icon name="edit" size={16} color={themeColors.gray500} />
                                </button>
                                {campaign.status === 'active' ? (
                                  <button
                                    type="button"
                                    onClick={() => handleToggleCampaignStatus(campaign.id, campaign.status)}
                                    style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                                  }}
                                    title="Pause"
                                  >
                                    <Icon name="pause" size={16} color={themeColors.warning600} />
                                  </button>
                                ) : (
                                  <button
                                  type="button"
                                  onClick={() => handleToggleCampaignStatus(campaign.id, campaign.status)}
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                                  }}
                                  title="Start"
                                >
                                  <Icon name="play" size={16} color={themeColors.success600} />
                                </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCampaign(campaign.id)}
                                  style={{
                                    background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                                  }}
                                  title="Delete"
                                >
                                  <Icon name="trash" size={16} color={themeColors.error500} />
                                </button>
                              </div>
                            </td>
                          </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: themeSpace.sm, marginTop: themeSpace.lg,
        }}
        >
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, backgroundColor: themeColors.white, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1,
            }}
          >
            <Icon name="chevronLeft" size={16} />
          </button>
          <span style={{ padding: `${themeSpace.sm} ${themeSpace.md}`, color: themeColors.gray600 }}>
            Page
            {' '}
            {currentPage}
            {' '}
            of
            {' '}
            {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, backgroundColor: themeColors.white, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1,
            }}
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
        )}
      </div>
      )}

      {/* Segments Tab */}
      {activeTab === 'segments' && (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: themeSpace.lg }}>
          {segments.map((segment) => (
            <div
              key={segment.id}
              style={{
                backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, border: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.sm,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.md,
              }}
              >
                <div>
                  <h3 style={{
                    fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: 0, marginBottom: themeSpace.xs,
                  }}
                  >
                    {segment.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: themeColors.gray500, margin: 0 }}>{segment.description}</p>
                </div>
                <div style={{ padding: themeSpace.sm, backgroundColor: themeColors.primary50, borderRadius: themeRadius.sm }}>
                  <Icon name="users" size={18} color={themeColors.primary600} />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text }}>{segment.count.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: themeColors.gray500 }}>users in segment</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewCampaign((prev) => ({ ...prev, segments: [segment.id] }));
                    setShowCreateForm(true);
                  }}
                  style={{
                    background: themeColors.primary50, border: 'none', color: themeColors.primary600, padding: `${themeSpace.sm} ${themeSpace.md}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                  }}
                >
                  Create Campaign
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Segment Performance */}
        <div style={{
          marginTop: themeSpace.xl, backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, border: `1px solid ${themeColors.gray200}`,
        }}
        >
          <h3 style={{
            fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: 0, marginBottom: themeSpace.lg,
          }}
          >
            Segment Performance
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={computedAnalytics.segmentPerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gray200} />
              <XAxis dataKey="segment" tick={{ fontSize: 12, fill: themeColors.gray600 }} />
              <YAxis tick={{ fontSize: 12, fill: themeColors.gray600 }} />
              <Tooltip contentStyle={{ backgroundColor: themeColors.white, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm }} />
              <Legend />
              <Bar dataKey="conversions" name="Conversions" fill={themeColors.primary600} radius={[4, 4, 0, 0]} />
              <Bar dataKey="roi" name="ROI %" fill={themeColors.success600} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
      <div>
        {/* KPI Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl,
        }}
        >
          {[
            {
              label: 'Total Campaigns', value: campaigns.length.toString(), icon: 'megaphone', color: themeColors.primary600,
            },
            {
              label: 'Messages Sent', value: campaignStats.totalSent.toLocaleString(), icon: 'email', color: themeColors.info600,
            },
            {
              label: 'Conversions', value: campaignStats.totalConverted.toLocaleString(), icon: 'target', color: themeColors.success600,
            },
            {
              label: 'Revenue Generated', value: `$${campaignStats.totalRevenue.toLocaleString()}`, icon: 'trendingUp', color: themeColors.purple600,
            },
            {
              label: 'Avg ROI', value: `${campaignStats.avgRoi.toFixed(0)}%`, icon: 'chart', color: themeColors.warning600,
            },
          ].map((kpi) => (
            <div
              key={kpi.label}
              style={{
                backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, border: `1px solid ${themeColors.gray200}`,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.sm,
              }}
              >
                <span style={{ fontSize: '12px', color: themeColors.gray500 }}>{kpi.label}</span>
                <Icon name={kpi.icon} size={16} color={kpi.color} />
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: themeColors.text }}>{kpi.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: themeSpace.lg }}>
          {/* Campaign Performance Over Time */}
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, border: `1px solid ${themeColors.gray200}`,
          }}
          >
            <h3 style={{
              fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: 0, marginBottom: themeSpace.lg,
            }}
            >
              Campaign Performance
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={computedAnalytics.campaignPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeColors.gray200} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: themeColors.gray600 }} />
                <YAxis tick={{ fontSize: 11, fill: themeColors.gray600 }} />
                <Tooltip contentStyle={{ backgroundColor: themeColors.white, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm }} />
                <Area type="monotone" dataKey="value" name="Sent" stroke={themeColors.primary600} fill={themeColors.primary100} />
                <Area type="monotone" dataKey="conversions" name="Conversions" stroke={themeColors.success600} fill={themeColors.success100} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Conversions by Type */}
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, border: `1px solid ${themeColors.gray200}`,
          }}
          >
            <h3 style={{
              fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: 0, marginBottom: themeSpace.lg,
            }}
            >
              Conversions by Campaign Type
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={computedAnalytics.conversionsByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {computedAnalytics.conversionsByType.map((_entry, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: themeColors.white, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Channel Performance */}
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, border: `1px solid ${themeColors.gray200}`, gridColumn: 'span 2',
          }}
          >
            <h3 style={{
              fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: 0, marginBottom: themeSpace.lg,
            }}
            >
              Channel Performance
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: themeSpace.md, textAlign: 'left', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                    }}
                    >
                            Channel
                    </th>
                    <th style={{
                      padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                    }}
                    >
                            Sent
                    </th>
                    <th style={{
                      padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                    }}
                    >
                            Opened
                    </th>
                    <th style={{
                      padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                    }}
                    >
                            Converted
                    </th>
                    <th style={{
                      padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600, borderBottom: `1px solid ${themeColors.gray200}`,
                    }}
                    >
                            Conversion Rate
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {computedAnalytics.channelPerformance.map((channel) => (
                    <tr key={channel.name}>
                      <td style={{ padding: themeSpace.md, fontWeight: '500' }}>{channel.name}</td>
                      <td style={{ padding: themeSpace.md, textAlign: 'right' }}>{channel.sent.toLocaleString()}</td>
                      <td style={{ padding: themeSpace.md, textAlign: 'right' }}>{channel.opened.toLocaleString()}</td>
                      <td style={{ padding: themeSpace.md, textAlign: 'right' }}>{channel.converted.toLocaleString()}</td>
                      <td style={{
                              padding: themeSpace.md, textAlign: 'right', fontWeight: '600', color: themeColors.success600,
                            }}
                            >
                              {channel.rate}
                              %
                            </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Merchants Tab */}
      {activeTab === 'merchants' && (
      <div>
        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl,
        }}
        >
          {[
            {
              label: 'Total Merchants', value: merchants.length, icon: 'store', color: themeColors.primary600,
            },
            {
              label: 'Active Campaigns', value: merchants.reduce((a, m) => a + (m.campaigns || 0), 0), icon: 'megaphone', color: themeColors.success600,
            },
            {
              label: 'Total Redemptions', value: merchants.reduce((a, m) => a + (m.redemptions || 0), 0).toLocaleString(), icon: 'gift', color: themeColors.warning600,
            },
            {
              label: 'Avg Rating', value: merchants.length > 0 ? (merchants.reduce((a, m) => a + (m.rating || 0), 0) / merchants.length).toFixed(1) : '0', icon: 'award', color: themeColors.purple600,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: themeSpace.lg, border: `1px solid ${themeColors.gray200}`,
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.sm,
              }}
              >
                <span style={{ fontSize: '13px', color: themeColors.gray500 }}>{stat.label}</span>
                <Icon name={stat.icon} size={16} color={stat.color} />
              </div>
              <div style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Merchants List */}
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden',
        }}
        >
          <div style={{
            padding: themeSpace.lg, borderBottom: `1px solid ${themeColors.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}
          >
            <h3 style={{
              fontSize: '16px', fontWeight: '600', color: themeColors.text, margin: 0,
            }}
            >
              Merchant Network
            </h3>
            <button
              type="button"
              style={{
                background: themeColors.primary50, border: 'none', color: themeColors.primary600, padding: `${themeSpace.sm} ${themeSpace.md}`, borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: themeSpace.xs,
              }}
            >
              <Icon name="plus" size={14} color={themeColors.primary600} />
              Add Merchant
            </button>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: themeColors.gray50 }}>
                <th style={{
                  padding: themeSpace.md, textAlign: 'left', fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
                  Merchant
                </th>
                <th style={{
                  padding: themeSpace.md, textAlign: 'left', fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
                  Category
                </th>
                <th style={{
                  padding: themeSpace.md, textAlign: 'left', fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
                  Location
                </th>
                <th style={{
                  padding: themeSpace.md, textAlign: 'center', fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
                  Campaigns
                </th>
                <th style={{
                  padding: themeSpace.md, textAlign: 'right', fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
                  Redemptions
                </th>
                <th style={{
                  padding: themeSpace.md, textAlign: 'center', fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
                  Rating
                </th>
                <th style={{
                  padding: themeSpace.md, textAlign: 'center', fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
                  Status
                </th>
                <th style={{
                  padding: themeSpace.md, textAlign: 'center', fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => (
                <tr key={merchant.id} style={{ borderBottom: `1px solid ${themeColors.gray100}` }}>
                  <td style={{ padding: themeSpace.md }}>
                    <div style={{ fontWeight: '500', color: themeColors.text }}>{merchant.name}</div>
                  </td>
                  <td style={{ padding: themeSpace.md, color: themeColors.gray600, fontSize: '14px' }}>{merchant.category}</td>
                  <td style={{ padding: themeSpace.md }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: themeSpace.xs, color: themeColors.gray600, fontSize: '14px',
                    }}
                    >
                      <Icon name="location" size={14} color={themeColors.gray500} />
                      {merchant.location}
                    </div>
                  </td>
                  <td style={{ padding: themeSpace.md, textAlign: 'center', color: themeColors.text }}>{merchant.campaigns}</td>
                  <td style={{ padding: themeSpace.md, textAlign: 'right', color: themeColors.text }}>{merchant.redemptions.toLocaleString()}</td>
                  <td style={{ padding: themeSpace.md, textAlign: 'center' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: themeSpace.xs, color: themeColors.warning600,
                    }}
                    >
                      <Icon name="award" size={14} color={themeColors.warning600} />
                      {merchant.rating}
                    </span>
                  </td>
                  <td style={{ padding: themeSpace.md, textAlign: 'center' }}>
                    <span style={{
                      padding: `${themeSpace.xs} ${themeSpace.sm}`,
                      backgroundColor: merchant.status === 'active' ? themeColors.success50 : themeColors.warning50,
                      color: merchant.status === 'active' ? themeColors.success600 : themeColors.warning600,
                      borderRadius: themeRadius.sm,
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'capitalize',
                    }}
                    >
                      {merchant.status}
                    </span>
                  </td>
                  <td style={{ padding: themeSpace.md, textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: themeSpace.xs }}>
                      <button
                        type="button"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                        }}
                        title="View Details"
                      >
                        <Icon name="eye" size={16} color={themeColors.gray500} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setNewCampaign((prev) => ({ ...prev, name: `${merchant.name} Campaign` }));
                          setShowCreateForm(true);
                        }}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                        }}
                        title="Create Campaign"
                      >
                        <Icon name="megaphone" size={16} color={themeColors.primary600} />
                      </button>
                      <button
                        type="button"
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.xs,
                        }}
                        title="Edit"
                      >
                        <Icon name="edit" size={16} color={themeColors.gray500} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* Create Campaign Modal */}
      {showCreateForm && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: themeSpace.xl,
      }}
      >
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, padding: 0, width: '90%', maxWidth: '800px', maxHeight: '90vh', boxShadow: themeShadow.lg, display: 'flex', flexDirection: 'column',
        }}
        >
          {/* Modal Header */}
          <div style={{
            padding: themeSpace.lg, borderBottom: `1px solid ${themeColors.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: `linear-gradient(135deg, ${themeColors.primary50} 0%, ${themeColors.purple50} 100%)`,
          }}
          >
            <div>
              <h2 style={{
                fontSize: '20px', fontWeight: '700', color: themeColors.text, margin: 0,
              }}
              >
                Create AI Campaign
              </h2>
              <p style={{
                fontSize: '13px', color: themeColors.gray600, margin: 0, marginTop: themeSpace.xs,
              }}
              >
                Configure automated behavioral targeting
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: themeSpace.sm,
              }}
            >
              <Icon name="x" size={20} color={themeColors.gray500} />
            </button>
          </div>

          {/* Modal Body */}
          <div style={{ padding: themeSpace.lg, overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {/* Campaign Name */}
            <div style={{ marginBottom: themeSpace.lg }}>
              <label
htmlFor="field" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.gray700, marginBottom: themeSpace.sm,
              }}
              >
                Campaign Name *
              </label>
              <input
id="field"
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Weekend Flash Sale"
                style={{
                  width: '100%', padding: themeSpace.md, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, fontSize: '14px', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Campaign Type */}
            <div style={{ marginBottom: themeSpace.lg }}>
              <label
htmlFor="field-2" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.gray700, marginBottom: themeSpace.sm,
              }}
              >
                Campaign Type *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: themeSpace.sm }}>
                {CAMPAIGN_TYPES.map((type) => (
                  <div
                    key={type.id}
                    onClick={() => setNewCampaign((prev) => ({ ...prev, type: type.id }))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                    style={{
                      padding: themeSpace.md,
                      border: `2px solid ${newCampaign.type === type.id ? type.color : themeColors.gray200}`,
                      borderRadius: themeRadius.md,
                      cursor: 'pointer',
                      backgroundColor: newCampaign.type === type.id ? `${type.color}10` : themeColors.white,
                      transition: 'all 200ms',
                    }}
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: themeSpace.sm, marginBottom: themeSpace.xs,
                    }}
                    >
                      <Icon name={type.icon} size={16} color={type.color} />
                      <span style={{ fontWeight: '600', fontSize: '14px', color: themeColors.text }}>{type.name}</span>
                    </div>
                    <p style={{ fontSize: '12px', color: themeColors.gray500, margin: 0 }}>{type.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Segments */}
            <div style={{ marginBottom: themeSpace.lg }}>
              <label
htmlFor="field-3" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.gray700, marginBottom: themeSpace.sm,
              }}
              >
                Target Segments *
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: themeSpace.sm }}>
                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    onClick={() => toggleSegment(segment.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                    style={{
                      padding: themeSpace.md,
                      border: `2px solid ${newCampaign.segments.includes(segment.id) ? themeColors.primary600 : themeColors.gray200}`,
                      borderRadius: themeRadius.md,
                      cursor: 'pointer',
                      backgroundColor: newCampaign.segments.includes(segment.id) ? themeColors.primary50 : themeColors.white,
                      display: 'flex',
                      alignItems: 'center',
                      gap: themeSpace.sm,
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '4px',
                      border: `2px solid ${newCampaign.segments.includes(segment.id) ? themeColors.primary600 : themeColors.gray300}`,
                      backgroundColor: newCampaign.segments.includes(segment.id) ? themeColors.primary600 : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    >
                      {newCampaign.segments.includes(segment.id) && <Icon name="check" size={12} color={themeColors.white} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', fontSize: '13px', color: themeColors.text }}>{segment.name}</div>
                      <div style={{ fontSize: '11px', color: themeColors.gray500 }}>
                            {segment.count.toLocaleString()}
                            {' '}
                            users
                          </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notification Channels */}
            <div style={{ marginBottom: themeSpace.lg }}>
              <label
htmlFor="field-4" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.gray700, marginBottom: themeSpace.sm,
              }}
              >
                Notification Channels *
              </label>
              <div style={{ display: 'flex', gap: themeSpace.md, flexWrap: 'wrap' }}>
                {NOTIFICATION_CHANNELS.map((channel) => (
                  <div
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                    style={{
                      padding: `${themeSpace.sm} ${themeSpace.lg}`,
                      border: `2px solid ${newCampaign.channels.includes(channel.id) ? channel.color : themeColors.gray200}`,
                      borderRadius: themeRadius.md,
                      cursor: 'pointer',
                      backgroundColor: newCampaign.channels.includes(channel.id) ? `${channel.color}15` : themeColors.white,
                      display: 'flex',
                      alignItems: 'center',
                      gap: themeSpace.sm,
                    }}
                  >
                    <Icon name={channel.icon} size={16} color={newCampaign.channels.includes(channel.id) ? channel.color : themeColors.gray500} />
                    <span style={{ fontWeight: '500', fontSize: '14px', color: newCampaign.channels.includes(channel.id) ? channel.color : themeColors.gray600 }}>{channel.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message */}
            <div style={{ marginBottom: themeSpace.lg }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.sm,
              }}
              >
                <label htmlFor="campaign-message" style={{ fontSize: '14px', fontWeight: '600', color: themeColors.gray700 }}>Campaign Message</label>
                <button
                  type="button"
                  onClick={handleGenerateAIContent}
                  disabled={isGeneratingAI}
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.purple600} 0%, ${themeColors.primary600} 100%)`,
                    color: themeColors.white,
                    border: 'none',
                    padding: `${themeSpace.xs} ${themeSpace.md}`,
                    borderRadius: themeRadius.sm,
                    cursor: isGeneratingAI ? 'wait' : 'pointer',
                    fontSize: '12px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: themeSpace.xs,
                    opacity: isGeneratingAI ? 0.7 : 1,
                  }}
                >
                  <Icon name="brain" size={14} color={themeColors.white} />
                  {isGeneratingAI ? 'Generating...' : 'Generate with AI'}
                </button>
              </div>
              <textarea
                value={newCampaign.message}
                onChange={(e) => setNewCampaign((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Enter your campaign message or click 'Generate with AI' to create content automatically..."
                rows={4}
                style={{
                  width: '100%', padding: themeSpace.md, border: `1px solid ${aiGeneratedContent ? themeColors.purple600 : themeColors.gray200}`, borderRadius: themeRadius.sm, fontSize: '14px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box', backgroundColor: aiGeneratedContent ? themeColors.purple50 : themeColors.white,
                }}
              />
              {aiGeneratedContent && (
              <p style={{
                fontSize: '12px', color: themeColors.purple600, marginTop: themeSpace.xs, display: 'flex', alignItems: 'center', gap: themeSpace.xs,
              }}
              >
                <Icon name="brain" size={12} color={themeColors.purple600} />
                AI-generated content - feel free to edit
              </p>
              )}
            </div>

            {/* Schedule */}
            <div style={{ marginBottom: themeSpace.lg }}>
              <label
htmlFor="field-5" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.gray700, marginBottom: themeSpace.sm,
              }}
              >
                Schedule (Optional)
              </label>
              <input
id="field-5"
                type="datetime-local"
                value={newCampaign.scheduleDate}
                onChange={(e) => setNewCampaign((prev) => ({ ...prev, scheduleDate: e.target.value }))}
                style={{
                  padding: themeSpace.md, border: `1px solid ${themeColors.gray200}`, borderRadius: themeRadius.sm, fontSize: '14px',
                }}
              />
              <p style={{ fontSize: '12px', color: themeColors.gray500, marginTop: themeSpace.xs }}>Leave empty to start immediately</p>
            </div>

            {/* Advanced Options */}
            <div style={{ padding: themeSpace.lg, backgroundColor: themeColors.gray50, borderRadius: themeRadius.md }}>
              <h4 style={{
                fontSize: '14px', fontWeight: '600', color: themeColors.gray700, margin: 0, marginBottom: themeSpace.md,
              }}
              >
                Advanced Options
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
                {[
                  {
                    key: 'enableGeofencing', label: 'Enable Geofencing', desc: 'Target users based on location proximity', icon: 'map',
                  },
                  {
                    key: 'enableGamification', label: 'Enable Gamification', desc: 'Add rewards and badges for engagement', icon: 'award',
                  },
                  {
                    key: 'enableLearning', label: 'AI Learning Optimization', desc: 'Automatically optimize based on performance', icon: 'brain',
                  },
                ].map((option) => (
                  <div
                    key={option.key}
                    onClick={() => setNewCampaign((prev) => ({ ...prev, [option.key]: !prev[option.key as keyof typeof prev] }))}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                    style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: themeSpace.md,
                          padding: themeSpace.md,
                          backgroundColor: themeColors.white,
                          borderRadius: themeRadius.sm,
                          cursor: 'pointer',
                          border: `1px solid ${themeColors.gray200}`,
                        }}
                  >
                    <div style={{
                          width: '40px',
                          height: '22px',
                          backgroundColor: newCampaign[option.key as keyof typeof newCampaign] ? themeColors.primary600 : themeColors.gray300,
                          borderRadius: '11px',
                          position: 'relative',
                          transition: 'background-color 200ms',
                        }}
                        >
                          <div style={{
                            width: '18px',
                            height: '18px',
                            backgroundColor: themeColors.white,
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: newCampaign[option.key as keyof typeof newCampaign] ? '20px' : '2px',
                            transition: 'left 200ms',
                            boxShadow: themeShadow.sm,
                          }}
                          />
                        </div>
                    <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.sm }}>
                            <Icon name={option.icon} size={16} color={themeColors.gray600} />
                            <span style={{ fontWeight: '500', fontSize: '14px', color: themeColors.text }}>{option.label}</span>
                          </div>
                          <p style={{
                            fontSize: '12px', color: themeColors.gray500, margin: 0, marginTop: themeSpace.xs,
                          }}
                          >
                            {option.desc}
                          </p>
                        </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div style={{
            padding: themeSpace.lg, borderTop: `1px solid ${themeColors.gray200}`, display: 'flex', justifyContent: 'flex-end', gap: themeSpace.md, flexShrink: 0,
          }}
          >
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                border: `1px solid ${themeColors.gray200}`,
                backgroundColor: themeColors.white,
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                color: themeColors.gray600,
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={!newCampaign.name}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                border: `1px solid ${themeColors.gray200}`,
                backgroundColor: themeColors.white,
                borderRadius: themeRadius.sm,
                cursor: newCampaign.name ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
                color: themeColors.gray600,
                display: 'flex',
                alignItems: 'center',
                gap: themeSpace.sm,
                opacity: newCampaign.name ? 1 : 0.5,
              }}
            >
              <Icon name="inbox" size={16} color={themeColors.gray600} />
              Save as Draft
            </button>
            <button
              type="button"
              onClick={handleCreateCampaign}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                border: 'none',
                background: `linear-gradient(135deg, ${themeColors.primary600} 0%, ${themeColors.purple600} 100%)`,
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: themeColors.white,
                display: 'flex',
                alignItems: 'center',
                gap: themeSpace.sm,
              }}
            >
              <Icon name="zap" size={16} color={themeColors.white} />
              Launch Campaign
            </button>
          </div>
        </div>
      </div>
      )}
    </PageLayout>
  );
}
