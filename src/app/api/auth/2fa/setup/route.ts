import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { generateTwoFactorSecret, generateQRCode } from '@/lib/twoFactor';

async function handler(request: AuthenticatedRequest) {
  try {
    const user = request.user!;
    
    // Generate 2FA secret and QR code
    const twoFactorSetup = generateTwoFactorSecret(user.email);
    const qrCodeDataUrl = await generateQRCode(twoFactorSetup.qrCodeUrl);
    
    return Response.json({
      secret: twoFactorSetup.secret,
      qrCode: qrCodeDataUrl,
      backupCodes: twoFactorSetup.backupCodes,
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return Response.json(
      { error: 'Failed to setup 2FA' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler); 