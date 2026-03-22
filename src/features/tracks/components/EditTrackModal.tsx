'use client';

import { useEffect, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks';
import { config } from '@/config';
import type { TrackPrivacyValue } from '@/types/tracks';
import { toTrackSlug } from '@/types/uploadSchema';
import Button from '@/components/buttons/Button';
import ArtworkPreviewField from '@/features/tracks/TrackUploadForm/FormFields/ArtworkPreviewField';
import TrackTextField from '@/features/tracks/TrackUploadForm/FormFields/TrackTextField';
import TrackLinkField from '@/features/tracks/TrackUploadForm/FormFields/TrackLinkField';
import TrackGenreField from '@/features/tracks/TrackUploadForm/FormFields/TrackGenreField';
import TrackTagsCombobox from '@/features/tracks/TrackUploadForm/FormFields/TrackTagsCombobox';
import TrackDescriptionField from '@/features/tracks/TrackUploadForm/FormFields/TrackDescriptionField';
import { TrackPrivacy } from '@/features/tracks/TrackUploadForm/FormFields/TrackPrivacy';

type EditTrackModalProps = {
  open: boolean;
  onClose: () => void;
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
  track,
}: EditTrackModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<EditTab>('basic');
  const [title, setTitle] = useState(track.title);
  const [artist, setArtist] = useState(track.artist);
  const [trackLinkSuffix, setTrackLinkSuffix] = useState(
    toTrackSlug(track.title)
  );
  const [trackLinkEdited, setTrackLinkEdited] = useState(false);
  const [genre, setGenre] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');
  const [artworkPreview, setArtworkPreview] = useState<string | null>(
    track.cover ?? null
  );
  const [artworkFile, setArtworkFile] = useState<File | null>(null);

  const normalizedDomainName = config.urls.domainName.replace(/\/+$/, '');
  const trackLinkPrefix = useMemo(() => {
    const username = user?.username ?? track.artist ?? 'user';
    return `${normalizedDomainName}/${username}`;
  }, [normalizedDomainName, track.artist, user?.username]);

  useEffect(() => {
    if (!open) return;
    setActiveTab('basic');
    setTitle(track.title);
    setArtist(track.artist);
    setTrackLinkSuffix(toTrackSlug(track.title));
    setTrackLinkEdited(false);
    setGenre('');
    setTags([]);
    setDescription('');
    setPrivacy('public');
    setArtworkPreview(track.cover ?? null);
    setArtworkFile(null);
  }, [open, track.artist, track.cover, track.title]);

  useEffect(() => {
    if (trackLinkEdited) return;
    setTrackLinkSuffix(toTrackSlug(title));
  }, [title, trackLinkEdited]);

  const handleArtwork = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Artwork must be an image file');
      return;
    }

    setArtworkFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setArtworkPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeArtwork = () => {
    setArtworkFile(null);
    setArtworkPreview(null);
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl bg-surface-default text-text-primary border border-border-default rounded-lg shadow-2xl overflow-hidden">
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
                      <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-text-primary" />
                    ) : null}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="max-h-[70vh] overflow-y-auto">
            {activeTab === 'basic' ? (
              <div className="grid gap-6 md:grid-cols-[240px_1fr] px-5 py-6">
                <div className="flex flex-col gap-3">
                  <ArtworkPreviewField
                    artworkPreview={artworkPreview}
                    onArtworkSelect={handleArtwork}
                    onRemoveArtwork={removeArtwork}
                  />
                  {artworkFile ? (
                    <p className="text-[11px] text-text-muted">
                      New artwork selected.
                    </p>
                  ) : null}
                </div>

                <div className="max-w-xl">
                  <form className="space-y-4 text-sm">
                    <TrackTextField
                      label="Title"
                      value={title}
                      onChange={setTitle}
                      required
                      tooltipTitle="Track title"
                      tooltipText="Clear track titles help your fans know what they are listening to."
                    />

                    <TrackLinkField
                      prefix={trackLinkPrefix}
                      suffix={trackLinkSuffix}
                      onChange={(nextSuffix) => {
                        setTrackLinkEdited(true);
                        setTrackLinkSuffix(toTrackSlug(nextSuffix));
                      }}
                    />

                    <TrackTextField
                      label="Main Artist"
                      value={artist}
                      onChange={setArtist}
                      tooltipTitle="Main artist"
                      tooltipText="Put your name and any featured artists you want to give primary credit to here. These names will be displayed underneath your track title."
                    />

                    <TrackGenreField value={genre} onChange={setGenre} />

                    <TrackTagsCombobox value={tags} onChange={setTags} />

                    <TrackDescriptionField
                      value={description}
                      onChange={setDescription}
                    />

                    <TrackPrivacy value={privacy} onChange={setPrivacy} />
                  </form>
                </div>
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
            <span className="text-[11px] text-text-muted">* Required fields</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="secondary">Save changes</Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
