'use client';

import React, { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  colors, space, shadow, radius,
} from '@/lib/theme';
import {
  Dashboard,
  Users,
  Building,
  Award,
  Share2,
  ShoppingBag,
  Tag,
  Ticket,
  CheckCircle,
  CreditCard,
  MapPin,
  Bell,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
} from '@/components/Icons';

interface NavItem {
  name: string;
  href: string;
  Icon: React.ComponentType<Record<string, unknown>>;
  badge?: number;
}

const mainNavItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', Icon: Dashboard },
  { name: 'Users', href: '/users', Icon: Users },
  { name: 'Bulk Create Users', href: '/bulk-users', Icon: Users },
  { name: 'Organizations', href: '/organizations', Icon: Building },
  { name: 'Scouts', href: '/scouts', Icon: Award },
  { name: 'Referrals', href: '/referrals', Icon: Share2 },
  { name: 'Merchants', href: '/merchants', Icon: ShoppingBag },
  { name: 'Offers', href: '/offers', Icon: Tag },
  { name: 'Camp Cards', href: '/camp-cards', Icon: Ticket },
  { name: 'Redemptions', href: '/redemptions', Icon: CheckCircle },
  { name: 'Subscriptions', href: '/subscriptions', Icon: CreditCard },
  { name: 'Geofences', href: '/geofences', Icon: MapPin },
];

const bottomNavItems: NavItem[] = [
  {
    name: 'Notifications', href: '/notifications', Icon: Bell, badge: 3,
  },
  { name: 'Health', href: '/health', Icon: Activity },
  { name: 'Settings', href: '/settings', Icon: Settings },
];

export function ModernLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? '80px' : '260px';
  const isNavItemActive = (href: string) => pathname === href;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.gray50,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarWidth,
          backgroundColor: colors.primary900,
          color: colors.white,
          transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: shadow.lg,
          WebkitBackfaceVisibility: 'hidden',
        }}
      >
        {/* Sidebar Header */}
        <div
          style={{
            padding: `${space.xl} ${space.lg}`,
            borderBottom: `1px solid ${colors.primary800}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            minHeight: '70px',
          }}
        >
          <Link
            href="/dashboard"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: space.md,
              textDecoration: 'none',
              color: 'inherit',
              flex: sidebarCollapsed ? 0 : 1,
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: radius.lg,
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accentDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '20px', fontWeight: '700' }}>CC</span>
            </div>
            {!sidebarCollapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '16px', fontWeight: '700', letterSpacing: '-0.5px' }}>CampCard</div>
              <div style={{ fontSize: '11px', color: colors.primary400, marginTop: '2px' }}>Admin</div>
            </div>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary400,
              cursor: 'pointer',
              padding: space.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.2s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = colors.white; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = colors.primary400; }}
          >
            {sidebarCollapsed ? <Menu size={20} /> : <X size={20} />}
          </button>
        </div>

        {/* Sidebar Navigation - Main */}
        <nav style={{ flex: 1, paddingTop: space.lg, overflowY: 'auto' }}>
          {mainNavItems.map((item) => {
            const isActive = isNavItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: space.lg,
                  padding: `${space.lg} ${space.lg}`,
                  color: isActive ? colors.white : colors.primary400,
                  backgroundColor: isActive ? colors.primary800 : 'transparent',
                  borderLeft: isActive ? `3px solid ${colors.accent}` : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = colors.primary800;
                    (e.currentTarget as HTMLElement).style.color = colors.white;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = colors.primary400;
                  }
                }}
              >
                <item.Icon size={20} color={isActive ? colors.accent : 'currentColor'} strokeWidth={2} />
                {!sidebarCollapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Navigation - Bottom */}
        <div
          style={{
            borderTop: `1px solid ${colors.primary800}`,
            paddingTop: space.lg,
            paddingBottom: space.lg,
          }}
        >
          {bottomNavItems.map((item) => {
            const isActive = isNavItemActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: space.lg,
                  padding: `${space.lg} ${space.lg}`,
                  color: isActive ? colors.white : colors.primary400,
                  backgroundColor: isActive ? colors.primary800 : 'transparent',
                  borderLeft: isActive ? `3px solid ${colors.accent}` : '3px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer',
                  position: 'relative',
                  fontSize: '14px',
                  fontWeight: isActive ? '600' : '500',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = colors.primary800;
                    (e.currentTarget as HTMLElement).style.color = colors.white;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                    (e.currentTarget as HTMLElement).style.color = colors.primary400;
                  }
                }}
              >
                <div style={{ position: 'relative', display: 'flex' }}>
                  <item.Icon size={20} color={isActive ? colors.accent : 'currentColor'} strokeWidth={2} />
                  {item.badge && !sidebarCollapsed && (
                  <span
                   style={{
                   position: 'absolute',
                   top: '-5px',
                   right: '-5px',
                   backgroundColor: colors.error,
                   color: colors.white,
                   borderRadius: '50%',
                   width: '18px',
                   height: '18px',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '11px',
                   fontWeight: '700',
                 }}
                 >
                   {item.badge}
                 </span>
                  )}
                </div>
                {!sidebarCollapsed && (
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.name}
                </span>
                )}
              </Link>
            );
          })}

          {/* Logout Button */}
          <button
            type="button"
            onClick={() => signOut()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: space.lg,
              padding: `${space.lg} ${space.lg}`,
              color: colors.primary400,
              backgroundColor: 'transparent',
              border: 'none',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              marginTop: space.lg,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = colors.primary800;
              (e.currentTarget as HTMLElement).style.color = colors.error;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
              (e.currentTarget as HTMLElement).style.color = colors.primary400;
            }}
          >
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarWidth,
          flex: 1,
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflowY: 'auto',
        }}
      >
        {/* Top Bar */}
        <header
          style={{
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.gray200}`,
            padding: `${space.xl} ${space['2xl']}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: shadow.xs,
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: space.lg }}>
            <h2 style={{
              fontSize: '20px', fontWeight: '600', color: colors.text, margin: 0,
            }}
            >
              {(() => {
                const pathName = pathname.split('/')[1];
                const item = [...mainNavItems, ...bottomNavItems].find(
                  (i) => i.href === `/${pathName}`,
                );
                return item?.name || 'Dashboard';
              })()}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: space['2xl'] }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: space.md }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: radius.lg,
                  backgroundColor: colors.primary200,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: colors.primary800,
                }}
              >
                {session?.user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div style={{ fontSize: '14px', color: colors.gray600 }}>{session?.user?.email || 'User'}</div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ padding: space['2xl'] }}>
          {children}
        </div>
      </main>
    </div>
  );
}
