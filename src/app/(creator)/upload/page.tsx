// frontend/src/app/upload/page.tsx
'use client'

import { useState } from 'react'
import { useEffect } from 'react'

export default function UploadPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [trackLink, setTrackLink] = useState('')
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public')
  const [artworkFile, setArtworkFile] = useState<File | null>(null)
  const [artworkPreview, setArtworkPreview] = useState<string | null>(null)
  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB in bytes
  const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/x-aac', 'audio/mp4']
  const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac']
  useEffect(() => {
  if (audioFile) {
    const nameWithoutExt = audioFile.name.replace(/\.[^/.]+$/, "")
    setTitle(nameWithoutExt)
  }
  }, [audioFile])
  const startUpload = () => {
    setIsUploading(true)
    setUploadProgress(0)

    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsUploading(false)
          setShowForm(true)
          return 100
        }
        return prev + 4
      })
    }, 120)
  }
  const resetUpload = () => {
    setAudioFile(null)
    setShowForm(false)
    setUploadProgress(0)
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
      startUpload()
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

  // If form should be shown, render the form
  if (showForm && audioFile) {
    return (
      <section className="min-h-screen w-full">
        {/* Top Bar */}
          <div className="sticky top-0 w-full mb-8">

            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

              {isUploading ? (
                <div className="w-full">
                  <div className="flex justify-between text-sm text-neutral-400 mb-2">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>

                  <div className="w-full h-2 bg-neutral-800 rounded">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">

                    <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-xs text-neutral-400">
                      ♪
                    </div>

                    <span className="text-sm text-neutral-200 font-medium">
                      {audioFile?.name}
                    </span>

                  </div>

                  <button
                    onClick={resetUpload}
                    className="text-sm text-neutral-400 hover:text-neutral-200 transition"
                  >
                    Replace
                  </button>
                </>
              )}

            </div>

          </div>
        <div className="flex justify-center px-6 md:px-12 lg:px-20">
          <div className="w-full max-w-3xl py-1">
            <div className="grid md:grid-cols-[300px_1fr] gap-8">
              {/* Artwork */}
              <div className="flex flex-col items-center gap-2">

                <div
                  className="w-full aspect-square border border-dashed border-neutral-700 rounded-lg flex items-center justify-center hover:border-neutral-500 transition cursor-pointer overflow-hidden relative"
                  onClick={() => document.getElementById("artwork-input")?.click()}
                >

                  {artworkPreview ? (
                    <img
                      src={artworkPreview}
                      alt="Artwork preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-neutral-500 text-xs gap-2">

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
                      className="text-neutral-400 hover:text-neutral-200"
                    >
                      Replace
                    </button>

                    <button
                      type="button"
                      onClick={removeArtwork}
                      className="text-red-400 hover:text-red-300"
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
                    <label className="block text-xs text-neutral-400 mb-1">
                      Track Title
                    </label>

                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                  
                  {/* Track Link */}
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Track Link
                    </label>

                    <input
                      type="text"
                      value={trackLink}
                      onChange={(e) => setTrackLink(e.target.value)}
                      placeholder="your-site.com/track-name"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>
                  {/* Main Artist */}
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Main Artist
                    </label>

                    <input
                      type="text"
                      value={artist}
                      onChange={(e) => setArtist(e.target.value)}
                      placeholder="Artist name"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>


                  {/* Genre */}
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Genre
                    </label>

                    <select className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500">
                      <option>Select genre</option>
                      <option>Electronic</option>
                      <option>Rock</option>
                      <option>Hip-Hop</option>
                      <option>Jazz</option>
                      <option>Classical</option>
                    </select>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Tags
                    </label>

                    <input
                      type="text"
                      placeholder="space separated tags"
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                  {/* Privacy */}
                  <div>
                    <label className="block text-xs text-neutral-400 mb-1">
                      Privacy
                    </label>

                    <div className="flex gap-6 text-xs text-neutral-300">

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
                  <div>
                    <label className="block text-sm text-neutral-400 mb-1">
                      Description
                    </label>

                    <textarea
                      rows={4}
                      placeholder="Tell listeners about your track..."
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-2 text-neutral-100 focus:outline-none focus:border-neutral-500"
                    />
                  </div>

                </form>

              </div>

            </div>
            <div className='mt-2'></div>
          </div>
        </div>
        {/* Bottom Submit Bar */}
        <div className="fixed bottom-0 left-0 w-full border-t border-neutral-800 bg-neutral-950">

          <div className="max-w-6xl mx-auto flex justify-end px-6 py-2">

            <button
              type="submit"
              className="bg-green-500 text-white px-12 py-1 rounded-full font-semibold hover:bg-green-600 transition"
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
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">
              Upload your audio files.
            </h1>
            <p className="max-w-2xl text-xs text-neutral-50">
              For best quality, use MP3, WAV, FLAC, or AAC. The maximum file
              size is 500MB uncompressed.{' '}
              <span className="font-semibold underline underline-offset-2">
                Learn more.
              </span>
            </p>
          </header>

          {/* File upload area */}
          <div
            className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-6 rounded-2xl border border-dashed px-8 py-16 text-center transition ${
              error ? 'border-red-500' : 'border-neutral-700 hover:border-neutral-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => document.getElementById('upload-file-input')?.click()}
          >
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-neutral-600 bg-neutral-900">
              <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full">
                <span className="text-xs text-neutral-300">+</span>
              </div>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M12 3v12m0 0l3-3m-3 3l-3-3M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-neutral-200"
                />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-base font-semibold text-neutral-50">
                Drag and drop audio files to get started.
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="rounded-full bg-neutral-50 !px-8 !py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200">
                Choose files
              </span>
              <span className="text-xs text-neutral-500">
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