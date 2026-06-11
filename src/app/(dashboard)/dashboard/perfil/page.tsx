'use client';

import { useAuth } from '@/contexts/auth-context';

export default function PerfilPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-lg space-y-6 mx-auto">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mi perfil</h1>
        <p className="mt-1 text-slate-600">Datos de tu cuenta</p>
      </div>
      <dl className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white shadow-sm">
        {[
          ['Nombre', `${user.firstName} ${user.lastName}`],
          ['Email', user.email],
          ['Teléfono', user.phone ?? '—'],
          ['Rol', user.role],
          ['Verificado', user.isVerified ? 'Sí' : 'No'],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between gap-4 px-5 py-3 text-sm"
          >
            <dt className="font-medium text-slate-500">{label}</dt>
            <dd className="text-right text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
