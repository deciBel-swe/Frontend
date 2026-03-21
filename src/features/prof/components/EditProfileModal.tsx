'use client';

import React, { useEffect, useRef, useState } from 'react';
import FloatingInputField from '@/features/auth/components/FormFields/FloatingInputField';
import Button from '@/components/buttons/Button';
import { X } from 'lucide-react';
import { useUserMe } from '@/features/prof/hooks/useUserMe';
import { z } from 'zod';
import FloatingSelectField from '@/features/prof/FormFields/FloatingSelectField';
import { useGetCountry } from '@/hooks';

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

type EditProfileFormErrors = Partial<
  Record<'displayName' | 'profileUrl' | 'bio', string>
>;

const editProfileSchema = z.object({
  displayName: z.string().trim().min(1, 'Display name is required'),
  profileUrl: z.string().trim().min(1, 'Profile URL is required'),
  firstName: z.string(),
  lastName: z.string(),
  city: z.string(),
  country: z.string(),
  bio: z.string().max(200, 'Bio must be 200 characters or fewer'),
});

const getFormErrors = (
  values: EditProfileFormValues
): EditProfileFormErrors => {
  const result = editProfileSchema.safeParse(values);
  if (result.success) {
    return {};
  }

  const errors: EditProfileFormErrors = {};

  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (
      (key === 'displayName' || key === 'profileUrl' || key === 'bio') &&
      !errors[key]
    ) {
      errors[key] = issue.message;
    }
  }

  return errors;
};

const EditProfileModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const { data: countries } = useGetCountry();
  const imageMenuRef = useRef<HTMLDivElement>(null);

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
  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [submitError] = useState<string | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<EditProfileFormErrors>({});
  const { user: myUser } = useUserMe();

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!imageMenuRef.current) {
        return;
      }

      if (!imageMenuRef.current.contains(event.target as Node)) {
        setImageMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // UPDATE FUNCTION
  const updateField = (field: keyof EditProfileFormValues, value: string) => {
    const nextValue = field === 'bio' ? value.slice(0, 200) : value;

    setFormValues((prev) => {
      const nextValues = {
        ...prev,
        [field]: nextValue,
      };

      if (
        field === 'displayName' ||
        field === 'profileUrl' ||
        field === 'bio'
      ) {
        setFormErrors(getFormErrors(nextValues));
      }

      return nextValues;
    });
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

            const errors = getFormErrors(formValues);
            setFormErrors(errors);

            if (Object.keys(errors).length > 0) {
              return;
            }

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
              <div className="h-32 w-32 rounded-full bg-gradient-to-br from-gray-400 to-gray-600"></div>

              <div className="relative" ref={imageMenuRef}>
                <button
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={imageMenuOpen}
                  onClick={() => setImageMenuOpen((prev) => !prev)}
                  className="bg-white/10 text-brand-primary px-3 py-1 rounded text-sm font-semibold hover:bg-white/20 hover:text-brand-primary-hover 
                  transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-brand focus-visible:ring-offset-2 
                  focus-visible:ring-offset-bg-base"
                >
                  update image
                </button>

                {imageMenuOpen ? (
                  <div
                    role="menu"
                    className="absolute top-[calc(100%+6px)] left-0 min-w-37 bg-bg-base border border-interactive-default rounded shadow-[0_8px_24px_rgba(0,0,0,0.55)] z-300 overflow-hidden animate-drop-in"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setImageMenuOpen(false);
                      }}
                      className="flex w-full px-3.5 py-3 text-left font-extrabold text-[13px] text-text-primary hover:text-text-secondary/80 transition-colors duration-150"
                    >
                      Replace image
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setImageMenuOpen(false);
                      }}
                      className="flex w-full px-3.5 py-3 text-left font-extrabold text-[13px] text-text-primary hover:text-text-secondary/80 transition-colors duration-150"
                    >
                      Delete image
                    </button>
                  </div>
                ) : null}
              </div>
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
                    Add links to your website and social network profiles to
                    help your audience find you wherever you are.
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-row gap-2 mt-2">
                <Button variant="secondary">Add link</Button>

                <Button variant="secondary">Add support link</Button>
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
              required
              error={formErrors.displayName}
            />

            <FloatingInputField
              name="profileUrl"
              label="Profile URL *"
              value={formValues.profileUrl}
              onChange={(v) => updateField('profileUrl', v)}
              required
              error={formErrors.profileUrl}
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

              <FloatingSelectField
                name="country"
                label="Country"
                value={formValues.country}
                onChange={(v) => updateField('country', v)}
                options={countries.map((country) => ({
                  label: country.name,
                  value: country.code,
                }))}
              />
            </div>

            {/* BIO */}
            <div>
              <div className="text-xs text-white/70 mb-1">Bio</div>
              <textarea
                className="w-full h-24 rounded bg-white/10 px-3 py-2 text-sm outline-none placeholder:font-light"
                value={formValues.bio}
                placeholder="Tell the world a little bit about yourself. The shorter the better"
                onChange={(e) => updateField('bio', e.target.value)}
                maxLength={200}
              />
              <div className="mt-1 flex justify-between text-xs text-white/60">
                <span>{formErrors.bio ?? ''}</span>
                <span>{formValues.bio.length}/200</span>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>

              <Button type="submit" variant="secondary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
