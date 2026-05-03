'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { authService } from '@/services';

type VerificationStatus = 'loading' | 'success' | 'error';

const getTokenFromQuery = (): string | null => {
	if (typeof window === 'undefined') {
		return null;
	}

	const params = new URLSearchParams(window.location.search);
	const token = params.get('token');

	if (!token || token.trim().length === 0) {
		return null;
	}

	return token;
};

export default function VerifyEmailPage() {
	const [status, setStatus] = useState<VerificationStatus>('loading');
	const [message, setMessage] = useState('Verifying your email...');
	const hasSubmitted = useRef(false);

	useEffect(() => {
		if (hasSubmitted.current) {
			return;
		}

		hasSubmitted.current = true;

		const token = getTokenFromQuery();
		if (!token) {
			setStatus('error');
			setMessage('Missing verification token. Please use the link from your email.');
			return;
		}

		const message = authService.verifyEmail(token);
		message.then((res) => {
			setStatus('success');
			setMessage(res.message);
		}).catch(() => {
			setStatus('error');
			setMessage('We could not verify your email right now. Please try again.');
		});

	}, []);

	return (
		<main className="flex min-h-screen items-center justify-center bg-bg-base px-4">
			<section className="w-full max-w-md rounded-xl border border-border-contrast bg-bg-base p-8 text-center">
				<h1 className="text-2xl font-semibold text-text-primary">Email Verification</h1>

				<p
					className={`mt-4 text-sm ${
						status === 'success'
							? 'text-green-600'
							: status === 'error'
							? 'text-red-600'
							: 'text-text-muted'
					}`}
				>
					{message}
				</p>

				{status !== 'loading' && (
					<div className="mt-6">
						<Link
							href="/signin"
							className="inline-flex rounded-md border border-border-contrast px-4 py-2 text-sm font-medium text-text-primary hover:bg-bg-muted"
						>
							Back to sign in
						</Link>
					</div>
				)}
			</section>
		</main>
	);
}