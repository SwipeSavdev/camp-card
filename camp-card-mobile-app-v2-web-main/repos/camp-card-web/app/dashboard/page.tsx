'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray600: '#4b5563',
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
  xs: '3px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '40px',
  '3xl': '48px',
};

const themeRadius = {
  sm: '4px',
  card: '12px',
};

const themeShadow = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

// Icon components
function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    users: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    organization: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M18 21H3v-2a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 11a4 4 0 0 0-7.33-2.5M20.5 7a4 4 0 1 0-7 0" />
      </svg>
    ),
    merchants: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
      </svg>
    ),
    offers: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M6 9h12M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" />
        <circle cx="9" cy="14" r="1.5" fill={color} />
        <circle cx="15" cy="14" r="1.5" fill={color} />
      </svg>
    ),
    cards: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    analytics: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="12" y1="2" x2="12" y2="22" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    creditCard: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    settings: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m3.08-3.08l4.24-4.24M19.78 19.78l-4.24-4.24m-3.08-3.08l-4.24-4.24" />
      </svg>
    ),
    notifications: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    health: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M16.5 9l-5.5 5.5L7.5 12" />
      </svg>
    ),
    checkmark: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    logout: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    add: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    ),
    report: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="12" y1="13" x2="12" y2="17" />
        <line x1="12" y1="19" x2="12" y2="20" />
      </svg>
    ),
    docs: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M4 19.5h16M6 4h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
      </svg>
    ),
    config: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12.5 2l.5 8M12.5 22l.5-8M3.5 12.5l8 .5M21.5 12.5l-8 .5" />
        <circle cx="12.5" cy="12.5" r="3.5" />
      </svg>
    ),
    brain: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5" />
        <path d="M12 4.5v15M8 8h8M8 12h8M10 16h4" />
      </svg>
    ),
    menu: (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  };
  return icons[name] || null;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (status === 'loading') return null;
  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }
  if (!session) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Collapsible Sidebar */}
      <div
        style={{
          width: sidebarOpen ? '260px' : '70px',
          backgroundColor: themeColors.primary900,
          color: themeColors.white,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 300ms ease',
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Logo */}
        <div style={{
          padding: themeSpace.lg, display: 'flex', alignItems: 'center', gap: themeSpace.md, borderBottom: `1px solid ${themeColors.primary800}`,
        }}
        >
          <div style={{
            width: '36px', height: '36px', backgroundColor: themeColors.primary600, borderRadius: themeRadius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
          >
            <span style={{ fontWeight: '700', fontSize: '16px' }}>CC</span>
          </div>
          {sidebarOpen && <span style={{ fontSize: '14px', fontWeight: '600', whiteSpace: 'nowrap' }}>Camp Card</span>}
        </div>

        {/* Navigation */}
        <div style={{ flex: 1, overflow: 'auto', paddingTop: themeSpace.md }}>
          {[
            { name: 'dashboard', label: 'Dashboard', href: '/dashboard' },
            { name: 'users', label: 'Users', href: '/users' },
            { name: 'organization', label: 'Councils', href: '/councils' },
            { name: 'merchants', label: 'Merchants', href: '/merchants' },
            { name: 'offers', label: 'Offers', href: '/offers' },
            { name: 'cards', label: 'Cards', href: '/camp-cards' },
            { name: 'analytics', label: 'Analytics', href: '/analytics' },
            { name: 'brain', label: 'AI Marketing', href: '/ai-marketing' },
            { name: 'creditCard', label: 'Subscriptions', href: '/subscriptions' },
            { name: 'settings', label: 'Settings', href: '/settings' },
          ].map((item) => {
            const isActive = item.href === '/dashboard';
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  padding: `${themeSpace.md}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: themeSpace.md,
                  cursor: 'pointer',
                  color: isActive ? themeColors.white : themeColors.primary100,
                  fontSize: '14px',
                  transition: 'all 200ms',
                  borderLeft: isActive ? `3px solid ${themeColors.primary300}` : '3px solid transparent',
                  backgroundColor: isActive ? themeColors.primary800 : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = themeColors.primary800;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px',
                }}
                >
                  <Icon name={item.name} size={18} color="currentColor" />
                </div>
                {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div style={{ borderTop: `1px solid ${themeColors.primary800}`, padding: themeSpace.md }}>
          {[
            { name: 'notifications', label: 'Notifications', href: '/notifications' },
            { name: 'health', label: 'Health', href: '/health' },
            { name: 'config', label: 'Config', href: '/config' },
          ].map((item) => (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              style={{
                padding: themeSpace.md,
                display: 'flex',
                alignItems: 'center',
                gap: themeSpace.md,
                cursor: 'pointer',
                color: themeColors.primary100,
                fontSize: '13px',
                marginBottom: themeSpace.xs,
                borderRadius: '4px',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = themeColors.primary800; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px',
              }}
              >
                <Icon name={item.name} size={18} color="currentColor" />
              </div>
              {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>{item.label}</span>}
            </div>
          ))}
          <div
            onClick={() => router.push('/login')}
            style={{
              padding: themeSpace.md,
              display: 'flex',
              alignItems: 'center',
              gap: themeSpace.md,
              cursor: 'pointer',
              color: themeColors.primary100,
              fontSize: '13px',
              marginTop: themeSpace.md,
              borderTop: `1px solid ${themeColors.primary800}`,
              paddingTop: themeSpace.lg,
            }}
          >
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '24px',
            }}
            >
              <Icon name="logout" size={18} color="currentColor" />
            </div>
            {sidebarOpen && <span style={{ whiteSpace: 'nowrap' }}>Logout</span>}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top Bar */}
        <div
          style={{
            padding: `${themeSpace.md} ${themeSpace.xl}`,
            backgroundColor: themeColors.white,
            borderBottom: `1px solid ${themeColors.gray200}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: themeShadow.xs,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: themeColors.primary600,
                padding: themeSpace.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icon name="menu" size={20} />
            </button>
            <h2 style={{
              margin: 0, fontSize: '18px', fontWeight: '600', color: themeColors.text,
            }}
            >
              Dashboard
            </h2>
          </div>
          <div
            onClick={() => router.push('/profile')}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: themeColors.white,
              fontWeight: '600',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            {session?.user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1, padding: themeSpace.xl, overflowY: 'auto', backgroundColor: themeColors.gray50,
        }}
        >
          {/* Welcome */}
          <div style={{ marginBottom: themeSpace['3xl'] }}>
            <h1 style={{
              fontSize: '28px', fontWeight: '700', color: themeColors.text, margin: 0, marginBottom: themeSpace.sm,
            }}
            >
              Welcome back,
              {session?.user?.name || 'Admin'}
            </h1>
            <p style={{ fontSize: '15px', color: themeColors.gray600, margin: 0 }}>Here's what's happening with your Camp Card ecosystem today.</p>
          </div>

          {/* Stats Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: themeSpace.lg,
              marginBottom: themeSpace['3xl'],
            }}
          >
            {[{
              label: 'Active Users', value: '12,847', trend: '+12%', color: themeColors.primary50, icon: 'users',
            }, {
              label: 'Merchants', value: '384', trend: '+8%', color: themeColors.warning50, icon: 'merchants',
            }, {
              label: 'Live Offers', value: '1,563', trend: '+24%', color: themeColors.info50, icon: 'offers',
            }, {
              label: 'Redemptions', value: '4,207', trend: '+15%', color: themeColors.success50, icon: 'cards',
            }].map((stat, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: themeColors.white,
                  borderRadius: themeRadius.card,
                  padding: themeSpace.lg,
                  border: `1px solid ${themeColors.gray200}`,
                  boxShadow: themeShadow.sm,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                   position: 'absolute',
                   top: '-40px',
                   right: '-40px',
                   width: '120px',
                   height: '120px',
                   borderRadius: '50%',
                   background: stat.color,
                 }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                   display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.md,
                 }}
                 >
                   <p style={{
                   margin: 0, fontSize: '13px', color: themeColors.gray600, fontWeight: '500',
                 }}
                 >
                   {stat.label}
                 </p>
                   <div style={{ color: themeColors.primary600 }}>
                   <Icon name={stat.icon} size={20} color={themeColors.primary600} />
                 </div>
                 </div>
                  <div style={{
                   display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: themeSpace.md,
                 }}
                 >
                   <h3 style={{
                   margin: 0, fontSize: '32px', fontWeight: '700', color: themeColors.text,
                 }}
                 >
                   {stat.value}
                 </h3>
                   <span style={{
                   padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: themeColors.success50, color: themeColors.success600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '600',
                 }}
                 >
                   {stat.trend}
                 </span>
                 </div>
                </div>
              </div>
            ))}
          </div>

          {/* System Status */}
          <div
            style={{
              backgroundColor: themeColors.success50,
              border: `1px solid ${themeColors.success200}`,
              borderRadius: themeRadius.card,
              padding: themeSpace.lg,
              marginBottom: themeSpace['3xl'],
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', gap: themeSpace.lg, alignItems: 'center' }}>
              <div style={{ color: themeColors.success600 }}>
                <Icon name="checkmark" size={28} color={themeColors.success600} />
              </div>
              <div>
                <p style={{
                  margin: 0, fontSize: '15px', fontWeight: '600', color: themeColors.text,
                }}
                >
All systems operational
</p>
                <p style={{
                  margin: 0, fontSize: '13px', color: themeColors.gray600, marginTop: themeSpace.xs,
                }}
                >
Your Camp Card ecosystem is running smoothly.
</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/health')}
              style={{
                background: themeColors.white,
                border: `1px solid ${themeColors.success200}`,
                color: themeColors.success600,
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              View Details
            </button>
          </div>

          {/* Activity & Actions Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: themeSpace.lg,
            }}
          >
            {/* Activity */}
            <div
              style={{
                backgroundColor: themeColors.white,
                borderRadius: themeRadius.card,
                padding: themeSpace.lg,
                border: `1px solid ${themeColors.gray200}`,
                boxShadow: themeShadow.sm,
              }}
            >
              <h3 style={{
                margin: 0, fontSize: '16px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.lg,
              }}
              >
                Recent Activity
</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
                {[{ name: 'users', title: 'New merchant onboarded', time: '2 hours ago' }, { name: 'report', title: 'Bulk user import completed', time: '5 hours ago' }, { name: 'offers', title: 'New promotional offer created', time: '1 day ago' }, { name: 'config', title: 'System backup completed', time: '2 days ago' }].map((item, idx) => (
                  <div
                    key={idx} style={{
                     display: 'flex', gap: themeSpace.md, paddingBottom: idx < 3 ? themeSpace.md : 0, borderBottom: idx < 3 ? `1px solid ${themeColors.gray100}` : 'none',
                   }}
                  >
                    <div style={{ color: themeColors.primary600, display: 'flex', alignItems: 'center' }}>
                     <Icon name={item.name} size={18} color={themeColors.primary600} />
                   </div>
                    <div style={{ flex: 1 }}>
                     <p style={{
                     margin: 0, fontSize: '14px', fontWeight: '500', color: themeColors.text,
                   }}
                   >{item.title}
                   </p>
                     <p style={{
                     margin: 0, fontSize: '12px', color: themeColors.gray500, marginTop: themeSpace.xs,
                   }}
                   >{item.time}
                   </p>
                   </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div
              style={{
                backgroundColor: themeColors.white,
                borderRadius: themeRadius.card,
                padding: themeSpace.lg,
                border: `1px solid ${themeColors.gray200}`,
                boxShadow: themeShadow.sm,
              }}
            >
              <h3 style={{
                margin: 0, fontSize: '16px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.lg,
              }}
              >
                Quick Actions
</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
                {[
                  {
                    name: 'add', label: 'Create New User', color: themeColors.primary600, bg: themeColors.primary50, action: '/users',
                  },
                  {
                    name: 'report', label: 'Generate Report', color: themeColors.info600, bg: themeColors.info50, action: '/analytics',
                  },
                  {
                    name: 'docs', label: 'View Documentation', color: themeColors.warning600, bg: themeColors.warning50, action: '/settings',
                  },
                  {
                    name: 'config', label: 'Feature Configuration', color: themeColors.success600, bg: themeColors.success50, action: '/config',
                  },
                ].map((action, idx) => (
                  <button
                   key={idx}
                   onClick={() => router.push(action.action)}
                   style={{
                   background: action.bg,
                   border: 'none',
                   color: action.color,
                   padding: `${themeSpace.md} ${themeSpace.lg}`,
                   borderRadius: themeRadius.sm,
                   cursor: 'pointer',
                   fontSize: '14px',
                   fontWeight: '500',
                   display: 'flex',
                   gap: themeSpace.md,
                   alignItems: 'center',
                   transition: 'all 200ms',
                 }}
                   onMouseEnter={(e) => {
                   e.currentTarget.style.opacity = '0.8';
                 }}
                   onMouseLeave={(e) => {
                   e.currentTarget.style.opacity = '1';
                 }}
                 >
                   <Icon name={action.name} size={18} color={action.color} />
                   {action.label}
                 </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
