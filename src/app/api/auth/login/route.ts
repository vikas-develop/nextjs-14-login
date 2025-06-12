import { NextResponse } from 'next/server';

// This is a mock user database - in a real application, you would use a proper database
const MOCK_USER = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  password: 'password123' // In a real app, this would be hashed
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // In a real application, you would:
    // 1. Validate the input
    // 2. Check the database for the user
    // 3. Compare hashed passwords
    // 4. Generate a JWT token
    
    if (email === MOCK_USER.email && password === MOCK_USER.password) {
      // In a real app, you would set an HTTP-only cookie with a JWT token
      const response = NextResponse.json({
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        name: MOCK_USER.name
      });
      
      response.cookies.set('auth-token', 'mock-jwt-token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });

      return response;
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 