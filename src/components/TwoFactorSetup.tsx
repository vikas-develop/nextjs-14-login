'use client';

import React, { useState } from 'react';

interface TwoFactorSetupProps {
  onComplete: () => void;
}

export default function TwoFactorSetup({ onComplete }: TwoFactorSetupProps) {
  const [step, setStep] = useState(1);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/setup', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setBackupCodes(data.backupCodes);
        setStep(2);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to setup 2FA');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          token: verificationCode,
          secret,
          backupCodes,
        }),
      });

      if (response.ok) {
        setStep(3);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid verification code');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (step === 1) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Enable Two-Factor Authentication</h2>
        <p className="text-gray-600 mb-4">
          Two-factor authentication adds an extra layer of security to your account. You'll need an authenticator app like Google Authenticator or Authy.
        </p>
        {error && (
          <div className="bg-red-50 p-3 rounded-md mb-4">
            <div className="text-red-700 text-sm">{error}</div>
          </div>
        )}
        <button
          onClick={startSetup}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Setting up...' : 'Setup 2FA'}
        </button>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Setup Two-Factor Authentication</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-2">1. Scan QR Code</h3>
            <p className="text-sm text-gray-600 mb-3">
              Scan this QR code with your authenticator app:
            </p>
            <div className="flex justify-center mb-4">
              <img src={qrCode} alt="QR Code" className="border rounded" />
            </div>
            <p className="text-xs text-gray-500 mb-4">
              Or enter this secret manually: <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">{secret}</code>
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-2">2. Save Backup Codes</h3>
            <p className="text-sm text-gray-600 mb-3">
              Save these backup codes in a secure location. You can use them to access your account if you lose your authenticator device.
            </p>
            <div className="bg-gray-50 p-3 rounded mb-3">
              <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                {backupCodes.map((code, index) => (
                  <div key={index}>{code}</div>
                ))}
              </div>
            </div>
            <button
              onClick={downloadBackupCodes}
              className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
            >
              Download Codes
            </button>
          </div>

          <form onSubmit={verifyAndEnable}>
            <div>
              <h3 className="font-medium mb-2">3. Verify Setup</h3>
              <p className="text-sm text-gray-600 mb-3">
                Enter the 6-digit code from your authenticator app:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="123456"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 p-3 rounded-md">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">Two-Factor Authentication Enabled!</h2>
        <p className="text-gray-600 mb-4">
          Your account is now protected with two-factor authentication.
        </p>
        <button
          onClick={onComplete}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Done
        </button>
      </div>
    </div>
  );
} 