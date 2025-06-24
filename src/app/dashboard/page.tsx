'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import TwoFactorSetup from '@/components/TwoFactorSetup';

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const disable2FA = async () => {
    setDisabling2FA(true);
    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        // Refresh the page to update user state
        window.location.reload();
      } else {
        alert('Failed to disable 2FA');
      }
    } catch (error) {
      alert('Error disabling 2FA');
    } finally {
      setDisabling2FA(false);
    }
  };

  if (showTwoFactorSetup) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-2xl mx-auto">
          <TwoFactorSetup onComplete={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Your Profile</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Email:</span> {user.email}</p>
                <p><span className="font-medium">User ID:</span> {user.id}</p>
                <p>
                  <span className="font-medium">Email Verified:</span>{' '}
                  <span className={user.emailVerified ? 'text-green-600' : 'text-red-600'}>
                    {user.emailVerified ? 'Yes' : 'No'}
                  </span>
                </p>
                <p>
                  <span className="font-medium">Two-Factor Auth:</span>{' '}
                  <span className={user.twoFactorEnabled ? 'text-green-600' : 'text-gray-600'}>
                    {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </p>
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Security Settings</h2>
              <div className="space-y-3">
                {!user.twoFactorEnabled ? (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      Enhance your account security with two-factor authentication.
                    </p>
                    <button
                      onClick={() => setShowTwoFactorSetup(true)}
                      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                      Enable 2FA
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-green-600 mb-2">
                      ✓ Two-factor authentication is enabled for your account.
                    </p>
                    <button
                      onClick={disable2FA}
                      disabled={disabling2FA}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      {disabling2FA ? 'Disabling...' : 'Disable 2FA'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Account Status</h2>
              <p className="text-green-600">Active</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Protected API Test</h2>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch('/api/protected/profile', {
                      credentials: 'include',
                    });
                    const data = await response.json();
                    alert(JSON.stringify(data, null, 2));
                  } catch (error) {
                    alert('Error calling protected API');
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Test Protected Route
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 