"use client";

import Button from "@/components/buttons/Button";
import FloatingEmailField from "@/components/FormFields/auth/FloatingEmailField";
import { useEmail } from "@/features/change-email/hooks/useEmail";

export default function ChangeEmail() {
  const userEmail = "testuser@gmail.com";
  const { email, showForm, setShowForm, newEmail, setNewEmail, changeEmail } =
    useEmail(userEmail);

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-l font-semibold">Email Address</h2>

      <div className="space-y-2">
        <div className="pointer-events-none">
          <FloatingEmailField
            value={email}
            onChange={() => {}}
            label="Current email (Primary)"
            name="current-email"
          />
        </div>
      </div>

      {!showForm ? (
        <Button
          variant="secondary"
          size="md"
          onClick={() => setShowForm(true)}
          data-testid="change-email-button"
        >
          Change Email
        </Button>
      ) : (
        <div className="flex flex-col gap-3">
          <div data-testid="change-email-input">
            <FloatingEmailField
              value={newEmail}
              onChange={setNewEmail}
              label="New email address"
              name="new-email"
              autoComplete="email"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="secondary"
              size="md"
              onClick={changeEmail}
              data-testid="confirm-change-email-button"
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setShowForm(false)}
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
