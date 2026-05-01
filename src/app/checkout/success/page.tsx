'use client';
import { Button } from '@/components/buttons/Button';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';

/**
 * Payment Success Page (Route: /checkout/success)
 *
 * Displays when a user's payment is successfully processed.
 * Allows users to return to the subscription page or continue using the app.
 *
 * @component
 * @returns {JSX.Element} The payment success page
 */
const page = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-fit gap-8 bg-bg-base border border-text-on-brand px-8 py-10 max-w-md rounded-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-status-success mb-3">
            Welcome to Premium!
          </h1>
          <p className="text-text-secondary text-sm">
            You're all set! Unlock exclusive features and dive into unlimited
            music. Let's explore what's waiting for you.
          </p>
        </div>

        <Link href={ROUTES.DISCOVER} className="w-full">
          <Button variant="secondary" size="lg" fullWidth>
            Start Exploring
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default page;
