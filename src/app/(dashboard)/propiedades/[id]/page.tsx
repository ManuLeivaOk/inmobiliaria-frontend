/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";

import { PropertyCreateForm } from "@/components/properties/property-create-form";
import { useAuth } from "@/contexts/auth-context";
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/types/property";
import type { Property } from "@/lib/types/property";
import { formatPrice } from "@/lib/utils/property-format";
import { getProperty } from "@/lib/api/properties-api";
import { Amenity, FeatureResponse } from "@/lib/types/create-property";
import { resolveImageUrl } from "@/utils/image-url";
import Image from "next/image";

export default function Page() {
  const params = useParams();
  const id = params?.id as string;
  const { isAuthenticated, user } = useAuth();

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  const canEdit =
    isAuthenticated && (user?.role === "ADMIN" || user?.role === "VENDEDOR");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const data = await getProperty(id);

        if (!data) {
          setError(true);
          return;
        }

        setProperty(data);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 animate-pulse">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="h-4 w-32 bg-slate-200 rounded"></div>
          <div className="h-[450px] bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 bg-white rounded-2xl border border-slate-200 p-6"></div>
              <div className="h-24 bg-white rounded-2xl border border-slate-200 p-6"></div>
            </div>
            <div className="h-40 bg-white rounded-2xl border border-slate-200 p-6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return notFound();
  }

  if (isEditing) {
    return (
      <main className="min-h-screen bg-slate-50 py-8 text-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors gap-1.5"
            >
              <svg
                className="h-4 w-4 stroke-[2.5]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Volver al detalle
            </button>

            <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200">
              Modo edición
            </span>
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Editar propiedad
            </h1>
            <p className="mt-1 text-sm text-slate-500">{property.title}</p>
          </div>

          <PropertyCreateForm
            property={property}
            onCancel={() => setIsEditing(false)}
            onSuccess={(updated) => {
              setProperty(updated);
              setIsEditing(false);
              setCurrentImageIndex(0);
            }}
          />
        </div>
      </main>
    );
  }

  // Locación armada según tu JSON estructurado
  const fullLocation = [
    property.address,
    property.neighborhood?.name,
    property.city?.name,
    property.province?.name,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <main className="min-h-screen bg-slate-50 py-8 text-slate-900 selection:bg-emerald-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Topbar / Navegación */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-emerald-700 transition-colors gap-1.5"
          >
            <svg
              className="h-4 w-4 stroke-[2.5]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Volver al listado
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {property.status && (
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${
                  property.status === "BORRADOR"
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                Estado interno: {property.status}
              </span>
            )}

            {canEdit && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-800 hover:bg-emerald-100 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                Editar propiedad
              </button>
            )}
          </div>
        </div>

        {/* Carrusel Eficiente de una Sola Imagen a la vez */}
        <section className="mb-8 overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 p-2">
          <div className="relative aspect-video w-full md:h-[480px] bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center group">
            {property?.images && property.images.length > 0 ? (
              <>
                {/* 🌟 FILTRADO ESTRICTO: Solo se monta en el DOM la imagen activa actual */}
                {property.images.map((img: any, index: number) => {
                  if (index !== currentImageIndex) return null; // No consume ancho de banda de red
                  return (
                    <Image
                      key={img.id}
                      src={resolveImageUrl(img.imageUrl)}
                      alt={`${property.title} - Foto ${index + 1}`}
                      fill
                      sizes="100vw"
                      priority={index === 0}
                      className="object-contain select-none animate-fade-in"
                    />
                  );
                })}

                {/* Indicador de posición (ej: 1 / 5) en la esquina superior derecha */}
                <div className="absolute top-4 right-4 bg-slate-900/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full z-10">
                  {currentImageIndex + 1} / {property.images.length}
                </div>

                {/* Flecha Izquierda (Solo aparece si hay más de 1 imagen) */}
                {property.images.length > 1 && (
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? property.images.length - 1 : prev - 1,
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                    aria-label="Imagen anterior"
                  >
                    <svg
                      className="h-5 w-5 stroke-[2.5]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 19.5L8.25 12l7.5-7.5"
                      />
                    </svg>
                  </button>
                )}

                {/* Flecha Derecha (Solo aparece si hay más de 1 imagen) */}
                {property.images.length > 1 && (
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === property.images.length - 1 ? 0 : prev + 1,
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-slate-800 p-2.5 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 z-10"
                    aria-label="Siguiente imagen"
                  >
                    <svg
                      className="h-5 w-5 stroke-[2.5]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.25 4.5l7.5 7.5-7.5 7.5"
                      />
                    </svg>
                  </button>
                )}
              </>
            ) : (
              /* Estado vacío si la propiedad literalmente no tiene imágenes en la base de datos */
              <div className="text-slate-400 flex flex-col items-center gap-2">
                <svg
                  className="h-12 w-12 text-slate-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H2.25A1.5 1.5 0 00.75 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
                <span className="text-sm font-medium">
                  Sin imágenes disponibles
                </span>
              </div>
            )}
          </div>
        </section>

        {/* Estructura Principal en 2 Columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna de Datos Básicos y Fichas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Encabezado Principal */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  {
                    OPERATION_LABELS[
                      property.operationType as keyof typeof OPERATION_LABELS
                    ]
                  }
                </span>

                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                  {
                    PROPERTY_TYPE_LABELS[
                      property.propertyType as keyof typeof PROPERTY_TYPE_LABELS
                    ]
                  }
                </span>

                {property.suitableForMortgageCredit && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 border border-blue-200 flex items-center gap-1">
                    ✨ Apto Crédito Hipotecario
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl tracking-tight">
                {property.title}
              </h1>

              <p className="mt-2 text-sm text-slate-500 flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-slate-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                </svg>

                {fullLocation || "Dirección no disponible"}
              </p>

              <div className="mt-4 border-t border-slate-100 pt-4 flex flex-wrap items-baseline justify-between gap-2">
                <p className="text-3xl font-extrabold text-emerald-800 tracking-tight">
                  {formatPrice(property.price, property.currency)}
                </p>

                {property.propertyAge != null && (
                  <span className="text-sm text-slate-500 font-medium">
                    Antigüedad: {property.propertyAge} años
                  </span>
                )}
              </div>
            </section>

            {/* Ficha Técnica Métrica */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Ambientes
                </span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {property.rooms ?? "-"}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Dormitorios
                </span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {property.bedrooms ?? "0"}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Baños
                </span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {property.bathrooms ?? "-"}
                </span>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Sup. Cubierta
                </span>
                <span className="text-xl font-bold text-slate-800 mt-1 block">
                  {property.coveredArea ? `${property.coveredArea} m²` : "-"}
                </span>
              </div>
            </section>

            {/* Descripción */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-3">
                Descripción de la propiedad
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </section>

            {/* Servicios y Características Técnicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Servicios Disponibles */}
              {property.availableServices &&
                property.availableServices.length > 0 && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                      Servicios Conectados
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {property.availableServices.map(
                        (service: string, index: number) => (
                          <span
                            key={index}
                            className="bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-1.5 text-xs font-semibold text-emerald-800 capitalize flex items-center gap-1"
                          >
                            ✓ {service}
                          </span>
                        ),
                      )}
                    </div>
                  </section>
                )}

              {/* Atributos / Características del Vector features */}
              {property.features && property.features.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Detalles Técnicos
                  </h2>
                  <div className="space-y-2">
                    {property?.features &&
                      property?.features?.length > 0 &&
                      property.features.map((feat: FeatureResponse) => (
                        <div
                          key={feat.id}
                          className="flex justify-between border-b border-slate-100 pb-1.5 text-xs"
                        >
                          <span className="text-slate-500 capitalize font-medium">
                            {feat.featureKey}:
                          </span>
                          <span className="font-bold text-slate-800">
                            {feat.featureValue}
                          </span>
                        </div>
                      ))}

                    {/* Las superficies las dejamos acá abajo fijas por si querés mostrarlas junto a los detalles técnicos */}
                    {property.totalArea && (
                      <div className="flex justify-between border-b border-slate-100 pb-1.5 text-xs">
                        <span className="text-slate-500 font-medium">
                          Superficie Total:
                        </span>
                        <span className="font-bold text-slate-800">
                          {property.totalArea} m²
                        </span>
                      </div>
                    )}
                    {property.floorNumber && (
                      <div className="flex justify-between border-b border-slate-100 pb-1.5 text-xs">
                        <span className="text-slate-500 font-medium">
                          Piso:
                        </span>
                        <span className="font-bold text-slate-800">
                          {property.floorNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </section>
              )}
            </div>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900 mb-3">
                  Amenities del Complejo / Edificio
                </h2>
                <div className="flex flex-wrap gap-2">
                  {property.amenities.map((amenity: Amenity) => (
                    <span
                      key={amenity.id}
                      className="bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-700"
                    >
                      🏢 {amenity.name}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha: Tarjeta Comercial de Contacto */}
          <div className="space-y-6">
            <aside className="sticky top-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Información Comercial
              </h3>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-medium text-slate-500">
                    Cochera / Garaje:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {property.garage ? "Sí posee" : "No posee"}
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="font-medium text-slate-500">
                    Llave en oficina:
                  </span>
                  <span className="font-semibold text-slate-800">
                    {property.weHaveTheKey ? "Disponible" : "Coordinar"}
                  </span>
                </div>

                {/* Vendedor Asignado */}
                {property.assignedSeller && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Asesor Comercial:
                    </span>
                    <p className="font-bold text-slate-800">
                      {property.assignedSeller.firstName}{" "}
                      {property.assignedSeller.lastName}
                    </p>
                    <p className="text-xs text-slate-500 break-all">
                      {property.assignedSeller.email}
                    </p>
                  </div>
                )}
              </div>

              {/* Botón de WhatsApp Directo con Mensaje Personalizado */}
              {property.contact && (
                <a
                  href={`https://wa.me/${property.contact.replace(/[^0-9]/g, "")}?text=Hola!%20Estoy%20interesado%20en%20el%20aviso:%20${encodeURIComponent(property.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-semibold text-white shadow-md transition-colors"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397 0 11.966 0c3.178.001 6.169 1.24 8.424 3.496 2.254 2.256 3.491 5.249 3.491 8.425 0 6.574-5.337 11.923-11.905 11.923-2.017-.001-4.004-.512-5.765-1.488L0 24zm6.19-4.754l.369.219c1.61.955 3.565 1.46 5.566 1.465 5.485 0 9.948-4.471 9.953-9.963.003-2.659-1.03-5.16-2.912-7.04C17.342 1.947 14.846.91 12.19.91a9.954 9.954 0 0 0-9.953 9.963c-.001 2.05.539 4.05 1.564 5.807l.24.413-1.012 3.693 3.774-1.002z" />
                  </svg>
                  Consultar por WhatsApp
                </a>
              )}

              {/* Enlace de Publicación cruzada (ZonaProp u otros) */}
              {property.publicationLink && (
                <a
                  href={property.publicationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors underline pt-2"
                >
                  Ver ficha externa en Facebook
                </a>
              )}
            </aside>
          </div>
        </div>
      </div>
    </main>
  );
}
