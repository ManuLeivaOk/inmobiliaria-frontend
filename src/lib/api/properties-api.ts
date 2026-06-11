import type {
  Amenity,
  CreatePropertyPayload,
} from "@/lib/types/create-property";
import type {
  GeoItem,
  PaginatedProperties,
  Property,
  PropertyFilters,
} from "@/lib/types/property";
import { buildQueryString } from "@/lib/utils/query-string";
import { apiRequest } from "./client";

function toQueryParams(filters: PropertyFilters) {
  return buildQueryString({
    page: filters.page,
    limit: filters.limit,
    search: filters.search?.trim(),
    status: filters.status || undefined,
    operationType: filters.operationType || undefined,
    propertyType: filters.propertyType || undefined,
    currency: filters.currency || undefined,
    cityId: filters.cityId || undefined,
    neighborhoodId: filters.neighborhoodId || undefined,
    minPrice: filters.minPrice || undefined,
    maxPrice: filters.maxPrice || undefined,
  });
}

export function getProperties(filters: PropertyFilters) {
  return apiRequest<PaginatedProperties>(
    `/properties${toQueryParams(filters)}`,
  );
}

export function getProperty(id: string) {
  return apiRequest<Property>(`/properties/${id}`);
}

export async function createProperty(formData: FormData) {
  return apiRequest<Property>("/properties", {
    method: "POST",
    body: formData,
  });
}

export async function updateProperty(id: string, formData: FormData) {
  return apiRequest<Property>(`/properties/${id}`, {
    method: "PATCH",
    body: formData,
  });
}

export function getAmenities() {
  return apiRequest<Amenity[]>("/amenities");
}

export function getCountries() {
  return apiRequest<GeoItem[]>("/geo/countries");
}

export function getProvinces(countryId?: string) {
  const qs = countryId ? `?countryId=${countryId}` : "";
  return apiRequest<GeoItem[]>(`/geo/provinces${qs}`);
}

export function getCities(provinceId?: string) {
  const qs = provinceId ? `?provinceId=${provinceId}` : "";
  return apiRequest<GeoItem[]>(`/geo/cities${qs}`);
}

export function getNeighborhoods(cityId?: string) {
  const qs = cityId ? `?cityId=${cityId}` : "";
  return apiRequest<GeoItem[]>(`/geo/neighborhoods${qs}`);
}
