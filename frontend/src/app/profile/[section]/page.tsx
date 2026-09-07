"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import ProfileGate from "@/components/ProfileGate";
import UserProfile from "@/components/UserProfile";
import { useApp } from "../../providers";

const SECTIONS = ["my", "liked", "security"] as const;

export default function ProfileSectionPage() {
  const { currentUser, requests, like, refresh } = useApp();
  const params = useParams<{ section: string }>();
  const router = useRouter();

  const section = params.section as (typeof SECTIONS)[number];
  const valid = SECTIONS.includes(section);

  // Unknown section → back to profile hub
  useEffect(() => {
    if (!valid) router.replace("/profile");
  }, [valid, router]);

  if (!valid) return null;

  return (
    <ProfileGate>
      {currentUser && (
        <UserProfile
          currentUser={currentUser}
          requests={requests}
          onLike={like}
          onRefresh={() => refresh({ force: true })}
          section={section}
        />
      )}
    </ProfileGate>
  );
}
