'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/auth';
import { checkHealth, getSettings, updateSettings, maskModelName } from '@/lib/api/transcribe';
import type { ConnectionStatus } from '@/types/transcribe';

const DEFAULT_VOXTRAL_URL =
  process.env.NEXT_PUBLIC_VOXTRAL_BACKEND_URL || 'https://transcribe.simpliant-ds.eu';

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
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'transcription'>('profile');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword1: '',
    newPassword2: '',
  });
  const [transcriptionSettings, setTranscriptionSettings] = useState({
    backendUrl: DEFAULT_VOXTRAL_URL,
    apiKey: '',
  });
  const [transcriptionDirty, setTranscriptionDirty] = useState(false);
  const [transcriptionSaving, setTranscriptionSaving] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [transcriptionStatus, setTranscriptionStatus] = useState<ConnectionStatus>({
    connected: false,
    status: 'Bereit',
    model: '–',
    haveKey: false,
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

  const fetchTranscriptionSettings = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const settings = await getSettings(undefined, { authToken: session.accessToken });
      setTranscriptionSettings({
        backendUrl: settings?.backend_url || DEFAULT_VOXTRAL_URL,
        apiKey: settings?.api_key || '',
      });
      setTranscriptionDirty(false);
      setTranscriptionError(null);
    } catch (error: any) {
      setTranscriptionError(error?.message || 'Einstellungen konnten nicht geladen werden.');
    }
  }, [session]);

  const refreshTranscriptionStatus = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const data = await checkHealth(undefined, { authToken: session.accessToken });
      const statusText = data?.status || 'ok';
      const displayModel = data?.model ? maskModelName(data.model) : '–';
      setTranscriptionStatus({
        connected: true,
        status: statusText,
        model: displayModel,
        haveKey: data?.have_key ?? false,
      });
    } catch (error) {
      setTranscriptionStatus({
        connected: false,
        status: 'nicht erreichbar',
        model: '–',
        haveKey: false,
      });
    }
  }, [session]);

  useEffect(() => {
    if (!session?.accessToken) return;
    fetchTranscriptionSettings();
    refreshTranscriptionStatus();
  }, [session, fetchTranscriptionSettings, refreshTranscriptionStatus]);

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

  const handleTranscriptionSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTranscriptionSettings(prev => ({
      ...prev,
      [name]: value,
    }));
    setTranscriptionDirty(true);
    setTranscriptionError(null);
  };

  const handleTranscriptionSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.accessToken) return;

    setTranscriptionSaving(true);
    setTranscriptionError(null);
    try {
      await updateSettings(
        {
          backend_url: transcriptionSettings.backendUrl,
          api_key: transcriptionSettings.apiKey,
        },
        undefined,
        { authToken: session.accessToken }
      );
      setTranscriptionDirty(false);
      await refreshTranscriptionStatus();
    } catch (error: any) {
      setTranscriptionError(error?.message || 'Einstellungen konnten nicht gespeichert werden.');
    } finally {
      setTranscriptionSaving(false);
    }
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
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))] mx-auto"></div>
          <p className="mt-4 text-[hsl(var(--muted-foreground))]">Lade Profil...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--background))] px-4">
        <div className="max-w-md w-full rounded-lg border border-[hsl(var(--border))] bg-white p-6 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-[hsl(var(--foreground))]">Profil konnte nicht geladen werden</h2>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
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
              className="w-full rounded-md bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] px-4 py-2 text-sm font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_6px_16px_hsl(var(--primary)/0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_hsl(var(--primary)/0.3)]"
            >
              Erneut versuchen
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-md border border-[hsl(var(--border))] px-4 py-2 text-sm font-semibold text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/0.35]"
            >
              Zur Anmeldung
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.username)}&background=007aff&color=fff`;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-2xl overflow-hidden border border-[hsl(var(--border))]">
          {/* Header mit Avatar */}
          <div className="bg-[linear-gradient(120deg,hsl(var(--primary)/0.16),hsl(var(--primary)/0.06))] px-6 py-6">
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <div className="relative h-20 w-20">
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  width={80}
                  height={80}
                  className="h-20 w-20 rounded-full border border-white shadow-sm object-cover"
                />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-2xl font-semibold text-[hsl(var(--foreground))]">{profile.username}</h1>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{profile.email}</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))]">
                    Profil
                  </span>
                  {profile.email_verified === false && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      Email nicht verifiziert
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-[hsl(var(--border))]">
            <nav className="flex -mb-px flex-wrap">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'profile' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))]'}`}
              >
                Profil bearbeiten
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'password' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))]'}`}
              >
                Passwort ändern
              </button>
              <button
                onClick={() => setActiveTab('transcription')}
                className={`py-4 px-6 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'transcription' ? 'border-[hsl(var(--primary))] text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--border))]'}`}
              >
                Transkription
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
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Account-Informationen</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Benutzername
                      </label>
                      <input
                        type="text"
                        id="username"
                        value={profile.username}
                        disabled
                        className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md shadow-sm px-3 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Email-Adresse
                      </label>
                      <input
                        type="email"
                        id="email"
                        value={profile.email}
                        disabled
                        className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md shadow-sm px-3 py-2 bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))] cursor-not-allowed"
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
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Persönliche Informationen</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="name" className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={profile.name || ''}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md shadow-sm px-3 py-2 focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-md text-[hsl(var(--primary-foreground))] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] hover:shadow-[0_10px_20px_hsl(var(--primary)/0.3)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Passwort ändern</h3>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="oldPassword" className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Aktuelles Passwort
                      </label>
                      <input
                        type="password"
                        id="oldPassword"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={handlePasswordChange}
                        required
                        className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md shadow-sm px-3 py-2 focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword1" className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Neues Passwort
                      </label>
                      <input
                        type="password"
                        id="newPassword1"
                        name="newPassword1"
                        value={passwordData.newPassword1}
                        onChange={handlePasswordChange}
                        required
                        className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md shadow-sm px-3 py-2 focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-colors"
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword2" className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Neues Passwort bestätigen
                      </label>
                      <input
                        type="password"
                        id="newPassword2"
                        name="newPassword2"
                        value={passwordData.newPassword2}
                        onChange={handlePasswordChange}
                        required
                        className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md shadow-sm px-3 py-2 focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-md text-[hsl(var(--primary-foreground))] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] hover:shadow-[0_10px_20px_hsl(var(--primary)/0.3)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSaving ? 'Wird gespeichert...' : 'Passwort ändern'}
                  </button>
                </div>
              </form>
            )}

            {/* Transkription Tab */}
            {activeTab === 'transcription' && (
              <form onSubmit={handleTranscriptionSave} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-4">Voxtral-Verbindung</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      transcriptionStatus.status === 'ok' ? 'bg-[hsl(var(--success-green))/0.16] text-[hsl(var(--success-green))]' : 'bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]'
                    }`}>
                      Status: {transcriptionStatus.status}
                    </span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[hsl(var(--secondary))] text-[hsl(var(--muted-foreground))]">
                      Modell: {transcriptionStatus.model}
                    </span>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      transcriptionStatus.haveKey ? 'bg-[hsl(var(--success-green))/0.16] text-[hsl(var(--success-green))]' : 'bg-[hsl(var(--warning-orange))/0.16] text-[hsl(var(--warning-orange))]'
                    }`}>
                      API-Key: {transcriptionStatus.haveKey ? 'aktiv' : 'fehlt'}
                    </span>
                    <button
                      type="button"
                      onClick={refreshTranscriptionStatus}
                      className="ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/0.35]"
                    >
                      Status prüfen
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="backendUrl" className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        Service-URL
                      </label>
                      <input
                        type="url"
                        id="backendUrl"
                        name="backendUrl"
                        value={transcriptionSettings.backendUrl}
                        onChange={handleTranscriptionSettingsChange}
                        className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md shadow-sm px-3 py-2 focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-colors"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="apiKey" className="block text-sm font-medium text-[hsl(var(--muted-foreground))]">
                        API-Key
                      </label>
                      <input
                        type="password"
                        id="apiKey"
                        name="apiKey"
                        value={transcriptionSettings.apiKey}
                        onChange={handleTranscriptionSettingsChange}
                        placeholder="API-Key einfügen"
                        className="mt-1 block w-full border border-[hsl(var(--border))] rounded-md shadow-sm px-3 py-2 focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.15)] transition-colors"
                      />
                      <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
                        Wird verschlüsselt gespeichert und nur für die Transkription verwendet.
                      </p>
                    </div>
                  </div>
                </div>

                {transcriptionError && (
                  <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {transcriptionError}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={transcriptionSaving || !transcriptionDirty}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-semibold rounded-md text-[hsl(var(--primary-foreground))] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] hover:shadow-[0_10px_20px_hsl(var(--primary)/0.3)] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {transcriptionSaving ? 'Wird gespeichert...' : 'Einstellungen speichern'}
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
