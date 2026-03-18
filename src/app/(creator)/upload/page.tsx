'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import { z } from 'zod'
import { uploadTrackService } from "@/services/index"
import { generateWaveform } from "@/features/generateWaveform"
import FloatingInputField from '@/features/auth/components/FormFields/FloatingInputField'
import FloatingSelectField from '@/features/auth/components/FormFields/FloatingSelectField'

const titleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
})

export default function UploadPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [titleError, setTitleError] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [trackLink, setTrackLink] = useState('')
  const [tags, setTags] = useState('')
  const [genre, setGenre] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [uploadedTrackUrl, setUploadedTrackUrl] = useState<string | null>(null)
  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB in bytes
  const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/x-aac', 'audio/mp4']
  const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac']
  useEffect(() => {
  if (audioFile) {
    const nameWithoutExt = audioFile.name.replace(/\.[^/.]+$/, "")
    setTitle(nameWithoutExt)
  }
  }, [audioFile])
  const startUpload = async () => {

    if (!audioFile) return
    const validation = titleSchema.safeParse({ title })
    if (!validation.success) {
      setTitleError(validation.error.issues[0]?.message ?? 'Title is required')
      return
    }
    setTitleError('')

    const formData = new FormData()

    formData.append("audioFile", audioFile)

    if (artworkFile) {
      formData.append("coverImage", artworkFile)
    }

    formData.append("title", title)
    formData.append("genre", genre || "Electronic")
    formData.append("description", "")
    formData.append("isPrivate", String(privacy === "private"))
    formData.append("releaseDate", "2025-01-01")
    setIsUploading(true)

    try {

      const waveform = await generateWaveform(audioFile)

      waveform.forEach((value: string) => {
        formData.append("waveformData", value)
      })

      const response = await uploadTrackService(formData, "mock-token", setUploadProgress)
      setUploadComplete(true)
      setIsUploading(false)
      setUploadedTrackUrl(response.trackUrl) // save the returned track URL
    } catch (err) {

      setError("Upload failed")
      setIsUploading(false)
      console.error("Track upload error:", err)

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
    if (!file.type.startsWith("image/")) {
      alert("Artwork must be an image file")
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
  const input = document.getElementById("artwork-input") as HTMLInputElement
  if (input) input.value = ""
}
  const handleAudio = (file: File) => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError('Invalid file type. Please upload MP3, WAV, FLAC, or AAC files only.')
      setAudioFile(null)
      setShowForm(false)
      return
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 500MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      setAudioFile(null)
      setShowForm(false)
    } else {
      setError('')
      setAudioFile(file)
      setShowForm(true) // Show the form when file is uploaded
      console.log('Valid file:', file.name, (file.size / (1024 * 1024)).toFixed(2), 'MB')
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
  // Show completed upload message
  if (uploadComplete && uploadedTrackUrl) {
    return (
      <section className="min-h-screen w-full flex flex-col items-center justify-center gap-6 px-6">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-text-primary">Saved to DeciBel.</h2>
          <p className="text-text-secondary mt-2">
            Congratulations!, Your tracks are now on DeciBel.
          </p>
        </div>
        <div className="mt-4">
          <a
            href={uploadedTrackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border-contrast text-text-primary px-6 py-2 rounded-full font-semibold hover:bg-interactive-hover transition"
          >
            View Track
          </a>
        </div>
        <div className="mt-6">
          <button
            onClick={resetUpload}
            className="text-sm text-text-muted hover:text-text-secondary transition"
          >
            Upload Another Track
          </button>
        </div>
      </section>
    )
  }
  // If form should be shown, render the form
  if (showForm && audioFile) {
    return (
      <section className="min-h-screen w-full pb-24">
        {/* Top Bar */}
          <div className="sticky top-0 w-full mb-8">

            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

              {isUploading ? (
                <div className="w-full">
                  <div className="flex justify-between text-sm text-text-muted mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div className="w-full h-2 bg-surface-raised rounded">
                    <div
                      className="h-full bg-brand-accent transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded bg-interactive-default flex items-center justify-center text-xs text-text-muted">
                      ♪
                    </div>

                    <span className="text-sm text-text-secondary font-medium">
                      {audioFile?.name}
                    </span>

                  </div>

                  <button
                    onClick={resetUpload}
                    className="text-sm text-text-muted hover:text-text-secondary transition"
                  >
                    Replace
                  </button>
                </>
              )}

            </div>

          </div>
        <div className="flex justify-center px-6 md:px-12 lg:px-20">
          <div className="w-full max-w-3xl py-2">
            <div className="grid md:grid-cols-[300px_1fr] gap-8">
              {/* Artwork */}
              <div className="flex flex-col items-center gap-2">

                <div
                  className="w-full aspect-square border border-dashed border-border-default rounded-lg flex items-center justify-center hover:border-border-strong transition cursor-pointer overflow-hidden relative"
                  onClick={() => document.getElementById("artwork-input")?.click()}
                >

                  {artworkPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={artworkPreview}
                      alt="Artwork preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-text-muted text-xs gap-2">

                      {/* SVG placeholder */}
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <path d="M4 16l4-4 4 4 6-6 2 2v6H4z" />
                        <circle cx="9" cy="9" r="2" />
                      </svg>

                      <span>Add new artwork</span>

                    </div>
                  )}

                </div>

                {/* Replace / Remove buttons */}
                {artworkPreview && (
                  <div className="flex gap-3 text-xs">

                    <button
                      type="button"
                      onClick={() => document.getElementById("artwork-input")?.click()}
                      className="text-text-muted hover:text-text-secondary"
                    >
                      Replace
                    </button>

                    <button
                      type="button"
                      onClick={removeArtwork}
                      className="text-status-error hover:text-status-error"
                    >
                      Remove
                    </button>

                  </div>
                )}

                <input
                  id="artwork-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleArtwork(file)
                  }}
                />

              </div>

              {/* Track form */}
              <div className="p-4 max-w-xl">
                <form className="space-y-4 text-sm">

                  {/* Title */}
                  <div>
                    <FloatingInputField
                      type="text"
                      label="Track Title*"
                      value={title}
                      onChange={(nextTitle) => {
                        setTitle(nextTitle)
                        if (titleError && nextTitle.trim().length > 0) {
                          setTitleError('')
                        }
                      }}
                      error={titleError || undefined}
                    />
                  </div>
                  
                  {/* Track Link */}
                  <div>
                    <FloatingInputField
                      type="text"
                      label="Track Link"
                      value={trackLink}
                      onChange={setTrackLink}
                    />
                  </div>
                  {/* Main Artist */}
                  <div>
                    <FloatingInputField
                      type="text"
                      label="Main Artist"
                      value={artist}
                      onChange={setArtist}
                    />
                  </div>


                  {/* Genre */}
                  <div>
                    <FloatingSelectField
                      label="Genre"
                      value={genre}
                      onChange={setGenre}
                      placeholder="Select genre"
                      options={[
                        { value: 'Electronic', label: 'Electronic' },
                        { value: 'Rock', label: 'Rock' },
                        { value: 'Hip-Hop', label: 'Hip-Hop' },
                        { value: 'Jazz', label: 'Jazz' },
                        { value: 'Classical', label: 'Classical' },
                      ]}
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <FloatingInputField
                      type="text"
                      label="Tags"
                      value={tags}
                      onChange={setTags}
                    />
                  </div>

                  {/* Privacy */}
                  <div>
                    <label className="block text-xs text-text-muted mb-1">
                      Privacy
                    </label>

                    <div className="flex gap-6 text-xs text-text-secondary">

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value="public"
                          checked={privacy === 'public'}
                          onChange={() => setPrivacy('public')}
                        />
                        Public
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value="private"
                          checked={privacy === 'private'}
                          onChange={() => setPrivacy('private')}
                        />
                        Private
                      </label>

                    </div>
                  </div>

                  {/* Description */}
                  <div className="mb-8">
                    <label className="block text-sm text-text-muted mb-1">
                      Description
                    </label>

                    <textarea
                      rows={4}
                      placeholder="Tell listeners about your track..."
                      className="w-full bg-interactive-default border border-border-default rounded-lg px-4 py-2 text-text-primary focus:outline-none focus:border-border-strong"
                    />
                  </div>

                </form>

              </div>

            </div>
          </div>
        </div>
        {/* Bottom Submit Bar */}
        <div className="fixed bottom-0 left-0 w-full border-t border-border-default bg-bg-base">

          <div className="max-w-6xl mx-auto flex justify-end px-6 py-2">

            <button
              type="button"
              onClick={startUpload}
              className="bg-brand-primary text-text-on-brand px-12 py-1 rounded-full font-semibold hover:bg-brand-primary-hover transition"
            >
              Upload
            </button>

          </div>

        </div>
      </section>
    )
  }

  // Otherwise show the upload area
  return (
    <section className="min-h-screen w-full">
      <div className="flex justify-center px-6 md:px-12 lg:px-20">
        <div className="w-full max-w-5xl py-12">
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary">
              Upload your audio files.
            </h1>
            <p className="max-w-2xl text-xs text-text-secondary">
              For best quality, use MP3, WAV, FLAC, or AAC. The maximum file
              size is 500MB uncompressed.{' '}
              <span className="font-semibold underline underline-offset-2">
                Learn more.
              </span>
            </p>
          </header>

          {/* File upload area */}
          <div
            className={`relative flex min-h-70 cursor-pointer flex-col items-center justify-center gap-6 rounded-2xl border border-dashed px-8 py-16 text-center transition ${
              error ? 'border-status-error' : 'border-border-default hover:border-border-strong'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('upload-file-input')?.click()}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-border-default bg-surface-default">
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full">
                <span className="text-xs text-text-secondary">+</span>
              </div>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3v12m0 0l3-3m-3 3l-3-3M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-text-secondary"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-text-primary">
                Drag and drop audio files to get started.
              </p>
              {error && <p className="text-sm text-status-error">{error}</p>}
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="rounded-full bg-surface-default px-8! py-3! text-sm font-semibold text-text-primary transition hover:bg-interactive-hover">
                Choose files
              </span>
              <span className="text-xs text-text-muted">
                or click anywhere in the drop zone
              </span>
            </div>

            <input
              id="upload-file-input"
              type="file"
              accept=".mp3,.wav,.flac,.aac,audio/mpeg,audio/wav,audio/x-wav,audio/flac,audio/x-flac,audio/aac,audio/x-aac,audio/mp4"
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0]
                if (file) handleAudio(file)
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}

