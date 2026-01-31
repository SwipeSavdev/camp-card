'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api';
import PageLayout from '../components/PageLayout';

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
  error50: '#fef2f2',
  error600: '#dc2626',
};

const themeSpace = {
  xs: '3px', sm: '8px', md: '16px', lg: '24px', xl: '32px',
};
const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' };

interface MobileModule {
  id: number;
  moduleId: string;
  name: string;
  description: string;
  enabled: boolean;
  category: string;
  createdAt: string;
  updatedAt: string;
}

const categoryLabels: Record<string, string> = {
  auth: 'Authentication',
  engagement: 'Engagement',
  features: 'Core Features',
  ux: 'User Experience',
};

const categoryOrder = ['auth', 'features', 'engagement', 'ux'];

export default function ConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [modules, setModules] = useState<MobileModule[]>([]);
  const [saved, setSaved] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const fetchModules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await api.getMobileModules(session);
      if (Array.isArray(result)) {
        setModules(result.map((m) => ({
          id: m.id,
          moduleId: m.moduleId,
          name: m.name,
          description: m.description || '',
          enabled: m.enabled,
          category: m.category,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        })));
      }
    } catch (err) {
      console.error('Failed to fetch modules:', err);
      setError('Failed to load module configuration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login');
    if (status === 'authenticated') fetchModules();
  }, [status, router, fetchModules]);

  const handleToggle = (moduleId: string) => {
    setModules((prev) => prev.map((m) => (m.moduleId === moduleId ? { ...m, enabled: !m.enabled } : m)));
    setHasUnsavedChanges(true);
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      setError(null);
      const enabledMap: Record<string, boolean> = {};
      modules.forEach((m) => { enabledMap[m.moduleId] = m.enabled; });
      const result = await api.bulkToggleMobileModules(enabledMap, session);
      if (Array.isArray(result)) {
        setModules(result.map((m) => ({
          id: m.id,
          moduleId: m.moduleId,
          name: m.name,
          description: m.description || '',
          enabled: m.enabled,
          category: m.category,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        })));
      }
      setHasUnsavedChanges(false);
      setSaved(true);
      setLastSaved(new Date().toLocaleString());
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save modules:', err);
      setError('Failed to save configuration. Please try again.');
    }
  };

  const handleResetDefaults = async () => {
    try {
      setError(null);
      const result = await api.resetMobileModules(session);
      if (Array.isArray(result)) {
        setModules(result.map((m) => ({
          id: m.id,
          moduleId: m.moduleId,
          name: m.name,
          description: m.description || '',
          enabled: m.enabled,
          category: m.category,
          createdAt: m.createdAt,
          updatedAt: m.updatedAt,
        })));
      }
      setHasUnsavedChanges(false);
      setSaved(true);
      setLastSaved(new Date().toLocaleString());
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to reset modules:', err);
      setError('Failed to reset configuration. Please try again.');
    }
  };

  if (status === 'loading') return null;
  if (!session) return null;

  const enabledCount = modules.filter((m) => m.enabled).length;
  const disabledCount = modules.filter((m) => !m.enabled).length;

  return (
    <PageLayout title="Mobile App Modules" currentPath="/config">
      {/* Header */}
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ fontSize: '14px', color: themeColors.gray600, margin: 0 }}>Enable or disable features in the mobile application</p>
            {lastSaved && (
              <p style={{ fontSize: '12px', color: themeColors.gray600, margin: '4px 0 0 0' }}>
                Last saved:
                {' '}
                {lastSaved}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', gap: themeSpace.md, alignItems: 'center' }}>
            <span style={{
              padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: themeColors.success50, color: themeColors.success600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '600',
            }}
            >
              {enabledCount}
              {' '}
              enabled
            </span>
            <span style={{
              padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: themeColors.gray100, color: themeColors.gray600, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '600',
            }}
            >
              {disabledCount}
              {' '}
              disabled
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {error && (
        <div style={{
          backgroundColor: themeColors.error50, border: `1px solid ${themeColors.error600}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.error600,
        }}
        >
          {error}
        </div>
        )}

        {saved && (
        <div style={{
          backgroundColor: themeColors.success50, border: `1px solid ${themeColors.success600}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.success600,
        }}
        >
          Modules configuration saved successfully! Changes will take effect on next mobile app launch.
        </div>
        )}

        {hasUnsavedChanges && !saved && (
        <div style={{
          backgroundColor: '#fefce8', border: '1px solid #eab308', borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: '#854d0e',
        }}
        >
          You have unsaved changes. Click &quot;Save Configuration&quot; to apply.
        </div>
        )}

        {isLoading ? (
          <div style={{
            backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, padding: themeSpace.xl, textAlign: 'center',
          }}
          >
            <p style={{ fontSize: '14px', color: themeColors.gray600 }}>Loading module configuration...</p>
          </div>
        ) : (
          <>
            {/* Modules grouped by category */}
            {categoryOrder.map((cat) => {
              const catModules = modules.filter((m) => m.category === cat);
              if (catModules.length === 0) return null;
              return (
                <div key={cat} style={{ marginBottom: themeSpace.xl }}>
                  <h2 style={{
                    fontSize: '16px', fontWeight: '700', color: themeColors.text, margin: `0 0 ${themeSpace.md} 0`, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}
                  >
                    {categoryLabels[cat] || cat}
                  </h2>
                  <div style={{
                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: themeSpace.lg,
                  }}
                  >
                    {catModules.map((module) => (
                      <div
                        key={module.moduleId}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: themeSpace.md }}>
                          <div style={{ flex: 1, marginRight: themeSpace.md }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: themeColors.text }}>{module.name}</h3>
                          </div>
                          <button
                            type="button"
                            aria-label={`Toggle ${module.name}`}
                            onClick={() => handleToggle(module.moduleId)}
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
                            <div style={{
                              position: 'absolute', width: '24px', height: '24px', backgroundColor: themeColors.white, borderRadius: '50%', top: '2px', left: module.enabled ? '24px' : '2px', transition: 'left 200ms',
                            }}
                            />
                          </button>
                        </div>

                        <p style={{ margin: 0, fontSize: '13px', color: themeColors.gray600 }}>{module.description}</p>

                        <div style={{ marginTop: themeSpace.md, paddingTop: themeSpace.md, borderTop: `1px solid ${themeColors.gray200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                            {module.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                          <span style={{ fontSize: '11px', color: themeColors.gray600 }}>
                            ID:
                            {' '}
                            {module.moduleId}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: themeSpace.md, alignItems: 'center' }}>
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
                  opacity: hasUnsavedChanges ? 1 : 0.6,
                }}
              >
                Save Configuration
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                style={{
                  padding: `${themeSpace.md} ${themeSpace.lg}`,
                  backgroundColor: 'transparent',
                  color: themeColors.gray600,
                  border: `1px solid ${themeColors.gray200}`,
                  borderRadius: themeRadius.sm,
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px',
                }}
              >
                Reset to Defaults
              </button>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}
