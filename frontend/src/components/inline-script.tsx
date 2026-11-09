"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Inline bootstrap script (see the "Preventing Flash Before Hydration" guide
 * in node_modules/next/dist/docs). With type="text/javascript" the server-emitted
 * markup executes synchronously during HTML parsing; on the client the type is
 * switched to "text/plain" so React never re-executes the script while
 * rendering/hydrating components, and suppressHydrationWarning accepts the
 * type mismatch.
 */
export default function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
