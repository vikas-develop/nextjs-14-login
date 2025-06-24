import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import crypto from 'crypto';

export interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

// Generate a new 2FA secret for a user
export function generateTwoFactorSecret(userEmail: string, appName: string = 'NextLogin'): TwoFactorSetup {
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: appName,
    length: 32,
  });

  // Generate backup codes
  const backupCodes = generateBackupCodes();

  return {
    secret: secret.base32,
    qrCodeUrl: secret.otpauth_url!,
    backupCodes,
  };
}

// Generate QR code data URL for the secret
export async function generateQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
}

// Verify TOTP token
export function verifyTOTP(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps (60 seconds) tolerance
  });
}

// Generate backup codes
export function generateBackupCodes(count: number = 8): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

// Verify backup code
export function verifyBackupCode(inputCode: string, validCodes: string[]): boolean {
  return validCodes.includes(inputCode.toUpperCase());
}

// Remove used backup code
export function removeUsedBackupCode(usedCode: string, validCodes: string[]): string[] {
  return validCodes.filter(code => code !== usedCode.toUpperCase());
} 