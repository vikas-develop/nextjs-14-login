import { NextResponse } from 'next/server';
import { findUserByEmail, createUser, generateToken, generateEmailVerificationToken } from '@/lib/auth';
import { sendEmail, generateEmailVerificationTemplate } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Check if user already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await createUser(email, name, password);

    // Generate email verification token
    const verificationToken = await generateEmailVerificationToken(newUser.id);
    
    // Create verification URL
    const verificationUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:4000'}/api/auth/verify-email?token=${verificationToken}`;
    
    // Generate email template
    const emailTemplate = generateEmailVerificationTemplate(newUser.name, verificationUrl);
    
    // Send verification email
    const emailResult = await sendEmail(
      newUser.email,
      emailTemplate.subject,
      emailTemplate.html,
      emailTemplate.text
    );

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error);
      // Don't fail registration if email sending fails
    }

    // Generate JWT token
    const token = generateToken(newUser);

    // Create response with user data
    const response = NextResponse.json({
      user: newUser,
      token,
      message: 'Account created successfully. Please check your email to verify your account.'
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 