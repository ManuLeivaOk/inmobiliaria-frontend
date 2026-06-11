import { AuthGuard } from '@/components/auth/auth-guard';
import { AppHeader } from '@/components/layout/app-header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-full flex-1 flex-col bg-slate-50">
        <AppHeader />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
