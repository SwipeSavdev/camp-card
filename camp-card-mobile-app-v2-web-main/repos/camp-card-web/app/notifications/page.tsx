'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  useEffect, useState, useCallback,
} from 'react';
import { api } from '@/lib/api';
import PageLayout from '../components/PageLayout';

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray600: '#4b5563',
  text: '#1f2937',
  primary600: '#2563eb',
  primary900: '#1e3a8a',
  success50: '#f0fdf4',
  success600: '#16a34a',
  info50: '#f0f9ff',
  info600: '#0284c7',
  warning50: '#fef3c7',
  warning600: '#f59e0b',
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px',
};
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' };

function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: Record<string, JSX.Element> = {
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>,
    checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
                 </svg>,
    info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>,
    alertCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
  };
  return icons[name] || null;
}

type UiType = 'success' | 'info' | 'warning' | 'alert';

interface Notification {
  id: number;
  type: UiType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

/** Map backend NotificationType enum to a UI display category */
function mapNotificationType(backendType: string): UiType {
  switch (backendType) {
    case 'PAYMENT_SUCCESS':
    case 'SUBSCRIPTION_RENEWED':
    case 'REFERRAL_REWARD':
      return 'success';
    case 'PAYMENT_FAILED':
    case 'SYSTEM_ALERT':
      return 'alert';
    case 'SUBSCRIPTION_EXPIRING':
    case 'OFFER_EXPIRING':
      return 'warning';
    case 'NEW_OFFER':
    case 'TROOP_ANNOUNCEMENT':
    case 'MARKETING':
    default:
      return 'info';
  }
}

/** Format an ISO timestamp into a human-readable relative string */
function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString();
}

export default function NotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await api.getNotifications(0, 50, session);
      if (result?.content && Array.isArray(result.content)) {
        setNotifications(result.content.map((n) => ({
          id: n.id,
          type: mapNotificationType(n.type),
          title: n.title || 'Notification',
          message: n.body || '',
          timestamp: n.createdAt ? formatRelativeTime(n.createdAt) : '',
          read: n.read ?? false,
        })));
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchNotifications();
  }, [status, router, fetchNotifications]);

  if (status === 'loading' || isLoading) return null;
  if (!session) return null;

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return themeColors.success600;
      case 'info':
        return themeColors.info600;
      case 'warning':
        return themeColors.warning600;
      case 'alert':
        return '#dc2626';
      default:
        return themeColors.primary600;
    }
  };

  const getNotificationBgColor = (type: string) => {
    switch (type) {
      case 'success':
        return themeColors.success50;
      case 'info':
        return themeColors.info50;
      case 'warning':
        return themeColors.warning50;
      case 'alert':
        return '#fef2f2';
      default:
        return themeColors.gray100;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return 'checkCircle';
      case 'info':
        return 'info';
      case 'warning':
      case 'alert':
        return 'alertCircle';
      default:
        return 'bell';
    }
  };

  const markAsRead = async (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await api.markNotificationAsRead(id, session);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await api.markAllNotificationsAsRead(session);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const filteredNotifications = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PageLayout title="Notifications" currentPath="/notifications">
      {/* Header */}
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: themeSpace.lg,
        }}
        >
          <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>Stay updated with system and platform events</p>
          {unreadCount > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: themeSpace.md,
          }}
          >
            <div style={{
              backgroundColor: '#dc2626',
              color: themeColors.white,
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '700',
            }}
            >
              {unreadCount}
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        padding: themeSpace.xl, maxWidth: '900px', margin: '0 auto', width: '100%',
      }}
      >
        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: themeSpace.md, marginBottom: themeSpace.xl }}>
          <button
            type="button"
            onClick={() => setFilter('all')}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`,
              border: `2px solid ${filter === 'all' ? themeColors.primary600 : themeColors.gray200}`,
              backgroundColor: filter === 'all' ? themeColors.primary600 : themeColors.white,
              color: filter === 'all' ? themeColors.white : themeColors.text,
              borderRadius: themeRadius.sm,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            All (
            {notifications.length}
            )
          </button>
          <button
            type="button"
            onClick={() => setFilter('unread')}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`,
              border: `2px solid ${filter === 'unread' ? themeColors.primary600 : themeColors.gray200}`,
              backgroundColor: filter === 'unread' ? themeColors.primary600 : themeColors.white,
              color: filter === 'unread' ? themeColors.white : themeColors.text,
              borderRadius: themeRadius.sm,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            Unread (
            {unreadCount}
            )
          </button>
          {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`,
              border: `1px solid ${themeColors.gray200}`,
              backgroundColor: 'transparent',
              color: themeColors.primary600,
              borderRadius: themeRadius.sm,
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              marginLeft: 'auto',
            }}
          >
            Mark all as read
          </button>
          )}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.xl, textAlign: 'center', boxShadow: themeShadow.sm,
          }}
          >
            <Icon name="bell" size={48} color={themeColors.gray200} />
            <p style={{
              fontSize: '16px', fontWeight: '600', color: themeColors.text, marginTop: themeSpace.lg, marginBottom: themeSpace.sm,
            }}
            >
              No notifications
            </p>
            <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>You&apos;re all caught up!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.currentTarget.click(); } }}
                style={{
                  backgroundColor: notification.read ? themeColors.white : '#f0f9ff',
                  borderRadius: themeRadius.card,
                  border: `1px solid ${themeColors.gray200}`,
                  padding: themeSpace.lg,
                  boxShadow: themeShadow.sm,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  gap: themeSpace.lg,
                  alignItems: 'flex-start',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = themeColors.primary600;
                  e.currentTarget.style.boxShadow = themeShadow.sm;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = themeColors.gray200;
                  e.currentTarget.style.boxShadow = themeShadow.xs;
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: getNotificationBgColor(notification.type),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                >
                  <Icon name={getNotificationIcon(notification.type)} size={24} color={getNotificationColor(notification.type)} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                   display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: themeSpace.md,
                 }}
                 >
                   <div>
                   <h3 style={{
                   margin: 0, fontSize: '16px', fontWeight: '700', color: themeColors.text,
                 }}
                 >
                   {notification.title}
                 </h3>
                   <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: themeColors.gray600 }}>{notification.message}</p>
                 </div>
                   {!notification.read && (
                 <div style={{
                 width: '8px',
                 height: '8px',
                 borderRadius: '50%',
                 backgroundColor: themeColors.primary600,
                 flexShrink: 0,
                 marginTop: '6px',
               }}
               />
                 )}
                 </div>
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: themeColors.gray600 }}>{notification.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
