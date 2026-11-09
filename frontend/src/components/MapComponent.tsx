"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LocationPickerView,
  setupMapWorker,
  type PickerLocation,
  type Venue,
} from "@amir83nasr/map";
import "@amir83nasr/map/styles.css";
import { RequestItem } from "../types";
import { determineRegion } from "../utils/regionUtils";

// MapLibre loads its worker from a separate file. `scripts/copy-maplibre-worker.mjs`
// copies it from `node_modules/maplibre-gl/dist` before dev/build.
if (typeof window !== "undefined") {
  setupMapWorker("/maplibre/maplibre-gl-worker.mjs");
}

interface MapComponentProps {
  pickerMode?: boolean;
  selectedCoordinates?: { lat: number; lng: number } | null;
  onCoordinatesChange?: (
    coords: { lat: number; lng: number },
    region: string,
  ) => void;
  /** Fired when the user confirms a point inside the picker. */
  onConfirm?: (coords: { lat: number; lng: number }, region: string) => void;
  items?: RequestItem[];
  onSelectItem?: (item: RequestItem) => void;
  theme?: "light" | "dark";
  /** Show the package's "my location" (GPS) control in display mode. */
  locateButton?: boolean;
}

// Qom coordinates as starting default
const DEFAULT_CENTER = { lat: 34.641, lng: 50.88 };

const toVenue = (item: RequestItem): Venue => ({
  name: item.title,
  lat: item.coordinates.lat,
  lng: item.coordinates.lng,
});

const hasCoordinates = (item: RequestItem) =>
  Number.isFinite(item.coordinates?.lat) &&
  Number.isFinite(item.coordinates?.lng);

export default function MapComponent({
  pickerMode = false,
  selectedCoordinates,
  onCoordinatesChange,
  onConfirm,
  items = [],
  onSelectItem,
  theme,
  locateButton = false,
}: MapComponentProps) {
  // The picker is uncontrolled after mount, so remember the last emitted point
  // to avoid feeding the same coordinates back into the parent state.
  const lastEmittedRef = useRef<string | null>(null);

  // Callers that do not pass `theme` (e.g. the profile dialog) still follow the
  // app's class-based dark mode.
  const [documentTheme, setDocumentTheme] = useState<"light" | "dark">(() =>
    typeof document !== "undefined" &&
    document.documentElement.classList.contains("dark")
      ? "dark"
      : "light",
  );

  useEffect(() => {
    const root = document.documentElement;
    const syncTheme = () =>
      setDocumentTheme(root.classList.contains("dark") ? "dark" : "light");

    syncTheme();
    const observer = new MutationObserver(syncTheme);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const resolvedTheme = theme ?? documentTheme;

  const handleCoordinatesChange = (location: PickerLocation) => {
    if (!onCoordinatesChange) return;

    const key = `${location.lat.toFixed(7)},${location.lng.toFixed(7)}`;
    if (lastEmittedRef.current === key) return;
    lastEmittedRef.current = key;

    onCoordinatesChange(
      { lat: location.lat, lng: location.lng },
      determineRegion(location.lat, location.lng),
    );
  };

  const handleConfirm = (location: PickerLocation) => {
    const coords = { lat: location.lat, lng: location.lng };
    const region = determineRegion(location.lat, location.lng);

    if (onConfirm) {
      onConfirm(coords, region);
      return;
    }

    onCoordinatesChange?.(coords, region);
  };

  const venues = useMemo(
    () => items.filter(hasCoordinates).map(toVenue),
    [items],
  );

  // Engine options are mount-only; remount when the displayed markers change.
  const markersKey = useMemo(
    () => venues.map((v) => `${v.name}@${v.lat},${v.lng}`).join("|"),
    [venues],
  );

  const initialCenter = pickerMode
    ? (selectedCoordinates ?? DEFAULT_CENTER)
    : (venues[0] ?? DEFAULT_CENTER);

  if (pickerMode) {
    return (
      <LocationPickerView
        theme={resolvedTheme}
        map={{
          center: initialCenter,
          zoom: 14,
          minZoom: 10,
          maxZoom: 18,
        }}
        controls={{
          gps: true,
          confirmButton: true,
          searchTrigger: true,
          developers: false,
          themeToggle: false,
        }}
        search={{ enabled: true }}
        onLocationChange={handleCoordinatesChange}
        onPick={handleCoordinatesChange}
        onConfirm={handleConfirm}
        style={{ height: "100%", width: "100%" }}
      />
    );
  }

  const handleSelectVenue = (location: PickerLocation) => {
    const item = items.find(
      (candidate) =>
        hasCoordinates(candidate) &&
        Math.abs(candidate.coordinates.lat - location.lat) < 1e-6 &&
        Math.abs(candidate.coordinates.lng - location.lng) < 1e-6,
    );

    if (item) onSelectItem?.(item);
  };

  return (
    <LocationPickerView
      key={markersKey || "empty"}
      theme={resolvedTheme}
      className="map-display"
      map={{
        center: initialCenter,
        zoom: 12,
        minZoom: 10,
        maxZoom: 18,
      }}
      markers={venues}
      controls={{
        gps: locateButton,
        confirmButton: false,
        searchTrigger: false,
        developers: false,
        themeToggle: false,
      }}
      search={{ enabled: false }}
      sheet={{ enabled: false }}
      behavior={{ resolveOnMove: false, snapToRoad: false }}
      onPick={handleSelectVenue}
      style={{ height: "100%", width: "100%" }}
    />
  );
}
