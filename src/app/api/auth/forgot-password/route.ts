import { NextResponse } from 'next/server';
import { generatePasswordResetToken, findUserByEmail } from '@/lib/auth';
import { sendEmail, generatePasswordResetTemplate } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await findUserByEmail(email);
    
    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
    }

    // Generate reset token
    const resetToken = await generatePasswordResetToken(email);
    
    if (!resetToken) {
      return NextResponse.json(
        { error: 'Failed to generate reset token' },
        { status: 500 }
      );
    }

    // Create reset URL
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:4000'}/reset-password?token=${resetToken}`;
    
    // Generate email template
    const emailTemplate = generatePasswordResetTemplate(user.name, resetUrl);
    
    // Send email
    const emailResult = await sendEmail(
      user.email,
      emailTemplate.subject,
      emailTemplate.html,
      emailTemplate.text
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'If an account with this email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 