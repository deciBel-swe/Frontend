'use client';

import { Button } from '@/components/buttons/Button';
import { useId } from 'react';

interface FileDropzoneFieldProps {
  error?: string;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileSelected: (file: File) => void;
  title?: string;
  description?: string;
  prompt?: string;
  accept?: string;
  buttonText?: string;
}

export default function FileDropzoneField({
  error,
  onDragOver,
  onDrop,
  onFileSelected,
  title = 'Upload your files.',
  description = 'Choose a supported file and drag/drop or click to browse.',
  prompt = 'Drag and drop files to get started.',
  accept,
  buttonText = 'Choose files',
}: FileDropzoneFieldProps) {
  const inputId = useId();

  return (
    <section className="min-h-screen w-full">
      <div className="w-full max-w-6xl mx-auto px-0 sm:px-0 md:px-0 lg:px-0">
        <div className="w-full py-10 sm:py-12">
          <header className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm sm:text-xs text-text-primary">
              {description}
            </p>
          </header>

          <div
            className={`group relative flex min-h-60 sm:min-h-70 cursor-pointer flex-col items-center justify-center gap-4 sm:gap-6 rounded-2xl border-2 border-dashed px-6 sm:px-8 py-10 sm:py-12 lg:py-16 text-center transition ${
              error
                ? 'border-status-error'
                : 'border-border-default hover:border-border-contrast'
            }`}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onClick={() => document.getElementById(inputId)?.click()}
          >
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full">
              <svg
                width="69"
                height="72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#a)">
                  <path
                    d="M26.405 8.21c.06-.13.13-.26.2-.38.16-.31.33-.61.51-.9.08-.13.15-.25.23-.38.22-.33.44-.66.68-.97.04-.05.08-.11.12-.17.28-.36.57-.69.88-1.02.08-.09.17-.17.26-.26.23-.23.47-.46.71-.67.11-.09.21-.18.32-.27.27-.22.54-.42.82-.61.08-.06.16-.12.24-.17.26-.17.53-.32.81-.47.14-.08.26-.16.4-.23.41-.21.84-.4 1.27-.56l-13.92 5.19c-.43.16-.86.35-1.27.56-.14.07-.27.16-.4.23-.25.14-.5.27-.74.42-.02.02-.05.04-.07.05-.08.05-.16.11-.24.17-.28.19-.55.4-.82.61-.11.09-.21.18-.32.27-.24.21-.48.44-.71.67-.09.09-.18.17-.26.26-.3.32-.6.66-.88 1.02-.04.05-.08.11-.12.17a13.928 13.928 0 0 0-.91 1.34c-.18.29-.35.59-.51.9-.07.13-.14.25-.2.38-.21.43-.13.27-.31.73M56.155 51.7l-17.09-3.93-9.77-2.24c-5.7-1.31-10.64-6.41-13.08-12.75-1.02-2.66-1.6-5.55-1.61-8.46-.01-5.97 2.38-10.7 6.07-13.09.65-.42 1.34-.77 2.06-1.04l-13.92 5.19c-.72.27-1.41.62-2.06 1.04-3.69 2.39-6.08 7.12-6.06 13.09 0 2.91.58 5.8 1.61 8.46 2.43 6.34 7.38 11.44 13.08 12.75l9.77 2.24 17.09 3.93c1.94.45 3.77.32 5.4-.29l13.92-5.19c-1.63.61-3.46.74-5.4.29h-.01z"
                    stroke="currentColor"
                    strokeMiterlimit="10"
                  ></path>
                  <path
                    d="M58.395 22.75c-1.12-10.48-8.3-20.01-16.99-22.01-6.98-1.6-12.96 2.11-15.61 8.8-6.44.4-11.21 6.36-11.19 14.78.02 9.86 6.59 19.35 14.68 21.21l9.77 2.24v-5.43l4.88 1.12v-5.43l4.88 1.12v5.43l-4.88-1.12v5.43l12.21 2.81c6.74 1.55 12.19-3.85 12.18-12.07-.01-7.25-4.29-14.28-9.94-16.88h.01zm-9.06 8.9-5.39-7.79v14.18l-4.88-1.12V22.74l-5.36 5.31-3.46-5 7.65-7.59c1.87-1.85 4.83-1.76 7.33 1.85l7.56 10.93-3.44 3.41h-.01zM4.895 42.95l12.13-4.52c-.77-1.14-1.46-2.36-2.05-3.65L2.845 39.3c.58 1.29 1.27 2.51 2.04 3.65h.01zM34.185 52.09l4.88 1.12v5.43l-4.88-1.12v-5.43zM39.065 66.43l3.45.79v3.84l-3.45-.79v-3.84z"
                    fill="currentColor"
                  ></path>
                  <path
                    d="M58.395 22.75c-1.11-10.48-8.3-20.01-16.99-22.01-6.98-1.6-12.96 2.11-15.61 8.8-6.44.4-11.21 6.36-11.19 14.78.02 9.86 6.59 19.35 14.68 21.21l9.77 2.24 4.88 1.12 12.22 2.81c6.74 1.55 12.19-3.85 12.18-12.07-.01-7.25-4.29-14.28-9.94-16.88z"
                    stroke="currentColor"
                    strokeMiterlimit="10"
                  ></path>
                </g>
                <defs>
                  <clipPath id="a">
                    <path
                      fill="currentColor"
                      transform="translate(.315)"
                      d="M0 0h68.4v71.06H0z"
                    ></path>
                  </clipPath>
                </defs>
              </svg>
            </div>

            <div className="space-y-2">
              <p className="text-base font-extrabold text-text-primary">
                {prompt}
              </p>
              {error && <p className="text-sm text-status-error">{error}</p>}
            </div>

            <div className="flex flex-col items-center gap-3">
              <Button
                className="rounded-full px-6! py-2!"
                variant="secondary"
                size="md"
              >
                {buttonText}
              </Button>
            </div>

            <input
              id={inputId}
              type="file"
              accept={
                accept ??
                '.mp3,.wav,.flac,.aac,audio/mpeg,audio/wav,audio/x-wav,audio/flac,audio/x-flac,audio/aac,audio/x-aac,audio/mp4'
              }
              className="hidden"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const file = e.target.files?.[0];
                if (file) onFileSelected(file);
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export const UploadDropzone = FileDropzoneField;
