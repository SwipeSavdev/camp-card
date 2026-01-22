'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import PageLayout from '../../../components/PageLayout';

const themeColors = {
  white: '#ffffff',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray500: '#6b7280',
  gray600: '#4b5563',
  text: '#1f2937',
  primary50: '#eff6ff',
  primary100: '#dbeafe',
  primary200: '#bfdbfe',
  primary600: '#2563eb',
  primary800: '#1e40af',
  success50: '#f0fdf4',
  success200: '#bbf7d0',
  success600: '#16a34a',
  warning50: '#fefce8',
  warning200: '#fef08a',
  warning600: '#ca8a04',
  error50: '#fef2f2',
  error200: '#fecaca',
  error500: '#ef4444',
  error600: '#dc2626',
};

const themeSpace = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
};

const themeRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
};

const themeShadow = {
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
};

interface PaymentConfig {
  id?: number;
  uuid?: string;
  councilId: number;
  councilName?: string;
  gatewayType: 'AUTHORIZE_NET';
  apiLoginIdMasked?: string;
  transactionKeyMasked?: string;
  environment: 'SANDBOX' | 'PRODUCTION';
  isActive: boolean;
  isVerified: boolean;
  lastVerifiedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

function Icon({ name, size = 18, color = 'currentColor' }: { name: string; size?: number; color?: string }) {
  const icons: Record<string, JSX.Element> = {
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
    check: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
    creditCard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>,
    shield: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    refresh: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" /></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>,
    eyeOff: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>,
  };
  return icons[name] || null;
}

export default function PaymentSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const councilId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [councilName, setCouncilName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [apiLoginId, setApiLoginId] = useState('');
  const [transactionKey, setTransactionKey] = useState('');
  const [environment, setEnvironment] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  const [showApiLoginId, setShowApiLoginId] = useState(false);
  const [showTransactionKey, setShowTransactionKey] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session && councilId) {
      loadData();
    }
  }, [status, session, councilId]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load council details
      const council = await api.getCouncilById(councilId, session);
      if (council) {
        setCouncilName(council.name || `Council ${councilId}`);
      }

      // Load payment config
      const paymentConfig = await api.getCouncilPaymentConfig(councilId, session);
      if (paymentConfig) {
        setConfig(paymentConfig);
        setEnvironment(paymentConfig.environment || 'SANDBOX');
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      // Don't show error for 404 - it just means no config exists yet
      if (err?.status !== 404) {
        setError('Failed to load payment configuration');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!apiLoginId || !transactionKey) {
      setError('Please enter both API Login ID and Transaction Key');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = {
        apiLoginId,
        transactionKey,
        environment,
        gatewayType: 'AUTHORIZE_NET' as const,
      };

      if (config?.id) {
        // Update existing config
        await api.updateCouncilPaymentConfig(councilId, data, session);
        setSuccess('Payment configuration updated successfully');
      } else {
        // Create new config
        await api.createCouncilPaymentConfig(councilId, data, session);
        setSuccess('Payment configuration created successfully');
      }

      // Clear form and reload
      setApiLoginId('');
      setTransactionKey('');
      await loadData();
    } catch (err: any) {
      console.error('Failed to save config:', err);
      setError(err.message || 'Failed to save payment configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await api.verifyCouncilPaymentConfig(councilId, session);
      if (result.success) {
        setSuccess('Credentials verified successfully! Gateway is ready for payments.');
        await loadData();
      } else {
        setError(`Verification failed: ${result.message}`);
      }
    } catch (err: any) {
      console.error('Failed to verify config:', err);
      setError(err.message || 'Failed to verify credentials');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this payment configuration? This action cannot be undone.')) {
      return;
    }

    try {
      await api.deleteCouncilPaymentConfig(councilId, session);
      setSuccess('Payment configuration deleted');
      setConfig(null);
    } catch (err: any) {
      console.error('Failed to delete config:', err);
      setError(err.message || 'Failed to delete payment configuration');
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <PageLayout title="Payment Gateway Settings" currentPath="/councils">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          flexDirection: 'column',
          gap: themeSpace.md,
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${themeColors.gray200}`,
            borderTopColor: themeColors.primary600,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
          <p style={{ color: themeColors.gray600, margin: 0 }}>Loading payment settings...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Payment Gateway Settings" currentPath="/councils">
      {/* Back button and header */}
      <div style={{ marginBottom: themeSpace.lg }}>
        <button
          onClick={() => router.push('/councils')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: themeSpace.sm,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: themeColors.primary600,
            fontSize: '14px',
            fontWeight: '500',
            padding: 0,
            marginBottom: themeSpace.md,
          }}
        >
          <Icon name="back" size={18} />
          Back to Councils
        </button>
        <h2 style={{ margin: 0, color: themeColors.text, fontSize: '24px', fontWeight: '700' }}>
          Payment Gateway Settings
        </h2>
        <p style={{ margin: `${themeSpace.sm} 0 0 0`, color: themeColors.gray600, fontSize: '14px' }}>
          Configure Authorize.net payment gateway for {councilName}
        </p>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div style={{
          padding: themeSpace.md,
          backgroundColor: themeColors.error50,
          border: `1px solid ${themeColors.error200}`,
          borderRadius: themeRadius.md,
          marginBottom: themeSpace.lg,
          display: 'flex',
          alignItems: 'center',
          gap: themeSpace.sm,
        }}>
          <Icon name="x" size={18} color={themeColors.error600} />
          <span style={{ color: themeColors.error600, fontSize: '14px' }}>{error}</span>
        </div>
      )}

      {success && (
        <div style={{
          padding: themeSpace.md,
          backgroundColor: themeColors.success50,
          border: `1px solid ${themeColors.success200}`,
          borderRadius: themeRadius.md,
          marginBottom: themeSpace.lg,
          display: 'flex',
          alignItems: 'center',
          gap: themeSpace.sm,
        }}>
          <Icon name="check" size={18} color={themeColors.success600} />
          <span style={{ color: themeColors.success600, fontSize: '14px' }}>{success}</span>
        </div>
      )}

      {/* Current Configuration Status */}
      {config && (
        <div style={{
          backgroundColor: themeColors.white,
          borderRadius: themeRadius.lg,
          padding: themeSpace.lg,
          marginBottom: themeSpace.lg,
          boxShadow: themeShadow.sm,
          border: `1px solid ${themeColors.gray200}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: themeSpace.md, marginBottom: themeSpace.lg }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: themeRadius.md,
              backgroundColor: config.isVerified ? themeColors.success50 : themeColors.warning50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Icon
                name={config.isVerified ? 'shield' : 'creditCard'}
                size={24}
                color={config.isVerified ? themeColors.success600 : themeColors.warning600}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0, color: themeColors.text, fontSize: '18px', fontWeight: '600' }}>
                Current Configuration
              </h3>
              <p style={{ margin: `${themeSpace.xs} 0 0 0`, color: themeColors.gray600, fontSize: '13px' }}>
                Gateway: Authorize.net • Environment: {config.environment}
              </p>
            </div>
            <div style={{
              padding: `${themeSpace.xs} ${themeSpace.md}`,
              borderRadius: themeRadius.sm,
              backgroundColor: config.isVerified ? themeColors.success50 : themeColors.warning50,
              color: config.isVerified ? themeColors.success600 : themeColors.warning600,
              fontSize: '12px',
              fontWeight: '600',
            }}>
              {config.isVerified ? 'Verified' : 'Not Verified'}
            </div>
          </div>

          {/* Credential Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: themeSpace.lg, marginBottom: themeSpace.lg }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.xs }}>
                API Login ID
              </label>
              <div style={{
                padding: themeSpace.md,
                backgroundColor: themeColors.gray50,
                borderRadius: themeRadius.sm,
                fontFamily: 'monospace',
                fontSize: '14px',
                color: themeColors.text,
              }}>
                {config.apiLoginIdMasked || '••••••••'}
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: themeColors.gray600, marginBottom: themeSpace.xs }}>
                Transaction Key
              </label>
              <div style={{
                padding: themeSpace.md,
                backgroundColor: themeColors.gray50,
                borderRadius: themeRadius.sm,
                fontFamily: 'monospace',
                fontSize: '14px',
                color: themeColors.text,
              }}>
                {config.transactionKeyMasked || '••••••••'}
              </div>
            </div>
          </div>

          {/* Verification Info */}
          {config.lastVerifiedAt && (
            <p style={{ margin: `0 0 ${themeSpace.md} 0`, fontSize: '13px', color: themeColors.gray600 }}>
              Last verified: {new Date(config.lastVerifiedAt).toLocaleString()}
            </p>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: themeSpace.md }}>
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                backgroundColor: themeColors.primary600,
                color: themeColors.white,
                border: 'none',
                borderRadius: themeRadius.sm,
                cursor: isVerifying ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: themeSpace.sm,
                opacity: isVerifying ? 0.7 : 1,
              }}
            >
              <Icon name="refresh" size={16} />
              {isVerifying ? 'Verifying...' : 'Test Connection'}
            </button>
            <button
              onClick={handleDelete}
              style={{
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                backgroundColor: themeColors.white,
                color: themeColors.error600,
                border: `1px solid ${themeColors.error200}`,
                borderRadius: themeRadius.sm,
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '14px',
              }}
            >
              Delete Configuration
            </button>
          </div>
        </div>
      )}

      {/* Configuration Form */}
      <div style={{
        backgroundColor: themeColors.white,
        borderRadius: themeRadius.lg,
        padding: themeSpace.lg,
        boxShadow: themeShadow.sm,
        border: `1px solid ${themeColors.gray200}`,
      }}>
        <h3 style={{ margin: `0 0 ${themeSpace.lg} 0`, color: themeColors.text, fontSize: '18px', fontWeight: '600' }}>
          {config ? 'Update Credentials' : 'Configure Payment Gateway'}
        </h3>

        {/* Gateway Type */}
        <div style={{ marginBottom: themeSpace.lg }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm }}>
            Gateway Type
          </label>
          <select
            disabled
            style={{
              width: '100%',
              padding: themeSpace.md,
              border: `1px solid ${themeColors.gray300}`,
              borderRadius: themeRadius.sm,
              fontSize: '14px',
              backgroundColor: themeColors.gray50,
              color: themeColors.gray600,
              cursor: 'not-allowed',
            }}
          >
            <option value="AUTHORIZE_NET">Authorize.net</option>
          </select>
          <p style={{ margin: `${themeSpace.xs} 0 0 0`, fontSize: '12px', color: themeColors.gray500 }}>
            Currently only Authorize.net is supported
          </p>
        </div>

        {/* Environment */}
        <div style={{ marginBottom: themeSpace.lg }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm }}>
            Environment
          </label>
          <div style={{ display: 'flex', gap: themeSpace.lg }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: themeSpace.sm, cursor: 'pointer' }}>
              <input
                type="radio"
                name="environment"
                value="SANDBOX"
                checked={environment === 'SANDBOX'}
                onChange={() => setEnvironment('SANDBOX')}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px', color: themeColors.text }}>Sandbox (Testing)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: themeSpace.sm, cursor: 'pointer' }}>
              <input
                type="radio"
                name="environment"
                value="PRODUCTION"
                checked={environment === 'PRODUCTION'}
                onChange={() => setEnvironment('PRODUCTION')}
                style={{ width: '18px', height: '18px' }}
              />
              <span style={{ fontSize: '14px', color: themeColors.text }}>Production (Live)</span>
            </label>
          </div>
          {environment === 'PRODUCTION' && (
            <p style={{
              margin: `${themeSpace.sm} 0 0 0`,
              padding: themeSpace.sm,
              backgroundColor: themeColors.warning50,
              borderRadius: themeRadius.sm,
              fontSize: '12px',
              color: themeColors.warning600,
            }}>
              Warning: Production mode will process real payments. Make sure credentials are correct.
            </p>
          )}
        </div>

        {/* API Login ID */}
        <div style={{ marginBottom: themeSpace.lg }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm }}>
            API Login ID
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showApiLoginId ? 'text' : 'password'}
              value={apiLoginId}
              onChange={(e) => setApiLoginId(e.target.value)}
              placeholder={config ? 'Enter new API Login ID to update' : 'Enter API Login ID'}
              style={{
                width: '100%',
                padding: `${themeSpace.md} ${themeSpace.xl} ${themeSpace.md} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray300}`,
                borderRadius: themeRadius.sm,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowApiLoginId(!showApiLoginId)}
              style={{
                position: 'absolute',
                right: themeSpace.md,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: themeColors.gray500,
              }}
            >
              <Icon name={showApiLoginId ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
        </div>

        {/* Transaction Key */}
        <div style={{ marginBottom: themeSpace.lg }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: themeColors.text, marginBottom: themeSpace.sm }}>
            Transaction Key
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type={showTransactionKey ? 'text' : 'password'}
              value={transactionKey}
              onChange={(e) => setTransactionKey(e.target.value)}
              placeholder={config ? 'Enter new Transaction Key to update' : 'Enter Transaction Key'}
              style={{
                width: '100%',
                padding: `${themeSpace.md} ${themeSpace.xl} ${themeSpace.md} ${themeSpace.md}`,
                border: `1px solid ${themeColors.gray300}`,
                borderRadius: themeRadius.sm,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            <button
              type="button"
              onClick={() => setShowTransactionKey(!showTransactionKey)}
              style={{
                position: 'absolute',
                right: themeSpace.md,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: themeColors.gray500,
              }}
            >
              <Icon name={showTransactionKey ? 'eyeOff' : 'eye'} size={18} />
            </button>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving || !apiLoginId || !transactionKey}
          style={{
            padding: `${themeSpace.md} ${themeSpace.xl}`,
            backgroundColor: (!apiLoginId || !transactionKey) ? themeColors.gray300 : themeColors.success600,
            color: themeColors.white,
            border: 'none',
            borderRadius: themeRadius.sm,
            cursor: (!apiLoginId || !transactionKey || isSaving) ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            opacity: isSaving ? 0.7 : 1,
          }}
        >
          {isSaving ? 'Saving...' : (config ? 'Update Configuration' : 'Save Configuration')}
        </button>
      </div>

      {/* Help Section */}
      <div style={{
        backgroundColor: themeColors.primary50,
        borderRadius: themeRadius.lg,
        padding: themeSpace.lg,
        marginTop: themeSpace.lg,
        border: `1px solid ${themeColors.primary200}`,
      }}>
        <h4 style={{ margin: `0 0 ${themeSpace.md} 0`, color: themeColors.primary800, fontSize: '16px', fontWeight: '600' }}>
          Getting Your Authorize.net Credentials
        </h4>
        <ol style={{ margin: 0, paddingLeft: themeSpace.lg, color: themeColors.gray600, fontSize: '14px', lineHeight: '1.6' }}>
          <li>Log in to your Authorize.net Merchant Interface</li>
          <li>Navigate to Account &gt; Settings &gt; API Credentials & Keys</li>
          <li>Copy your API Login ID</li>
          <li>Generate a new Transaction Key if needed (existing keys cannot be viewed)</li>
          <li>Enter the credentials above and save</li>
          <li>Click &quot;Test Connection&quot; to verify the credentials work</li>
        </ol>
        <p style={{ margin: `${themeSpace.md} 0 0 0`, fontSize: '13px', color: themeColors.gray500 }}>
          For sandbox testing, create a free account at{' '}
          <a href="https://developer.authorize.net/hello_world/sandbox.html" target="_blank" rel="noopener noreferrer" style={{ color: themeColors.primary600 }}>
            Authorize.net Developer Center
          </a>
        </p>
      </div>
    </PageLayout>
  );
}
