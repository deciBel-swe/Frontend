'use client';

import { useRedirectAfterLogin } from '@/hooks';

export default function Page() {
  useRedirectAfterLogin();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <>This is a sign in page</>
    </div>
  );
}
