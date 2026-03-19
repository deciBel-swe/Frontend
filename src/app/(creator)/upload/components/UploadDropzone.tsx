'use client'

import { useId } from 'react'

interface UploadDropzoneProps {
  error: string
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void
  onFileSelected: (file: File) => void
}

export default function UploadDropzone({
  error,
  onDragOver,
  onDrop,
  onFileSelected,
}: UploadDropzoneProps) {
  const inputId = useId()

  return (
    <section className="min-h-screen w-full">
      <div className="w-full max-w-6xl mx-auto px-0 sm:px-0 md:px-0 lg:px-0">
        <div className="w-full py-10 sm:py-12">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
              Upload your audio files.
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-xs text-text-primary">
              For best quality, use MP3, WAV, FLAC, or AAC. The maximum file
              size is 500MB uncompressed.{' '}
              <span className="font-semibold underline underline-offset-2">
                Learn more.
              </span>
            </p>
          </header>

          <div
            className={`group relative flex min-h-60 sm:min-h-70 cursor-pointer flex-col items-center justify-center gap-4 sm:gap-6 rounded-2xl border-2 border-dashed px-6 sm:px-8 py-10 sm:py-12 lg:py-16 text-center transition ${
              error ? 'border-status-error' : 'border-border-default hover:border-white'
            }`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full">
              <svg
                width="72"
                height="72"
                viewBox="0 0 64 64"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Cloud */}
                <path
                  d="M20 40
                    C14 40, 10 36, 10 31
                    C10 26, 14 22, 19 22
                    C20 17, 25 14, 30 14
                    C36 14, 41 18, 42 24
                    C47 25, 50 29, 50 34
                    C50 38, 46 40, 42 40
                    Z"
                  stroke="white"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Upload arrow */}
                <line
                  x1="32"
                  y1="34"
                  x2="32"
                  y2="22"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <polyline
                  points="27,27 32,22 37,27"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Dotted trail */}
                <circle cx="32" cy="42" r="1.5" fill="white" />
                <circle cx="32" cy="47" r="1.5" fill="white" />
                <circle cx="32" cy="52" r="1.5" fill="white" />
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-base font-extrabold text-text-primary">
                Drag and drop audio files to get started.
              </p>
              {error && <p className="text-sm text-status-error">{error}</p>}
            </div>

            <div className="flex flex-col items-center gap-3">
              <span className="rounded-full bg-white px-6! py-2! text-sm font-extrabold text-neutral-950 transition hover:bg-neutral-100">
                Choose files
              </span>
            </div>

            <input
              id={inputId}
              type="file"
              accept=".mp3,.wav,.flac,.aac,audio/mpeg,audio/wav,audio/x-wav,audio/flac,audio/x-flac,audio/aac,audio/x-aac,audio/mp4"
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0]
                if (file) onFileSelected(file)
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
