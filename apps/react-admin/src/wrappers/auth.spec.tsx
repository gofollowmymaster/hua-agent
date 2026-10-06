import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writeAuthState } from '@/auth/storage';
import AuthWrapper from './auth';

const location = { pathname: '/knowledge/documents', search: '?drawer=x' };

vi.mock('@umijs/max', () => ({
  Navigate: ({ to }: { to: string }) => <div>navigate:{to}</div>,
  Outlet: () => <div>protected content</div>,
  useLocation: () => location,
}));

describe('AuthWrapper', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the nested route when a compatible token is persisted', () => {
    writeAuthState('header.eyJ1c2VySWQiOiIxIn0.signature');
    render(<AuthWrapper />);
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('redirects unauthenticated users and preserves the target query', () => {
    render(<AuthWrapper />);
    expect(
      screen.getByText(
        'navigate:/login?redirect=%2Fknowledge%2Fdocuments%3Fdrawer%3Dx',
      ),
    ).toBeInTheDocument();
  });
});
