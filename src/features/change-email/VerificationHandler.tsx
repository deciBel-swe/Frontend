"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { userService } from "@/services";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/useAuth";

/**
 * VerificationHandler
 * 
 * Handles the logic for verifying an email change token.
 * Shows status and redirects to sign in on success.
 */
export default function VerificationHandler() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "unauthorized">("loading");
  const [message, setMessage] = useState<string>("Verifying your email change...");

  useEffect(() => {
    // Wait for auth to load
    if (isAuthLoading) return;

    // Backend requires Authorization header for /users/me/email/verify
    if (!isAuthenticated) {
      setStatus("unauthorized");
      setMessage("You must be logged in to verify your email change.");
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from the link.");
      return;
    }

    const verify = async () => {
      try {
        console.log('Attempting to verify token:', token);
        const response = await userService.verifyEmailChange(token);
        console.log('Verification successful:', response);
        setStatus("success");
        setMessage(response.message || "Email verified successfully!");
        toast.success("Email verified! Redirecting to settings...");
        
        // Success redirect to settings as requested
        setTimeout(() => {
          router.push(ROUTES.SETTINGS);
        }, 3000);
      } catch (err) {
        console.error('Verification error:', err);
        let errorMessage = err instanceof Error ? err.message : "Verification failed. The link may be expired.";
        
        // Check if it's an auth error
        if (err instanceof Error && err.message.includes('401')) {
          errorMessage = "Your session has expired. Please sign in again and try the verification link.";
        } else if (err instanceof Error && err.message.includes('Unauthorized')) {
          errorMessage = "Your session has expired. Please sign in again and try the verification link.";
        }
        
        setStatus("error");
        setMessage(errorMessage);
      }
    };

    void verify();
  }, [router, isAuthenticated, isAuthLoading]);

  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-surface-raised rounded-xl border border-border-contrast shadow-2xl animate-in fade-in zoom-in duration-500 max-w-lg mx-auto">
      <div className="space-y-6">
        {status === "loading" && (
          <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto"></div>
        )}
        
        {status === "success" && (
          <div className="w-16 h-16 bg-status-success/20 text-status-success rounded-full flex items-center justify-center mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {(status === "error" || status === "unauthorized") && (
          <div className="w-16 h-16 bg-status-error/20 text-status-error rounded-full flex items-center justify-center mx-auto">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )}

        <h1 className={`text-2xl font-bold ${status === 'error' || status === 'unauthorized' ? 'text-status-error' : 'text-text-primary'}`}>
          {status === 'loading' ? 'Verification in Progress' : status === 'success' ? 'Verification Successful!' : 'Verification Failed'}
        </h1>
        
        <p className="text-text-secondary">
          {message}
        </p>

        {status === "unauthorized" && (
          <button 
            onClick={() => router.push(`${ROUTES.SIGNIN}?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`)}
            className="px-6 py-2 bg-brand text-white rounded-md hover:bg-brand-hover transition-colors font-medium"
          >
            Sign In to Verify
          </button>
        )}

        {status === "error" && (
          <button 
            onClick={() => router.push(ROUTES.SETTINGS)}
            className="px-6 py-2 bg-surface-default text-text-primary rounded-md border border-border-contrast hover:bg-surface-hover transition-colors font-medium"
          >
            Back to Settings
          </button>
        )}
      </div>
    </div>
  );
}
