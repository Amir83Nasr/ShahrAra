/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { RequestStatus, RequestType } from '../types';

// Single source of truth for the Persian labels and Tailwind color classes
// used on status/type badges across ReportsDirectory, AdminPanel, UserProfile,
// and MapComponent — previously each component defined its own wording and
// colors, which had drifted out of sync for the same enum values.

export const STATUS_LABELS: Record<RequestStatus, string> = {
  submitted: 'ثبت شده',
  under_review: 'در حال بررسی',
  in_progress: 'در حال اجرا',
  resolved: 'حل شده',
  archived: 'بایگانی‌شده',
};

export const STATUS_BADGE_CLASS: Record<RequestStatus, string> = {
  submitted:
    'bg-status-submitted/15 text-status-submitted border-status-submitted/20',
  under_review:
    'bg-status-under-review/15 text-status-under-review border-status-under-review/20',
  in_progress:
    'bg-status-in-progress/15 text-status-in-progress border-status-in-progress/20',
  resolved:
    'bg-status-resolved/15 text-status-resolved border-status-resolved/20',
  archived:
    'bg-status-archived/15 text-status-archived border-status-archived/20',
};

export const TYPE_LABELS: Record<RequestType, string> = {
  problem: 'گزارش مشکل',
  idea: 'ایده شهری',
};

export const TYPE_BADGE_CLASS: Record<RequestType, string> = {
  problem: 'bg-type-problem/15 text-type-problem border-type-problem/20',
  idea: 'bg-type-idea/15 text-type-idea border-type-idea/20',
};
