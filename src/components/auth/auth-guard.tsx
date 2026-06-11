'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, isRefreshing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isRefreshing && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, isRefreshing, router]);

  if (isLoading || isRefreshing) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-sm text-slate-600">
        <p>Sesión no válida o expirada.</p>
        <p>Redirigiendo al login…</p>
      </div>
    );
  }

  return <>{children}</>;
}
