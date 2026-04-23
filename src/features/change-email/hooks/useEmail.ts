"use client";

import { useState } from "react";

export function useEmail(initialEmail: string) {
  const [email, setEmail] = useState(initialEmail);
  const [showForm, setShowForm] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const changeEmail = () => {
    if (newEmail.trim()) {
      setEmail(newEmail);       // update the current email
      setNewEmail("");          // clear the input
      setShowForm(false);       // hide the form
    }
  };

  return {
    email,
    showForm,
    setShowForm,
    newEmail,
    setNewEmail,
    changeEmail,
  };
}
