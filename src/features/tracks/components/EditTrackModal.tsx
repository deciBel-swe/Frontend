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
  const [isLoadingMeta, setIsLoadingMeta] = useState(false);
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
      setIsLoadingMeta(true);
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
      } finally {
        if (!isCancelled) {
          setIsLoadingMeta(false);
        }
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-surface-overlay"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="w-full max-w-5xl bg-surface-default text-text-primary border border-border-default rounded-lg shadow-2xl overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-default">
            <div className="text-sm font-semibold">Edit Track</div>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-border-default">
            <nav className="flex items-center gap-6 px-5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={[
                      'relative py-3 text-xs font-semibold transition-colors',
                      isActive
                        ? 'text-text-primary'
                        : 'text-text-muted hover:text-text-secondary',
                    ].join(' ')}
                  >
                    {tab.label}
                    {tab.isNew ? (
                      <span className="ml-1 rounded bg-status-error px-1.5 py-0.5 text-[9px] font-bold text-white">
                        NEW
                      </span>
                    ) : null}
                    {isActive ? (
                      <span className="absolute left-0 right-0 -bottom-px h-0.5 bg-text-primary" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {activeTab === 'basic' ? (
              <div className="px-5 py-6">
                {isLoadingMeta ? (
                  <p className="mb-3 text-xs text-text-muted">
                    Loading track details...
                  </p>
                ) : null}
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
                  onTrackLinkSuffixChange={(nextSuffix) => {
                    setTrackLinkEdited(true);
                    setTrackLinkSuffix(toTrackSlug(nextSuffix));
                  }}
                  artist={artist}
                  onArtistChange={setArtist}
                  genre={genre}
                  onGenreChange={setGenre}
                  tags={tags}
                  onTagsChange={setTags}
                  description={description}
                  onDescriptionChange={(next) => {
                    setDescriptionTouched(true);
                    setDescription(next);
                  }}
                  releaseDate={releaseDate}
                  releaseDateError={releaseDateError}
                  onReleaseDateChange={(nextDate) => {
                    setReleaseDate(nextDate);
                    if (releaseDateError) {
                      setReleaseDateError('');
                    }
                  }}
                  releaseDateMax={todayIsoDate}
                  showReleaseDate
                  privacy={privacy}
                  onPrivacyChange={(next) => {
                    setPrivacyTouched(true);
                    setPrivacy(next);
                  }}
                />
              </div>
            ) : null}

            {activeTab !== 'basic' ? (
              <div className="px-5 py-8 text-sm text-text-muted">
                This section will be available soon.
              </div>
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-border-default">
            <span className="text-[11px] text-text-muted">
              {saveError.length > 0
                ? saveError
                : metaError.length > 0
                  ? metaError
                  : '* Required fields'}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving || isLoadingMeta}
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
