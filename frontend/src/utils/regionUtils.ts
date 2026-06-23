/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Qom city approximate center: lat 34.64, lng 50.88
// Determines municipal district (1-8) from map coordinates deterministically
export const determineRegion = (lat: number, lng: number): string => {
  // Outer ring — priority boundaries
  if (lat > 34.68) return 'منطقه ۱ (شمال قم)';
  if (lat < 34.58) return 'منطقه ۵ (جنوب قم)';
  if (lng < 50.83) return 'منطقه ۴ (غرب قم)';
  if (lng > 50.95) return 'منطقه ۳ (شرق قم)';

  // Inner zones (34.58 <= lat <= 34.68, 50.83 <= lng <= 50.95)
  if (lat > 34.655) {
    // North-central band
    return lng < 50.88 ? 'منطقه ۷' : 'منطقه ۲ (مرکز قم)';
  }
  if (lat <= 34.62) {
    // South-central band
    return lng < 50.88 ? 'منطقه ۶' : 'منطقه ۸';
  }
  // Mid-central band (34.62 < lat <= 34.655)
  return 'منطقه ۲ (مرکز قم)';
};

export const REGIONS = [
  'منطقه ۱ (شمال قم)',
  'منطقه ۲ (مرکز قم)',
  'منطقه ۳ (شرق قم)',
  'منطقه ۴ (غرب قم)',
  'منطقه ۵ (جنوب قم)',
  'منطقه ۶',
  'منطقه ۷',
  'منطقه ۸',
] as const;
