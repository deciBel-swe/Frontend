'use client';

import Button from '@/components/buttons/Button';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';

export default function SignupSection() {
  return (
    <section className="py-16 px-6 flex flex-col items-center text-center">
      <h2 className="text-3xl font-semibold mb-4">
        Thanks for listening. Now join in.
      </h2>

      <p className="font-extrabold mb-6 max-w-md">
        Save tracks, follow artists and build playlists. All for free.
      </p>

      <Link href={ROUTES.REGISTER}>
        <Button variant="secondary" className="mb-5">
          Create account
        </Button>
      </Link>

      <div className="flex items-center gap-2">
        <p className="text-xs">Already have an account?</p>
        <Link href={ROUTES.SIGNIN} className="font-medium hover:underline">
          Signin
        </Link>
      </div>
    </section>
  );
}
