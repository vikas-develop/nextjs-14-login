import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, UserPayload } from '@/lib/auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: UserPayload;
}

// Middleware function to authenticate requests
export function authenticateToken(request: NextRequest): UserPayload | null {
  // Try to get token from Authorization header first
  const authHeader = request.headers.get('authorization');
  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else {
    // Fallback to cookie
    token = request.cookies.get('auth-token')?.value;
  }

  if (!token) {
    return null;
  }

  const user = verifyToken(token);
  return user;
}

// Higher-order function to protect API routes
export function withAuth(handler: (request: AuthenticatedRequest) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const user = authenticateToken(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Add user to request object
    (request as AuthenticatedRequest).user = user;
    
    return handler(request as AuthenticatedRequest);
  };
} 