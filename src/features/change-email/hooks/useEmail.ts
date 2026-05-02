"use client";

import { useState, useCallback } from "react";
import { userService } from "@/services";
import type { ChangeEmailResponse } from "@/types/user";

/**
 * Hook for managing email change functionality
 *
 * @param initialEmail - The current email address
 * @returns Object with email state, form state, and handlers
 */
export function useEmail(initialEmail: string) {
  const [currentEmail, setCurrentEmail] = useState(initialEmail);
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const changeEmail = useCallback(async () => {
    if (!newEmail.trim()) {
      setError("Please enter a new email address");
      return;
    }

    if (newEmail === currentEmail) {
      setError("New email must be different from current email");
      return;
    }

    clearError();
    setIsLoading(true);

    try {
      const response: ChangeEmailResponse = await userService.changeEmail({
        newEmail,
      });
      setCurrentEmail(newEmail);
      setNewEmail("");
      setShowForm(false);
      setSuccessMessage(
        response.message || "Email changed successfully. Please verify your new email."
      );

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to change email. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [newEmail, currentEmail, clearError]);

  return {
    currentEmail,
    setCurrentEmail,
    showForm,
    setShowForm,
    newEmail,
    setNewEmail,
    changeEmail,
    isLoading,
    error,
    clearError,
    successMessage,
  };
}
