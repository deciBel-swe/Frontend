'use client';
import { useAuth, useRedirectAfterLogin } from '@/hooks';
export default function Page() {
  useRedirectAfterLogin();
  const { login, logout, isAuthenticated, role } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <>This is a sign in page</>
      {isAuthenticated && (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <>Logged in as {role}</>
          <button
            className="bg-brand-primary hover:bg-amber-300"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      )}
      {!isAuthenticated && (
        <div className="flex min-h-screen flex-col items-center justify-center">
          <>Logged out</>
          <button
            className="bg-brand-primary hover:bg-amber-300"
            onClick={() => login('artist@decibel.test', 'x')}
          >
            Login as Artist
          </button>
          <button
            className="bg-brand-primary hover:bg-amber-300"
            onClick={() => login('listener@decibel.test', 'x')}
          >
            Login as Listener
          </button>
        </div>
      )}
    </div>
  );
}
