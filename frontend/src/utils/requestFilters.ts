/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestItem } from '../types';

export type RequestSortOption =
  | 'newest'
  | 'oldest'
  | 'most_liked'
  | 'least_liked';

type SearchableField = 'title' | 'description' | 'region' | 'userName';

export type RequestSearchField = SearchableField | 'userPhone';

export interface RequestFilterOptions {
  /** Free-text search term, matched against searchFields. */
  searchTerm?: string;
  /** Fields the search term is matched against. Defaults to title + description. */
  searchFields?: RequestSearchField[];
  /** Exact-match filters; omit or pass 'all' to skip. */
  type?: string;
  category?: string;
  status?: string;
  /** Matches if the item's region starts with this value, so a bare "منطقه ۶" and a
   * full name like "منطقه ۱ (شمال قم)" both match themselves. Omit or pass 'all' to skip. */
  region?: string;
  startDate?: Date;
  endDate?: Date;
}

const DEFAULT_SEARCH_FIELDS: RequestSearchField[] = ['title', 'description'];

/**
 * Applies the search/category/type/status/region/date-range filters shared by
 * ReportsDirectory, AdminPanel, and UserProfile — kept as a single source of
 * truth instead of three diverging inline implementations.
 */
export function filterRequests(
  items: RequestItem[],
  options: RequestFilterOptions,
): RequestItem[] {
  const {
    searchTerm,
    searchFields = DEFAULT_SEARCH_FIELDS,
    type,
    category,
    status,
    region,
    startDate,
    endDate,
  } = options;

  const term = searchTerm?.toLowerCase() ?? '';

  return items.filter((item) => {
    const matchesSearch =
      !term ||
      searchFields.some((field) =>
        field === 'userPhone'
          ? item.userPhone.includes(searchTerm ?? '')
          : item[field].toLowerCase().includes(term),
      );

    const matchesType = !type || type === 'all' || item.type === type;
    const matchesCategory =
      !category || category === 'all' || item.category === category;
    const matchesStatus = !status || status === 'all' || item.status === status;
    const matchesRegion =
      !region || region === 'all' || item.region.startsWith(region);

    let matchesDate = true;
    if (startDate || endDate) {
      const itemDate = new Date(item.createdAt).getTime();
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && itemDate >= start.getTime();
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && itemDate <= end.getTime();
      }
    }

    return (
      matchesSearch &&
      matchesType &&
      matchesCategory &&
      matchesStatus &&
      matchesRegion &&
      matchesDate
    );
  });
}

/** Sorts requests per the shared sort options used by ReportsDirectory. */
export function sortRequests(
  items: RequestItem[],
  sortBy: RequestSortOption,
): RequestItem[] {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      case 'most_liked':
        return b.likes - a.likes;
      case 'least_liked':
        return a.likes - b.likes;
      default: // newest
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }
  });
}
