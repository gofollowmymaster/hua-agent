import { Navigate, Outlet, useLocation } from '@umijs/max';
import { currentAccessToken } from '@/auth/storage';

export default function AuthWrapper() {
  const location = useLocation();
  if (currentAccessToken()) return <Outlet />;
  const redirect = `${location.pathname}${location.search}`;
  return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} />;
}
