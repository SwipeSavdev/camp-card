'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
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
}: { name: string; size?: number; color?: string; [key: string]: any }) {
  const icons: { [key: string]: JSX.Element } = {
    add: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
         </svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>,
    delete: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
            </svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
            </svg>,
    back: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>,
  };
  return <span {...props}>{icons[name] || null}</span>;
}

export default function CampCardsPage() {
  const { data: session, status } = useSession();
  const _router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  useEffect(() => {
    // Load data when session is available
    if (status === 'authenticated' && session) {
      fetchData();
    }
  }, [status, session]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getCards(session);
      setItems(data.content || data || []);
    } catch (err) {
      setError('Failed to load cards');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this card?')) return;
    try {
      await api.deleteCard(id, session);
      setItems(items.filter((i) => i.id !== id));
    } catch (err) {
      setError('Failed to delete');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return { bg: themeColors.success50, text: themeColors.success600 };
      case 'PENDING_CLAIM':
        return { bg: themeColors.warning50, text: themeColors.warning600 };
      case 'EXPIRED':
        return { bg: '#fee2e2', text: themeColors.error500 };
      case 'CANCELLED':
        return { bg: themeColors.gray100, text: themeColors.gray600 };
      default:
        return { bg: themeColors.info50, text: themeColors.info600 };
    }
  };

  const filteredItems = (Array.isArray(items) ? items : []).filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase())
 || item.cardNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status?.toUpperCase() === statusFilter.toUpperCase();

    const matchesMethod = methodFilter === 'all' || item.issuanceMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  if (status === 'loading') return null;
  if (!session) return null;

  return (
    <PageLayout title="Camp Cards" currentPath="/camp-cards">
      <div style={{
        padding: themeSpace.xl, backgroundColor: themeColors.white, borderBottom: `1px solid ${themeColors.gray200}`, boxShadow: themeShadow.xs, marginBottom: themeSpace.lg, borderRadius: themeRadius.card,
      }}
      >
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: themeSpace.lg,
        }}
        >
          <p style={{ fontSize: '13px', color: themeColors.gray600, margin: 0 }}>Cards issued through purchase or claim links only</p>
          <div style={{ display: 'flex', gap: themeSpace.sm, alignItems: 'center' }}>
            <button
              disabled
              title="Cards are issued automatically when customers purchase through our gateway or use a claim link from a Troop Leader"
              style={{
                background: themeColors.gray200,
                color: themeColors.gray500,
                border: 'none',
                padding: `${themeSpace.sm} ${themeSpace.lg}`,
                borderRadius: themeRadius.sm,
                cursor: 'not-allowed',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                gap: themeSpace.sm,
                alignItems: 'center',
                opacity: 0.6,
              }}
            >
              <Icon name="add" size={18} color={themeColors.gray500} />
              Add Card
            </button>
          </div>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto auto', gap: themeSpace.md, alignItems: 'center', marginBottom: themeSpace.lg,
        }}
        >
          <div style={{ position: 'relative' }}>
            <Icon
              name="search"
              size={18}
              color={themeColors.gray500}
              style={{
                position: 'absolute', left: themeSpace.md, top: '12px', pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search by name or card number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: `${themeSpace.sm} ${themeSpace.md} ${themeSpace.sm} ${themeSpace.xl}`,
                border: `1px solid ${themeColors.gray200}`,
                borderRadius: themeRadius.sm,
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`,
              border: `1px solid ${themeColors.gray200}`,
              borderRadius: themeRadius.sm,
              fontSize: '14px',
              backgroundColor: themeColors.white,
              cursor: 'pointer',
              minWidth: '140px',
              whiteSpace: 'nowrap',
            }}
          >
            <option value="all">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING_CLAIM">Pending Claim</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            style={{
              padding: `${themeSpace.sm} ${themeSpace.md}`,
              border: `1px solid ${themeColors.gray200}`,
              borderRadius: themeRadius.sm,
              fontSize: '14px',
              backgroundColor: themeColors.white,
              cursor: 'pointer',
              minWidth: '150px',
              whiteSpace: 'nowrap',
            }}
          >
            <option value="all">All Methods</option>
            <option value="GATEWAY_PURCHASE">Payment Gateway</option>
            <option value="CLAIM_LINK">Claim Link</option>
          </select>
        </div>
      </div>

      {error && (
      <div style={{
        backgroundColor: '#fee2e2', border: `1px solid ${themeColors.error500}`, borderRadius: themeRadius.card, padding: themeSpace.lg, marginBottom: themeSpace.lg, color: themeColors.error500,
      }}
      >
        {error}
      </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: themeSpace.xl }}>Loading...</div>
      ) : filteredItems.length === 0 ? (
        <div style={{
          backgroundColor: themeColors.white,
          borderRadius: themeRadius.card,
          border: `1px solid ${themeColors.gray200}`,
          padding: themeSpace.xl,
          textAlign: 'center',
          color: themeColors.gray600,
        }}
        >
          <p style={{
            fontSize: '16px', fontWeight: '500', margin: 0, marginBottom: themeSpace.md,
          }}
          >
            No cards found
          </p>
          <p style={{ fontSize: '14px', color: themeColors.gray500, margin: 0 }}>Cards are automatically issued when customers purchase through our payment gateway or use a claim link from a Troop Leader</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden', boxShadow: themeShadow.sm,
        }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: themeColors.gray50, borderBottom: `1px solid ${themeColors.gray200}` }}>
                <th style={{
                  textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
Cardholder
                </th>
                <th style={{
                  textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
Card Number
                </th>
                <th style={{
                  textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
Status
                </th>
                <th style={{
                  textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
Method
                </th>
                <th style={{
                  textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
Issued
                </th>
                <th style={{
                  textAlign: 'left', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
Expires
                </th>
                <th style={{
                  textAlign: 'center', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600,
                }}
                >
Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const statusColor = getStatusColor(item.status);
                const issuedDate = item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A';
                const expiresDate = item.expiresAt ? new Date(item.expiresAt).toLocaleDateString() : 'N/A';
                const claimToken = item.claimToken || item.token;

                return (
                  <tr key={item.id} style={{ borderBottom: `1px solid ${themeColors.gray200}` }}>
                   <td style={{
                   padding: themeSpace.lg, fontSize: '14px', color: themeColors.text, fontWeight: '500',
                 }}
                 >
                   <div>{item.name || item.cardholderName || 'Unknown'}</div>
                   {claimToken && item.status?.toUpperCase() === 'PENDING_CLAIM' && (
                 <div style={{
                   fontSize: '12px', color: themeColors.warning600, marginTop: themeSpace.xs, fontFamily: 'monospace',
                 }}
                 >
                   {claimToken}
                 </div>
                 )}
                 </td>
                   <td style={{
                   padding: themeSpace.lg, fontSize: '14px', color: themeColors.text, fontFamily: 'monospace',
                 }}
                 >
                   {item.cardNumber ? ` ${item.cardNumber.slice(-4)}` : 'N/A'}
                 </td>
                   <td style={{ padding: themeSpace.lg }}>
                   <span style={{
                   padding: `${themeSpace.xs} ${themeSpace.sm}`, backgroundColor: statusColor.bg, color: statusColor.text, borderRadius: themeRadius.sm, fontSize: '12px', fontWeight: '500', display: 'inline-block',
                 }}
                 >
                   {item.status?.replace(/_/g, ' ') || 'ACTIVE'}
                 </span>
                 </td>
                   <td style={{ padding: themeSpace.lg, fontSize: '13px', color: themeColors.text }}>
                   <span style={{
                   padding: `${themeSpace.xs} ${themeSpace.sm}`,
                   backgroundColor: item.issuanceMethod === 'GATEWAY_PURCHASE' ? themeColors.info50 : themeColors.primary50,
                   color: item.issuanceMethod === 'GATEWAY_PURCHASE' ? themeColors.info600 : themeColors.primary600,
                   borderRadius: themeRadius.sm,
                   fontSize: '12px',
                   fontWeight: '500',
                   display: 'inline-block',
                 }}
                 >
                   {item.issuanceMethod === 'GATEWAY_PURCHASE' ? 'Payment Gateway' : item.issuanceMethod === 'CLAIM_LINK' ? 'Claim Link' : item.issuanceMethod || 'Unknown'}
                 </span>
                 </td>
                   <td style={{ padding: themeSpace.lg, fontSize: '13px', color: themeColors.gray600 }}>
                   {issuedDate}
                 </td>
                   <td style={{ padding: themeSpace.lg, fontSize: '13px', color: themeColors.gray600 }}>
                   {expiresDate}
                 </td>
                   <td style={{ padding: themeSpace.lg, textAlign: 'center' }}>
                   <div style={{ display: 'flex', gap: themeSpace.sm, justifyContent: 'center' }}>
                   <button style={{
                     background: themeColors.info50, border: 'none', color: themeColors.info600, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   }}
                   >
                     <Icon name="edit" size={16} color={themeColors.info600} />
                   </button>
                   <button
                     onClick={() => handleDelete(item.id)} style={{
                     background: '#fee2e2', border: 'none', color: themeColors.error500, width: '32px', height: '32px', borderRadius: themeRadius.sm, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   }}
                   >
                     <Icon name="delete" size={16} color={themeColors.error500} />
                   </button>
                 </div>
                 </td>
                 </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageLayout>
  );
}
