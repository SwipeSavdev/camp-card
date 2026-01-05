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
 success50: '#f0fdf4',
 success600: '#16a34a',
 warning50: '#fef3c7',
 warning600: '#f59e0b',
 error50: '#fef2f2',
 error600: '#dc2626',
};

const themeSpace = { xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px' };
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' };

const Icon = ({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) => {
 const icons: Record<string, JSX.Element> = {
 back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
 checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
 alertCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
 database: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><ellipse cx="12" cy="19" rx="9" ry="3" /></svg>,
 server: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="1" /><rect x="2" y="14" width="20" height="8" rx="1" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>,
 activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
 };
 return icons[name] || null;
};

interface HealthStatus {
 id: string;
 name: string;
 status: 'healthy' | 'warning' | 'error';
 message: string;
 lastChecked: string;
}

const healthStatus: HealthStatus[] = [
 {
 id: '1',
 name: 'API Server',
 status: 'healthy',
 message: 'All systems operational',
 lastChecked: '2 minutes ago',
 },
 {
 id: '2',
 name: 'Database',
 status: 'healthy',
 message: 'Connection stable, 2.3GB used',
 lastChecked: '1 minute ago',
 },
 {
 id: '3',
 name: 'Cache Service',
 status: 'healthy',
 message: 'Redis running smoothly',
 lastChecked: '3 minutes ago',
 },
 {
 id: '4',
 name: 'Message Queue',
 status: 'healthy',
 message: '12 jobs processed',
 lastChecked: 'just now',
 },
 {
 id: '5',
 name: 'Email Service',
 status: 'warning',
 message: 'High latency detected',
 lastChecked: '1 minute ago',
 },
];

export default function HealthPage() {
 const { data: session, status } = useSession();
 const router = useRouter();
 const [health, setHealth] = useState(healthStatus);

 useEffect(() => {
 if (status === 'unauthenticated') router.push('/login');
 }, [status, router]);

 if (status === 'loading') return null;
 if (!session) return null;

 const getStatusColor = (status: string) => {
 switch (status) {
 case 'healthy':
 return themeColors.success600;
 case 'warning':
 return themeColors.warning600;
 case 'error':
 return themeColors.error600;
 default:
 return themeColors.gray600;
 }
 };

 const getStatusBgColor = (status: string) => {
 switch (status) {
 case 'healthy':
 return themeColors.success50;
 case 'warning':
 return themeColors.warning50;
 case 'error':
 return themeColors.error50;
 default:
 return themeColors.gray100;
 }
 };

 const getStatusIcon = (status: string) => {
 switch (status) {
 case 'healthy':
 return 'checkCircle';
 case 'warning':
 case 'error':
 return 'alertCircle';
 default:
 return 'activity';
 }
 };

 const healthyCount = health.filter(h => h.status === 'healthy').length;
 const warningCount = health.filter(h => h.status === 'warning').length;
 const errorCount = health.filter(h => h.status === 'error').length;

 return (
 <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: themeColors.gray50 }}>
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
 {/* Header */}
 <div style={{ padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs }}>
 <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: themeColors.primary600, marginBottom: themeSpace.md }}>
 <Icon name="back" size={20} />
 </button>
 <h1 style={{ fontSize: '28px', fontWeight: '700', color: themeColors.text, margin: 0, marginBottom: themeSpace.sm }}>System Health</h1>
 <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>Monitor platform infrastructure and service status</p>
 </div>

 {/* Content */}
 <div style={{ padding: themeSpace.xl, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
 {/* Summary Cards */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl }}>
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.lg, boxShadow: themeShadow.sm }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, marginBottom: themeSpace.md }}>
 <Icon name="checkCircle" size={24} color={themeColors.success600} />
 <div>
 <p style={{ margin: 0, fontSize: '12px', color: themeColors.gray600, fontWeight: '500' }}>Healthy Services</p>
 <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.success600 }}>{healthyCount}</p>
 </div>
 </div>
 </div>

 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.lg, boxShadow: themeShadow.sm }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, marginBottom: themeSpace.md }}>
 <Icon name="alertCircle" size={24} color={themeColors.warning600} />
 <div>
 <p style={{ margin: 0, fontSize: '12px', color: themeColors.gray600, fontWeight: '500' }}>Warnings</p>
 <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.warning600 }}>{warningCount}</p>
 </div>
 </div>
 </div>

 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.lg, boxShadow: themeShadow.sm }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, marginBottom: themeSpace.md }}>
 <Icon name="alertCircle" size={24} color={themeColors.error600} />
 <div>
 <p style={{ margin: 0, fontSize: '12px', color: themeColors.gray600, fontWeight: '500' }}>Errors</p>
 <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.error600 }}>{errorCount}</p>
 </div>
 </div>
 </div>
 </div>

 {/* Service Status List */}
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.sm, overflow: 'hidden' }}>
 <div style={{ padding: themeSpace.lg, borderBottom: `1px solid ${themeColors.gray200}` }}>
 <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: themeColors.text }}>Service Status</h2>
 </div>

 {health.map((service, idx) => (
 <div
 key={service.id}
 style={{
 padding: themeSpace.lg,
 borderBottom: idx < health.length - 1 ? `1px solid ${themeColors.gray200}` : 'none',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 gap: themeSpace.lg,
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, flex: 1 }}>
 <div style={{
 width: '40px',
 height: '40px',
 borderRadius: '50%',
 backgroundColor: getStatusBgColor(service.status),
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 flexShrink: 0,
 }}>
 <Icon name={getStatusIcon(service.status)} size={20} color={getStatusColor(service.status)} />
 </div>
 <div style={{ flex: 1 }}>
 <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: themeColors.text }}>{service.name}</h3>
 <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: themeColors.gray600 }}>{service.message}</p>
 </div>
 </div>

 <div style={{ textAlign: 'right', flexShrink: 0 }}>
 <span style={{
 display: 'inline-block',
 padding: `${themeSpace.xs} ${themeSpace.sm}`,
 backgroundColor: getStatusBgColor(service.status),
 color: getStatusColor(service.status),
 borderRadius: themeRadius.sm,
 fontSize: '12px',
 fontWeight: '600',
 marginBottom: themeSpace.sm,
 }}>
 {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
 </span>
 <p style={{ margin: 0, fontSize: '12px', color: themeColors.gray600 }}>{service.lastChecked}</p>
 </div>
 </div>
 ))}
 </div>

 {/* Metrics Section */}
 <div style={{ marginTop: themeSpace.xl, backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.lg, boxShadow: themeShadow.sm }}>
 <h2 style={{ margin: '0 0 ' + themeSpace.lg + ' 0', fontSize: '18px', fontWeight: '700', color: themeColors.text }}>Performance Metrics</h2>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: themeSpace.lg }}>
 <div>
 <p style={{ margin: '0 0 ' + themeSpace.sm + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>API Response Time</p>
 <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.text }}>45ms</p>
 </div>
 <div>
 <p style={{ margin: '0 0 ' + themeSpace.sm + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Database Queries/sec</p>
 <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.text }}>1,234</p>
 </div>
 <div>
 <p style={{ margin: '0 0 ' + themeSpace.sm + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Memory Usage</p>
 <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.text }}>4.2GB</p>
 </div>
 <div>
 <p style={{ margin: '0 0 ' + themeSpace.sm + ' 0', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Uptime</p>
 <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.text }}>99.98%</p>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
