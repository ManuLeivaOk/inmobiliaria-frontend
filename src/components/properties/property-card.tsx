/* eslint-disable @next/next/no-img-element */
import Link from "next/link"; // 🌟 Importamos Link
import type { Property } from "@/lib/types/property";
import { OPERATION_LABELS, PROPERTY_TYPE_LABELS } from "@/lib/types/property";
import { formatPrice, StatusBadge } from "@/lib/utils/property-format";
import { resolveImageUrl } from "@/utils/image-url";
import Image from "next/image";

export function PropertyCard({ property }: { property: Property }) {
  const cover =
    property.images.find((img) => img.isCover) ?? property.images[0];

  const location = [property.neighborhood?.name, property.city?.name]
    .filter(Boolean)
    .join(", ");

  return (
    // 🌟 Envolvemos en un Link apuntando al ID de la propiedad
    <Link
      href={`/propiedades/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <article className="flex flex-1 flex-col">
        <div className="relative aspect-16/10 bg-slate-100 overflow-hidden">
          {cover ? (
            <Image
              src={resolveImageUrl(cover.imageUrl)}
              alt={property.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-slate-400">
              Sin imagen
            </div>
          )}
          <div className="absolute left-3 top-3 z-10">
            <StatusBadge status={property.status} />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div className="mb-1 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
              {property.title}
            </h3>
          </div>

          <p className="text-lg font-bold text-emerald-800">
            {formatPrice(property.price, property.currency)}
          </p>

          <p className="mt-1 text-sm text-slate-600">
            {OPERATION_LABELS[property.operationType]} ·{" "}
            {PROPERTY_TYPE_LABELS[property.propertyType]}
          </p>

          {location && (
            <p className="mt-1 text-sm text-slate-500">{location}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-500">
            {property.bedrooms != null && (
              <span>{property.bedrooms} dorm.</span>
            )}
            {property.bathrooms != null && (
              <span>{property.bathrooms} baños</span>
            )}
            {property.coveredArea != null && (
              <span>{property.coveredArea} m² cub.</span>
            )}
            {property.garage && <span>Cochera</span>}
          </div>

          {/* MAPA ESTÁTICO DE GOOGLE MAPS */}
          {property.latitude != null && property.longitude != null && (
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-opacity opacity-90 group-hover:opacity-100">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${property.latitude},${property.longitude}&zoom=15&size=600x300&scale=2&markers=color:0x065f46%7C${property.latitude},${property.longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                alt={`Mapa de ubicación de ${property.title}`}
                loading="lazy"
                className="h-[140px] w-full object-cover"
              />
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
