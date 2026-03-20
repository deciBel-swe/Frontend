'use client';

import React, { useState } from 'react';
import FloatingInputField from '@/features/auth/components/FormFields/FloatingInputField';
import ContinueButton from '@/features/auth/components/ContinueButton';
import Button from '@/components/buttons/Button';
import { X } from "lucide-react";

export type EditProfileFormValues = {
  displayName: string;
  profileUrl: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  bio: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: EditProfileFormValues) => void;
};

const EditProfileModal: React.FC<Props> = ({
  open,
  onClose,
  onSubmit,
}) => {
  // LOCAL STATE (NOW STATEFUL)
  const [formValues, setFormValues] = useState<EditProfileFormValues>({
    displayName: '',
    profileUrl: '',
    firstName: '',
    lastName: '',
    city: '',
    country: '',
    bio: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError] = useState<string | undefined>(undefined);

  // UPDATE FUNCTION
  const updateField = (field: keyof EditProfileFormValues, value: string) => {
    setFormValues((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Modal visibility is controlled externally
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="relative w-[900px] max-w-[95vw] rounded bg-[#111] text-white border border-white/10">

        {/* CLOSE */}
        {/* these are two options for close button: */}
        {/* <Button
          onClick={onClose}
          variant='ghost'
          className="absolute right-4 top-4"
        >
          ✕
        </Button> */}
        <Button
        aria-label="Close"
        onClick={onClose}
        variant="ghost"
        className="absolute right-4 top-4"
        >
        <X className="w-4 h-4" />
        </Button>

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-white/10 text-[17px] font-bold">
          Edit your Profile
        </div>

        <form
        // dummy submit function
        // TODO: Implement submit function
          onSubmit={(e) => {
            e.preventDefault();
            setIsSubmitting(true);

            console.log('SUBMIT DATA:', formValues);

            onSubmit?.(formValues);

            setTimeout(() => setIsSubmitting(false), 500);
          }}
          className="flex gap-6 p-6"
        >

          {/* LEFT */}
           {/* pretty sure if safwat has a component for this */}
          <div className="w-[260px] flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3">
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />

              <button
                type="button"
                className="bg-white/10 px-3 py-1 rounded text-sm hover:bg-white/20"
              >
                Upload image
              </button>
            </div>
             {/* HEADER ROW */}
             <div className="flex flex-col gap-2 mt-auto mb-7">
  <div className="flex items-center gap-2">
    <div className="font-bold text-sm">Your Links</div>

    {/* INFO ICON */}
    <div className="relative group">
      <button
        type="button"
        className="h-4 w-4 flex items-center justify-center rounded-full text-[10px] text-white cursor-pointer bg-gray-500"
      >
        i
      </button>

      {/* TOOLTIP */}
      <div className="absolute left-1/2 top-6 -translate-x-1/2 w-64 bg-gray-500 text-white text-xs p-2 rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition">
        Add links to your website and social network profiles to help your audience find you wherever you are.
      </div>
    </div>
  </div>

  {/* BUTTONS */}
  <div className="flex flex-row gap-2 mt-2">
    <Button
      variant='secondary'
    >
      Add link
    </Button>

    <Button
    variant='secondary'
    >
      Add support link
    </Button>
  </div>
  </div>
          </div>

          {/* RIGHT */}
          <div className="flex-1 flex flex-col gap-4">

            <FloatingInputField
              name="displayName"
              label="Display name *"
              value={formValues.displayName}
              onChange={(v) => updateField('displayName', v)}
            />

            <FloatingInputField
              name="profileUrl"
              label="Profile URL *"
              value={formValues.profileUrl}
              onChange={(v) => updateField('profileUrl', v)}
            />

            <div className="flex gap-3">
              <FloatingInputField
                name="firstName"
                label="First name"
                value={formValues.firstName}
                onChange={(v) => updateField('firstName', v)}
              />

              <FloatingInputField
                name="lastName"
                label="Last name"
                value={formValues.lastName}
                onChange={(v) => updateField('lastName', v)}
              />
            </div>

            <div className="flex gap-3">
              <FloatingInputField
                name="city"
                label="City"
                value={formValues.city}
                onChange={(v) => updateField('city', v)}
              />

              <FloatingInputField
                name="country"
                label="Country"
                value={formValues.country}
                onChange={(v) => updateField('country', v)}
              />
            </div>

            {/* BIO */}
            <div>
              <div className="text-xs text-white/70 mb-1">Bio</div>
              <textarea
                className="w-full h-24 rounded bg-white/10 px-3 py-2 text-sm outline-none placeholder:font-light"
                value={formValues.bio}
                placeholder='Tell the world a little bit about yourself. The shorter the better'
                onChange={(e) => updateField('bio', e.target.value)}
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                variant='ghost'
                onClick={onClose}
              >
                Cancel
              </Button>

              <ContinueButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </ContinueButton>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;