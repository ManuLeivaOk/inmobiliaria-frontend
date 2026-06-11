'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export function AppHeader() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Helper para meter estilos activos a las solapas del menú
  const linkClass = (path: string) =>
    `font-medium transition-colors ${
      pathname === path
        ? 'text-emerald-700'
        : 'text-slate-600 hover:text-slate-900'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        
        {/* Logo / Inicio */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-bold text-slate-900 hover:opacity-80">
            Inmobiliaria
          </Link>

          {/* 🧭 MENÚ DE NAVEGACIÓN PRINCIPAL */}
          {user && (
            <nav className="hidden items-center gap-4 text-sm md:flex">
              <Link href="/dashboard" className={linkClass('/dashboard')}>
                Inicio
              </Link>
              <Link href="/dashboard/perfil" className={linkClass('/dashboard/perfil')}>
                Mi Perfil
              </Link>
            </nav>
          )}
        </div>

        {/* Bloque de Usuario y Acciones */}
        {user && (
          <div className="flex items-center gap-4 text-sm">
            
            {/* Badge de info de usuario */}
            <span className="hidden text-slate-600 sm:inline">
              {user.firstName} {user.lastName}
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                {user.role}
              </span>
            </span>

            {/* Botón dinámico: los ADMIN cargan desde el nav, los usuarios comunes tienen su link en la página */}
            {user.role === 'ADMIN' && (
              <Link
                href="/dashboard/propiedades/cargar"
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                  pathname === '/dashboard/propiedades/cargar'
                    ? 'bg-emerald-800 text-white'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                Cargar propiedad
              </Link>
            )}

            {/* Links para mobile (se muestran si la pantalla es chica y el nav central se oculta) */}
            <Link
              href="/dashboard/perfil"
              className="inline md:hidden text-slate-600 hover:text-slate-900"
            >
              Perfil
            </Link>

            <button
              type="button"
              onClick={() => void logout()}
              className="font-medium text-slate-600 hover:text-red-600 hover:cursor-pointer transition-colors"
            >
              Salir
            </button>
          </div>
        )}
      </div>
    </header>
  );
}