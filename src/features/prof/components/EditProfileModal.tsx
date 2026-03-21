'use client';

import React, { useEffect, useRef, useState } from 'react';
import FloatingInputField from '@/features/auth/components/FormFields/FloatingInputField';
import Button from '@/components/buttons/Button';
import { IconButton } from '@/components/buttons/IconButton';
import { Link2, Trash2, X } from 'lucide-react';
import { useUserMe } from '@/features/prof/hooks/useUserMe';
import { z } from 'zod';
import FloatingSelectField from '@/features/prof/FormFields/FloatingSelectField';
import { useGetCountry } from '@/hooks';
import { useEditMe } from '@/features/prof/hooks/useEditMe';
import { ProfileLink, UpdateMeRequest } from '@/types/user';
import { validateLinks } from '@/utils/forValidation';

export type EditProfileFormValues = {
  displayName: string;
  profileUrl: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  bio: string;
  links: ProfileLink[];
  avatar: File | string | null;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: EditProfileFormValues) => void;
};

type EditProfileFormErrors = Partial<
  Record<'displayName' | 'profileUrl' | 'bio', string>
>;

const MAX_LINKS = 10;

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

const buildSocialLinks = (
  links: ProfileLink[]
): UpdateMeRequest['socialLinks'] => {
  const socialLinks: UpdateMeRequest['socialLinks'] = {};

  for (const link of links) {
    const url = link.url.trim();
    if (!url) {
      continue;
    }

    if (link.kind === 'support') {
      socialLinks.website = url;
      continue;
    }

    const title = link.title.trim().toLowerCase();

    if (!socialLinks.instagram && title.includes('instagram')) {
      socialLinks.instagram = url;
      continue;
    }

    if (!socialLinks.twitter && (title.includes('twitter') || title === 'x')) {
      socialLinks.twitter = url;
      continue;
    }

    if (!socialLinks.website) {
      socialLinks.website = url;
    }
  }

  return socialLinks;
};

const EditProfileModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const { data: countries } = useGetCountry();
  const { editMe, isUpdating, error: editMeError } = useEditMe();
  const imageMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nextLinkIdRef = useRef(1);

  // LOCAL STATE (NOW STATEFUL)
  const [formValues, setFormValues] = useState<EditProfileFormValues>({
    displayName: '',
    profileUrl: '',
    firstName: '',
    lastName: '',
    city: '',
    country: '',
    bio: '',
    links: [],
    avatar: null,
  });

  const [imageMenuOpen, setImageMenuOpen] = useState(false);
  const [isLinksTooltipOpen, setIsLinksTooltipOpen] = useState(false);
  const [openSupportTooltipId, setOpenSupportTooltipId] = useState<
    number | null
  >(null);
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [linkErrors, setLinkErrors] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<EditProfileFormErrors>({});
  const { user: myUser } = useUserMe();
  const hasSupportLink = links.some((item) => item.kind === 'support');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
      setFormValues((prev) => ({ ...prev, avatar: e.target.files![0] }));
    }
  };

  const addLink = () => {
    if (links.length >= MAX_LINKS) {
      return;
    }
    setLinks((prev) => {
      const updated: ProfileLink[] = [
        ...prev,
        {
          id: nextLinkIdRef.current++,
          url: '',
          title: '',
          kind: 'regular',
        },
      ];
      setFormValues((fv) => ({ ...fv, links: updated }));
      return updated;
    });
  };

  const addSupportLink = () => {
    if (links.length >= MAX_LINKS || hasSupportLink) {
      return;
    }
    setLinks((prev) => {
      const updated: ProfileLink[] = [
        ...prev,
        {
          id: nextLinkIdRef.current++,
          url: '',
          title: 'Support',
          kind: 'support',
        },
      ];
      setFormValues((fv) => ({ ...fv, links: updated }));
      return updated;
    });
  };

  const removeLink = (id: number) => {
    setLinks((prev) => {
      const next: ProfileLink[] = prev.filter((item) => item.id !== id);
      setLinkErrors(validateLinks(next));
      setFormValues((fv) => ({ ...fv, links: next }));
      return next;
    });
  };

  const updateLinkField = (
    id: number,
    field: keyof Omit<ProfileLink, 'id'>,
    value: string
  ) => {
    setLinks((prev) => {
      const next: ProfileLink[] = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: value,
              kind: item.kind as 'regular' | 'support',
            }
          : item
      );
      setLinkErrors(validateLinks(next));
      setFormValues((fv) => ({ ...fv, links: next }));
      return next;
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target;

      if (!imageMenuRef.current) {
        return;
      }

      if (!imageMenuRef.current.contains(target as Node)) {
        setImageMenuOpen(false);
      }

      if (target instanceof Element) {
        if (!target.closest('.js-links-tooltip')) {
          setIsLinksTooltipOpen(false);
        }

        if (!target.closest('.js-support-tooltip')) {
          setOpenSupportTooltipId(null);
        }
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay">
      <div className="relative w-[900px] max-w-[95vw] max-h-[90vh] rounded bg-surface-default text-text-primary border border-border-default overflow-auto">
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
        <div className="px-6 py-4 border-b border-border-default text-[17px] font-bold">
          Edit your Profile
        </div>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            // Always keep links and avatar in formValues up to date
            setFormValues((prev) => ({
              ...prev,
              links,
              avatar: selectedImage ?? prev.avatar,
            }));
            const errors = getFormErrors({
              ...formValues,
              links,
              avatar: selectedImage ?? formValues.avatar,
            });
            setFormErrors(errors);
            const nextLinkErrors = validateLinks(links);
            setLinkErrors(nextLinkErrors);
            if (
              Object.keys(errors).length > 0 ||
              Object.keys(nextLinkErrors).length > 0
            ) {
              return;
            }

            setSubmitError(undefined);

            const payload: UpdateMeRequest = {
              bio: formValues.bio,
              city: formValues.city,
              country: formValues.country,
              socialLinks: buildSocialLinks(links),
            };

            // Submit all form data including links and avatar
            try {
              await editMe(payload);

              onSubmit?.({
                ...formValues,
                links,
                avatar: selectedImage ?? formValues.avatar,
              });
            } catch (err) {
              setSubmitError(
                err instanceof Error
                  ? err.message
                  : (editMeError ?? 'Failed to update profile')
              );
            }
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
                  className="bg-interactive-default text-brand-primary px-3 py-1 rounded text-sm font-semibold hover:bg-interactive-hover hover:text-brand-primary-hover 
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
                        if (fileInputRef.current) {
                          fileInputRef.current.click();
                        }
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
                        setSelectedImage(null);
                        setFormValues((prev) => ({
                          ...prev,
                          avatar: 'No image',
                        }));
                      }}
                      className="flex w-full px-3.5 py-3 text-left font-extrabold text-[13px] text-text-primary hover:text-text-secondary/80 transition-colors duration-150"
                    >
                      Delete image
                    </button>
                  </div>
                ) : null}
                {/* Hidden file input for image upload */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={handleImageChange}
                />
              </div>
            </div>
            {/* HEADER ROW */}
            <div className="flex flex-col gap-2 mt-auto mb-7">
              <div className="flex items-center gap-2">
                <div className="font-bold text-sm">Your Links</div>

                {/* INFO ICON */}
                <div className="relative js-links-tooltip">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLinksTooltipOpen((prev) => !prev);
                      setOpenSupportTooltipId(null);
                    }}
                    className="h-4 w-4 flex items-center justify-center rounded-full text-[10px] text-text-inverse cursor-pointer bg-interactive-active"
                  >
                    i
                  </button>

                  {/* TOOLTIP */}
                  <div
                    className={`absolute left-1/2 top-6 -translate-x-1/2 w-64 bg-surface-raised text-text-primary text-xs p-2 rounded border border-border-default shadow-lg transition ${
                      isLinksTooltipOpen
                        ? 'opacity-100 visible'
                        : 'opacity-0 invisible'
                    }`}
                  >
                    Add links to your website and social network profiles to
                    help your audience find you wherever you are.
                  </div>
                </div>
              </div>

              {/* BUTTONS */}
              <div className="flex flex-row gap-2 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addLink}
                  disabled={links.length >= MAX_LINKS}
                >
                  Add link
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addSupportLink}
                  disabled={links.length >= MAX_LINKS || hasSupportLink}
                >
                  Add support link
                </Button>
              </div>

              <p className="text-[11px] text-text-muted mt-1">
                {links.length}/{MAX_LINKS} links
              </p>
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
                  value: country.name,
                }))}
              />
            </div>

            {/* BIO */}
            <div>
              <div className="text-xs text-text-secondary mb-1">Bio</div>
              <textarea
                className="w-full h-24 rounded bg-interactive-default px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted placeholder:font-light"
                value={formValues.bio}
                placeholder="Tell the world a little bit about yourself. The shorter the better"
                onChange={(e) => updateField('bio', e.target.value)}
                maxLength={200}
              />
              <div className="mt-1 flex justify-between text-xs text-text-muted">
                <span>{formErrors.bio ?? ''}</span>
                <span>{formValues.bio.length}/200</span>
              </div>
            </div>

            {links.length > 0 ? (
              <div className="space-y-2">
                {links.map((link) => (
                  <div key={link.id}>
                    <div className="flex items-center gap-2">
                      <Link2 className="w-4 h-4 text-text-secondary shrink-0" />

                      <input
                        type="text"
                        placeholder={
                          link.kind === 'support'
                            ? 'https://paypal.me/username'
                            : 'Web or email address'
                        }
                        value={link.url}
                        onChange={(e) =>
                          updateLinkField(link.id, 'url', e.target.value)
                        }
                        className="flex-1 h-10 rounded bg-interactive-default px-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
                      />

                      {link.kind !== 'support' ? (
                        <input
                          type="text"
                          placeholder="Short title"
                          value={link.title}
                          onChange={(e) =>
                            updateLinkField(link.id, 'title', e.target.value)
                          }
                          className="w-44 h-10 rounded bg-interactive-default px-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
                        />
                      ) : null}

                      {link.kind === 'support' ? (
                        <div className="relative js-support-tooltip">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenSupportTooltipId((prev) =>
                                prev === link.id ? null : link.id
                              );
                              setIsLinksTooltipOpen(false);
                            }}
                            className="h-4 w-4 flex items-center justify-center rounded-full text-[10px] text-text-inverse cursor-pointer bg-interactive-active"
                          >
                            i
                          </button>

                          {/* TOOLTIP */}
                          <div
                            className={`absolute left-1/2 top-6 -translate-x-1/2 w-64 bg-surface-raised text-text-primary text-xs p-2 rounded border border-border-default shadow-lg transition z-20 ${
                              openSupportTooltipId === link.id
                                ? 'opacity-100 visible'
                                : 'opacity-0 invisible'
                            }`}
                          >
                            Support Links are a single link that you add to your
                            profile in order to highlight an app or site where
                            you would like to direct supporters who want to chip
                            in and provide some financial relief for you, if you
                            choose to activate it.
                            <button
                              type="button"
                              className="mt-2 inline-flex items-center rounded bg-interactive-default px-2 py-1 text-[11px] font-semibold text-text-primary hover:bg-interactive-hover transition-colors"
                            >
                              Learn more
                            </button>
                          </div>
                        </div>
                      ) : null}

                      <IconButton
                        onClick={() => removeLink(link.id)}
                        aria-label="Delete link"
                        className="h-10 w-10 rounded bg-interactive-default hover:bg-interactive-hover text-text-secondary hover:text-text-primary transition-colors duration-150"
                      >
                        <Trash2 className="w-4 h-4" />
                      </IconButton>
                    </div>

                    {linkErrors[link.id] ? (
                      <p className="mt-1 text-xs text-red-400">
                        {linkErrors[link.id]}
                      </p>
                    ) : link.kind === 'support' ? (
                      <p className="mt-1 text-xs text-text-muted">
                        Supported platforms: PayPal, Cash app, Venmo, Bandcamp,
                        Shopify, Kickstarter, Patreon, and Gofundme.
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border-default">
              {submitError ? (
                <p className="mr-auto text-xs text-red-400">{submitError}</p>
              ) : null}
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="secondary" disabled={isUpdating}>
                {isUpdating ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
