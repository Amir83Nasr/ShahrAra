"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from "next/navigation";
import { useApp } from "../providers";
import RequestForm from "@/components/RequestForm";

export default function SubmitPage() {
  const { currentUser, submitSuccess } = useApp();
  const router = useRouter();

  return (
    <RequestForm
      currentUser={currentUser}
      onSubmitSuccess={() => {
        submitSuccess();
        router.push("/reports");
      }}
    />
  );
}
