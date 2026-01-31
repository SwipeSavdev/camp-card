'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import PageLayout from '../components/PageLayout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7010/api/v1';
/** Derive the backend root (without /api/v1) for actuator endpoints */
const BACKEND_ROOT = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray600: '#4b5563',
  text: '#1f2937',
  primary50: '#eff6ff',
  primary600: '#2563eb',
  success50: '#f0fdf4',
  success600: '#16a34a',
  warning50: '#fef3c7',
  warning600: '#f59e0b',
  error50: '#fef2f2',
  error600: '#dc2626',
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px',
};
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' };

function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: Record<string, JSX.Element> = {
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    checkCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
                 </svg>,
    alertCircle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>,
    database: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <ellipse cx="12" cy="19" rx="9" ry="3" />
    </svg>,
    server: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="2" y="2" width="20" height="8" rx="1" />
      <rect x="2" y="14" width="20" height="8" rx="1" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>,
    activity: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
             </svg>,
  };
  return icons[name] || null;
}

interface HealthService {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  message: string;
  lastChecked: string;
}

interface PerformanceMetrics {
  apiResponseTime: string;
  memoryUsed: string;
  uptime: string;
  diskFree: string;
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h`;
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m`;
}

function formatBytes(bytes: number): string {
  if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function getDiskStatus(usedPct: number): 'healthy' | 'warning' | 'error' {
  if (usedPct > 90) return 'error';
  if (usedPct > 75) return 'warning';
  return 'healthy';
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function parseApiHealth(res: Response, results: HealthService[], apiTime: string): string {
  if (res.ok) {
    results.push({ id: 'api', name: 'API Server', status: 'healthy', message: 'All systems operational', lastChecked: 'Just now' });
  } else {
    results.push({ id: 'api', name: 'API Server', status: 'error', message: `HTTP ${res.status}`, lastChecked: 'Just now' });
  }
  return apiTime;
}

function parseDbComponent(db: any, results: HealthService[]) {
  const dbDetails = db.details || {};
  const dbMsg = db.status === 'UP'
    ? `${dbDetails.database || 'PostgreSQL'} — connected`
    : (dbDetails.error || 'Connection failed');
  results.push({ id: 'db', name: 'Database', status: db.status === 'UP' ? 'healthy' : 'error', message: dbMsg, lastChecked: 'Just now' });
}

function parseRedisComponent(redis: any, results: HealthService[]) {
  const redisDetails = redis.details || {};
  const redisMsg = redis.status === 'UP'
    ? `Redis ${redisDetails.version || ''} — connected`.trim()
    : (redisDetails.error || 'Connection failed');
  results.push({ id: 'redis', name: 'Cache (Redis)', status: redis.status === 'UP' ? 'healthy' : 'error', message: redisMsg, lastChecked: 'Just now' });
}

function parseDiskComponent(disk: any, results: HealthService[]): string {
  const diskDetails = disk.details || {};
  const total = diskDetails.total || 0;
  const free = diskDetails.free || 0;
  const usedPct = total > 0 ? Math.round(((total - free) / total) * 100) : 0;
  const diskStatus = disk.status === 'UP' ? getDiskStatus(usedPct) : 'error';
  results.push({ id: 'disk', name: 'Disk Space', status: diskStatus, message: `${formatBytes(free)} free (${usedPct}% used)`, lastChecked: 'Just now' });
  return formatBytes(free);
}

function parseMailComponent(mail: any, results: HealthService[]) {
  const mailMsg = mail.status === 'UP' ? 'SMTP service operational' : (mail.details?.error || 'Service unavailable');
  results.push({ id: 'mail', name: 'Email Service', status: mail.status === 'UP' ? 'healthy' : 'error', message: mailMsg, lastChecked: 'Just now' });
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export default function HealthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [services, setServices] = useState<HealthService[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    apiResponseTime: '-', memoryUsed: '-', uptime: '-', diskFree: '-',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    const results: HealthService[] = [];
    let apiTime = '-';

    // 1. Check basic API health and measure response time
    try {
      const start = performance.now();
      const res = await fetch(`${API_BASE_URL}/public/health?_t=${Date.now()}`);
      const elapsed = Math.round(performance.now() - start);
      apiTime = parseApiHealth(res, results, `${elapsed}ms`);
    } catch {
      results.push({ id: 'api', name: 'API Server', status: 'error', message: 'Unreachable', lastChecked: 'Just now' });
    }

    // 2. Fetch actuator health for detailed component statuses
    try {
      const res = await fetch(`${BACKEND_ROOT}/actuator/health?_t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const components = data.components || {};

        if (components.db) parseDbComponent(components.db, results);
        if (components.redis) parseRedisComponent(components.redis, results);
        if (components.diskSpace) {
          const diskFree = parseDiskComponent(components.diskSpace, results);
          setMetrics((prev) => ({ ...prev, diskFree }));
        }
        if (components.mail) parseMailComponent(components.mail, results);
      }
    } catch {
      ['Database', 'Cache (Redis)', 'Disk Space', 'Email Service'].forEach((name, i) => {
        results.push({ id: `fallback-${i}`, name, status: 'unknown', message: 'Unable to reach actuator', lastChecked: 'Just now' });
      });
    }

    // 3. Fetch JVM memory and uptime from actuator metrics
    try {
      const [memRes, uptimeRes] = await Promise.all([
        fetch(`${BACKEND_ROOT}/actuator/metrics/jvm.memory.used?_t=${Date.now()}`),
        fetch(`${BACKEND_ROOT}/actuator/metrics/process.uptime?_t=${Date.now()}`),
      ]);
      if (memRes.ok) {
        const memData = await memRes.json();
        const memBytes = (memData.measurements?.[0]?.value || 0) * 1; // value is in bytes
        setMetrics((prev) => ({ ...prev, memoryUsed: formatBytes(memBytes) }));
      }
      if (uptimeRes.ok) {
        const uptimeData = await uptimeRes.json();
        const uptimeSec = uptimeData.measurements?.[0]?.value || 0;
        setMetrics((prev) => ({ ...prev, uptime: formatUptime(uptimeSec) }));
      }
    } catch {
      // Metrics unavailable
    }

    setMetrics((prev) => ({ ...prev, apiResponseTime: apiTime }));
    setServices(results);
    setLastRefresh(new Date());
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated' || status === 'loading') fetchHealth();
  }, [status, router, fetchHealth]);

  if (status === 'loading') return null;
  if (!session) return null;

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'healthy': return themeColors.success600;
      case 'warning': return themeColors.warning600;
      case 'error': return themeColors.error600;
      default: return themeColors.gray600;
    }
  };

  const getStatusBgColor = (s: string) => {
    switch (s) {
      case 'healthy': return themeColors.success50;
      case 'warning': return themeColors.warning50;
      case 'error': return themeColors.error50;
      default: return themeColors.gray100;
    }
  };

  const getStatusIcon = (s: string) => {
    switch (s) {
      case 'healthy': return 'checkCircle';
      case 'warning':
      case 'error': return 'alertCircle';
      default: return 'activity';
    }
  };

  const healthyCount = services.filter((h) => h.status === 'healthy').length;
  const warningCount = services.filter((h) => h.status === 'warning').length;
  const errorCount = services.filter((h) => h.status === 'error' || h.status === 'unknown').length;

  return (
    <PageLayout title="System Health" currentPath="/health">
      {/* Header */}
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>Monitor platform infrastructure and service status</p>
            {lastRefresh && (
              <p style={{ fontSize: '12px', color: themeColors.gray600, margin: '4px 0 0 0' }}>
                Last checked:
                {' '}
                {lastRefresh.toLocaleTimeString()}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={fetchHealth}
            disabled={isLoading}
            style={{
              display: 'flex', alignItems: 'center', gap: themeSpace.sm, padding: `${themeSpace.sm} ${themeSpace.md}`, backgroundColor: themeColors.primary50, color: themeColors.primary600, border: `1px solid ${themeColors.primary600}`, borderRadius: themeRadius.sm, cursor: isLoading ? 'wait' : 'pointer', fontSize: '13px', fontWeight: '600', opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Icon name="refresh" size={14} color={themeColors.primary600} />
            {isLoading ? 'Checking...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Summary Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl,
        }}
        >
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.lg, boxShadow: themeShadow.sm,
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, marginBottom: themeSpace.md }}>
              <Icon name="checkCircle" size={24} color={themeColors.success600} />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: themeColors.gray600, fontWeight: '500' }}>Healthy Services</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.success600 }}>{healthyCount}</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.lg, boxShadow: themeShadow.sm,
          }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, marginBottom: themeSpace.md }}>
              <Icon name="alertCircle" size={24} color={themeColors.warning600} />
              <div>
                <p style={{ margin: 0, fontSize: '12px', color: themeColors.gray600, fontWeight: '500' }}>Warnings</p>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.warning600 }}>{warningCount}</p>
              </div>
            </div>
          </div>

          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.lg, boxShadow: themeShadow.sm,
          }}
          >
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
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.sm, overflow: 'hidden',
        }}
        >
          <div style={{ padding: themeSpace.lg, borderBottom: `1px solid ${themeColors.gray200}` }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: themeColors.text }}>
              Service Status
            </h2>
          </div>

          {services.length === 0 && !isLoading && (
            <div style={{ padding: themeSpace.xl, textAlign: 'center', color: themeColors.gray600 }}>
              No service data available. Click Refresh to check.
            </div>
          )}

          {services.map((service, idx) => (
            <div
              key={service.id}
              style={{
                padding: themeSpace.lg,
                borderBottom: idx < services.length - 1 ? `1px solid ${themeColors.gray200}` : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: themeSpace.lg,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, flex: 1 }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', backgroundColor: getStatusBgColor(service.status), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}
                >
                  <Icon name={getStatusIcon(service.status)} size={20} color={getStatusColor(service.status)} />
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: themeColors.text }}>{service.name}</h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: themeColors.gray600 }}>{service.message}</p>
                </div>
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <span style={{
                  display: 'inline-block', padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: getStatusBgColor(service.status), color: getStatusColor(service.status), borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '600', marginBottom: themeSpace.sm,
                }}
                >
                  {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                </span>
                <p style={{ margin: 0, fontSize: '12px', color: themeColors.gray600 }}>{service.lastChecked}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Metrics Section */}
        <div style={{
          marginTop: themeSpace.xl, backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.lg, boxShadow: themeShadow.sm,
        }}
        >
          <h2 style={{ margin: `0 0 ${themeSpace.lg} 0`, fontSize: '18px', fontWeight: '700', color: themeColors.text }}>
            Performance Metrics
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: themeSpace.lg }}>
            <div>
              <p style={{ margin: `0 0 ${themeSpace.sm} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>API Response Time</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.text }}>{metrics.apiResponseTime}</p>
            </div>
            <div>
              <p style={{ margin: `0 0 ${themeSpace.sm} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>JVM Memory Used</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.text }}>{metrics.memoryUsed}</p>
            </div>
            <div>
              <p style={{ margin: `0 0 ${themeSpace.sm} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Disk Free</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.text }}>{metrics.diskFree}</p>
            </div>
            <div>
              <p style={{ margin: `0 0 ${themeSpace.sm} 0`, fontSize: '12px', fontWeight: '600', color: themeColors.gray600, textTransform: 'uppercase' }}>Uptime</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: '700', color: themeColors.text }}>{metrics.uptime}</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
