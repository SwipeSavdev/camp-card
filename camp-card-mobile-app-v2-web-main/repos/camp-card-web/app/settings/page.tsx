'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PageLayout from '../components/PageLayout';

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
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px', '2xl': '40px', '3xl': '48px',
};
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

function Icon({
  name, size = 18, color = 'currentColor', ...props
}: { name: string; size?: number; color?: string; [key: string]: unknown }) {
  const icons: { [key: string]: JSX.Element } = {
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>,
    lock: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>,
    mail: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>,
    toggle: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="1" y="5" width="22" height="14" rx="7" ry="7" />
      <circle cx="16" cy="12" r="5" />
            </svg>,
  };
  return <span {...props}>{icons[name] || null}</span>;
}

interface ApiKey {
  key: string;
  name: string;
  createdAt: string;
}

interface SettingsState {
  appName: string;
  apiUrl: string;
  timeout: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyReport: boolean;
  twoFactorAuth: boolean;
  ipWhitelist: boolean;
  sessionTimeout: string;
  apiKeys: ApiKey[];
  [key: string]: string | boolean | ApiKey[];
}

const STORAGE_KEY = 'campcard_settings';

const defaultSettings: SettingsState = {
  appName: 'Camp Card Platform',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: '30000',
  emailNotifications: true,
  pushNotifications: true,
  weeklyReport: true,
  twoFactorAuth: false,
  ipWhitelist: false,
  sessionTimeout: '3600',
  apiKeys: [],
};

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('general');
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);

  // Load persisted settings on mount
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      // localStorage unavailable or corrupt — use defaults
    }
  }, [status, router]);

  const handleSave = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // localStorage full or unavailable
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleSwitch = (key: string) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const generateApiKey = () => {
    const key = `cc_${crypto.randomUUID().replaceAll('-', '')}`;
    const newKey: ApiKey = {
      key,
      name: `Key ${settings.apiKeys.length + 1}`,
      createdAt: new Date().toLocaleDateString(),
    };
    const updated = { ...settings, apiKeys: [...settings.apiKeys, newKey] };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage full or unavailable
    }
  };

  const revokeApiKey = (keyToRevoke: string) => {
    const updated = { ...settings, apiKeys: settings.apiKeys.filter((k) => k.key !== keyToRevoke) };
    setSettings(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // localStorage full or unavailable
    }
  };

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <PageLayout title="Settings" currentPath="/settings">
      {/* Header */}
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>Manage your platform configuration and preferences</p>
      </div>
      {saved && (
      <div style={{
        backgroundColor: themeColors.success50, border: `1px solid ${themeColors.success600}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.success600,
      }}
      >
        Settings saved successfully!
      </div>
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '200px 1fr', gap: themeSpace.xl, maxWidth: '1200px',
      }}
      >
        {/* Sidebar */}
        <div>
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden',
          }}
          >
            {[
              { id: 'general', label: 'General', icon: 'toggle' },
              { id: 'notifications', label: 'Notifications', icon: 'bell' },
              { id: 'security', label: 'Security', icon: 'lock' },
              { id: 'api', label: 'API Keys', icon: 'mail' },
            ].map((tab) => (
              <button
                type="button"
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: themeSpace.lg,
                  border: 'none',
                  backgroundColor: activeTab === tab.id ? themeColors.primary50 : 'transparent',
                  color: activeTab === tab.id ? themeColors.primary600 : themeColors.text,
                  borderLeft: activeTab === tab.id ? `4px solid ${themeColors.primary600}` : '4px solid transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === tab.id ? '600' : '500',
                  display: 'flex',
                  gap: themeSpace.md,
                  alignItems: 'center',
                  transition: 'all 200ms',
                }}
              >
                <Icon name={tab.icon} size={18} color={activeTab === tab.id ? themeColors.primary600 : themeColors.gray600} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div>
          {/* General Settings */}
          {activeTab === 'general' && (
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.xl,
          }}
          >
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: themeColors.text, margin: '0 0 24px 0',
            }}
            >
              General Settings
            </h2>

            <div style={{ marginBottom: themeSpace.lg }}>
              <label
htmlFor="field" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: themeSpace.sm,
              }}
              >
                Application Name
              </label>
              <input
id="field"
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                style={{
                  width: '100%',
                  padding: themeSpace.md,
                  border: `1px solid ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: themeSpace.lg }}>
              <label
htmlFor="field-2" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: themeSpace.sm,
              }}
              >
                API Base URL
              </label>
              <input
id="field-2"
                type="text"
                value={settings.apiUrl}
                onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                style={{
                  width: '100%',
                  padding: themeSpace.md,
                  border: `1px solid ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  fontSize: '14px',
                }}
              />
            </div>

            <div style={{ marginBottom: themeSpace.lg }}>
              <label
htmlFor="field-3" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: themeSpace.sm,
              }}
              >
                Request Timeout (ms)
              </label>
              <input
id="field-3"
                type="number"
                value={settings.timeout}
                onChange={(e) => setSettings({ ...settings, timeout: e.target.value })}
                style={{
                  width: '100%',
                  padding: themeSpace.md,
                  border: `1px solid ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                backgroundColor: themeColors.primary600,
                color: themeColors.white,
                border: 'none',
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Save Changes
            </button>
          </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.xl,
          }}
          >
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: themeColors.text, margin: '0 0 24px 0',
            }}
            >
              Notification Preferences
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg }}>
              {[
                { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive important updates via email' },
                { key: 'pushNotifications', label: 'Push Notifications', description: 'Get instant notifications in the app' },
                { key: 'weeklyReport', label: 'Weekly Report', description: 'Receive a weekly summary of platform activity' },
              ].map((item) => (
                <div
                 key={item.key}
                 style={{
                 display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: themeSpace.lg, borderBottom: `1px solid ${themeColors.gray100}`,
               }}
               >
                 <div>
                 <p style={{
                 margin: 0, fontSize: '14px', fontWeight: '600', color: themeColors.text,
               }}
               >
                 {item.label}
               </p>
                 <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: themeColors.gray600 }}>{item.description}</p>
               </div>
                 <button
                 type="button"
                 aria-label={`Toggle ${item.label}`}
                 onClick={() => toggleSwitch(item.key)}
                 style={{
                 width: '50px',
                 height: '28px',
                 borderRadius: '14px',
                 border: 'none',
                 backgroundColor: settings[item.key] ? themeColors.primary600 : themeColors.gray200,
                 cursor: 'pointer',
                 position: 'relative',
                 transition: 'all 200ms',
               }}
               >
                 <div
                 style={{
                 position: 'absolute',
                 width: '24px',
                 height: '24px',
                 backgroundColor: themeColors.white,
                 borderRadius: '50%',
                 top: '2px',
                 left: settings[item.key] ? '24px' : '2px',
                 transition: 'left 200ms',
               }}
               />
               </button>
               </div>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSave}
              style={{
                marginTop: themeSpace.lg,
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                backgroundColor: themeColors.primary600,
                color: themeColors.white,
                border: 'none',
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Save Changes
            </button>
          </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.xl,
          }}
          >
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: themeColors.text, margin: '0 0 24px 0',
            }}
            >
              Security Settings
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: themeSpace.lg }}>
              {[
                { key: 'twoFactorAuth', label: 'Two-Factor Authentication', description: 'Add an extra layer of security to your account' },
                { key: 'ipWhitelist', label: 'IP Whitelist', description: 'Restrict access to specific IP addresses' },
              ].map((item) => (
                <div
                 key={item.key}
                 style={{
                 display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: themeSpace.lg, borderBottom: `1px solid ${themeColors.gray100}`,
               }}
               >
                 <div>
                 <p style={{
                 margin: 0, fontSize: '14px', fontWeight: '600', color: themeColors.text,
               }}
               >
                 {item.label}
               </p>
                 <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: themeColors.gray600 }}>{item.description}</p>
               </div>
                 <button
                 type="button"
                 aria-label={`Toggle ${item.label}`}
                 onClick={() => toggleSwitch(item.key)}
                 style={{
                 width: '50px',
                 height: '28px',
                 borderRadius: '14px',
                 border: 'none',
                 backgroundColor: settings[item.key] ? themeColors.primary600 : themeColors.gray200,
                 cursor: 'pointer',
                 position: 'relative',
                 transition: 'all 200ms',
               }}
               >
                 <div
                 style={{
                 position: 'absolute',
                 width: '24px',
                 height: '24px',
                 backgroundColor: themeColors.white,
                 borderRadius: '50%',
                 top: '2px',
                 left: settings[item.key] ? '24px' : '2px',
                 transition: 'left 200ms',
               }}
               />
               </button>
               </div>
              ))}
            </div>

            <div style={{ marginTop: themeSpace.lg, marginBottom: themeSpace.lg }}>
              <label
htmlFor="field-4" style={{
                display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: themeSpace.sm,
              }}
              >
                Session Timeout (seconds)
              </label>
              <input
id="field-4"
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
                style={{
                  width: '100%',
                  padding: themeSpace.md,
                  border: `1px solid ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  fontSize: '14px',
                }}
              />
            </div>

            <button
              type="button"
              onClick={handleSave}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                backgroundColor: themeColors.primary600,
                color: themeColors.white,
                border: 'none',
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Save Changes
            </button>
          </div>
          )}

          {/* API Keys */}
          {activeTab === 'api' && (
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.xl,
          }}
          >
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: themeColors.text, margin: '0 0 24px 0',
            }}
            >
              API Keys
            </h2>
            <p style={{ fontSize: '14px', color: themeColors.gray600, marginBottom: themeSpace.lg }}>Generate and manage API keys for integrations</p>

            <button
              type="button"
              onClick={generateApiKey}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                backgroundColor: themeColors.primary600,
                color: themeColors.white,
                border: 'none',
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Generate New Key
            </button>

            {settings.apiKeys.length === 0 ? (
              <div style={{
                marginTop: themeSpace.xl, padding: themeSpace.xl, backgroundColor: themeColors.gray50, borderRadius: themeRadius.card, textAlign: 'center', color: themeColors.gray600,
              }}
              >
                No API keys yet. Create one to get started.
              </div>
            ) : (
              <div style={{ marginTop: themeSpace.lg, display: 'flex', flexDirection: 'column', gap: themeSpace.md }}>
                {settings.apiKeys.map((apiKey) => (
                  <div
                    key={apiKey.key}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: themeSpace.lg, backgroundColor: themeColors.gray50, borderRadius: themeRadius.sm, border: `1px solid ${themeColors.gray200}`,
                    }}
                  >
                    <div>
                      <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: themeColors.text }}>{apiKey.name}</p>
                      <p style={{
                        margin: '4px 0 0 0', fontSize: '13px', color: themeColors.gray600, fontFamily: 'monospace',
                      }}
                      >
                        {apiKey.key.slice(0, 12)}
                        {'•'.repeat(20)}
                      </p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: themeColors.gray500 }}>
                        Created
                        {' '}
                        {apiKey.createdAt}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => revokeApiKey(apiKey.key)}
                      style={{
                        padding: `${themeSpace.xs} ${themeSpace.md}`, backgroundColor: themeColors.error500, color: themeColors.white, border: 'none', borderRadius: themeRadius.sm, cursor: 'pointer', fontSize: '13px', fontWeight: '500',
                      }}
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
