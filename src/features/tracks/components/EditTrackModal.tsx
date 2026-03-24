'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks';
import { config } from '@/config';
import { trackService } from '@/services';
import { useQueryClient } from '@tanstack/react-query';
import type { TrackPrivacyValue } from '@/types/tracks';
import { toTrackSlug } from '@/types/uploadSchema';
import { validateImageFile } from '@/utils/fileValidation';
import Button from '@/components/buttons/Button';
import UploadForm from '@/features/tracks/TrackUploadForm/UploadForm';

type EditTrackModalProps = {
  open: boolean;
  onClose: () => void;
  trackId: number;
  track: {
    title: string;
    artist: string;
    cover?: string;
  };
};

type EditTab = 'basic' | 'metadata' | 'permissions' | 'advanced';

export default function EditTrackModal({
  open,
  onClose,
  trackId,
  track,
}: EditTrackModalProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const todayIsoDate = new Date().toISOString().slice(0, 10);
  const [activeTab, setActiveTab] = useState<EditTab>('basic');
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [trackLinkSuffix, setTrackLinkSuffix] = useState(
    toTrackSlug('')
  );
  const [trackLinkEdited, setTrackLinkEdited] = useState(false);
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [releaseDate, setReleaseDate] = useState(todayIsoDate);
  const [releaseDateError, setReleaseDateError] = useState('');
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');
  const [privacyTouched, setPrivacyTouched] = useState(false);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(
    track.cover ?? null
  );
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkRemoved, setArtworkRemoved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  // const [isLoadingMeta, setIsLoadingMeta] = useState(false);
  const [metaError, setMetaError] = useState('');

  const normalizedDomainName = config.urls.domainName.replace(/\/+$/, '');
  const trackLinkPrefix = useMemo(() => {
    const username = user?.username ?? artist ?? track.artist ?? 'user';
    return `${normalizedDomainName}/${username}`;
  }, [artist, normalizedDomainName, track.artist, user?.username]);

  useEffect(() => {
    if (!open) return;

    let isCancelled = false;

    const resetFormState = () => {
      setActiveTab('basic');
      setTitle(track.title);
      setArtist(track.artist);
      setTrackLinkSuffix('');
      setTrackLinkEdited(false);
      setGenre('');
      setTags([]);
      setDescription('');
      setDescriptionTouched(false);
      setReleaseDate(todayIsoDate);
      setReleaseDateError('');
      setPrivacy('public');
      setPrivacyTouched(false);
      setArtworkPreview(track.cover ?? null);
      setArtworkFile(null);
      setArtworkRemoved(false);
      setSaveError('');
    };

    const loadTrack = async () => {
      resetFormState();
      // setIsLoadingMeta(true);
      setMetaError('');

      try {
        const data = await trackService.getTrackMetadata(trackId);
        if (isCancelled) return;

        const artistName =
          typeof data.artist === 'string'
            ? data.artist
            : data.artist.username;

        setTitle(data.title);
        setArtist(artistName);
        const trackUrl = data.trackUrl ?? '';
        const trackUrlPath = trackUrl
          ? new URL(trackUrl, normalizedDomainName).pathname
          : '';
        const trackUrlSegments = trackUrlPath.split('/').filter(Boolean);
        const trackUrlSuffix =
          trackUrlSegments.length > 0
            ? trackUrlSegments[trackUrlSegments.length - 1]
            : '';
        setTrackLinkSuffix(
          trackUrlSuffix ? toTrackSlug(trackUrlSuffix) : toTrackSlug(data.title)
        );
        setGenre(data.genre ?? '');
        setTags(data.tags ?? []);
        setDescription(data.description ?? '');
        setReleaseDate(data.releaseDate?.trim() || todayIsoDate);
        setArtworkPreview(data.coverUrl ?? null);
        setArtworkRemoved(false);
      } catch (err) {
        console.error('Failed to load track metadata:', err);
        if (!isCancelled) {
          setMetaError('Unable to load track details. Please try again.');
        }
      // } finally {
      //   if (!isCancelled) {
      //     setIsLoadingMeta(false);
      //   }
       }
    };

    void loadTrack();

    return () => {
      isCancelled = true;
    };
  }, [open, track.cover, track.artist, track.title, trackId]);

  useEffect(() => {
    if (trackLinkEdited) return;
    setTrackLinkSuffix(toTrackSlug(title));
  }, [title, trackLinkEdited]);

  const handleArtwork = async (file: File) => {
    try {
      const validation = await validateImageFile(file);
      if (!validation.ok) {
        alert(validation.reason ?? 'Artwork must be a valid image file.');
        return;
      }

      setArtworkFile(file);
      setArtworkRemoved(false);
      const reader = new FileReader();
      reader.onload = () => {
        setArtworkPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Artwork validation failed:', err);
      alert('Unable to read artwork file. Please try another image.');
    }
  };

  const removeArtwork = () => {
    setArtworkFile(null);
    setArtworkPreview(null);
    setArtworkRemoved(true);
  };

  const handleSave = async () => {
    if (isSaving) return;
    if (!Number.isFinite(trackId)) {
      setSaveError('Track is missing an id.');
      return;
    }
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setSaveError('Title is required.');
      return;
    }
    if (!releaseDate) {
      setReleaseDateError('Release date is required.');
      return;
    }
    if (releaseDate > todayIsoDate) {
      setReleaseDateError('Release date cannot be in the future.');
      return;
    }
    setSaveError('');
    setReleaseDateError('');
    setIsSaving(true);

    try {
      const formData = new FormData();
      if (artworkFile) {
        formData.append('coverImage', artworkFile);
      }
      if (!artworkFile && artworkRemoved) {
        formData.append('removeCover', 'true');
      }
      formData.append('title', trimmedTitle);

      const trimmedArtist = artist.trim();
      if (trimmedArtist.length > 0) {
        formData.append('artist', trimmedArtist);
      }

      const trimmedGenre = genre.trim();
      if (trimmedGenre.length > 0) {
        formData.append('genre', trimmedGenre);
      }

      const normalizedTags = tags
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      if (normalizedTags.length > 0) {
        formData.append('tags', JSON.stringify(normalizedTags));
      }

      if (descriptionTouched) {
        formData.append('description', description.trim());
      }

      formData.append('trackLinkSuffix', trackLinkSuffix);
      formData.append('releaseDate', releaseDate);

      if (privacyTouched) {
        formData.append('isPrivate', String(privacy === 'private'));
      }

      await trackService.updateTrack(trackId, formData);
      await queryClient.invalidateQueries({
        queryKey: ['userTracks', user?.id ?? 7],
      });
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('track-updated', { detail: { trackId } })
        );
      }
      onClose();
    } catch (err) {
      console.error('Track update error:', err);
      setSaveError('Unable to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  const tabs: { id: EditTab; label: string; isNew?: boolean }[] = [
    { id: 'basic', label: 'Basic info' },
    { id: 'metadata', label: 'Metadata' },
    { id: 'permissions', label: 'Permissions' },
    { id: 'advanced', label: 'Advanced', isNew: true },
  ];

  return (
    <>
      

      {/* MODAL WRAPPER */}
      <div className="fixed inset-0 z-50 flex items-end justify-center">
        {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/60 dark:bg-white/60 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-5xl bg-white dark:bg-black rounded-lg border border-white/10 shadow-2xl overflow-hidden">

          {/* CLOSE BUTTON (like EditProfileModal style) */}
          <button
            onClick={onClose}
            className="fixed top-15 right-6 z-[60] p-2 rounded-full bg-white/80 dark:bg-white/10 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-white/20 hover:text-black dark:hover:text-white transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-md">
            <X size={20} />
          </button>

          {/* HEADER */}
          <div className="px-5 py-4 border-b border-border-default font-semibold">
            Edit Track
          </div>

          {/* TABS */}
          <div className="flex gap-6 px-5 border-b border-border-default">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-xs font-semibold ${
                  activeTab === tab.id
                    ? 'text-black dark:text-white'
                    : 'text-gray-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* BODY */}
          <div className="max-h-[70vh] overflow-y-auto px-5 py-6">
            {activeTab === 'basic' ? (
              <UploadForm
                variant="modal"
                showHeader={false}
                showFooter={false}
                onSubmit={handleSave}
                artworkPreview={artworkPreview}
                onArtworkSelect={handleArtwork}
                onRemoveArtwork={removeArtwork}
                title={title}
                titleError=""
                onTitleChange={setTitle}
                trackLinkPrefix={trackLinkPrefix}
                trackLinkSuffix={trackLinkSuffix}
                onTrackLinkSuffixChange={(v) => {
                  setTrackLinkEdited(true);
                  setTrackLinkSuffix(toTrackSlug(v));
                }}
                artist={artist}
                onArtistChange={setArtist}
                genre={genre}
                onGenreChange={setGenre}
                tags={tags}
                onTagsChange={setTags}
                description={description}
                onDescriptionChange={(v) => {
                  setDescriptionTouched(true);
                  setDescription(v);
                }}
                releaseDate={releaseDate}
                releaseDateError={releaseDateError}
                onReleaseDateChange={setReleaseDate}
                releaseDateMax={todayIsoDate}
                showReleaseDate
                privacy={privacy}
                onPrivacyChange={setPrivacy}
              />
            ) : (
              <div className="text-sm text-gray-400">
                This section will be available soon.
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-center px-5 py-4 border-t border-border-default">
            <span className="text-xs text-red-400">
              {saveError || metaError || '* Required fields'}
            </span>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
