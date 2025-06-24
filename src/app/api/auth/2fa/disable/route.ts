import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { updateUser2FA } from '@/lib/auth';

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    
    // Disable 2FA for user
    const success = await updateUser2FA(user.id, false);
    
    if (!success) {
      return Response.json(
        { error: 'Failed to disable 2FA' },
        { status: 500 }
      );
    }

    return Response.json({
      message: 'Two-factor authentication has been disabled successfully'
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = withAuth(handler); 