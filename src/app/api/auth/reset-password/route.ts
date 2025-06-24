import { NextResponse } from 'next/server';
import { resetPasswordWithToken, verifyPasswordResetToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    // Validate input
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Token, password, and confirmation are required' },
        { status: 400 }
      );
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Verify token is valid
    const user = await verifyPasswordResetToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Reset password
    const success = await resetPasswordWithToken(token, password);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to reset password' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 