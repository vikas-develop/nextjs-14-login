import { NextResponse } from 'next/server';
import { getUserForAuth, verifyPassword, generateToken, useBackupCode, updateLastLogin } from '@/lib/auth';
import { verifyTOTP } from '@/lib/twoFactor';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, twoFactorToken, isBackupCode } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await getUserForAuth(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      // If 2FA token not provided, request it
      if (!twoFactorToken) {
        return NextResponse.json(
          { 
            error: 'Two-factor authentication required',
            requiresTwoFactor: true
          },
          { status: 200 }
        );
      }

      // Verify 2FA token
      let twoFactorValid = false;
      
      if (isBackupCode) {
        // Verify backup code
        twoFactorValid = await useBackupCode(user.id, twoFactorToken);
      } else {
        // Verify TOTP
        if (user.twoFactorSecret) {
          twoFactorValid = verifyTOTP(twoFactorToken, user.twoFactorSecret);
        }
      }

      if (!twoFactorValid) {
        return NextResponse.json(
          { error: 'Invalid two-factor authentication code' },
          { status: 401 }
        );
      }
    }

    // Create user payload (without password)
    const userPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      emailVerified: user.emailVerified,
      twoFactorEnabled: user.twoFactorEnabled,
    };

    // Update last login time
    await updateLastLogin(user.id);

    // Generate JWT token
    const token = generateToken(userPayload);

    // Create response with user data
    const response = NextResponse.json({
      user: userPayload,
      token, // Include token in response for client-side storage if needed
    });

    // Set HTTP-only cookie with JWT token
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 