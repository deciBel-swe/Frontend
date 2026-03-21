'use client';

import Waveform from '@/components/waveform/Waveform';

interface UploadSuccessProps {
  uploadedTrackUrl: string;
  generatedWaveform: number[];
  waveformHeight: number;
  onReset: () => void;
}

export default function UploadSuccess({
  uploadedTrackUrl,
  generatedWaveform,
  waveformHeight,
  onReset,
}: UploadSuccessProps) {
  return (
    <section className="min-h-screen w-full flex items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-3xl mx-auto flex flex-col items-center gap-6 text-center">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-text-primary">
            Saved to DeciBel.
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mt-2">
            Congratulations!, Your tracks are now on DeciBel.
          </p>
          {generatedWaveform.length > 0 && (
            <div className="mt-6 w-full">
              <Waveform data={generatedWaveform} height={waveformHeight} />
            </div>
          )}
        </div>
        <div className="mt-2">
          <a
            href={uploadedTrackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-border-contrast text-text-primary px-6 py-2 rounded-full font-semibold hover:bg-interactive-hover transition"
          >
            View Track
          </a>
        </div>
        <div className="mt-2">
          <button
            onClick={onReset}
            className="text-sm text-text-muted hover:text-text-secondary transition"
          >
            Upload Another Track
          </button>
        </div>
      </div>
    </section>
  );
}
