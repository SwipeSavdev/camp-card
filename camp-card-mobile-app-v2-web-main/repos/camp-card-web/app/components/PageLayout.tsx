'use client';

import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useEffect, ReactNode } from 'react';
import { useIsMobile } from '@/lib/hooks';

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
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px',
};
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' };

function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: { [key: string]: JSX.Element } = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
               </svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
           </svg>,
    organization: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 21H3v-2a6 6 0 0 1 6-6h3a6 6 0 0 1 6 6v2" />
      <circle cx="9" cy="7" r="4" />
                  </svg>,
    merchants: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>,
    offers: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M6 9h12M6 9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9z" /></svg>,
    cards: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
           </svg>,
    analytics: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
               </svg>,
    brain: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 4.5a2.5 2.5 0 0 0-4.96-.46 2.5 2.5 0 0 0-1.98 3 2.5 2.5 0 0 0-1.32 4.24 3 3 0 0 0 .34 5.58 2.5 2.5 0 0 0 2.96 3.08A2.5 2.5 0 0 0 12 19.5a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 12 4.5" /></svg>,
    creditCard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
                </svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m3.08 3.08l4.24 4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m3.08-3.08l4.24-4.24M19.78 19.78l-4.24-4.24m-3.08-3.08l-4.24-4.24" />
              </svg>,
    notifications: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                   </svg>,
    health: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
      <path d="M16.5 9l-5.5 5.5L7.5 12" />
            </svg>,
    config: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="3" /></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>,
  };
  return <span>{icons[name] || null}</span>;
}

const navItems = [
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
];

const bottomNavItems = [
  { name: 'notifications', label: 'Notifications', href: '/notifications' },
  { name: 'health', label: 'Health', href: '/health' },
  { name: 'config', label: 'Config', href: '/config' },
];

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  currentPath: string;
}

export default function PageLayout({ children, title, currentPath }: PageLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Collapse sidebar on mobile
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
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
          {navItems.map((item) => {
            const isActive = item.href === currentPath;
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  padding: themeSpace.md,
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
          {bottomNavItems.map((item) => {
            const isActive = item.href === currentPath;
            return (
              <div
                key={item.href}
                onClick={() => router.push(item.href)}
                style={{
                  padding: themeSpace.md,
                  display: 'flex',
                  alignItems: 'center',
                  gap: themeSpace.md,
                  cursor: 'pointer',
                  color: isActive ? themeColors.white : themeColors.primary100,
                  fontSize: '13px',
                  marginBottom: themeSpace.xs,
                  borderRadius: '4px',
                  transition: 'all 200ms',
                  backgroundColor: isActive ? themeColors.primary800 : 'transparent',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = themeColors.primary800; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
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
          <div
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
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
        {/* Header */}
        <div style={{
          padding: `${themeSpace.md} ${themeSpace.xl}`, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, display: 'flex', alignItems: 'center', gap: themeSpace.md,
        }}
        >
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
          <h1 style={{
            margin: 0, fontSize: '20px', fontWeight: '600', color: themeColors.text,
          }}
          >
            {title}
          </h1>
        </div>

        {/* Page Content */}
        <div style={{ flex: 1, padding: themeSpace.xl, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
