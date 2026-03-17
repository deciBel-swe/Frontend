import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get the secret key from environment variables
    const secretKey = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;

    if (!secretKey) {
      console.error('NEXT_PUBLIC_RECAPTCHA_SECRET_KEY is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify the token with Google's ReCaptcha API
    const verificationResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`,
      {
        method: 'POST',
      }
    );

    const verificationData = await verificationResponse.json();

    if (verificationData.success) {
      // Token is valid
      return NextResponse.json({
        success: true,
        score: verificationData.score,
        challenge_ts: verificationData.challenge_ts,
        hostname: verificationData.hostname,
      });
    } else {
      // Token is invalid
      return NextResponse.json({
        success: false,
        score: verificationData.score || 0,
        errors: verificationData['error-codes'] || [],
      });
    }

  } catch (error) {
    console.error('Error verifying ReCaptcha:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}