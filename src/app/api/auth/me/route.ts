import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Mock user data - in a real app, you would verify the JWT token and fetch user data from a database
const MOCK_USER = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User'
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // In a real app, you would:
  // 1. Verify the JWT token
  // 2. Fetch the user data from your database
  return NextResponse.json(MOCK_USER);
} 