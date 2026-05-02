"use client";

import { usePathname } from "next/navigation";
import VerificationHandler from "./VerificationHandler";

/**
 * RootRouteHijack
 * 
 * Intercepts specific system routes at the root layout level.
 * This is used to solve routing collisions between static paths
 * and the dynamic [username] route.
 */
export default function RootRouteHijack({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/verify-email-change') {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-bg-base w-full">
        <VerificationHandler />
      </div>
    );
  }

  return <>{children}</>;
}
