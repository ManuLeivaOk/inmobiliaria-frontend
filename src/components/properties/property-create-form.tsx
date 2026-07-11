"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { usePropertyForm } from "@/hooks/use-property-form";
import type { Property } from "@/lib/types/property";
import {
  CURRENCIES,
  OPERATION_TYPES,
  OPERATION_LABELS,
  PROPERTY_STATUSES,
  PROPERTY_TYPES,
  PROPERTY_TYPE_LABELS,
  STATUS_LABELS,
  AVAILABLE_SERVICES,
  AVAILABLE_SERVICE_LABELS,
} from "@/lib/types/property";
import { AutocompleteInput } from "./AutocompleteInput";

type PropertyFormProps = {
  property?: Property;
  onCancel?: () => void;
  onSuccess?: (property: Property) => void;
};

export function PropertyCreateForm({
  property,
  onCancel,
  onSuccess,
}: PropertyFormProps = {}) {
  const {
    form,
    updateField,
    handlePlaceSelect,
    handleCountryChange,
    handleProvinceChange,
    handleCityChange,
    images,
    addImage,
    removeImage,
    setCoverImage,
    updateImageFile,
    setImages,
    features,
    addFeature,
    removeFeature,
    setFeatures,
    selectedAmenities,
    toggleAmenity,
    countries,
    provinces,
    cities,
    neighborhoods,
    amenities,
    isSubmitting,
    isEditMode,
    isInitialized,
    submitForm,
  } = usePropertyForm({
    propertyId: property?.id,
    initialProperty: property,
    onSuccess,
  });

  if (isEditMode && !isInitialized) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-600" />
      </div>
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  return (
    <APIProvider apiKey={apiKey}>
      <form onSubmit={submitForm} className="space-y-6">
        {/* SECCIÓN: DATOS PRINCIPALES */}
        <FormSection title="Datos principales">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Título *" className="sm:col-span-2">
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={inputClass}
                placeholder="Ej: Departamento 3 amb en Palermo"
              />
            </Field>

            <Field label="Descripción" className="sm:col-span-2">
              <textarea
                rows={4}
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className={inputClass}
                placeholder="Descripción detallada de la propiedad…"
              />
            </Field>

            <Field label="Operación *">
              <select
                required
                value={form.operationType}
                onChange={(e) => updateField("operationType", e.target.value)}
                className={inputClass}
              >
                {OPERATION_TYPES.map((o) => (
                  <option key={o} value={o}>
                    {OPERATION_LABELS[o]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Tipo *">
              <select
                required
                value={form.propertyType}
                onChange={(e) => updateField("propertyType", e.target.value)}
                className={inputClass}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {PROPERTY_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Precio *">
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Moneda *">
              <select
                required
                value={form.currency}
                onChange={(e) => updateField("currency", e.target.value)}
                className={inputClass}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={isEditMode ? "Estado" : "Estado inicial"}>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className={inputClass}
              >
                {PROPERTY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        {/* SECCIÓN: UBICACIÓN */}
        <FormSection title="Ubicación">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Dirección (Buscador Inteligente)"
              className="sm:col-span-2"
            >
              <AutocompleteInput
                addressValue={form.address}
                onChange={(val) => updateField("address", val)}
                onPlaceSelect={handlePlaceSelect}
              />
            </Field>

            <Field label="País">
              <select
                value={form.countryId}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar…</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Provincia">
              <select
                value={form.provinceId}
                disabled={!form.countryId}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar…</option>
                {provinces.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Ciudad">
              <select
                value={form.cityId}
                disabled={!form.provinceId}
                onChange={(e) => handleCityChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar…</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Barrio">
              <select
                value={form.neighborhoodId}
                disabled={!form.cityId}
                onChange={(e) => updateField("neighborhoodId", e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar…</option>
                {neighborhoods.map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Latitud (Completado automático)">
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => updateField("latitude", e.target.value)}
                className={inputClass}
                min={-90}
                max={90}
              />
            </Field>

            <Field label="Longitud (Completado automático)">
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => updateField("longitude", e.target.value)}
                className={inputClass}
                min={-180}
                max={180}
              />
            </Field>
          </div>
        </FormSection>

        {/* SECCIÓN: CARACTERÍSTICAS */}
        <FormSection title="Características">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Ambientes">
              <input
                type="number"
                min={0}
                value={form.rooms}
                onChange={(e) => updateField("rooms", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Dormitorios">
              <input
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) => updateField("bedrooms", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Baños">
              <input
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) => updateField("bathrooms", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Antigüedad (años)">
              <input
                type="number"
                min={0}
                value={form.propertyAge}
                onChange={(e) => updateField("propertyAge", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Sup. cubierta (m²)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.coveredArea}
                onChange={(e) => updateField("coveredArea", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Sup. total (m²)">
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.totalArea}
                onChange={(e) => updateField("totalArea", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Piso">
              <input
                type="number"
                value={form.floorNumber}
                onChange={(e) => updateField("floorNumber", e.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Cochera">
              <label className="flex h-10 items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={form.garage}
                  onChange={(e) => updateField("garage", e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Tiene cochera
              </label>
            </Field>
          </div>
        </FormSection>

        {/* SECCIÓN: IMÁGENES */}
        <FormSection
          title="Imágenes"
          action={
            <button
              type="button"
              onClick={addImage}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              + Agregar imagen
            </button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img) => (
              <div
                key={img.id}
                className={`overflow-hidden rounded-xl border bg-white transition ${
                  img.isCover
                    ? "border-emerald-500 ring-2 ring-emerald-200"
                    : "border-slate-200"
                }`}
              >
                <div className="relative aspect-4/3 bg-slate-100">
                  {img.preview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.preview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-400">
                      Sin imagen
                    </div>
                  )}

                  {img.isCover && (
                    <div className="absolute left-2 top-2 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow">
                      Portada
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-3">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files ?? []);
                      if (files.length === 0) return;
                      if (files.length === 1) {
                        updateImageFile(img.id, files[0]);
                      } else {
                        const [first, ...rest] = files;
                        setImages((prev) => {
                          const updated = prev.map((row) =>
                            row.id === img.id
                              ? {
                                  ...row,
                                  file: first,
                                  preview: URL.createObjectURL(first),
                                }
                              : row,
                          );
                          const newRows = rest.map((file) => ({
                            id: crypto.randomUUID(),
                            file,
                            preview: URL.createObjectURL(file),
                            isCover: false,
                          }));
                          return [...updated, ...newRows];
                        });
                      }
                      e.target.value = "";
                    }}
                    className={inputClass}
                  />

                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="radio"
                        name="cover"
                        checked={img.isCover}
                        onChange={() => setCoverImage(img.id)}
                      />
                      Portada
                    </label>

                    {images.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImage(img.id)}
                        className="text-sm font-medium text-red-600 hover:underline"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FormSection>

        {/* SECCIÓN: AMENITIES */}
        {amenities.length > 0 && (
          <FormSection title="Amenities">
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {amenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-gray-600"
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => toggleAmenity(amenity.id)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  {amenity.name}
                </label>
              ))}
            </div>
          </FormSection>
        )}

        {/* SECCIÓN: FEATURES ADICIONALES */}
        <FormSection
          title="Features adicionales"
          action={
            <button
              type="button"
              onClick={addFeature}
              className="text-sm font-medium text-emerald-700 hover:underline"
            >
              + Agregar feature
            </button>
          }
        >
          {features.length === 0 ? (
            <p className="text-sm text-slate-500">
              Opcional: orientación, expensas, etc.
            </p>
          ) : (
            <div className="space-y-3">
              {features.map((feature) => (
                <div key={feature.id} className="flex gap-2">
                  <input
                    placeholder="Clave (ej: orientacion)"
                    value={feature.name} // 🌟 Cambiado de featureKey a name
                    onChange={(e) => {
                      const updated = features.map((f) =>
                        f.id === feature.id
                          ? { ...f, name: e.target.value }
                          : f,
                      );
                      setFeatures(updated);
                    }}
                    className={inputClass}
                  />
                  <input
                    placeholder="Valor (ej: Norte)"
                    value={feature.value}
                    onChange={(e) => {
                      const updated = features.map((f) =>
                        f.id === feature.id
                          ? { ...f, value: e.target.value }
                          : f,
                      );
                      setFeatures(updated);
                    }}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(feature.id)}
                    className="shrink-0 text-sm text-red-600 hover:underline"
                  >
                    Quitar
                  </button>
                </div>
              ))}
            </div>
          )}
        </FormSection>

        {/* SECCIÓN: INFORMACIÓN COMERCIAL */}
        <FormSection title="Información comercial">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Contacto">
              <input
                value={form.contact}
                onChange={(e) => updateField("contact", e.target.value)}
                className={inputClass}
                placeholder="Ej: +54 9 11 5555-5555"
              />
            </Field>

            <Field label="Link de publicación">
              <input
                type="url"
                value={form.publicationLink}
                onChange={(e) => updateField("publicationLink", e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </Field>

            <Field label="Servicios disponibles" className="sm:col-span-2">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {AVAILABLE_SERVICES.map((service) => (
                  <label
                    key={service}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 text-gray-600"
                  >
                    <input
                      type="checkbox"
                      checked={form.availableServices.includes(service)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          updateField("availableServices", [
                            ...form.availableServices,
                            service,
                          ]);
                        } else {
                          updateField(
                            "availableServices",
                            form.availableServices.filter((s) => s !== service),
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    {AVAILABLE_SERVICE_LABELS[service]}
                  </label>
                ))}
              </div>
            </Field>

            <Field label="Opciones" className="sm:col-span-2">
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.suitableForMortgageCredit}
                    onChange={(e) =>
                      updateField("suitableForMortgageCredit", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Apta crédito hipotecario
                </label>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.weHaveTheKey}
                    onChange={(e) =>
                      updateField("weHaveTheKey", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Tenemos llave
                </label>
              </div>
            </Field>
          </div>
        </FormSection>

        {/* ACCIONES DEL FORMULARIO */}
        <div className="flex flex-wrap gap-3 border-t border-slate-200 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60 hover:cursor-pointer"
          >
            {isSubmitting
              ? "Guardando…"
              : isEditMode
                ? "Guardar cambios"
                : "Crear propiedad"}
          </button>

          {isEditMode && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </APIProvider>
  );
}

// 📌 SUB-COMPONENTES AUXILIARES SÓLO DE ESTILO (Se quedan al final)
const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2";

function FormSection({
  title,
  children,
  action,
}: {
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-slate-600">
        {label}
      </label>
      {children}
    </div>
  );
}
