'use client';

/**
 * @file EmbedCodeBox.tsx
 * @description Displays the generated embed code (iframe or WordPress shortcode)
 * with a copy button and a toggle between the two formats.
 * Presenter component — receives computed code strings via props.
 */

import { type FC, useState } from 'react';

interface EmbedCodeBoxProps {
  /** The HTML iframe code. */
  iframeCode: string;
  /** The WordPress shortcode. */
  wordPressCode: string;
}

/**
 * Renders the code output section of the embed panel.
 * Allows switching between iframe and WordPress code, with one-click copy.
 *
 * @param iframeCode - The full iframe embed string.
 * @param wordPressCode - The WordPress shortcode string.
 */
export const EmbedCodeBox: FC<EmbedCodeBoxProps> = ({ iframeCode, wordPressCode }) => {
  const [isWordPress, setIsWordPress] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeCode = isWordPress ? wordPressCode : iframeCode;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(activeCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">Code</p>

      <div className="flex items-center gap-2 rounded border border-border-default bg-surface-default px-3 py-2">
        <input
          type="text"
          readOnly
          value={activeCode}
          aria-label="Embed code"
          className="flex-1 truncate bg-transparent font-mono text-xs text-text-primary outline-none"
        />
        <button
          onClick={handleCopy}
          aria-label="Copy embed code"
          className={`shrink-0 text-xs font-medium transition-colors duration-150 ${
            copied ? 'text-status-success' : 'text-brand-primary hover:text-brand-primary-hover'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <button
        onClick={() => setIsWordPress(prev => !prev)}
        className="self-end text-xs text-brand-primary hover:underline"
      >
        {isWordPress ? 'Use iframe code' : 'WordPress code'}
      </button>
    </div>
  );
};