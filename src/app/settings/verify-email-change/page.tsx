"use client";

import VerificationHandler from "@/features/change-email/VerificationHandler";
import { Suspense } from "react";

/**
 * Email Verification Page
 * 
 * Handles email change verification flow.
 * Accessed via /settings/verify-email-change?token=<token>
 */
export default function Page() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-bg-base">
      <Suspense fallback={<div className="text-text-secondary">Loading verification...</div>}>
        <VerificationHandler />
      </Suspense>
    </div>
  );
}
