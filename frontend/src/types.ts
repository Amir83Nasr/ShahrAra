/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  phone: string;
  nationalId: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  // Absent in sessions saved before the OTP auth rework — treat as unknown.
  hasPassword?: boolean;
  /** Versioned URL of the profile picture; null/absent means no picture. */
  avatarUrl?: string | null;
  token?: string;
}

export type RequestStatus =
  "submitted" | "under_review" | "in_progress" | "resolved" | "archived";
export type RequestType = "problem" | "idea";

export interface RequestItem {
  id: string;
  title: string;
  description: string;
  type: RequestType;
  category: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  region: string;
  status: RequestStatus;
  userPhone: string;
  userName: string;
  createdAt: string;
  adminResponse?: string;
  likes: number;
  isOwner?: boolean;
  likedByCurrentUser?: boolean;
  likedBy?: string[];
}

export interface NotificationItem {
  id: string;
  userPhone: string;
  message: string;
  requestId?: string | null;
  requestTitle?: string | null;
  createdAt: string;
  isRead: boolean;
}

export interface Stats {
  totalCount: number;
  problemsCount: number;
  ideasCount: number;
  byStatus: Record<RequestStatus, number>;
  byCategory: Record<string, number>;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export interface UserStats {
  totalLikesReceived: number;
  totalRequests: number;
}

export interface RequestUpdateData {
  title?: string;
  description?: string;
  category?: string;
  region?: string;
}
