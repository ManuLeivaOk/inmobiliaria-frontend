import type {
  CreatePropertyPayload,
  FeatureRow,
  ImageRow,
} from "@/lib/types/create-property";
import type { Property } from "@/lib/types/property";

function parseOptionalInt(value: string): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const n = parseInt(value, 10);
  return Number.isNaN(n) ? undefined : n;
}

function parseOptionalFloat(value: string): number | undefined {
  if (!value || value.trim() === "") return undefined;
  const n = parseFloat(value);
  return Number.isNaN(n) ? undefined : n;
}

export function getRelativeImageUrl(url: string) {
  if (!url) return "";
  const cleanUrl = url
    .replace("http://127.0.0.1:3000", "")
    .replace("http://localhost:3000", "");
  return cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapPropertyToForm(property: Property) {
  return {
    title: property.title,
    description: property.description ?? "",
    operationType: property.operationType,
    propertyType: property.propertyType,
    price: String(property.price),
    currency: property.currency,
    status: property.status,
    address: property.address ?? "",
    countryId: property.country?.id ?? "",
    provinceId: property.province?.id ?? "",
    cityId: property.city?.id ?? "",
    neighborhoodId: property.neighborhood?.id ?? "",
    latitude: property.latitude != null ? String(property.latitude) : "",
    longitude: property.longitude != null ? String(property.longitude) : "",
    rooms: property.rooms != null ? String(property.rooms) : "",
    bedrooms: property.bedrooms != null ? String(property.bedrooms) : "",
    bathrooms: property.bathrooms != null ? String(property.bathrooms) : "",
    garage: property.garage,
    coveredArea:
      property.coveredArea != null ? String(property.coveredArea) : "",
    totalArea: property.totalArea != null ? String(property.totalArea) : "",
    propertyAge:
      property.propertyAge != null ? String(property.propertyAge) : "",
    floorNumber:
      property.floorNumber != null ? String(property.floorNumber) : "",
    suitableForMortgageCredit: property.suitableForMortgageCredit,
    availableServices: property.availableServices ?? [],
    weHaveTheKey: property.weHaveTheKey,
    contact: property.contact ?? "",
    publicationLink: property.publicationLink ?? "",
  };
}

export function mapPropertyToImages(property: Property): ImageRow[] {
  if (!property.images?.length) {
    return [
      { id: crypto.randomUUID(), file: null, preview: "", isCover: true },
    ];
  }

  return [...property.images]
    .sort((a, b) => a.position - b.position)
    .map((img) => ({
      id: img.id,
      file: null,
      preview: getRelativeImageUrl(img.imageUrl),
      isCover: img.isCover,
      existingImageId: img.id,
      imageUrl: img.imageUrl,
    }));
}

export function mapPropertyToFeatures(property: Property): FeatureRow[] {
  return (property.features ?? []).map((feat) => ({
    id: feat.id,
    name: feat.featureKey,
    value: feat.featureValue,
  }));
}

export function buildPropertyPayload(
  form: any,
  selectedAmenities: string[],
  features: FeatureRow[],
): CreatePropertyPayload {
  const validFeatures = features
    .filter((f) => f.name.trim() && f.value.trim())
    .map((f) => ({
      featureKey: f.name.trim(),
      featureValue: f.value.trim(),
    }));

  return {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    operationType: form.operationType,
    propertyType: form.propertyType,
    price: parseFloat(form.price),
    currency: form.currency,
    status: form.status,
    address: form.address.trim() || undefined,
    countryId: parseOptionalInt(form.countryId),
    provinceId: parseOptionalInt(form.provinceId),
    cityId: parseOptionalInt(form.cityId),
    neighborhoodId: parseOptionalInt(form.neighborhoodId),
    latitude: parseOptionalFloat(form.latitude),
    longitude: parseOptionalFloat(form.longitude),
    rooms: parseOptionalInt(form.rooms),
    bedrooms: parseOptionalInt(form.bedrooms),
    bathrooms: parseOptionalInt(form.bathrooms),
    garage: form.garage,
    coveredArea: parseOptionalFloat(form.coveredArea),
    totalArea: parseOptionalFloat(form.totalArea),
    propertyAge: parseOptionalInt(form.propertyAge),
    floorNumber: parseOptionalInt(form.floorNumber),
    amenityIds: selectedAmenities.length ? selectedAmenities.map((id) => parseInt(id, 10)) : undefined,
    features: validFeatures.length ? validFeatures : undefined,
    suitableForMortgageCredit: form.suitableForMortgageCredit,
    availableServices: form.availableServices.length ? form.availableServices : undefined,
    weHaveTheKey: form.weHaveTheKey,
    contact: form.contact.trim() || undefined,
    publicationLink: form.publicationLink.trim() || undefined,
  };
}

export function buildPropertyFormData(
  payload: CreatePropertyPayload,
  images: ImageRow[],
): FormData {
  const formData = new FormData();

  const existingImages = images
    .filter((img) => !img.file && img.imageUrl)
    .map((img, index) => ({
      imageUrl: img.imageUrl!,
      position: index,
      isCover: img.isCover,
    }));

  const fullPayload: CreatePropertyPayload = {
    ...payload,
    images: existingImages.length ? existingImages : undefined,
  };

  formData.append("data", JSON.stringify(fullPayload));

  const newImages = images.filter((img) => img.file);
  newImages.forEach((img, index) => {
    if (!img.file) return;
    formData.append("images", img.file);
    formData.append(
      "imagesMetadata",
      JSON.stringify({
        position: existingImages.length + index,
        isCover: img.isCover,
      }),
    );
  });

  return formData;
}