'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/buttons/Button';
import { IconButton } from '@/components/buttons/IconButton';
import {
  ArtworkPreviewField,
  AutoResizableTextAreaField,
  FloatingTextField,
  PrefixedInputField,
  SelectTextField,
} from '@/components/FormFields';
import { Link2, Trash2, X } from 'lucide-react';
import { useEditProfileForm } from '@/features/prof/hooks/useEditProfileForm';
import {
  MAX_PROFILE_LINKS,
  type EditProfileFormValues,
} from '@/types/editProfile';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit?: (data: EditProfileFormValues) => void;
};


const EditProfileModal: React.FC<Props> = ({ open, onClose, onSubmit }) => {
  const router = useRouter();

  const handleSuccessfulSubmit = useCallback(
    (data: EditProfileFormValues) => {
      onSubmit?.(data);
      router.refresh();
      onClose();

      // Fallback for views backed by client-side state where router.refresh()
      // does not visibly update the page.
      if (typeof window !== 'undefined') {
        window.setTimeout(() => {
          window.location.reload();
        }, 0);
      }
    },
    [onClose, onSubmit, router]
  );

  const {
    isUpdating,
    isInitialLoading,
    initialLoadError,
    formValues,
    formErrors,
    submitError,
    links,
    linkErrors,
    avatarPreviewUrl,
    hasSupportLink,
    isLinksTooltipOpen,
    openSupportTooltipId,
    countryOptions,
    setIsLinksTooltipOpen,
    setOpenSupportTooltipId,
    addLink,
    addSupportLink,
    removeLink,
    updateLinkField,
    updateField,
    handleImageSelect,
    handleImageRemove,
    handleSubmit,
  } = useEditProfileForm({
    open,
    onSubmit: handleSuccessfulSubmit,
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay">
      <div className="relative w-225 max-w-[95vw] max-h-[90vh] rounded bg-surface-default text-text-primary border border-border-default overflow-auto">
        <Button
          aria-label="Close"
          onClick={onClose}
          variant="ghost"
          className="absolute right-4 top-4"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="px-6 py-4 border-b border-border-default text-[17px] font-bold">
          Edit your Profile
        </div>

        <form onSubmit={handleSubmit} className="flex gap-6 p-6">
          <div className="w-65 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32">
                <ArtworkPreviewField
                  previewUrl={avatarPreviewUrl}
                  onSelect={handleImageSelect}
                  onRemove={handleImageRemove}
                  emptyLabel="Add profile image"
                  replaceLabel="Replace image"
                  removeLabel="Delete image"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-auto mb-7">
              <div className="flex items-center gap-2">
                <div className="font-bold text-sm">Your Links</div>

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

              <div className="flex flex-row gap-2 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={addLink}
                  disabled={links.length >= MAX_PROFILE_LINKS}
                >
                  Add link
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={addSupportLink}
                  disabled={
                    links.length >= MAX_PROFILE_LINKS || hasSupportLink
                  }
                >
                  Add support link
                </Button>
              </div>

              <p className="text-[11px] text-text-muted mt-1">
                {links.length}/{MAX_PROFILE_LINKS} links
              </p>

              {formErrors.links ? (
                <p className="text-xs text-red-400">{formErrors.links}</p>
              ) : null}
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            {isInitialLoading ? (
              <p className="text-xs text-text-muted">Loading profile data...</p>
            ) : null}
            {initialLoadError ? (
              <p className="text-xs text-red-400">{initialLoadError}</p>
            ) : null}

            <FloatingTextField
              name="displayName"
              label="Display name *"
              value={formValues.displayName}
              onChange={(v) => updateField('displayName', v)}
              required
              error={formErrors.displayName}
            />

            <PrefixedInputField
              label="Profile URL *"
              prefix="decibel.com"
              value={formValues.profileUrl}
              onChange={(v) => updateField('profileUrl', v.toLowerCase())}
              placeholder="your-handle"
              error={formErrors.profileUrl}
            />

            <div className="flex gap-3">
              <FloatingTextField
                name="firstName"
                label="First name"
                value={formValues.firstName}
                onChange={(v) => updateField('firstName', v)}
                error={formErrors.firstName}
              />

              <FloatingTextField
                name="lastName"
                label="Last name"
                value={formValues.lastName}
                onChange={(v) => updateField('lastName', v)}
                error={formErrors.lastName}
              />
            </div>

            <div className="flex gap-3">
              <FloatingTextField
                name="city"
                label="City"
                value={formValues.city}
                onChange={(v) => updateField('city', v)}
                error={formErrors.city}
              />

              <SelectTextField
                name="country"
                label="Country"
                value={formValues.country}
                onChange={(v) => updateField('country', v)}
                options={countryOptions}
                placeholder="Select country"
                error={formErrors.country}
              />
            </div>

            <div>
              <AutoResizableTextAreaField
                label="Bio"
                value={formValues.bio}
                onChange={(v) => updateField('bio', v)}
                placeholder="Tell the world a little bit about yourself. The shorter the better"
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
                        onChange={(event) =>
                          updateLinkField(link.id, 'url', event.target.value)
                        }
                        className="flex-1 h-10 rounded bg-interactive-default px-3 text-sm text-text-primary outline-none placeholder:text-text-muted"
                      />

                      {link.kind !== 'support' ? (
                        <input
                          type="text"
                          placeholder="Short title"
                          value={link.title}
                          onChange={(event) =>
                            updateLinkField(link.id, 'title', event.target.value)
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

                          <div
                            className={`absolute left-1/2 top-6 -translate-x-1/2 w-64 bg-surface-raised text-text-primary text-xs p-2 rounded border border-border-default shadow-lg transition z-20 ${
                              openSupportTooltipId === link.id
                                ? 'opacity-100 visible'
                                : 'opacity-0 invisible'
                            }`}
                          >
                            Support links help listeners directly support your
                            work.
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
