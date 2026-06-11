"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import {
  createProperty,
  updateProperty,
  getCountries,
  getAmenities,
  getProvinces,
  getCities,
  getNeighborhoods,
} from "@/lib/api/properties-api";
import type { GeoItem, Property } from "@/lib/types/property";
import type { FeatureRow, ImageRow } from "@/lib/types/create-property";
import {
  buildPropertyFormData,
  buildPropertyPayload,
  mapPropertyToFeatures,
  mapPropertyToForm,
  mapPropertyToImages,
} from "@/utils/property-mappers";

const emptyForm = {
  title: "",
  description: "",
  operationType: "VENTA",
  propertyType: "DEPARTAMENTO",
  price: "",
  currency: "USD",
  status: "BORRADOR",
  address: "",
  countryId: "",
  provinceId: "",
  cityId: "",
  neighborhoodId: "",
  latitude: "",
  longitude: "",
  rooms: "",
  bedrooms: "",
  bathrooms: "",
  garage: false,
  coveredArea: "",
  totalArea: "",
  propertyAge: "",
  floorNumber: "",
  suitableForMortgageCredit: false,
  availableServices: [] as string[],
  weHaveTheKey: false,
  contact: "",
  publicationLink: "",
};

type UsePropertyFormOptions = {
  propertyId?: string;
  initialProperty?: Property;
  onSuccess?: (property: Property) => void;
};

export function usePropertyForm(options: UsePropertyFormOptions = {}) {
  const { propertyId, initialProperty, onSuccess } = options;
  const isEditMode = Boolean(propertyId && initialProperty);

  const router = useRouter();
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [images, setImages] = useState<ImageRow[]>([
    { id: crypto.randomUUID(), file: null, preview: "", isCover: true },
  ]);
  const [features, setFeatures] = useState<FeatureRow[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);

  const [countries, setCountries] = useState<GeoItem[]>([]);
  const [provinces, setProvinces] = useState<GeoItem[]>([]);
  const [cities, setCities] = useState<GeoItem[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<GeoItem[]>([]);
  const [amenities, setAmenities] = useState<{ id: string; name: string }[]>(
    [],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(!isEditMode);

  useEffect(() => {
    getCountries()
      .then(setCountries)
      .catch(() => setCountries([]));
    getAmenities()
      .then(setAmenities)
      .catch(() => setAmenities([]));
  }, []);

  useEffect(() => {
    if (!initialProperty) return;

    setForm(mapPropertyToForm(initialProperty));
    setImages(mapPropertyToImages(initialProperty));
    setFeatures(mapPropertyToFeatures(initialProperty));
    setSelectedAmenities(initialProperty.amenities.map((a) => a.id));

    async function loadGeoCascade() {
      const countryId = initialProperty!.country?.id;
      if (!countryId) {
        setIsInitialized(true);
        return;
      }

      try {
        const loadedProvinces = await getProvinces(countryId);
        setProvinces(loadedProvinces);

        const provinceId = initialProperty!.province?.id;
        if (!provinceId) {
          setIsInitialized(true);
          return;
        }

        const loadedCities = await getCities(provinceId);
        setCities(loadedCities);

        const cityId = initialProperty!.city?.id;
        if (!cityId) {
          setIsInitialized(true);
          return;
        }

        const loadedNeighborhoods = await getNeighborhoods(cityId);
        setNeighborhoods(loadedNeighborhoods);
      } catch {
        /* geo opcional */
      } finally {
        setIsInitialized(true);
      }
    }

    void loadGeoCascade();
  }, [initialProperty]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function updateField(key: string, value: any) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const handlePlaceSelect = (address: string, lat: string, lng: string) => {
    setForm((prev) => ({ ...prev, address, latitude: lat, longitude: lng }));
  };

  function handleCountryChange(countryId: string) {
    setForm((prev) => ({
      ...prev,
      countryId,
      provinceId: "",
      cityId: "",
      neighborhoodId: "",
    }));
    setCities([]);
    setNeighborhoods([]);

    if (countryId) {
      getProvinces(countryId)
        .then(setProvinces)
        .catch(() => setProvinces([]));
    } else {
      setProvinces([]);
    }
  }

  function handleProvinceChange(provinceId: string) {
    setForm((prev) => ({
      ...prev,
      provinceId,
      cityId: "",
      neighborhoodId: "",
    }));
    setNeighborhoods([]);

    if (provinceId) {
      getCities(provinceId)
        .then(setCities)
        .catch(() => setCities([]));
    } else {
      setCities([]);
    }
  }

  function handleCityChange(cityId: string) {
    setForm((prev) => ({
      ...prev,
      cityId,
      neighborhoodId: "",
    }));

    if (cityId) {
      getNeighborhoods(cityId)
        .then(setNeighborhoods)
        .catch(() => setNeighborhoods([]));
    } else {
      setNeighborhoods([]);
    }
  }

  function toggleAmenity(id: string) {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id],
    );
  }

  function addImage() {
    setImages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        file: null,
        preview: "",
        isCover: prev.length === 0,
      },
    ]);
  }

  function removeImage(id: string) {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (next.length > 0 && !next.some((img) => img.isCover)) {
        next[0].isCover = true;
      }
      return next;
    });
  }

  function setCoverImage(id: string) {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isCover: img.id === id,
      })),
    );
  }

  function updateImageFile(id: string, file: File) {
    const preview = URL.createObjectURL(file);
    setImages((prev) =>
      prev.map((row) => (row.id === id ? { ...row, file, preview } : row)),
    );
  }

  function addFeature() {
    setFeatures((prev) => [
      ...prev,
      { id: crypto.randomUUID(), name: "", value: "" },
    ]);
  }

  function removeFeature(id: string) {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault();

    const price = parseFloat(form.price);
    if (!form.title.trim()) {
      showToast("El título es obligatorio", "warn");
      return;
    }
    if (isNaN(price) || price < 0) {
      showToast("Ingresá un precio válido", "warn");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = buildPropertyPayload(form, selectedAmenities, features);
      const formData = buildPropertyFormData(payload, images);

      if (isEditMode && propertyId) {
        const updated = await updateProperty(propertyId, formData);
        showToast(
          `Propiedad "${updated.title}" actualizada correctamente.`,
          "success",
        );
        onSuccess?.(updated);
      } else {
        const created = await createProperty(formData);
        showToast(
          `Propiedad "${created.title}" creada correctamente.`,
          "success",
        );
        setTimeout(() => router.push("/dashboard"), 3000);
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : isEditMode
            ? "No se pudo actualizar la propiedad"
            : "No se pudo crear la propiedad";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    form,
    updateField,
    handlePlaceSelect,
    handleCountryChange,
    handleProvinceChange,
    handleCityChange,
    images,
    setImages,
    addImage,
    removeImage,
    setCoverImage,
    updateImageFile,
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
  };
}
