'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/auth-context';
import { ApiError } from '@/lib/api/client';

export function RegisterForm() {
  const { register, user } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (form.password.length < 12) {
      setError('La contraseña debe tener al menos 12 caracteres');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone || undefined,
        password: form.password,
      });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'No se pudo registrar');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {user?.role === 'ADMIN' && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          Estás autenticado como ADMIN. Los nuevos usuarios serán VENDEDOR salvo
          que indiques otro rol desde la API.
        </p>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {error}
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-slate-700">
            Nombre
          </label>
          <input
            id="firstName"
            required
            value={form.firstName}
            onChange={(e) => updateField('firstName', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-slate-700">
            Apellido
          </label>
          <input
            id="lastName"
            required
            value={form.lastName}
            onChange={(e) => updateField('lastName', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
          />
        </div>
      </div>
      <div>
        <label htmlFor="reg-email" className="mb-1 block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="reg-email"
          type="email"
          required
          value={form.email}
          onChange={(e) => updateField('email', e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700">
          Teléfono (opcional)
        </label>
        <input
          id="phone"
          type="tel"
          value={form.phone}
          onChange={(e) => updateField('phone', e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="reg-password" className="mb-1 block text-sm font-medium text-slate-700">
          Contraseña
        </label>
        <input
          id="reg-password"
          type="password"
          required
          minLength={12}
          value={form.password}
          onChange={(e) => updateField('password', e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
        <p className="mt-1 text-xs text-slate-500">Mínimo 12 caracteres</p>
      </div>
      <div>
        <label htmlFor="confirm" className="mb-1 block text-sm font-medium text-slate-700">
          Confirmar contraseña
        </label>
        <input
          id="confirm"
          type="password"
          required
          value={form.confirmPassword}
          onChange={(e) => updateField('confirmPassword', e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none ring-emerald-500 focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2.5 font-medium text-white transition hover:bg-emerald-800 disabled:opacity-60"
      >
        {isSubmitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </button>
      <p className="text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{' '}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </form>
  );
}
