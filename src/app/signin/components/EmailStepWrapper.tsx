'use client';
import React, { useState } from 'react';
import SmallEmailForm from './SmallEmailForm';
import ExistingUserLogin from './ExistingUserLogin';
import NewUserRegister from './NewUserRegister';
import NewRegistrationForm from './NewRegistrationForm';

const EmailStepWrapper: React.FC<{ onClose: () => void; onEmailContinue?: (email: string) => void }> = ({ onClose, onEmailContinue }) => {
  const [email, setEmail] = useState('');
  const [emailExists, setEmailExists] = useState<boolean | null>(null); // null = not checked yet
  const [showRegistrationDetails, setShowRegistrationDetails] = useState(false); // show additional profile form

  // Called by SmallEmailForm
  const handleEmailContinue = (enteredEmail: string) => {
    setEmail(enteredEmail);
    onEmailContinue?.(enteredEmail);

    // --------------------------
    // MOCK for testing
    // --------------------------
    const exists = enteredEmail === 'test@example.com';
    setEmailExists(exists);

    // --------------------------
    // REAL API call (commented)
    // --------------------------
    /*
    fetch('/auth/check-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: enteredEmail })
    })
      .then(res => res.json())
      .then(data => setEmailExists(data.exists));
    */
  };

  // Show email input first
  if (emailExists === null) {
    return <SmallEmailForm onClose={onClose} onContinue={handleEmailContinue} />;
  }

  // After registration step, show extra profile flow
  if (showRegistrationDetails) {
    return <NewRegistrationForm email={email} onClose={onClose} />;
  }

  // Show login for existing users
  return emailExists ? (
    <ExistingUserLogin email={email} onClose={onClose} />
  ) : (
    <NewUserRegister
      email={email}
      onClose={onClose}
      onContinue={() => setShowRegistrationDetails(true)}
    />
  );
};

export default EmailStepWrapper;