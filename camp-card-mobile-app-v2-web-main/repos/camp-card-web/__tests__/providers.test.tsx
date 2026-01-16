import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="session-provider">{children}</div>
  ),
}));

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn().mockImplementation(() => ({})),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-client-provider">{children}</div>
  ),
}));

// Import after mocks
import { Providers } from '../app/providers';

describe('Providers', () => {
  it('renders children within provider wrappers', () => {
    render(
      <Providers>
        <div data-testid="child-content">Test Content</div>
      </Providers>
    );

    expect(screen.getByTestId('child-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('wraps content with SessionProvider', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
  });

  it('wraps content with QueryClientProvider', () => {
    render(
      <Providers>
        <div>Content</div>
      </Providers>
    );

    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
  });

  it('renders multiple children correctly', () => {
    render(
      <Providers>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </Providers>
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });
});
