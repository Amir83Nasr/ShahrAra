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

const SECTIONS = ["my", "liked", "settings"] as const;

export default function ProfileSectionPage() {
  const { currentUser, requests, refresh } = useApp();
  const params = useParams<{ section: string }>();
  const router = useRouter();

  const section = params.section as (typeof SECTIONS)[number];
  const valid = SECTIONS.includes(section);

  // Older links to the password tab now live inside the settings section.
  useEffect(() => {
    if (params.section === "security") {
      router.replace("/profile/settings");
      return;
    }
    if (!valid) router.replace("/profile");
  }, [valid, params.section, router]);

  if (!valid) return null;

  return (
    <ProfileGate variant={section === "settings" ? "settings" : "list"}>
      {currentUser && (
        <UserProfile
          currentUser={currentUser}
          requests={requests}
          onRefresh={() => refresh({ force: true })}
          section={section}
        />
      )}
    </ProfileGate>
  );
}
