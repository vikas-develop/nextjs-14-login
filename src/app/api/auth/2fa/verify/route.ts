import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { verifyTOTP } from '@/lib/twoFactor';
import { updateUser2FA } from '@/lib/auth';

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    const body = await request.json();
    const { token, secret, backupCodes } = body;

    if (!token || !secret) {
      return Response.json(
        { error: 'Token and secret are required' },
        { status: 400 }
      );
    }

    // Verify TOTP token
    const isValidToken = verifyTOTP(token, secret);
    
    if (!isValidToken) {
      return Response.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Enable 2FA for user
    const success = await updateUser2FA(user.id, true, secret, backupCodes);
    
    if (!success) {
      return Response.json(
        { error: 'Failed to enable 2FA' },
        { status: 500 }
      );
    }

    return Response.json({
      message: 'Two-factor authentication has been enabled successfully',
      backupCodes: backupCodes
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler); 