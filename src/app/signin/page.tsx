'use client';
import { useAuth, useRedirectAfterLogin } from '@/hooks';
import { GoogleLoginButton } from '@/features/auth';
export default function Page() {
  useRedirectAfterLogin();
  const {isLoading, handleGoogleLogin } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <>This is a sign in page</>
        <div className="flex flex-center">
            <GoogleLoginButton
              onClick={handleGoogleLogin}
              isLoading={isLoading}
            />
        </div>
    </div>
  );
}