import { NextRequest } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { findUserById } from '@/lib/auth';

async function handler(request: AuthenticatedRequest) {
  try {
    // The user is already authenticated by the middleware
    const user = request.user!;
    
    // Fetch fresh user data from database (optional, for security)
    const userData = await findUserById(user.id);
    
    if (!userData) {
      return Response.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return Response.json(userData);
  } catch (error) {
    console.error('Auth check error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler); 