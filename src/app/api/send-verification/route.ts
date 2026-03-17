import { NextRequest, NextResponse } from 'next/server';

// ReCaptcha
// This endpoint receives the reCAPTCHA token from the client, verifies it with Google's API, and returns the verification result.
export async function POST(request:Request) {
  const body = await request.json();

  const {token} = body;

  const secretKey = process.env.NEXT_PUBLIC_RECAPTCHA_SECRET_KEY;
  const verificationresponse = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, {
    method: 'POST',
  });
  const verification = await verificationresponse.json();

  if(verification.success && verification.score >= 0.5) {
    return NextResponse.json({ 
      success: true,
      score:verification.score
     });
  }
  else {
    return NextResponse.json({ 
      success: false,
      score:verification.score,
      errors: verification['error-codes']
     });
  }
}
