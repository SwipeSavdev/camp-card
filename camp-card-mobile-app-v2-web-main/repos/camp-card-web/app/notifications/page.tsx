'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

const themeSpace = { xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px' };
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' };

const Icon = ({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
 const icons: Record<string, JSX.Element> = {
 back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
 bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
 checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
 info: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>,
 alertCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
 check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
 };
 return icons[name] || null;
};

interface Notification {
 id: string;
 type: 'success' | 'info' | 'warning' | 'alert';
 title: string;
 message: string;
 timestamp: string;
 read: boolean;
}

const mockNotifications: Notification[] = [
 {
 id: '1',
 type: 'success',
 title: 'User Import Complete',
 message: '1,250 users have been successfully imported to the system',
 timestamp: '2 hours ago',
 read: true,
 },
 {
 id: '2',
 type: 'info',
 title: 'New Offer Published',
 message: 'The Holiday Promotion offer has been published to all merchants',
 timestamp: '4 hours ago',
 read: true,
 },
 {
 id: '3',
 type: 'warning',
 title: 'High API Usage',
 message: 'API usage is 85% of monthly quota. Consider optimizing requests.',
 timestamp: '6 hours ago',
 read: false,
 },
 {
 id: '4',
 type: 'alert',
 title: 'Failed Payment Processing',
 message: '3 payment transactions failed. Please review and retry.',
 timestamp: '1 day ago',
 read: false,
 },
 {
 id: '5',
 type: 'success',
 title: 'Scout Verification',
 message: 'All pending scout applications have been verified',
 timestamp: '2 days ago',
 read: true,
 },
];

export default function NotificationsPage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [notifications, setNotifications] = useState(mockNotifications);
 const [filter, setFilter] = useState<'all' | 'unread'>('all');

 useEffect(() => {
 if (status === 'unauthenticated') router.push('/login');
 }, [status, router]);

 if (status === 'loading') return null;
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

 const markAsRead = (id: string) => {
 setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
 };

 const markAllAsRead = () => {
 setNotifications(notifications.map(n => ({ ...n, read: true })));
 };

 const filteredNotifications = filter === 'unread' ? notifications.filter(n => !n.read) : notifications;
 const unreadCount = notifications.filter(n => !n.read).length;

 return (
 <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
 {/* Header */}
 <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs }}>
 <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.primary600, marginBottom: themeSpace.md }}>
 <Icon name="back" size={20} />
 </button>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: themeSpace.lg }}>
 <div>
 <h1 style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text, margin: 0, marginBottom: themeSpace.sm }}>Notifications</h1>
 <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>Stay updated with system and platform events</p>
 </div>
 {unreadCount > 0 && (
 <div style={{
 display: 'flex',
 alignItems: 'center',
 gap: themeSpace.md,
 }}>
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
 }}>
 {unreadCount}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Content */}
 <div style={{ padding: themeSpace.xl, maxWidth: '900px', margin: '0 auto', width: '100%' }}>
 {/* Filter Buttons */}
 <div style={{ display: 'flex', gap: themeSpace.md, marginBottom: themeSpace.xl }}>
 <button
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
 All ({notifications.length})
 </button>
 <button
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
 Unread ({unreadCount})
 </button>
 {unreadCount > 0 && (
 <button
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
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.xl, textAlign: 'center', boxShadow: themeShadow.sm }}>
 <Icon name="bell" size={48} color={themeColors.gray200} />
 <p style={{ fontSize: '16px', fontWeight: '600', color: themeColors.text, marginTop: themeSpace.lg, marginBottom: themeSpace.sm }}>No notifications</p>
 <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>You're all caught up!</p>
 </div>
 ) : (
 <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
 {filteredNotifications.map((notification) => (
 <div
 key={notification.id}
 onClick={() => markAsRead(notification.id)}
 style={{
 backgroundColor: notification.read ? themeColors.white : '#f0f9ff',
 borderRadius: themeRadius.card,
 border: `1px solid ${notification.read ? themeColors.gray200 : themeColors.gray200}`,
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
 }}>
 <Icon name={getNotificationIcon(notification.type)} size={24} color={getNotificationColor(notification.type)} />
 </div>

 <div style={{ flex: 1 }}>
 <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: themeSpace.md }}>
 <div>
 <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: themeColors.text }}>{notification.title}</h3>
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
 }} />
 )}
 </div>
 <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: themeColors.gray600 }}>{notification.timestamp}</p>
 </div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
