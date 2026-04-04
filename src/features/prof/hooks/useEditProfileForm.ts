import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useGetCountry } from '@/hooks/useGetCountry';
import { useEditMe } from './useEditMe';
import { useEditProfileInitialValues } from './useEditProfileInitialValues';
import {
  buildSocialLinksFromFields,
  emptyEditProfileFormValues,
  getEditProfileFormErrors,
  type EditProfileFormErrors,
  type EditProfileFormValues,
} from '@/types/editProfile';
import type {
  UpdateImagesJsonRequest,
  UpdateMeRequest,
} from '@/types/user';
import type { SelectTextOption } from '@/components/FormFields';
import { validateImageFile } from '@/utils/fileValidation';
import { userService } from '@/services';

type UseEditProfileFormOptions = {
  open: boolean;
  onSubmit?: (data: EditProfileFormValues) => void;
};

export const useEditProfileForm = ({
  open,
  onSubmit,
}: UseEditProfileFormOptions) => {
  const { data: countries } = useGetCountry();
  const { editMe, isUpdating, error: editMeError } = useEditMe();
  const {
    initialValues,
    isLoading: isInitialLoading,
    error: initialLoadError,
  } = useEditProfileInitialValues();

  const hasHydratedFromUserRef = useRef(false);

  const [formValues, setFormValues] = useState<EditProfileFormValues>(
    emptyEditProfileFormValues
  );
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<EditProfileFormErrors>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [selectedCoverImage, setSelectedCoverImage] = useState<File | null>(
    null
  );
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      hasHydratedFromUserRef.current = false;
      setSelectedImage(null);
      setSelectedCoverImage(null);
      return;
    }

    if (!initialValues || hasHydratedFromUserRef.current) {
      return;
    }

    const hydratedValues: EditProfileFormValues = {
      ...initialValues,
      avatar: initialValues.avatar,
      coverImage: initialValues.coverImage,
    };

    setFormValues(hydratedValues);
    setAvatarPreviewUrl(initialValues.avatar);
    setCoverPreviewUrl(initialValues.coverImage);
    setFormErrors(getEditProfileFormErrors(hydratedValues));
    hasHydratedFromUserRef.current = true;
  }, [initialValues, open]);

  const countryOptions: SelectTextOption[] = useMemo(() => {
    const countryList = countries ?? [];

    return Array.from(
      new Map(
        countryList.map((country) => [
          country.name.toLowerCase(),
          country.name,
        ])
      ).values()
    ).map((countryName) => ({
      label: countryName,
      value: countryName,
    }));
  }, [countries]);

  const updateField = useCallback(
    <K extends keyof EditProfileFormValues>(
      field: K,
      value: EditProfileFormValues[K]
    ) => {
      setFormValues((prev) => {
        const nextValues = {
          ...prev,
          [field]: field === 'bio' && typeof value === 'string'
            ? value.slice(0, 200)
            : value,
        };

        setFormErrors(getEditProfileFormErrors(nextValues));
        return nextValues;
      });
    },
    []
  );

  const handleImageSelect = useCallback(async (file: File) => {
    try {
      const validation = await validateImageFile(file);
      if (!validation.ok) {
        alert(validation.reason ?? 'Profile image must be a valid image file.');
        return;
      }

      setSelectedImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreviewUrl(
          typeof reader.result === 'string' ? reader.result : null
        );
      };
      reader.readAsDataURL(file);

      setFormValues((prev) => ({ ...prev, avatar: file }));
    } catch (err) {
      console.error('Profile image validation failed:', err);
      alert('Unable to read profile image. Please try another image.');
    }
  }, []);

  const handleImageRemove = useCallback(() => {
    setSelectedImage(null);
    setAvatarPreviewUrl(null);
    setFormValues((prev) => ({ ...prev, avatar: null }));
  }, []);

  const handleCoverImageSelect = useCallback(async (file: File) => {
    try {
      const validation = await validateImageFile(file);
      if (!validation.ok) {
        alert(validation.reason ?? 'Cover image must be a valid image file.');
        return;
      }

      setSelectedCoverImage(file);

      const reader = new FileReader();
      reader.onload = () => {
        setCoverPreviewUrl(
          typeof reader.result === 'string' ? reader.result : null
        );
      };
      reader.readAsDataURL(file);

      setFormValues((prev) => ({ ...prev, coverImage: file }));
    } catch (err) {
      console.error('Cover image validation failed:', err);
      alert('Unable to read cover image. Please try another image.');
    }
  }, []);

  const handleCoverImageRemove = useCallback(() => {
    setSelectedCoverImage(null);
    setCoverPreviewUrl(null);
    setFormValues((prev) => ({ ...prev, coverImage: null }));
  }, []);

  const submitForm = useCallback(async () => {
    const nextValues: EditProfileFormValues = {
      ...formValues,
      avatar: selectedImage ?? formValues.avatar,
      coverImage: selectedCoverImage ?? formValues.coverImage,
    };

    setFormValues(nextValues);

    const errors = getEditProfileFormErrors(nextValues);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setSubmitError(undefined);
    const imagesPayload: UpdateImagesJsonRequest = {};

    if (selectedImage && avatarPreviewUrl) {
      imagesPayload.profilePic = avatarPreviewUrl;
    }
    if (selectedCoverImage && coverPreviewUrl) {
      imagesPayload.coverPic = coverPreviewUrl;
    }

    const payload: UpdateMeRequest = {
      bio: nextValues.bio,
      city: nextValues.city,
      country: nextValues.country,
      favoriteGenres: nextValues.favoriteGenres,
      socialLinks: buildSocialLinksFromFields(nextValues),
    };

    try {
      await editMe(payload);

      if (Object.keys(imagesPayload).length > 0) {
        await userService.updateImages(imagesPayload);
      }

      onSubmit?.(nextValues);
    } catch (caughtError) {
      setSubmitError(
        caughtError instanceof Error
          ? caughtError.message
          : (editMeError ?? 'Failed to update profile')
      );
    }
  }, [
    avatarPreviewUrl,
    coverPreviewUrl,
    editMe,
    editMeError,
    formValues,
    onSubmit,
    selectedImage,
    selectedCoverImage,
  ]);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      await submitForm();
    },
    [submitForm]
  );

  return {
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
  };
};
