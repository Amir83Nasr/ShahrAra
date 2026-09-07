"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import ProfileGate from "@/components/ProfileGate";
import UserProfile from "@/components/UserProfile";
import { useApp } from "../providers";

export default function ProfilePage() {
  const { currentUser, requests, like, refresh } = useApp();

  return (
    <ProfileGate>
      {currentUser && (
        <UserProfile
          currentUser={currentUser}
          requests={requests}
          onLike={like}
          onRefresh={() => refresh({ force: true })}
        />
      )}
    </ProfileGate>
  );
}
