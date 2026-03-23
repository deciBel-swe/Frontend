'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks';
import { config } from '@/config';
import { trackService } from '@/services';
import { generateWaveform } from '@/utils/generateWaveform';
import { validateAudioFile, validateImageFile } from '@/utils/fileValidation';
import UploadDropzone from '@/features/tracks/TrackUploadForm/FormFields/UploadDropzone';
import UploadForm from '@/features/tracks/TrackUploadForm/UploadForm';
import UploadSuccess from '@/features/tracks/TrackUploadForm/UploadSuccess';
import { toTrackSlug, uploadSchema } from '@/types/uploadSchema';
import type { TrackPrivacyValue } from '@/types/tracks';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB in bytes
const ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/x-aac',
  'audio/mp4',
];
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac'];

const getWaveformParseErrorMessage = (err: unknown): string => {
  if (err instanceof Error && err.message.trim().length > 0) {
    return `Unable to parse audio for waveform: ${err.message}`;
  }

  return 'Unable to parse audio for waveform. Please try another file.';
};

export default function UploadView() {
  const { user } = useAuth();
  const todayIsoDate = new Date().toISOString().slice(0, 10);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [titleError, setTitleError] = useState<string>('');
  const [trackLinkError, setTrackLinkError] = useState<string>('');
  const [genreError, setGenreError] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [artistEdited, setArtistEdited] = useState(false);
  const normalizedDomainName = config.urls.domainName.replace(/\/+$/, '');
  const trackLinkPrefix = `${normalizedDomainName}/${user?.username ?? 'user1'}`;
  const [trackLinkSuffix, setTrackLinkSuffix] = useState('');
  const [trackLinkEdited, setTrackLinkEdited] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  const [releaseDate, setReleaseDate] = useState(todayIsoDate);
  const [releaseDateError, setReleaseDateError] = useState('');
  const [privacy, setPrivacy] = useState<TrackPrivacyValue>('public');
  const [artworkFile, setArtworkFile] = useState<File | null>(null);
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadedTrackUrl, setUploadedTrackUrl] = useState<string | null>(null);
  const [generatedWaveform, setGeneratedWaveform] = useState<number[]>([]);
  const [waveformHeight, setWaveformHeight] = useState(300);

  useEffect(() => {
    if (audioFile) {
      const nameWithoutExt = audioFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
  }, [audioFile]);

  useEffect(() => {
    if (trackLinkEdited) {
      return;
    }

    setTrackLinkSuffix(toTrackSlug(title));
  }, [title, trackLinkEdited]);

  useEffect(() => {
    if (artistEdited || artist.trim().length > 0) {
      return;
    }

    if (user?.username) {
      setArtist(user.username);
    }
  }, [artist, artistEdited, user?.username]);

  useEffect(() => {
    const updateWaveformHeight = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setWaveformHeight(120);
      } else if (width < 1024) {
        setWaveformHeight(180);
      } else {
        setWaveformHeight(240);
      }
    };

    updateWaveformHeight();
    window.addEventListener('resize', updateWaveformHeight);
    return () => window.removeEventListener('resize', updateWaveformHeight);
  }, []);

  useEffect(() => {
    let isCancelled = false;
    if (!audioFile) {
      setGeneratedWaveform([]);
      return;
    }

    generateWaveform(audioFile)
      .then((values) => {
        if (isCancelled) return;
        const normalized = values
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
          .map((value) => Math.max(0, Math.min(1, value)));
        setGeneratedWaveform(normalized);
        setError('');
      })
      .catch((err) => {
        if (!isCancelled) {
          setGeneratedWaveform([]);
          setError(getWaveformParseErrorMessage(err));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [audioFile]);

  const startUpload = async () => {
    if (!audioFile) return;
    const validation = uploadSchema.safeParse({
      title,
      trackLinkSuffix,
      artist,
      genre,
      tags,
      description,
      releaseDate,
      privacy,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setTitleError(fieldErrors.title?.[0] ?? '');
      setTrackLinkError(fieldErrors.trackLinkSuffix?.[0] ?? '');
      setGenreError(fieldErrors.genre?.[0] ?? '');
      setReleaseDateError(fieldErrors.releaseDate?.[0] ?? '');
      return;
    }

    setTitleError('');
    setTrackLinkError('');
    setGenreError('');
    setReleaseDateError('');

    const formData = new FormData();

    formData.append('audioFile', audioFile);

    if (artworkFile) {
      formData.append('coverImage', artworkFile);
    }

    formData.append('title', title);
    formData.append('trackLinkSuffix', trackLinkSuffix);
    formData.append('genre', genre || '');
    formData.append('isPrivate', String(privacy === 'private'));
    formData.append('releaseDate', releaseDate);
    if (description.trim().length > 0) {
      formData.append('description', description);
    }
    if (artist.trim().length > 0) {
      formData.append('artist', artist);
    }
    const tagEntries = tags
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);
    if (tagEntries.length > 0) {
      formData.append('tags', JSON.stringify(tagEntries));
    }
    setIsUploading(true);

    try {
      const waveform = await generateWaveform(audioFile);

      const normalizedWaveform = waveform
        .map((value: string) => Number(value))
        .filter((value) => Number.isFinite(value));
      formData.append('waveformData', JSON.stringify(normalizedWaveform));

      const response = await trackService.uploadTrack(
        formData,
        setUploadProgress
      );
      const submittedTrackUrl = `${trackLinkPrefix}/${trackLinkSuffix}`;
      setUploadComplete(true);
      setIsUploading(false);
      setUploadedTrackUrl(submittedTrackUrl || response.trackUrl);
    } catch (err) {
      setError(getWaveformParseErrorMessage(err));
      setIsUploading(false);
      console.error('Track upload error:', err);
    }
  };

  const resetUpload = () => {
    setAudioFile(null);
    setShowForm(false);
    setUploadProgress(0);
    setUploadComplete(false);
    setIsUploading(false);
    setError('');
    setTitle('');
    setTitleError('');
    setTrackLinkError('');
    setGenreError('');
    setTrackLinkSuffix('');
    setTrackLinkEdited(false);
    setArtist('');
    setArtistEdited(false);
    setGenre('');
    setTags([]);
    setDescription('');
    setReleaseDate(todayIsoDate);
    setReleaseDateError('');
    setPrivacy('public');
    setArtworkFile(null);
    setArtworkPreview(null);
    setGeneratedWaveform([]);
  };

  const handleArtwork = async (file: File) => {
    try {
      const validation = await validateImageFile(file);
      if (!validation.ok) {
        alert(validation.reason ?? 'Artwork must be a valid image file.');
        return;
      }

      setArtworkFile(file);

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
  };

  const handleAudio = async (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (
      !ALLOWED_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(fileExtension)
    ) {
      setError(
        'Invalid file type. Please upload MP3, WAV, FLAC, or AAC files only.'
      );
      setAudioFile(null);
      setShowForm(false);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File size exceeds 500MB limit (${(file.size / (1024 * 1024)).toFixed(
          2
        )}MB)`
      );
      setAudioFile(null);
      setShowForm(false);
      return;
    }

    try {
      const validation = await validateAudioFile(file);
      if (!validation.ok) {
        setError(
          validation.reason ??
            'File content does not match a supported audio format.'
        );
        setAudioFile(null);
        setShowForm(false);
        return;
      }
    } catch (err) {
      console.error('Audio validation failed:', err);
      setError('Unable to read audio file. Please try another file.');
      setAudioFile(null);
      setShowForm(false);
      return;
    }

    setError('');
    setAudioFile(file);
    setShowForm(true);
    console.log(
      'Valid file:',
      file.name,
      (file.size / (1024 * 1024)).toFixed(2),
      'MB'
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      void handleAudio(file);
    }
  };

  if (uploadComplete && uploadedTrackUrl) {
    return (
      <UploadSuccess
        uploadedTrackUrl={uploadedTrackUrl}
        generatedWaveform={generatedWaveform}
        waveformHeight={waveformHeight}
        onReset={resetUpload}
      />
    );
  }

  if (showForm && audioFile) {
    return (
      <UploadForm
        audioFile={audioFile}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        error={error}
        onReset={resetUpload}
        onSubmit={startUpload}
        artworkPreview={artworkPreview}
        onArtworkSelect={handleArtwork}
        onRemoveArtwork={removeArtwork}
        title={title}
        titleError={titleError}
        onTitleChange={(nextTitle) => {
          setTitle(nextTitle);
          if (titleError && nextTitle.trim().length > 0) {
            setTitleError('');
          }
        }}
        trackLinkPrefix={trackLinkPrefix}
        trackLinkSuffix={trackLinkSuffix}
        trackLinkError={trackLinkError}
        onTrackLinkSuffixChange={(nextSuffix) => {
          setTrackLinkEdited(true);
          setTrackLinkSuffix(toTrackSlug(nextSuffix));
          if (trackLinkError) {
            setTrackLinkError('');
          }
        }}
        artist={artist}
        onArtistChange={(nextArtist) => {
          setArtistEdited(true);
          setArtist(nextArtist);
        }}
        genre={genre}
        genreError={genreError}
        onGenreChange={(nextGenre) => {
          setGenre(nextGenre);
          if (genreError) {
            setGenreError('');
          }
        }}
        tags={tags}
        onTagsChange={setTags}
        description={description}
        onDescriptionChange={setDescription}
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
        onPrivacyChange={setPrivacy}
      />
    );
  }

  return (
    <UploadDropzone
      error={error}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onFileSelected={(file) => {
        void handleAudio(file);
      }}
    />
  );
}
