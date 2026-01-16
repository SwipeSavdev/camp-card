'use client';

import { ReactNode } from 'react';

interface ApiErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  title?: string;
  className?: string;
}

const themeColors = {
  error50: '#fef2f2',
  error100: '#fee2e2',
  error500: '#ef4444',
  error600: '#dc2626',
  error700: '#b91c1c',
  white: '#ffffff',
  gray600: '#4b5563',
};

export function ApiErrorDisplay({
  error,
  onRetry,
  title = 'Error',
  className = '',
}: ApiErrorDisplayProps): ReactNode {
  if (!error) return null;

  return (
    <div
      className={className}
      style={{
        backgroundColor: themeColors.error50,
        border: `1px solid ${themeColors.error100}`,
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            flexShrink: 0,
            width: '20px',
            height: '20px',
            color: themeColors.error500,
          }}
        >
          <svg
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div style={{ flex: 1 }}>
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 600,
              color: themeColors.error700,
              margin: 0,
              marginBottom: '4px',
            }}
          >
            {title}
          </h3>
          <p
            style={{
              fontSize: '14px',
              color: themeColors.error600,
              margin: 0,
            }}
          >
            {error}
          </p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              style={{
                marginTop: '12px',
                padding: '8px 16px',
                backgroundColor: themeColors.error600,
                color: themeColors.white,
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading...' }: LoadingStateProps): ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          border: '3px solid #e5e7eb',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
      <p style={{ color: themeColors.gray600, fontSize: '14px' }}>{message}</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  icon,
}: EmptyStateProps): ReactNode {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px',
        textAlign: 'center',
      }}
    >
      {icon && (
        <div
          style={{
            width: '48px',
            height: '48px',
            marginBottom: '16px',
            color: '#9ca3af',
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: '16px',
          fontWeight: 600,
          color: '#1f2937',
          margin: 0,
          marginBottom: '8px',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0,
            maxWidth: '400px',
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          style={{
            marginTop: '16px',
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export default ApiErrorDisplay;
