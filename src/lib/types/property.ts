export type PropertyOperationType = 'VENTA' | 'ALQUILER' | 'ALQUILER_TEMPORAL';

export type PropertyType =
  | 'CASA'
  | 'DEPARTAMENTO'
  | 'LOCAL'
  | 'TERRENO'
  | 'OFICINA'
  | 'COCHERA'
  | 'PH'
  | 'QUINTA';

export type Currency = 'ARS' | 'USD' | 'EUR';

export type PropertyStatus =
  | 'BORRADOR'
  | 'PUBLICADA'
  | 'RESERVADA'
  | 'VENDIDA'
  | 'ALQUILADA'
  | 'INACTIVA';

export interface GeoItem {
  id: string;
  name: string;
}

export interface PropertyImage {
  id: string;
  imageUrl: string;
  position: number;
  isCover: boolean;
  createdAt: string;
}

export interface Property {
  id: string;
  title: string;
  description: string | null;
  operationType: PropertyOperationType;
  propertyType: PropertyType;
  price: number;
  currency: Currency;
  address: string | null;
  country: GeoItem | null;
  province: GeoItem | null;
  city: GeoItem | null;
  neighborhood: GeoItem | null;
  latitude: number | null;
  longitude: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  garage: boolean;
  coveredArea: number | null;
  totalArea: number | null;
  propertyAge: number | null;
  floorNumber: number | null;
  status: PropertyStatus;
  publishedAt: string | null;
  assignedSeller: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdBy: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  images: PropertyImage[];
  amenities: { id: string; name: string }[];
  features: { id: string; featureKey: string; featureValue: string }[];
  contact: string | null;
  publicationLink: string | null;
  weHaveTheKey: boolean;
  availableServices: AvailableService[] | null;
  suitableForMortgageCredit: boolean;
}

export interface PaginatedProperties {
  data: Property[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PropertyFilters {
  search?: string;
  status?: PropertyStatus | '';
  operationType?: PropertyOperationType | '';
  propertyType?: PropertyType | '';
  currency?: Currency | '';
  provinceId?: string;
  cityId?: string;
  neighborhoodId?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: number;
  limit?: number;
}

export const PROPERTY_STATUSES: PropertyStatus[] = [
  'BORRADOR',
  'PUBLICADA',
  'RESERVADA',
  'VENDIDA',
  'ALQUILADA',
  'INACTIVA',
];

export const OPERATION_TYPES: PropertyOperationType[] = [
  'VENTA',
  'ALQUILER',
  'ALQUILER_TEMPORAL',
];

export const PROPERTY_TYPES: PropertyType[] = [
  'CASA',
  'DEPARTAMENTO',
  'LOCAL',
  'TERRENO',
  'OFICINA',
  'COCHERA',
  'PH',
  'QUINTA',
];

export const CURRENCIES: Currency[] = ['ARS', 'USD', 'EUR'];

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  BORRADOR: 'Borrador',
  PUBLICADA: 'Publicada',
  RESERVADA: 'Reservada',
  VENDIDA: 'Vendida',
  ALQUILADA: 'Alquilada',
  INACTIVA: 'Inactiva',
};

export const OPERATION_LABELS: Record<PropertyOperationType, string> = {
  VENTA: 'Venta',
  ALQUILER: 'Alquiler',
  ALQUILER_TEMPORAL: 'Alquiler temporal',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  CASA: 'Casa',
  DEPARTAMENTO: 'Departamento',
  LOCAL: 'Local',
  TERRENO: 'Terreno',
  OFICINA: 'Oficina',
  COCHERA: 'Cochera',
  PH: 'PH',
  QUINTA: 'Quinta',
};

export const DEFAULT_FILTERS: PropertyFilters = {
  search: '',
  status: '',
  operationType: '',
  propertyType: '',
  currency: '',
  provinceId: '',
  cityId: '',
  neighborhoodId: '',
  minPrice: '',
  maxPrice: '',
  page: 1,
  limit: 12,
};

export const AVAILABLE_SERVICES = [
  'agua',
  'luz',
  'gas',
  'cloacas',
  'cordon_cuneta',
  'pavimento',
] as const;

export type AvailableService =
  (typeof AVAILABLE_SERVICES)[number];

export const AVAILABLE_SERVICE_LABELS: Record<
  AvailableService,
  string
> = {
  agua: 'Agua',
  luz: 'Luz',
  gas: 'Gas',
  cloacas: 'Cloacas',
  cordon_cuneta: 'Cordón cuneta',
  pavimento: 'Pavimento',
};