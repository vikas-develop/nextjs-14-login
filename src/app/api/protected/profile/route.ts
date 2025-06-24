import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { findUserById } from '@/lib/auth';

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    
    // Fetch additional user data if needed
    const fullUserData = await findUserById(user.id);
    
    return Response.json({
      message: 'This is a protected route',
      user: fullUserData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Protected route error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler); 