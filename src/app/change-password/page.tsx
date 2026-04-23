'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

import ChangePasswordForm from './components/ChangePasswordForm';

const FOOTER_LINKS = ['Legal', 'Privacy', 'Cookies', 'Imprint'];

export default function ChangePasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  return (
    <main className="min-h-screen bg-bg-base text-text-primary">
      <div className="mx-auto flex min-h-screen max-w-[1920px] flex-col px-4">
        <div className="flex flex-1 flex-col items-center justify-center py-10">
          <div className="mb-6 flex w-full max-w-[828px] justify-start">
            <Link
              href="/reset-password"
              className="inline-flex items-center gap-2 text-sm text-text-secondary transition hover:text-interactive-hover"
            >
              <FiArrowLeft size={16} />
              Back
            </Link>
          </div>

          <ChangePasswordForm token={token} />
        </div>

        <footer className="border-t border-border-default py-5">
          <div className="mx-auto flex w-full max-w-[1548px] flex-wrap items-center gap-x-8 gap-y-3 px-6 text-[15px] text-text-muted">
            {FOOTER_LINKS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </footer>
      </div>
    </main>
  );
}
