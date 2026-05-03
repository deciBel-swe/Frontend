import React from 'react';
import { redirect } from 'next/navigation';

export const revalidate = 0;

export default function VerifyEmailPage() {
  // This route exists to satisfy Next's type generation for /verify-email.
  // Redirect to the canonical auth verify page.
  if (typeof window === 'undefined') {
    redirect('/auth/verify-email');
  }

  React.useEffect(() => {
    window.location.replace('/auth/verify-email');
  }, []);

  return null;
}
