'use client';

import { useCallback, useEffect, useState } from 'react';
import { getProperties } from '@/lib/api/properties-api';
import { ApiError } from '@/lib/api/client';
import {
  DEFAULT_FILTERS,
  type PaginatedProperties,
  type PropertyFilters,
} from '@/lib/types/property';
import { PropertyCard } from './property-card';
import {
  PropertyFiltersPanel,
} from './property-filters';

export function PropertiesExplorer() {
  const [draftFilters, setDraftFilters] =
    useState<PropertyFilters>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<PropertyFilters>(DEFAULT_FILTERS);
  const [result, setResult] = useState<PaginatedProperties | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(async (filters: PropertyFilters) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getProperties(filters);
      setResult(data);
    } catch (err) {
      setResult(null);
      setError(
        err instanceof ApiError ? err.message : 'No se pudieron cargar las propiedades',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchProperties(appliedFilters);
  }, [appliedFilters, fetchProperties]);

  function applyFilters() {
    setAppliedFilters({ ...draftFilters, page: 1 });
  }

  function resetFilters() {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  }

  function goToPage(page: number) {
    setDraftFilters((prev) => ({ ...prev, page }));
    setAppliedFilters((prev) => ({ ...prev, page }));
  }

  const meta = result?.meta;

  return (
    <div className="space-y-6">
      <PropertyFiltersPanel
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={applyFilters}
        onReset={resetFilters}
        isLoading={isLoading}
      />

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {meta
            ? `${meta.total} propiedad${meta.total === 1 ? '' : 'es'} encontrada${meta.total === 1 ? '' : 's'}`
            : '—'}
        </p>
        {meta && meta.totalPages > 1 && (
          <p className="text-sm text-slate-500">
            Página {meta.page} de {meta.totalPages}
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {error}
        </div>
      )}

      {isLoading && !result && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-72 animate-pulse rounded-xl bg-slate-200"
            />
          ))}
        </div>
      )}

      {!isLoading && result?.data.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="font-medium text-slate-900">No hay propiedades</p>
          <p className="mt-1 text-sm text-slate-600">
            Probá ajustando los filtros o creá una nueva desde el backend.
          </p>
        </div>
      )}

      {result && result.data.length > 0 && (
        <div
          className={`grid gap-4 sm:grid-cols-2 xl:grid-cols-3 ${isLoading ? 'opacity-60' : ''}`}
        >
          {result.data.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <Pagination
          page={meta.page}
          totalPages={meta.totalPages}
          onPageChange={goToPage}
          disabled={isLoading}
        />
      )}
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  disabled,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Paginación"
    >
      <PageButton
        label="Anterior"
        disabled={disabled || page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      {buildPageNumbers(page, totalPages).map((p, idx) =>
        p === '…' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-slate-400">
            …
          </span>
        ) : (
          <PageButton
            key={p}
            label={String(p)}
            active={p === page}
            disabled={disabled}
            onClick={() => onPageChange(p as number)}
          />
        ),
      )}
      <PageButton
        label="Siguiente"
        disabled={disabled || page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}

function PageButton({
  label,
  onClick,
  disabled,
  active,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-w-9 rounded-lg px-3 py-1.5 text-sm transition disabled:opacity-50 ${
        active
          ? 'bg-emerald-700 font-medium text-white'
          : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
      }`}
    >
      {label}
    </button>
  );
}

function buildPageNumbers(
  current: number,
  total: number,
): Array<number | '…'> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: Array<number | '…'> = [1];

  if (current > 3) pages.push('…');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  if (current < total - 2) pages.push('…');

  pages.push(total);
  return pages;
}
