'use client';

import { ReactNode, useState } from 'react';
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

const menuItems = [
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
  { name: 'Notifications', href: '/notifications', Icon: Bell },
  { name: 'Health', href: '/health', Icon: Activity },
  { name: 'Feature Config', href: '/config', Icon: Settings },
  { name: 'Settings', href: '/settings', Icon: Settings },
];

function MenuItem({ item, isActive, sidebarExpanded }: any) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      href={item.href}
      style={{
        textDecoration: 'none',
        display: 'flex',
        marginBottom: space.xs,
        alignItems: 'center',
        gap: space.md,
        padding: `${space.sm} ${space.md}`,
        borderRadius: radius.md,
        backgroundColor: isActive
          ? 'rgba(59, 130, 246, 0.15)'
          : isHovered
            ? 'rgba(255, 255, 255, 0.08)'
            : 'transparent',
        color: colors.white,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '14px',
        fontWeight: isActive ? '600' : '500',
        borderLeft: isActive ? `3px solid ${colors.accent}` : '3px solid transparent',
        paddingLeft: `calc(${space.md} - 3px)`,
        justifyContent: sidebarExpanded ? 'flex-start' : 'center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <item.Icon
        size={20}
        color={isActive ? colors.accent : 'rgba(255, 255, 255, 0.8)'}
      />
      {sidebarExpanded && <span>{item.name}</span>}
    </Link>
  );
}

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const sidebarWidth = sidebarExpanded ? '260px' : '80px';

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: colors.gray50,
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarWidth,
          backgroundColor: colors.primary900,
          color: colors.white,
          padding: `${space.lg} ${space.md}`,
          position: 'fixed',
          height: '100vh',
          overflowY: 'auto',
          zIndex: 40,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid rgba(255, 255, 255, 0.05)',
          transition: 'width 0.3s ease',
        }}
      >
        {/* Logo & Branding */}
        <div style={{ marginBottom: space.xl }}>
          <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: space.sm,
                marginBottom: space.md,
                cursor: 'pointer',
                justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              }}
            >
              <img
                src="/assets/images/appicon_1024.png"
                alt="Camp Card Logo"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: radius.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  objectFit: 'contain',
                }}
              />
              {sidebarExpanded && (
              <div>
                <h2
                  style={{
                   fontSize: '16px',
                   fontWeight: '700',
                   margin: 0,
                   color: colors.white,
                 }}
                >
     Camp Card
                </h2>
                <p style={{ fontSize: '11px', opacity: 0.6, margin: 0 }}>Admin</p>
              </div>
              )}
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{
          flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column',
        }}
        >
          <div style={{
            flex: 1, overflowY: 'auto', marginRight: '-6px', paddingRight: '6px',
          }}
          >
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <MenuItem
                  key={item.href}
                  item={item}
                  isActive={isActive}
                  sidebarExpanded={sidebarExpanded}
                />
              );
            })}
          </div>
        </nav>

        {/* User Profile & Logout */}
        <div
          style={{
            paddingTop: space.md,
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            marginTop: 'auto',
          }}
        >
          <div
            style={{
              padding: space.md,
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: radius.md,
              marginBottom: space.md,
            }}
          >
            <p
              style={{
                fontSize: '12px',
                opacity: 0.7,
                margin: '0 0 4px 0',
              }}
            >
              Signed in as
            </p>
            <p
              style={{
                fontSize: '13px',
                fontWeight: '600',
                margin: 0,
                color: colors.white,
              }}
            >
              {session?.user?.name || session?.user?.email || 'User'}
            </p>
          </div>
          <button
            onClick={() => signOut({ redirect: true, callbackUrl: '/login' })}
            style={{
              width: '100%',
              padding: `${space.sm} ${space.md}`,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#FECACA',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: radius.md,
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: space.sm,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            }}
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarExpanded ? 'calc(260px + 24px)' : 'calc(80px + 24px)',
          flex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          transition: 'margin-left 0.3s ease',
        }}
      >
        {/* Header */}
        <header
          style={{
            backgroundColor: colors.white,
            borderBottom: `1px solid ${colors.border}`,
            padding: `${space.lg} ${space.xl}`,
            zIndex: 30,
            boxShadow: shadow.xs,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: space.lg }}>
            <button
              onClick={() => setSidebarExpanded(!sidebarExpanded)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: space.sm,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: radius.md,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.gray100;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {sidebarExpanded ? (
                <X size={24} color={colors.text} />
              ) : (
                <Menu size={24} color={colors.text} />
              )}
            </button>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: colors.text,
                margin: 0,
              }}
            >
              Camp Card Admin Portal
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            width: '100%',
            overflowX: 'hidden',
            paddingRight: '48px',
          }}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
