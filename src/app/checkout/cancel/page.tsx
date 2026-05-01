'use client';
import { Button } from '@/components/buttons/Button';
import { ROUTES } from '@/constants/routes';
import Link from 'next/link';

/**
 * Payment Cancellation Page (Route: /checkout/cancel)
 *
 * Displays when a user's payment fails or cancels during checkout.
 * Allows users to return to the subscription page to retry.
 *
 * @component
 * @returns {JSX.Element} The payment cancellation page
 */
const page = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center h-fit gap-8 bg-bg-base border border-text-on-brand px-8 py-10 max-w-md rounded-lg">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-status-error mb-3">
            Transaction Failed
          </h1>
          <p className="text-text-secondary text-sm">
            Unfortunately, your payment could not be processed. Please try again
            or contact support if the issue persists.
          </p>
        </div>

        <Link href={ROUTES.SUBSCRIPTION} className="w-full">
          <Button variant="secondary" size="lg" fullWidth>
            Return to Subscription
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default page;
