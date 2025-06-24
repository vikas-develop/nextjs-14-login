'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const router = useRouter();
  const { login } = useAuth();
  const searchParams = useSearchParams();

  useEffect(() => {
    const verified = searchParams.get('verified');
    const reset = searchParams.get('reset');
    
    if (verified === 'true') {
      setSuccess('Email verified successfully! You can now log in.');
    }
    if (reset === 'success') {
      setSuccess('Password reset successfully! You can now log in with your new password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          email, 
          password, 
          twoFactorToken: requiresTwoFactor ? twoFactorToken : undefined,
          isBackupCode: showBackupCode
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.requiresTwoFactor) {
          setRequiresTwoFactor(true);
          setError('');
        } else {
          // Login successful
          window.location.href = '/dashboard'; // Force refresh to update auth state
        }
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err: any) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {success && (
            <div className="text-green-700 text-center text-sm bg-green-50 p-3 rounded-md">{success}</div>
          )}
          {error && (
            <div className="text-red-500 text-center text-sm bg-red-50 p-3 rounded-md">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                disabled={requiresTwoFactor}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                disabled={requiresTwoFactor}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm disabled:bg-gray-100"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            {requiresTwoFactor && (
              <div>
                <label htmlFor="twoFactorToken" className="block text-sm font-medium text-gray-700">
                  {showBackupCode ? 'Backup Code' : 'Authentication Code'}
                </label>
                <input
                  id="twoFactorToken"
                  name="twoFactorToken"
                  type="text"
                  required
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder={showBackupCode ? "Enter backup code" : "Enter 6-digit code"}
                  value={twoFactorToken}
                  onChange={(e) => setTwoFactorToken(e.target.value)}
                />
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={() => setShowBackupCode(!showBackupCode)}
                    className="text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    {showBackupCode ? 'Use authenticator code' : 'Use backup code instead'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : requiresTwoFactor ? 'Verify' : 'Sign in'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link href="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500 text-sm">
              Forgot your password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 