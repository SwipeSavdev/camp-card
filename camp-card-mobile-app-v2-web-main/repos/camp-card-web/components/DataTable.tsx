'use client';

import React from 'react';

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
 xs: '3px',
 sm: '8px',
 md: '16px',
 lg: '24px',
 xl: '32px',
 '2xl': '40px',
 '3xl': '48px',
};

const themeRadius = { sm: '4px', card: '12px' };
const themeShadow = { xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' };

const Icon = ({ name, size = 18, color = 'currentColor', ...props }: { name: string; size?: number; color?: string; [key: string]: any }) => {
 const icons: { [key: string]: JSX.Element } = {
 edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
 delete: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>,
 };
 return <span {...props}>{icons[name] || null}</span>;
};

interface Column {
 key: string;
 label: string;
 render?: (value: any, row: any) => React.ReactNode;
}

interface DataTableProps {
 columns: Column[];
 data: any[];
 loading?: boolean;
 onEdit?: (row: any) => void;
 onDelete?: (row: any) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
 columns,
 data,
 loading = false,
 onEdit,
 onDelete,
}) => {
 return (
 <div style={{ backgroundColor: themeColors.white, borderRadius: themeRadius.card, border: `1px solid ${themeColors.gray200}`, overflow: 'hidden', boxShadow: themeShadow.sm }}>
 {loading ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl, color: themeColors.gray600 }}>
 Loading...
 </div>
 ) : data.length === 0 ? (
 <div style={{ textAlign: 'center', padding: themeSpace.xl, color: themeColors.gray600 }}>
 No data found
 </div>
 ) : (
 <table style={{ width: '100%', borderCollapse: 'collapse' }}>
 <thead>
 <tr style={{ backgroundColor: themeColors.gray50, borderBottom: `1px solid ${themeColors.gray200}` }}>
 {columns.map((col) => (
 <th
 key={col.key}
 style={{
 textAlign: 'left',
 padding: themeSpace.lg,
 fontSize: '13px',
 fontWeight: '600',
 color: themeColors.gray600,
 }}
 >
 {col.label}
 </th>
 ))}
 {(onEdit || onDelete) && (
 <th style={{ textAlign: 'center', padding: themeSpace.lg, fontSize: '13px', fontWeight: '600', color: themeColors.gray600 }}>
 Actions
 </th>
 )}
 </tr>
 </thead>
 <tbody>
 {data.map((row, idx) => (
 <tr key={row.id || idx} style={{ borderBottom: `1px solid ${themeColors.gray200}` }}>
 {columns.map((col) => (
 <td key={col.key} style={{ padding: themeSpace.lg, fontSize: '14px', color: themeColors.text }}>
 {col.render ? col.render(row[col.key], row) : row[col.key]}
 </td>
 ))}
 {(onEdit || onDelete) && (
 <td style={{ padding: themeSpace.lg, textAlign: 'center' }}>
 <div style={{ display: 'flex', gap: themeSpace.sm, justifyContent: 'center' }}>
 {onEdit && (
 <button
 onClick={() => onEdit(row)}
 style={{
 background: themeColors.info50,
 border: 'none',
 color: themeColors.info600,
 width: '32px',
 height: '32px',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 }}
 >
 <Icon name="edit" size={16} color={themeColors.info600} />
 </button>
 )}
 {onDelete && (
 <button
 onClick={() => onDelete(row)}
 style={{
 background: '#fee2e2',
 border: 'none',
 color: themeColors.error500,
 width: '32px',
 height: '32px',
 borderRadius: themeRadius.sm,
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 }}
 >
 <Icon name="delete" size={16} color={themeColors.error500} />
 </button>
 )}
 </div>
 </td>
 )}
 </tr>
 ))}
 </tbody>
 </table>
 )}
 </div>
 );
};
