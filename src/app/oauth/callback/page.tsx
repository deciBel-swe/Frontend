'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Ref prevents React StrictMode from firing the API call twice
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;

    // Grab the "code" from the URL parameters as advised by your teammate
    const code = searchParams.get('code');
    const googleError = searchParams.get('error');

    if (googleError) {
      setError(`Google Authentication Denied: ${googleError}`);
      setTimeout(() => router.push('/signin'), 3000);
      return;
    }

    if (code) {
      hasProcessed.current = true;

      // Pass the code to your Auth Context, which hits the MockService
      loginWithGoogle(code)
        .then(() => {
          // Success! Next.js middleware will let us into the protected feed
          router.push('/feed');
        })
        .catch((err) => {
          console.error('Failed to exchange Google code:', err);
          setError('Failed to authenticate with DeciBel servers.');
          setTimeout(() => router.push('/signin'), 3000);
        });
    } else {
      setError('No authorization code received from Google.');
      setTimeout(() => router.push('/signin'), 3000);
    }
  }, [searchParams, loginWithGoogle, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-8 text-center space-y-4 bg-white rounded-xl shadow-md">
        {error ? (
          <div className="text-red-600">
            <p className="font-bold text-lg">Authentication Error</p>
            <p className="font-medium mt-2">{error}</p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting back to sign in...
            </p>
          </div>
        ) : (
          <div className="text-blue-600">
            {/* Tailwind Spinner */}
            <svg
              className="animate-spin w-12 h-12 mx-auto mb-4 text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="font-medium text-gray-800">Authenticating...</p>
            <p className="text-sm text-gray-500 mt-2">
              Setting up your DeciBel session.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
