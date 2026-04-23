"use client";

import Button from "@/components/buttons/Button";
import { useEmail } from "@/features/change-email/hooks/useEmail";

export default function ChangeEmail() {
    const userEmail="testuser@gmail.com"
  const { email, showForm, setShowForm, newEmail, setNewEmail, changeEmail }= useEmail(userEmail);

  return (
    <div className="p-6">
      <h2 className="text-l font-semibold mb-4">Email Address</h2>
      <p className="text-sm text-text-muted mb-2">Current: {email} (Primary)</p>

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
        <div className="flex items-center space-x-2">
          <input
            type="email"
            placeholder="Enter new email address"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            className="flex-1 px-3 py-2 border border-border-default rounded-md text-sm"
            data-testid="change-email-input"
          />
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
      )}
    </div>
  );
}
