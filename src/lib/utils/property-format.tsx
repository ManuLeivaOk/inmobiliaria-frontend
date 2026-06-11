import type { PropertyStatus } from '@/lib/types/property';
import { STATUS_LABELS } from '@/lib/types/property';

const STATUS_STYLES: Record<PropertyStatus, string> = {
  BORRADOR: 'bg-slate-100 text-slate-700',
  PUBLICADA: 'bg-emerald-100 text-emerald-800',
  RESERVADA: 'bg-amber-100 text-amber-800',
  VENDIDA: 'bg-blue-100 text-blue-800',
  ALQUILADA: 'bg-violet-100 text-violet-800',
  INACTIVA: 'bg-red-100 text-red-800',
};

export function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function StatusBadge({ status }: { status: PropertyStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
