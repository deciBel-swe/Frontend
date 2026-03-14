'use client'

import { useState } from 'react'

export default function Page() {
  const [audioFile, setAudioFile] = useState<File | null>(null)
  const [error, setError] = useState<string>('')
  
  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB in bytes
  const ALLOWED_TYPES = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/flac', 'audio/x-flac', 'audio/aac', 'audio/x-aac', 'audio/mp4']
  const ALLOWED_EXTENSIONS = ['.mp3', '.wav', '.flac', '.aac']

  const handleAudio = (file: File) => {
    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!ALLOWED_TYPES.includes(file.type) && !ALLOWED_EXTENSIONS.includes(fileExtension)) {
      setError('Invalid file type. Please upload MP3, WAV, FLAC, or AAC files only.')
      setAudioFile(null)
      return
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size exceeds 500MB limit (${(file.size / (1024 * 1024)).toFixed(2)}MB)`)
      setAudioFile(null)
    } else {
      setError('')
      setAudioFile(file)
      console.log('Valid file:', file.name, (file.size / (1024 * 1024)).toFixed(2), 'MB')
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (file) handleAudio(file)
  }

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

          <label
            htmlFor="upload-file-input"
            className={`relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-6 rounded-2xl border border-dashed px-8 py-16 text-center transition ${
              error ? 'border-red-500' : 'border-neutral-700 hover:border-neutral-400'
            }`}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
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
                {audioFile ? audioFile.name : 'Drag and drop audio files to get started.'}
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
              {audioFile && !error && (
                <p className="text-xs text-neutral-400">
                  {(audioFile.size / (1024 * 1024)).toFixed(2)} MB • {audioFile.type || audioFile.name.split('.').pop()}
                </p>
              )}
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="rounded-full bg-neutral-50 !px-8 !py-3 text-sm font-semibold text-neutral-950 transition hover:bg-neutral-200">
                {audioFile ? 'Change file' : 'Choose files'}
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
          </label>
        </div>
      </div>
    </section>
  )
}