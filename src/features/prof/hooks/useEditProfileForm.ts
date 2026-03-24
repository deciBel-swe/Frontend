import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGetCountry } from '@/hooks/useGetCountry';
import { useEditMe } from './useEditMe';
import { useEditProfileInitialValues } from './useEditProfileInitialValues';
import {
  buildSocialLinksFromProfileLinks,
  emptyEditProfileFormValues,
  getEditProfileFormErrors,
  MAX_PROFILE_LINKS,
  type EditProfileFormErrors,
  type EditProfileFormValues,
} from '@/types/editProfile';
import type {
  ProfileLink,
  UpdateImagesJsonRequest,
  UpdateMeRequest,
} from '@/types/user';
import type { SelectTextOption } from '@/components/FormFields';
import { validateLinks } from '@/utils/forValidation';
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
    nextLinkId,
    isLoading: isInitialLoading,
    error: initialLoadError,
  } = useEditProfileInitialValues();

  const nextLinkIdRef = useRef(1);
  const hasHydratedFromUserRef = useRef(false);

  const [isLinksTooltipOpen, setIsLinksTooltipOpen] = useState(false);
  const [openSupportTooltipId, setOpenSupportTooltipId] = useState<
    number | null
  >(null);
  const [formValues, setFormValues] = useState<EditProfileFormValues>(
    emptyEditProfileFormValues
  );
  const [links, setLinks] = useState<ProfileLink[]>([]);
  const [linkErrors, setLinkErrors] = useState<Record<number, string>>({});
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [formErrors, setFormErrors] = useState<EditProfileFormErrors>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);

  const hasSupportLink = links.some((item) => item.kind === 'support');

  useEffect(() => {
    if (!open) {
      hasHydratedFromUserRef.current = false;
      return;
    }

    if (!initialValues || hasHydratedFromUserRef.current) {
      return;
    }

    const hydratedValues: EditProfileFormValues = {
      ...initialValues,
      avatar: initialValues.avatar,
    };

    setFormValues(hydratedValues);
    setLinks(initialValues.links);
    setAvatarPreviewUrl(initialValues.avatar);
    nextLinkIdRef.current = Math.max(nextLinkId, initialValues.links.length + 1);
    setLinkErrors(validateLinks(initialValues.links));
    setFormErrors(getEditProfileFormErrors(hydratedValues));
    hasHydratedFromUserRef.current = true;
  }, [initialValues, nextLinkId, open]);

  const countryOptions: SelectTextOption[] = useMemo(() => {
    return Array.from(
      new Map(
        countries.map((country) => [country.name.toLowerCase(), country.name])
      ).values()
    ).map((countryName) => ({
      label: countryName,
      value: countryName,
    }));
  }, [countries]);

  const addLink = useCallback(() => {
    if (links.length >= MAX_PROFILE_LINKS) {
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

      setFormValues((current) => ({ ...current, links: updated }));
      setLinkErrors(validateLinks(updated));
      return updated;
    });
  }, [links.length]);

  const addSupportLink = useCallback(() => {
    if (links.length >= MAX_PROFILE_LINKS || hasSupportLink) {
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

      setFormValues((current) => ({ ...current, links: updated }));
      setLinkErrors(validateLinks(updated));
      return updated;
    });
  }, [hasSupportLink, links.length]);

  const removeLink = useCallback((id: number) => {
    setLinks((prev) => {
      const next = prev.filter((item) => item.id !== id);
      setLinkErrors(validateLinks(next));
      setFormValues((current) => ({ ...current, links: next }));
      return next;
    });
  }, []);

  const updateLinkField = useCallback(
    (id: number, field: keyof Omit<ProfileLink, 'id'>, value: string) => {
      setLinks((prev) => {
        const next = prev.map((item) =>
          item.id === id
            ? {
                ...item,
                [field]: value,
                kind: item.kind as 'regular' | 'support',
              }
            : item
        );

        setLinkErrors(validateLinks(next));
        setFormValues((current) => ({ ...current, links: next }));
        return next;
      });
    },
    []
  );

  const updateField = useCallback(
    (field: keyof EditProfileFormValues, value: string) => {
      const nextValue = field === 'bio' ? value.slice(0, 200) : value;

      setFormValues((prev) => {
        const nextValues = {
          ...prev,
          [field]: nextValue,
        };

        setFormErrors(getEditProfileFormErrors({ ...nextValues, links }));
        return nextValues;
      });
    },
    [links]
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

  const submitForm = useCallback(async () => {
    const nextValues: EditProfileFormValues = {
      ...formValues,
      links,
      avatar: selectedImage ?? formValues.avatar,
    };

    setFormValues(nextValues);

    const errors = getEditProfileFormErrors(nextValues);
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

    const socialLinksPayload = buildSocialLinksFromProfileLinks(links) ?? {};
    const imagesPayload: UpdateImagesJsonRequest = {};

    if (selectedImage && avatarPreviewUrl) {
      imagesPayload.profilePic = avatarPreviewUrl;
    }

    const payload: UpdateMeRequest = {
      bio: nextValues.bio,
      city: nextValues.city,
      country: nextValues.country,
    };

    try {
      await editMe(payload);

      if (Object.keys(socialLinksPayload).length > 0) {
        await userService.updateSocialLinks(socialLinksPayload);
      }

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
    editMe,
    editMeError,
    formValues,
    links,
    onSubmit,
    selectedImage,
  ]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
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
  };
};
