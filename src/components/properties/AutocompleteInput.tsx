// @/components/AutocompleteInput.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

interface AutocompleteInputProps {
  addressValue: string;
  onChange: (value: string) => void;
  onPlaceSelect: (address: string, lat: string, lng: string) => void;
}

export function AutocompleteInput({
  addressValue,
  onChange,
  onPlaceSelect,
}: AutocompleteInputProps) {
  const placesLibrary = useMapsLibrary("places");

  const inputRef = useRef<HTMLInputElement>(null);

  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const onPlaceSelectRef = useRef(onPlaceSelect);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onPlaceSelectRef.current = onPlaceSelect;
    onChangeRef.current = onChange;
  }, [onPlaceSelect, onChange]);

  // 👇 SIN useEffect para sincronizar
  const [inputValue, setInputValue] = useState(addressValue || "");

  // 👇 valor real mostrado
  const displayedValue =
    inputValue !== addressValue && addressValue !== ""
      ? addressValue
      : inputValue;

  const hasComma = displayedValue.includes(",");

  useEffect(() => {
    if (!placesLibrary || !inputRef.current) {
      return;
    }

    if (!hasComma) {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);

        autocompleteRef.current = null;

        const containers = document.querySelectorAll(".pac-container");

        containers.forEach((el) => el.remove());
      }

      return;
    }

    if (autocompleteRef.current) {
      return;
    }

    autocompleteRef.current = new placesLibrary.Autocomplete(inputRef.current, {
      fields: ["geometry", "formatted_address", "name"],
      types: ["address"],
    });

    autocompleteRef.current.addListener("place_changed", () => {
      const place = autocompleteRef.current?.getPlace();

      if (!place || !place.geometry || !place.geometry.location) {
        return;
      }

      const fullAddress = place.formatted_address || place.name || "";

      const lat = place.geometry.location.lat().toString();

      const lng = place.geometry.location.lng().toString();

      setInputValue(fullAddress);

      onChangeRef.current(fullAddress);

      onPlaceSelectRef.current(fullAddress, lat, lng);
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);

        autocompleteRef.current = null;
      }
    };
  }, [placesLibrary, hasComma]);

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayedValue}
      onChange={(e) => {
        const val = e.target.value;

        setInputValue(val);

        onChangeRef.current(val);
      }}
      placeholder="Ej: Av. de Mayo 1234, CABA"
      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-500 focus:ring-2 bg-white"
    />
  );
}
