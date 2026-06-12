/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { RequestItem } from '../types';
import { Location01Icon } from 'hugeicons-react';
import { toPersianDigits } from '../utils/numberUtils';

interface MapComponentProps {
  pickerMode?: boolean;
  selectedCoordinates?: { lat: number; lng: number } | null;
  onCoordinatesChange?: (
    coords: { lat: number; lng: number },
    region: string,
  ) => void;
  items?: RequestItem[];
  onSelectItem?: (item: RequestItem) => void;
  theme?: 'light' | 'dark';
}

// Function to generate dynamic inline SVG markers to bypass standard Leaflet asset link breaks
const createMarkerIcon = (type: 'problem' | 'idea' | 'picker') => {
  const color =
    type === 'problem' ? '#f87171' : type === 'idea' ? '#10b981' : '#0891b2'; // red-500, emerald-500, cyan-600
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center transition-transform hover:scale-110">
        <svg width="36" height="42" viewBox="0 0 36 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 0C8.06 0 0 8.06 0 18C0 29.5 16.2 41.1 16.9 41.5C17.6 42.1 18.4 42.1 19.1 41.5C19.8 41.1 36 29.5 36 18C36 8.06 27.94 0 18 0Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
          <circle cx="18" cy="18" r="6.5" fill="#ffffff" />
        </svg>
        <span class="absolute top-[10px] w-2.5 h-2.5 rounded-full ${type === 'problem' ? 'bg-red-500' : type === 'idea' ? 'bg-emerald-500' : 'bg-cyan-600'}"></span>
      </div>
    `,
    iconSize: [36, 42],
    iconAnchor: [18, 42],
    popupAnchor: [0, -36],
    className: 'custom-svg-marker',
  });
};

// Simple heuristic to compute Municipal regions in Tehran
const determineTehranRegion = (lat: number, lng: number): string => {
  if (lat > 35.78) return 'منطقه ۱ (شمال تهران)';
  if (lat > 35.75 && lng < 51.38) return 'منطقه ۲ (شمال غربی)';
  if (lat > 35.75 && lng >= 51.38) return 'منطقه ۳ (شمال شرقی)';
  if (lng < 51.34) return 'منطقه ۵ (غرب تهران)';
  if (lat < 35.7) return 'منطقه ۱۶ (جنوب تهران)';
  if (lng > 51.44) return 'منطقه ۴ (شرق تهران)';

  // Random matching for other sectors
  const regions = [
    'منطقه ۶ (مرکزی)',
    'منطقه ۷',
    'منطقه ۸',
    'منطقه ۱۰',
    'منطقه ۱۱ (مرکزی)',
    'منطقه ۱۲ (بازار)',
  ];
  const index = Math.floor((lat + lng) * 100) % regions.length;
  return regions[index];
};

export default function MapComponent({
  pickerMode = false,
  selectedCoordinates,
  onCoordinatesChange,
  items = [],
  onSelectItem,
  theme = 'light',
}: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const pickerMarkerRef = useRef<L.Marker | null>(null);
  const itemMarkersRef = useRef<L.Marker[]>([]);

  // Tehran coordinates as starting default
  const defaultCenter: [number, number] = [35.7219, 51.4055];

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // 1. Initialize Map
    const initialCenter: [number, number] = selectedCoordinates
      ? [selectedCoordinates.lat, selectedCoordinates.lng]
      : items.length > 0
        ? [items[0].coordinates.lat, items[0].coordinates.lng]
        : defaultCenter;

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: pickerMode ? 14 : 12,
      zoomControl: true,
      maxZoom: 18,
      minZoom: 10,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // 2. Add Adaptive Mode Street Tiles (Voyager theme for Light Mode, Dark theme for Dark Mode)
    const isDarkGlobal =
      document.documentElement.classList.contains('dark') || theme === 'dark';
    const tileUrlTemplate = isDarkGlobal
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

    L.tileLayer(tileUrlTemplate, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);

    // 3. Setup Picker Interaction
    if (pickerMode) {
      // Create initial picker marker if coordinate is passed
      if (selectedCoordinates) {
        pickerMarkerRef.current = L.marker(
          [selectedCoordinates.lat, selectedCoordinates.lng],
          { icon: createMarkerIcon('picker'), draggable: true },
        ).addTo(map);

        // Bind drag events
        pickerMarkerRef.current.on('dragend', () => {
          if (!pickerMarkerRef.current) return;
          const position = pickerMarkerRef.current.getLatLng();
          const computedRegion = determineTehranRegion(
            position.lat,
            position.lng,
          );
          onCoordinatesChange?.(
            { lat: position.lat, lng: position.lng },
            computedRegion,
          );
        });
      }

      // Click to pin location
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        const computedRegion = determineTehranRegion(lat, lng);

        if (pickerMarkerRef.current) {
          pickerMarkerRef.current.setLatLng(e.latlng);
        } else {
          pickerMarkerRef.current = L.marker(e.latlng, {
            icon: createMarkerIcon('picker'),
            draggable: true,
          }).addTo(map);

          // Add dragend to newly created marker
          pickerMarkerRef.current.on('dragend', () => {
            if (!pickerMarkerRef.current) return;
            const position = pickerMarkerRef.current.getLatLng();
            const regObj = determineTehranRegion(position.lat, position.lng);
            onCoordinatesChange?.(
              { lat: position.lat, lng: position.lng },
              regObj,
            );
          });
        }

        onCoordinatesChange?.({ lat, lng }, computedRegion);
      });
    }

    // Cleanup on unmount
    return () => {
      map.remove();
      mapInstanceRef.current = null;
      pickerMarkerRef.current = null;
    };
  }, []); // Run once on load

  // Handle Updates to Display Markers (Submissions items)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || pickerMode) return;

    // Remove existing markers
    itemMarkersRef.current.forEach((m) => m.remove());
    itemMarkersRef.current = [];

    // Push new report indicators
    items.forEach((item) => {
      if (!item.coordinates?.lat || !item.coordinates?.lng) return;

      const marker = L.marker([item.coordinates.lat, item.coordinates.lng], {
        icon: createMarkerIcon(item.type),
      }).addTo(map);

      // Customize elegant light/dark themed popup
      const PersianTypeName =
        item.type === 'problem' ? 'گزارش مشکل' : 'ایده شهری';
      const typeColor =
        item.type === 'problem'
          ? 'text-red-500 font-bold'
          : 'text-emerald-500 font-bold';
      const statusLocales: Record<string, string> = {
        submitted: 'ثبت شده',
        under_review: 'در حال بررسی',
        in_progress: 'در حال اجرا',
        resolved: 'حل شده',
        archived: 'بایگانی‌شده',
      };

      const popupHtml = `
        <div class="text-right font-sans p-1 min-w-[210px] text-slate-800" dir="rtl">
          <div class="flex items-center justify-between border-b border-slate-200 pb-1.5 mb-2">
            <span class="text-[10px] font-black uppercase tracking-wider ${typeColor}">${PersianTypeName}</span>
            <span class="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">${statusLocales[item.status] || item.status}</span>
          </div>
          <h4 class="text-xs font-extrabold text-slate-900 mb-1 leading-snug">${item.title}</h4>
          <p class="text-[11px] text-slate-600 mb-2.5 line-clamp-2 leading-relaxed">${item.description}</p>
          <div class="text-[10px] text-slate-500 font-mono mb-2" dir="rtl">${toPersianDigits(item.region)}</div>
          <button id="marker-btn-${item.id}" class="w-full text-center bg-cyan-600 text-white font-black py-1 px-2 rounded-md hover:bg-cyan-500 transition-colors text-[10px]">
            مشاهده جزئیات درخواست
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // Listen for popup interactions
      marker.on('popupopen', () => {
        const btn = document.getElementById(`marker-btn-${item.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.stopPropagation();
            onSelectItem?.(item);
            map.closePopup();
          };
        }
      });

      itemMarkersRef.current.push(marker);
    });
  }, [items, pickerMode]);

  // Adjust map centering dynamically when coordinates update externally in pick mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !pickerMode || !selectedCoordinates) return;

    if (pickerMarkerRef.current) {
      pickerMarkerRef.current.setLatLng([
        selectedCoordinates.lat,
        selectedCoordinates.lng,
      ]);
    } else {
      pickerMarkerRef.current = L.marker(
        [selectedCoordinates.lat, selectedCoordinates.lng],
        { icon: createMarkerIcon('picker'), draggable: true },
      ).addTo(map);
    }

    map.setView(
      [selectedCoordinates.lat, selectedCoordinates.lng],
      map.getZoom(),
    );
  }, [selectedCoordinates]);

  return (
    <div className="w-full h-full relative" id="shahr_ara_map_component">
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[300px] border border-slate-200 dark:border-zinc-800/80 rounded-xl transition-colors duration-200"
      />

      {pickerMode && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 dark:bg-[#0b0f19]/95 border border-slate-200 dark:border-zinc-800 px-3 py-2 rounded-lg text-[10px] text-cyan-750 dark:text-cyan-300 flex items-center gap-1.5 backdrop-blur shadow-lg pointer-events-none transition-colors">
          <Location01Icon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 animate-pulse" />
          <span className="font-bold">
            برای جابجایی نشانگر، روی نقشه کلیک کنید یا پین را بکشید.
          </span>
        </div>
      )}
    </div>
  );
}
