"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useSearchParams } from "next/navigation";
import { useApp } from "../providers";
import ReportsDirectory from "@/components/ReportsDirectory";

export default function ReportsPage() {
  const { requests, currentUser, like, openAuth, refresh, theme } = useApp();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "all";

  return (
    <ReportsDirectory
      key={category}
      items={requests}
      currentUser={currentUser}
      onLike={like}
      onOpenAuth={openAuth}
      onRefresh={() => refresh({ force: true })}
      theme={theme}
      initialCategory={category}
    />
  );
}
