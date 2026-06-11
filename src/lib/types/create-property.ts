import type {
  AvailableService,
  Currency,
  PropertyOperationType,
  PropertyStatus,
  PropertyType,
} from "@/lib/types/property";

export interface CreatePropertyImageInput {
  imageUrl: string;
  position?: number;
  isCover?: boolean;
}

export interface CreatePropertyFeatureInput {
  featureKey: string;
  featureValue: string;
}

export interface CreatePropertyPayload {
  title: string;
  description?: string;
  operationType: PropertyOperationType;
  propertyType: PropertyType;
  price: number;
  currency: Currency;
  address?: string;
  countryId?: number;
  provinceId?: number;
  cityId?: number;
  neighborhoodId?: number;
  latitude?: number;
  longitude?: number;
  rooms?: number;
  bedrooms?: number;
  bathrooms?: number;
  garage?: boolean;
  coveredArea?: number;
  totalArea?: number;
  propertyAge?: number;
  floorNumber?: number;
  status?: PropertyStatus;
  assignedSellerId?: string;
  images?: CreatePropertyImageInput[];
  amenityIds?: number[];
  features?: CreatePropertyFeatureInput[];
  suitableForMortgageCredit?: boolean;
  availableServices?: AvailableService[];
  weHaveTheKey?: boolean;
  contact?: string;
  publicationLink?: string;
}

export interface Amenity {
  id: string;
  name: string;
}

export interface ImageRow {
  id: string;
  file: File | null;
  preview: string;
  isCover: boolean;
  existingImageId?: string;
  imageUrl?: string;
}

export interface FeatureRow {
  id: string;        
  name: string;     
  value: string;     
}

export interface FeatureResponse {
  id: string;
  featureKey: string;
  featureValue: string;
}