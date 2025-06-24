import nodemailer from 'nodemailer';

// Email configuration - In production, use proper SMTP settings
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password',
  },
});

// For development, we'll use a mock email service
const isDevelopment = process.env.NODE_ENV === 'development';

export async function sendEmail(to: string, subject: string, html: string, text?: string) {
  if (isDevelopment) {
    // In development, just log the email instead of sending
    console.log('📧 Email would be sent to:', to);
    console.log('📧 Subject:', subject);
    console.log('📧 HTML:', html);
    console.log('📧 Text:', text);
    return { success: true, messageId: 'dev-mock-id' };
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || 'noreply@yourapp.com',
      to,
      subject,
      text,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error };
  }
}

export function generateEmailVerificationTemplate(name: string, verificationUrl: string) {
  return {
    subject: 'Verify Your Email Address',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
        <p>Hi ${name},</p>
        <p>Thank you for signing up! Please click the button below to verify your email address:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verify Email Address
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Hi ${name},\n\nPlease verify your email address by clicking this link: ${verificationUrl}\n\nIf you didn't create an account, you can safely ignore this email.`
  };
}

export function generatePasswordResetTemplate(name: string, resetUrl: string) {
  return {
    subject: 'Reset Your Password',
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p>Hi ${name},</p>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
        </p>
      </div>
    `,
    text: `Hi ${name},\n\nReset your password by clicking this link: ${resetUrl}\n\nThis link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.`
  };
} 