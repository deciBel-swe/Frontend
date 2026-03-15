'use client';
import RegistrationForm from './components/RegistrationForm'
import { useAuth, useRedirectAfterLogin } from '@/hooks';
import { GoogleLoginButton } from '@/features/auth';
export default function Page() {
  useRedirectAfterLogin();
  const {isLoading, handleGoogleLogin } = useAuth();
  return (    <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex flex-center flex-col">
          <RegistrationForm />
            <GoogleLoginButton
              onClick={handleGoogleLogin}
              isLoading={isLoading}
            />
        </div>
    </div>
  );
}