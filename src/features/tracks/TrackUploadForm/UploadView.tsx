'use client'

import { useEffect, useState } from 'react'
import { z } from 'zod'
import { trackService } from '@/services'
import { generateWaveform } from '@/utils/generateWaveform'
import UploadDropzone from '@/features/tracks/TrackUploadForm/UploadDropzone'
import UploadFormView from '@/features/tracks/TrackUploadForm/UploadFormView'
import UploadSuccess from '@/features/tracks/TrackUploadForm/UploadSuccess'

const uploadSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
})

const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB in bytes
const ALLOWED_TYPES = [
  'audio/mpeg',
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/aac',
  'audio/x-aac',
  'audio/mp4',
]
const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac']

export default function UploadView() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [titleError, setTitleError] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const trackLinkPrefix = 'www.decibel.com/user1'
  const [trackLinkSuffix, setTrackLinkSuffix] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [genre, setGenre] = useState('')
  const [description, setDescription] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadedTrackUrl, setUploadedTrackUrl] = useState<string | null>(null)
  const [generatedWaveform, setGeneratedWaveform] = useState<number[]>([])
  const [waveformHeight, setWaveformHeight] = useState(300)

  useEffect(() => {
    if (audioFile) {
      const nameWithoutExt = audioFile.name.replace(/\.[^/.]+$/, '')
      setTitle(nameWithoutExt)
    }
  }, [audioFile])

  useEffect(() => {
    const updateWaveformHeight = () => {
      const width = window.innerWidth
      if (width < 640) {
        setWaveformHeight(120)
      } else if (width < 1024) {
        setWaveformHeight(180)
      } else {
        setWaveformHeight(240)
      }
    }

    updateWaveformHeight()
    window.addEventListener('resize', updateWaveformHeight)
    return () => window.removeEventListener('resize', updateWaveformHeight)
  }, [])

  useEffect(() => {
    let isCancelled = false
    if (!audioFile) {
      setGeneratedWaveform([])
      return
    }

    generateWaveform(audioFile)
      .then((values) => {
        if (isCancelled) return
        const normalized = values
          .map((value) => Number(value))
          .filter((value) => Number.isFinite(value))
          .map((value) => Math.max(0, Math.min(1, value)))
        setGeneratedWaveform(normalized)
      })
      .catch(() => {
        if (!isCancelled) setGeneratedWaveform([])
      })

    return () => {
      isCancelled = true
    }
  }, [audioFile])

  const startUpload = async () => {
    if (!audioFile) return
    const validation = uploadSchema.safeParse({ title })
    if (!validation.success) {
      setTitleError(validation.error.issues[0]?.message ?? 'Title is required')
      return
    }
    setTitleError('')

    const formData = new FormData()

    formData.append('audioFile', audioFile)

    if (artworkFile) {
      formData.append('coverImage', artworkFile)
    }

    formData.append('title', title)
    formData.append('genre', genre || 'Electronic')
    formData.append('isPrivate', String(privacy === 'private'))
    formData.append('releaseDate', new Date().toISOString().slice(0, 10))
    if (description.trim().length > 0) {
      formData.append('description', description)
    }
    if (artist.trim().length > 0) {
      formData.append('artist', artist)
    }
    const tagEntries = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
    if (tagEntries.length > 0) {
      formData.append('tags', JSON.stringify(tagEntries))
    }
    setIsUploading(true)

    try {
      const waveform = await generateWaveform(audioFile)

      const normalizedWaveform = waveform
        .map((value: string) => Number(value))
        .filter((value) => Number.isFinite(value))
      formData.append('waveformData', JSON.stringify(normalizedWaveform))

      const response = await trackService.uploadTrack(
        formData,
        'mock-token',
        setUploadProgress,
      )
      setUploadComplete(true)
      setIsUploading(false)
      setUploadedTrackUrl(response.trackUrl)
    } catch (err) {
      setError('Upload failed')
      setIsUploading(false)
      console.error('Track upload error:', err)
    }
  }

  const resetUpload = () => {
    setAudioFile(null)
    setShowForm(false)
    setUploadProgress(0)
    setUploadComplete(false)
    setIsUploading(false)
    setError('')
  }

  const handleArtwork = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Artwork must be an image file')
      return
    }

    setArtworkFile(file)

    const reader = new FileReader()
    reader.onload = () => {
      setArtworkPreview(reader.result as string)
    }

    reader.readAsDataURL(file)
  }

  const removeArtwork = () => {
    setArtworkFile(null)
    setArtworkPreview(null)
  }

  const handleAudio = (file: File) => {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (
      !ALLOWED_TYPES.includes(file.type) &&
      !ALLOWED_EXTENSIONS.includes(fileExtension)
    ) {
      setError(
        'Invalid file type. Please upload MP3, WAV, FLAC, or AAC files only.',
      )
      setAudioFile(null)
      setShowForm(false)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError(
        `File size exceeds 500MB limit (${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB)`,
      )
      setAudioFile(null)
      setShowForm(false)
    } else {
      setError('')
      setAudioFile(file)
      setShowForm(true)
      console.log(
        'Valid file:',
        file.name,
        (file.size / (1024 * 1024)).toFixed(2),
        'MB',
      )
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) handleAudio(file)
  }

  if (uploadComplete && uploadedTrackUrl) {
    return (
      <UploadSuccess
        uploadedTrackUrl={uploadedTrackUrl}
        generatedWaveform={generatedWaveform}
        waveformHeight={waveformHeight}
        onReset={resetUpload}
      />
    )
  }

  if (showForm && audioFile) {
    return (
      <UploadFormView
        audioFile={audioFile}
        isUploading={isUploading}
        uploadProgress={uploadProgress}
        onReset={resetUpload}
        onSubmit={startUpload}
        artworkPreview={artworkPreview}
        onArtworkSelect={handleArtwork}
        onRemoveArtwork={removeArtwork}
        title={title}
        titleError={titleError}
        onTitleChange={(nextTitle) => {
          setTitle(nextTitle)
          if (titleError && nextTitle.trim().length > 0) {
            setTitleError('')
          }
        }}
        trackLinkPrefix={trackLinkPrefix}
        trackLinkSuffix={trackLinkSuffix}
        onTrackLinkSuffixChange={setTrackLinkSuffix}
        artist={artist}
        onArtistChange={setArtist}
        genre={genre}
        onGenreChange={setGenre}
        tags={tags}
        onTagsChange={setTags}
        description={description}
        onDescriptionChange={setDescription}
        privacy={privacy}
        onPrivacyChange={setPrivacy}
      />
    )
  }

  return (
    <UploadDropzone
      error={error}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onFileSelected={handleAudio}
    />
  )
}
