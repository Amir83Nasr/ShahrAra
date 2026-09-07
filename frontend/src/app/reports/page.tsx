"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp } from "../providers";
import ReportsDirectory from "@/components/ReportsDirectory";

function ReportsContent() {
  const { requests, currentUser, like, refresh, theme } = useApp();
  const searchParams = useSearchParams();
  const category = searchParams.get("category") ?? "all";

  return (
    <ReportsDirectory
      key={category}
      items={requests}
      currentUser={currentUser}
      onLike={like}
      onRefresh={() => refresh({ force: true })}
      theme={theme}
      initialCategory={category}
    />
  );
}

export default function ReportsPage() {
  return (
    <Suspense>
      <ReportsContent />
    </Suspense>
  );
}
