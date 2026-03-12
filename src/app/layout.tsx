import type { Metadata } from 'next';
import './globals.css';

/**
 * Metadata for the application
 */
export const metadata: Metadata = {
  title: 'DeciBel - Social Streaming Platform',
  description: 'A modern music streaming platform inspired by SoundCloud',
  keywords: ['music', 'streaming', 'audio', 'social'],
};

/**
 * Root Layout Component
 * 
 * This layout wraps all pages in the application.
 * Add global providers, headers, and persistent components here.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
