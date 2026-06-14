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
  token?: string;
}

export type RequestStatus =
  | 'submitted'
  | 'under_review'
  | 'in_progress'
  | 'resolved'
  | 'archived';
export type RequestType = 'problem' | 'idea';

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
  likedByCurrentUser?: boolean;
  likedBy?: string[];
}

export interface Stats {
  totalCount: number;
  problemsCount: number;
  ideasCount: number;
  byStatus: Record<RequestStatus, number>;
  byCategory: Record<string, number>;
}
