'use client';

import React, { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/buttons/Button';
import {
  ArtworkPreviewField,
  AutoResizableTextAreaField,
  FloatingTextField,
  SelectTextField,
} from '@/components/FormFields';
import { X } from 'lucide-react';
import { useEditProfileForm } from '@/features/prof/hooks/useEditProfileForm';
import type { EditProfileFormValues } from '@/types/editProfile';
import FavoriteGenresSelector from '@/features/prof/components/FavoriteGenresSelector';
import ScrollableArea from '@/components/scroll/ScrollableArea';

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
    avatarPreviewUrl,
    coverPreviewUrl,
    countryOptions,
    updateField,
    handleImageSelect,
    handleImageRemove,
    handleCoverImageSelect,
    handleCoverImageRemove,
    handleSubmit,
  } = useEditProfileForm({
    open,
    onSubmit: handleSuccessfulSubmit,
  });

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center">
          {/* BACKDROP (ONLY THIS closes modal) */}
    <ScrollableArea maxHeight="600px" className="bg-surface-raised">
    <div
      className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm"
      onClick={onClose}
    />
      <div className="relative rounded bg-white dark:bg-black border border-white/10">
        {/* CLOSE BUTTON */} 
        <button
          onClick={onClose}
          // classname must be top-4, but due to header
            className="fixed top-7 right-6 z-60 p-2 rounded-full bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md">
          <X size={20} />
        </button>

        <div className="px-6 py-4 border-b border-border-default text-[17px] font-bold">
          Edit your Profile
        </div>

        <form onSubmit={handleSubmit} className="flex gap-6 p-6">
          <div className="w-65 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-3">
              <div className="w-48">
                <ArtworkPreviewField
                  previewUrl={avatarPreviewUrl}
                  onSelect={handleImageSelect}
                  onRemove={handleImageRemove}
                  emptyLabel="Add profile image"
                  replaceLabel="Replace Profile image"
                  removeLabel="Delete Profile image"
                />
              </div>

              <div className="w-48">
                <ArtworkPreviewField
                  previewUrl={coverPreviewUrl}
                  onSelect={handleCoverImageSelect}
                  onRemove={handleCoverImageRemove}
                  emptyLabel="Add cover image"
                  replaceLabel="Replace Cover image"
                  removeLabel="Delete Cover image"
                />
              </div>
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

            <FavoriteGenresSelector
              value={formValues.favoriteGenres}
              onChange={(genres) => updateField('favoriteGenres', genres)}
            />

            {formErrors.favoriteGenres ? (
              <p className="text-xs text-red-400">{formErrors.favoriteGenres}</p>
            ) : null}

            <div className="pt-2 border-t border-border-default">
              <p className="text-xs font-semibold text-text-primary mb-3">
                Social Links
              </p>
              <div className="space-y-3">
                <FloatingTextField
                  name="website"
                  label="Website"
                  value={formValues.website}
                  onChange={(v) => updateField('website', v)}
                  error={formErrors.website}
                  placeholder="https://yourwebsite.com"
                />

                <FloatingTextField
                  name="instagram"
                  label="Instagram"
                  value={formValues.instagram}
                  onChange={(v) => updateField('instagram', v)}
                  error={formErrors.instagram}
                  placeholder="https://instagram.com/yourname"
                />

                <FloatingTextField
                  name="twitter"
                  label="Twitter / X"
                  value={formValues.twitter}
                  onChange={(v) => updateField('twitter', v)}
                  error={formErrors.twitter}
                  placeholder="https://x.com/yourname"
                />
              </div>
            </div>

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
      </ScrollableArea>
    </div>
  );
};

export default EditProfileModal;
