import { NextRequest, NextResponse } from 'next/server';
import { verifyEmailVerificationToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      );
    }

    const user = await verifyEmailVerificationToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      );
    }

    // Redirect to login page with success message
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('verified', 'true');
    
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error('Email verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 