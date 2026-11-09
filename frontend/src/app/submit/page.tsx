"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from "next/navigation";
import { useApp } from "../providers";
import RequestForm from "@/components/RequestForm";
import { FormPageSkeleton } from "@/components/skeletons";

export default function SubmitPage() {
  const { currentUser, authReady, submitSuccess, theme } = useApp();
  const router = useRouter();

  // Avoid flashing the sign-in prompt while the saved session is restored.
  if (!authReady) return <FormPageSkeleton />;

  return (
    <RequestForm
      currentUser={currentUser}
      theme={theme}
      onSubmitSuccess={() => {
        submitSuccess();
        router.push("/reports");
      }}
    />
  );
}
