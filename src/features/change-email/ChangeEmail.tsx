"use client";import { useState, useEffect } from "react";
import Button from "@/components/buttons/Button";
import FloatingEmailField from "@/components/FormFields/auth/FloatingEmailField";
import { useUserMe } from "@/features/prof/hooks/useUserMe";
import { userService } from "@/services";
import type { ChangeEmailResponse } from "@/types/user";

/**
 * ChangeEmail component
 *
 * Handles the user email update process with full UI states:
 * - Display current email (read-only)
 * - Form with new email input
 * - Error messages in red
 * - "Saving" button state during submission
 * - Success message with email confirmation notice
 */
export default function ChangeEmail() {
  const { user, isLoading: isUserLoading } = useUserMe();

  // State management
  const [currentEmail, setCurrentEmail] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize with user email
  useEffect(() => {
    if (user?.email) {
      setCurrentEmail(user.email);
    }
  }, [user?.email]);

  const handleChangeEmail = async () => {
    if (!newEmail.trim()) {
      setError("Please enter a new email address");
      return;
    }

    if (newEmail === currentEmail) {
      setError("New email must be different from current email");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response: ChangeEmailResponse = await userService.changeEmail({
        newEmail,
      });
      // Do NOT setCurrentEmail(newEmail) here as the email hasn't actually changed yet.
      // It will only change after the user clicks the verification link in their email.
      setNewEmail("");
      setShowForm(false);
      setSuccessMessage(
        response.message || "A verification link has been sent to your new email address. Please click it to confirm the change."
      );

      // Success message stays longer to ensure user reads it
      setTimeout(() => setSuccessMessage(null), 10000);
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : "Failed to change email. Please try again.";
      
      if (errorMessage.toLowerCase().includes("exists") || errorMessage.toLowerCase().includes("taken")) {
        errorMessage = "This email is already in use or pending verification. Please check your inbox for a verification link if you recently requested this change.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmailClick = () => {
    setError(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setNewEmail("");
    setError(null);
  };

  const handleEmailChange = (value: string) => {
    setNewEmail(value);
    if (error) {
      setError(null);
    }
  };

  if (isUserLoading) {
    return (
      <div className="p-6 space-y-4 max-w-md animate-pulse">
        <div className="h-6 w-32 bg-interactive-hover rounded" />
        <div className="h-[3.2rem] w-full bg-interactive-hover rounded" />
        <div className="h-9 w-24 bg-interactive-hover rounded" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-l font-semibold">Email Address</h2>

      {/* Success Message */}
      {successMessage && (
        <div className="p-3 bg-status-success/10 border border-status-success/30 rounded text-status-success text-sm">
          <p className="font-medium">{successMessage}</p>
          <p className="text-xs mt-1 opacity-90">
            Please check your email and verify your new address.
          </p>
        </div>
      )}

      {/* Current Email Display */}
      <div className="space-y-2">
        <div className="w-full min-w-[20rem] max-w-md [&_input]:truncate [&_input]:overflow-hidden [&_input]:whitespace-nowrap pointer-events-none">
          <FloatingEmailField
            value={currentEmail}
            onChange={() => {}}
            label="Current email (Primary)"
            name="current-email"
            disabled
          />
        </div>
      </div>

      {/* Change Email Button or Form */}
      {!showForm ? (
        <Button
          variant="secondary"
          size="md"
          onClick={handleChangeEmailClick}
          data-testid="change-email-button"
        >
          Change Email
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          {/* New Email Input */}
          <div
            data-testid="change-email-input"
            className="w-full min-w-[20rem] max-w-md [&_input]:truncate [&_input]:overflow-hidden [&_input]:whitespace-nowrap"
          >
            <FloatingEmailField
              value={newEmail}
              onChange={handleEmailChange}
              label="New email address"
              name="new-email"
              autoComplete="email"
              disabled={isLoading}
              data-testid="new-email-input"
            />

            {/* Error Message in Red Below Input */}
            {error && (
              <p
                className="text-status-error text-sm font-medium mt-1 px-1"
                data-testid="email-error-message"
              >
                {error}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="md"
              onClick={handleChangeEmail}
              disabled={isLoading || !newEmail.trim()}
              data-testid="confirm-change-email-button"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={handleCancel}
              disabled={isLoading}
              data-testid="cancel-change-email-button"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
