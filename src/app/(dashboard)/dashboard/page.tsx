"use client";

import { useAuth } from "@/contexts/auth-context";
import { PropertiesExplorer } from "@/components/properties/properties-explorer";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoading } = useAuth(); // Podés usar isLoading si tu Provider lo expone

  // 1. Esperamos a que el usuario esté cargado para evitar crasheos por null
  if (isLoading || !user) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-slate-500">
        Cargando sesión...
      </div>
    );
  }

  // 2. Vista para usuarios que NO son ADMIN
  if (user.role !== "ADMIN") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Propiedades</h1>
          <p className="mt-1 text-slate-600">
            Hola {user.firstName}, podés cargar una nueva propiedad ingresando{" "}
            <Link 
              href="/dashboard/propiedades/cargar" 
              className="font-medium text-emerald-700 underline hover:text-emerald-800"
            >
              aquí
            </Link>.
          </p>
        </div>
      </div>
    );
  }

  // 3. Vista para usuarios ADMIN (ya no hace falta el 'else')
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Propiedades</h1>
        <p className="mt-1 text-slate-600">
          Hola {user.firstName}, explorá el catálogo y filtrá por operación,
          tipo, ubicación y precio.
        </p>
      </div>

      <PropertiesExplorer />
    </div>
  );
}