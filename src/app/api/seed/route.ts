import { NextResponse } from 'next/server';
import { createDefaultUsers } from '@/lib/auth';

export async function POST() {
  try {
    // Only allow seeding in development
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Database seeding is not allowed in production' },
        { status: 403 }
      );
    }

    console.log('🌱 Seeding database with default users...');
    await createDefaultUsers();
    
    return NextResponse.json({
      message: 'Database seeded successfully',
      users: [
        { email: 'test@example.com', password: 'password123' },
        { email: 'admin@example.com', password: 'password123' }
      ]
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 