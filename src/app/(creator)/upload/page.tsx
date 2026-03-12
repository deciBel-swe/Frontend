export default function Page() {
  return (
    <section className="min-h-screen w-full bg-neutral-950">
      <div className="flex justify-center px-6 md:px-12 lg:px-20">
        <div className="w-full max-w-5xl py-12">
          <div className="h-4"></div>
          <header className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">
              Upload your audio files.
            </h1>
            <div className="h-4"></div>
            <p className="max-w-2xl text-xs text-neutral-50">
              For best quality, use WAV, FLAC, AIFF, or ALAC. The maximum file
              size is 4GB uncompressed.{' '}
              <span className="font-semibold underline underline-offset-2">
                Learn more.
              </span>
            </p>
          </header>
          <div className="h-4"></div>
          <div className="rounded-2xl bg-neutral-950/40 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
            <label
              htmlFor="upload-file-input"
              className="relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center gap-6 rounded-2xl border border-dashed border-neutral-700 bg-neutral-950/40 px-8 py-16 text-center transition hover:border-neutral-400"
            >
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-neutral-600 bg-neutral-900">
                <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950">
                  <span className="text-xs text-neutral-300">+</span>
                </div>
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
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
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  );
}