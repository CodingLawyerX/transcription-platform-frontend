'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth';

interface ProfileData {
  username: string;
  email: string;
  email_verified?: boolean;
  name?: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword1: '',
    newPassword2: '',
  });

  const fetchProfile = useCallback(async () => {
    if (!session?.accessToken) {
      setErrors(['Kein gültiges Zugriffstoken gefunden. Bitte melden Sie sich erneut an.']);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.getProfile(session.accessToken);
      if (result.data) {
        setProfile(result.data);
      } else {
        setErrors(['Fehler beim Laden des Profils']);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      const redirectUrl = `/login?callbackUrl=${encodeURIComponent('/profile')}`;
      router.push(redirectUrl);
      return;
    }

    fetchProfile();
  }, [status, session, router, fetchProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    setErrors([]);
    setMessage('');

    try {
      const token = session?.accessToken;
      if (!token) return;

      const updateData = {
        name: profile.name,
      };

      const result = await authApi.updateProfile(token, updateData);
      if (result.data) {
        setProfile(result.data);
        setMessage('Profil erfolgreich aktualisiert');
      } else if (result.error) {
        const errorMessages = Object.values(result.error).flat();
        setErrors(errorMessages);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    setIsSaving(true);
    setErrors([]);
    setMessage('');

    try {
      const result = await authApi.changePassword(
        session.accessToken,
        passwordData.oldPassword,
        passwordData.newPassword1,
        passwordData.newPassword2
      );
      if (result.data) {
        setMessage('Passwort erfolgreich geändert');
        setPasswordData({ oldPassword: '', newPassword1: '', newPassword2: '' });
      } else if (result.error) {
        const errorMessages = Object.values(result.error).flat();
        setErrors(errorMessages);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setIsSaving(false);
    }
  };


  const handleResendVerification = async () => {
    if (!profile?.email) return;

    setIsSaving(true);
    setErrors([]);
    setMessage('');

    try {
      const result = await authApi.resendVerificationEmail(profile.email);
      if (result.data) {
        setMessage('Verifizierungs-Email wurde erneut gesendet');
      } else if (result.error) {
        const errorMessages = Object.values(result.error).flat();
        setErrors(errorMessages);
      }
    } catch (error) {
      setErrors(['Ein unerwarteter Fehler ist aufgetreten']);
    } finally {
      setIsSaving(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full rounded-lg border border-gray-200 bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Profil konnte nicht geladen werden</h2>
          <p className="mt-2 text-sm text-gray-600">
            Bitte versuchen Sie es erneut oder melden Sie sich erneut an.
          </p>
          {errors.length > 0 && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={fetchProfile}
              className="w-full rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Erneut versuchen
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.username)}&background=4f46e5&color=fff`;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header mit Avatar */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-8">
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-32 w-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
                <p className="text-indigo-100">{profile.email}</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-indigo-700">
                    Profil
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'profile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Profil bearbeiten
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'password' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Passwort ändern
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{message}</p>
                  </div>
                </div>
              </div>
            )}

            {errors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Profil Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Account-Informationen</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                        Benutzername
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={profile.username}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email-Adresse
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profile.email}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 bg-gray-100 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {profile.email_verified === false && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <div className="flex items-center flex-wrap">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm text-yellow-700">
                            Ihre Email-Adresse ist noch nicht bestätigt. Wir senden Ihnen die Verifizierungs-Mail erneut.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleResendVerification}
                          disabled={isSaving}
                          className="ml-3 mt-2 sm:mt-0 bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm font-medium hover:bg-yellow-200 disabled:opacity-50 transition-colors"
                        >
                          Email erneut senden
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Persönliche Informationen</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profile.name || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Wird gespeichert...' : 'Profil speichern'}
                  </button>
                </div>
              </form>
            )}

            {/* Passwort Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Passwort ändern</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                        Aktuelles Passwort
                      </label>
                      <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword1" className="block text-sm font-medium text-gray-700">
                        Neues Passwort
                      </label>
                      <input
                        type="password"
                        id="newPassword1"
                        name="newPassword1"
                        value={passwordData.newPassword1}
                        onChange={handlePasswordChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword2" className="block text-sm font-medium text-gray-700">
                        Neues Passwort bestätigen
                      </label>
                      <input
                        type="password"
                        id="newPassword2"
                        name="newPassword2"
                        value={passwordData.newPassword2}
                        onChange={handlePasswordChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isSaving ? 'Wird gespeichert...' : 'Passwort ändern'}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
