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
  gray600: '#4b5563',
  text: '#1f2937',
  primary600: '#2563eb',
  success50: '#f0fdf4',
  success600: '#16a34a',
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px',
};
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' };

// Icon component available for future use
function _Icon({
  name, size = 18, color = 'currentColor', ...props
}: { name: string; size?: number; color?: string; [key: string]: unknown }) {
  const icons: { [key: string]: JSX.Element } = {
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
  };
  return <span {...props}>{icons[name] || null}</span>;
}

interface MobileModule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

const defaultModules: MobileModule[] = [
  {
    id: '1',
    name: 'User Authentication',
    description: 'Email/password login and account management',
    enabled: true,
  },
  {
    id: '2',
    name: 'Biometric Login',
    description: 'Fingerprint and face recognition authentication',
    enabled: true,
  },
  {
    id: '3',
    name: 'Push Notifications',
    description: 'Real-time push notifications for offers and updates',
    enabled: true,
  },
  {
    id: '4',
    name: 'Loyalty Points',
    description: 'Earn and redeem loyalty points on purchases',
    enabled: true,
  },
  {
    id: '5',
    name: 'Dark Mode',
    description: 'Dark theme option for the mobile app',
    enabled: false,
  },
  {
    id: '6',
    name: 'Offer Redemption',
    description: 'Scan and redeem merchant offers',
    enabled: true,
  },
  {
    id: '7',
    name: 'Scout Management',
    description: 'Scout recruiting and management features',
    enabled: true,
  },
  {
    id: '8',
    name: 'Social Sharing',
    description: 'Share offers on social media platforms',
    enabled: false,
  },
  {
    id: '9',
    name: 'Offline Mode',
    description: 'Access cached data without internet connection',
    enabled: false,
  },
  {
    id: '10',
    name: 'Advanced Analytics',
    description: 'User behavior tracking and analytics dashboard',
    enabled: true,
  },
];

export default function ConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modules, setModules] = useState<MobileModule[]>(defaultModules);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
  }, [status, router]);

  const handleToggle = (id: string) => {
    setModules(modules.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <PageLayout title="Mobile App Modules" currentPath="/config">
      {/* Header */}
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>Enable or disable features in the mobile application</p>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {saved && (
        <div style={{
          backgroundColor: themeColors.success50, border: `1px solid ${themeColors.success600}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.success600,
        }}
        >
          Modules configuration saved successfully!
        </div>
        )}

        {/* Modules List */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: themeSpace.lg, marginBottom: themeSpace.xl,
        }}
        >
          {modules.map((module) => (
            <div
              key={module.id}
              style={{
                backgroundColor: themeColors.white,
                borderRadius: themeRadius.card,
                border: `1px solid ${themeColors.gray200}`,
                padding: themeSpace.lg,
                boxShadow: themeShadow.sm,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.md,
              }}
              >
                <div style={{ flex: 1, marginRight: themeSpace.md }}>
                  <h3 style={{
                    margin: 0, fontSize: '16px', fontWeight: '700', color: themeColors.text,
                  }}
                  >{module.name}
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label={`Toggle ${module.name}`}
                  onClick={() => handleToggle(module.id)}
                  style={{
                    width: '50px',
                    height: '28px',
                    borderRadius: '14px',
                    border: 'none',
                    backgroundColor: module.enabled ? themeColors.primary600 : themeColors.gray200,
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 200ms',
                    flexShrink: 0,
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
                     left: module.enabled ? '24px' : '2px',
                     transition: 'left 200ms',
                   }}
                  />
                </button>
              </div>

              <p style={{ margin: 0, fontSize: '13px', color: themeColors.gray600 }}>{module.description}</p>

              <div style={{ marginTop: themeSpace.md, paddingTop: themeSpace.md, borderTop: `1px solid ${themeColors.gray200}` }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: `${themeSpace.xs} ${themeSpace.sm}`,
                    backgroundColor: module.enabled ? themeColors.success50 : themeColors.gray100,
                    color: module.enabled ? themeColors.success600 : themeColors.gray600,
                    borderRadius: themeRadius.sm,
                    fontSize: '12px',
                    fontWeight: '500',
                  }}
                >
                  {module.enabled ? ' Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <button
          type="button"
          onClick={handleSave}
          style={{
            padding: `${themeSpace.md} ${themeSpace.lg}`,
            backgroundColor: themeColors.primary600,
            color: themeColors.white,
            border: 'none',
            borderRadius: themeRadius.sm,
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
          }}
        >
          Save Modules Configuration
        </button>
      </div>
    </PageLayout>
  );
}
