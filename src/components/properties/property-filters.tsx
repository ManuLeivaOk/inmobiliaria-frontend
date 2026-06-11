"use client";

import { useEffect, useState } from "react";
import {
  getCities,
  getNeighborhoods,
  getProvinces,
} from "@/lib/api/properties-api";
import {
  CURRENCIES,
  OPERATION_LABELS,
  OPERATION_TYPES,
  PROPERTY_STATUSES,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TYPES,
  STATUS_LABELS,
  type GeoItem,
  type PropertyFilters,
} from "@/lib/types/property";

interface PropertyFiltersPanelProps {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
  onApply: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export function PropertyFiltersPanel({
  filters,
  onChange,
  onApply,
  onReset,
  isLoading,
}: PropertyFiltersPanelProps) {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [provinces, setProvinces] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<GeoItem[]>([]);

  useEffect(() => {
    getProvinces()
      .then(setProvinces)
      .catch(() => setProvinces([]));
  }, []);

  useEffect(() => {
    let active = true;

    async function loadCities() {
      if (!filters.provinceId) {
        if (active) {
          setCities([]);
        }
        return;
      }

      try {
        const data = await getCities(filters.provinceId);

        if (active) {
          setCities(data);
        }
      } catch {
        if (active) {
          setCities([]);
        }
      }
    }

    loadCities();

    return () => {
      active = false;
    };
  }, [filters.provinceId]);

  useEffect(() => {
    let active = true;

    async function loadNeighborhoods() {
      if (!filters.cityId) {
        if (active) {
          setNeighborhoods([]);
        }
        return;
      }

      try {
        const data = await getNeighborhoods(filters.cityId);

        if (active) {
          setNeighborhoods(data);
        }
      } catch {
        if (active) {
          setNeighborhoods([]);
        }
      }
    }

    loadNeighborhoods();

    return () => {
      active = false;
    };
  }, [filters.cityId]);

  function update(partial: Partial<PropertyFilters>) {
    onChange({ ...filters, ...partial, page: 1 });
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* ⚡ BARRA PRINCIPAL COMPACTA (Lo que el 90% de la gente usa) */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-slate-600">
            Buscar propiedad
          </label>
          <input
            type="search"
            placeholder="Título, descripción, dirección..."
            value={filters.search ?? ""}
            onChange={(e) => update({ search: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && onApply()}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-gray-600 outline-none ring-emerald-500 transition focus:ring-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:w-[450px] md:shrink-0">
          <FilterSelect
            label="Operación"
            value={filters.operationType ?? ""}
            onChange={(v) =>
              update({ operationType: v as PropertyFilters["operationType"] })
            }
            options={[
              { value: "", label: "Todas" },
              ...OPERATION_TYPES.map((o) => ({
                value: o,
                label: OPERATION_LABELS[o],
              })),
            ]}
          />

          <FilterSelect
            label="Tipo de inmueble"
            value={filters.propertyType ?? ""}
            onChange={(v) =>
              update({ propertyType: v as PropertyFilters["propertyType"] })
            }
            options={[
              { value: "", label: "Todos" },
              ...PROPERTY_TYPES.map((t) => ({
                value: t,
                label: PROPERTY_TYPE_LABELS[t],
              })),
            ]}
          />

          {/* Botón de control móvil para desplegar avanzados */}
          <div className="col-span-2 sm:col-span-1">
            <label className="hidden text-xs font-medium text-slate-600 sm:block mb-1">
              Filtros
            </label>
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`flex w-full items-center justify-center gap-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                isAdvancedOpen
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span>{isAdvancedOpen ? "Ocultar" : "Avanzados"}</span>
              <svg
                className={`h-4 w-4 transition-transform ${isAdvancedOpen ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN DE LA BARRA PRINCIPAL */}
        <div className="flex gap-2 md:shrink-0">
          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 md:flex-none"
          >
            Limpiar
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={isLoading}
            className="flex-1 rounded-lg bg-emerald-700 px-5 py-2 text-sm font-medium text-white transition hover:bg-emerald-800 disabled:opacity-50 md:flex-none"
          >
            {isLoading ? "Buscando…" : "Buscar"}
          </button>
        </div>
      </div>

      {/* 🧭 PANEL DESPLEGABLE DE FILTROS AVANZADOS */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isAdvancedOpen
            ? "mt-4 pt-4 border-t border-slate-100 opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <FilterSelect
            label="Estado"
            value={filters.status ?? ""}
            onChange={(v) => update({ status: v as PropertyFilters["status"] })}
            options={[
              { value: "", label: "Todos" },
              ...PROPERTY_STATUSES.map((s) => ({
                value: s,
                label: STATUS_LABELS[s],
              })),
            ]}
          />

          <FilterSelect
            label="Moneda"
            value={filters.currency ?? ""}
            onChange={(v) =>
              update({ currency: v as PropertyFilters["currency"] })
            }
            options={[
              { value: "", label: "Todas" },
              ...CURRENCIES.map((c) => ({ value: c, label: c })),
            ]}
          />

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Precio mínimo
            </label>
            <input
              type="number"
              min={0}
              placeholder="0"
              value={filters.minPrice ?? ""}
              onChange={(e) => update({ minPrice: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 transition focus:ring-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-600">
              Precio máximo
            </label>
            <input
              type="number"
              min={0}
              placeholder="Sin límite"
              value={filters.maxPrice ?? ""}
              onChange={(e) => update({ maxPrice: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-emerald-500 transition focus:ring-2"
            />
          </div>

          <FilterSelect
            label="Provincia"
            value={filters.provinceId ?? ""}
            onChange={(v) =>
              update({ provinceId: v, cityId: "", neighborhoodId: "" })
            }
            options={[
              { value: "", label: "Todas" },
              ...provinces.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />

          <FilterSelect
            label="Ciudad"
            value={filters.cityId ?? ""}
            onChange={(v) => update({ cityId: v, neighborhoodId: "" })}
            disabled={!filters.provinceId}
            options={[
              { value: "", label: "Todas" },
              ...cities.map((c) => ({ value: c.id, label: c.name })),
            ]}
          />

          <FilterSelect
            label="Barrio"
            value={filters.neighborhoodId ?? ""}
            onChange={(v) => update({ neighborhoodId: v })}
            disabled={!filters.cityId}
            options={[
              { value: "", label: "Todos" },
              ...neighborhoods.map((n) => ({ value: n.id, label: n.name })),
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600 truncate">
        {label}
      </label>
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-500 transition focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 text-gray-600"
      >
        {options.map((opt) => (
          <option key={opt.value || "all"} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
