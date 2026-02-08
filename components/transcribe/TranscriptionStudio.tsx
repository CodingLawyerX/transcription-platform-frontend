'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import type { TranscriptMetadata, ConnectionStatus } from '@/types/transcribe';
import { getSettings, updateSettings } from '@/lib/api/transcribe';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import Sidebar from './Sidebar';
import Workspace from './Workspace';

const STORAGE_KEY = 'transcription_studio_text';
const DEFAULT_VOXTRAL_URL =
  process.env.NEXT_PUBLIC_VOXTRAL_BACKEND_URL || 'https://transcribe.simpliant-ds.eu';

export default function TranscriptionStudio() {
  const { data: session, status } = useSession();
  const authToken = useMemo(
    () => (session?.accessToken as string | undefined) ?? undefined,
    [session]
  );

  // Connection state (Voxtral settings)
  const [backendUrl, setBackendUrl] = useState(DEFAULT_VOXTRAL_URL);
  const [apiKey, setApiKey] = useState('');
  const [settingsDirty, setSettingsDirty] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    connected: false,
    status: 'Bereit',
    model: '–',
    haveKey: false,
  });

  // Transcript state
  const [transcript, setTranscript] = useState('');
  const [metadata, setMetadata] = useState<TranscriptMetadata>({
    status: '–',
    model: '–',
    language: '–',
  });
  
  // Cursor and selection state
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  // Load saved transcript from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTranscript(saved);
    }
  }, []);

  // Load Voxtral settings from backend
  useEffect(() => {
    if (status === 'loading') return;
    if (!authToken) return;

    const loadSettings = async () => {
      try {
        const settings = await getSettings(apiBaseUrl, { authToken });
        if (settings?.backend_url) {
          setBackendUrl(settings.backend_url);
        }
        if (typeof settings?.api_key === 'string') {
          setApiKey(settings.api_key);
        }
        setSettingsDirty(false);
        setSettingsError(null);
      } catch (error: any) {
        console.error('Failed to load transcription settings:', error);
        setSettingsError(
          error?.message || 'Einstellungen konnten nicht geladen werden.'
        );
      }
    };

    loadSettings();
  }, [apiBaseUrl, authToken, status]);

  // Persist transcript to localStorage
  const persistTranscript = (text: string) => {
    if (text && text.trim()) {
      localStorage.setItem(STORAGE_KEY, text);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleTranscriptChange = (text: string) => {
    setTranscript(text);
    persistTranscript(text);
  };

  const handleClearTranscript = () => {
    setTranscript('');
    localStorage.removeItem(STORAGE_KEY);
    setMetadata({
      status: '–',
      model: '–',
      language: '–',
    });
  };

  const handleBackendUrlChange = (value: string) => {
    setBackendUrl(value);
    setSettingsDirty(true);
    setSettingsError(null);
  };

  const handleApiKeyChange = (value: string) => {
    setApiKey(value);
    setSettingsDirty(true);
    setSettingsError(null);
  };

  const handleSaveSettings = async () => {
    if (!authToken) {
      setSettingsError('Bitte melde dich an, um Einstellungen zu speichern.');
      return;
    }

    setSettingsSaving(true);
    setSettingsError(null);
    try {
      await updateSettings(
        {
          backend_url: backendUrl,
          api_key: apiKey,
        },
        apiBaseUrl,
        { authToken }
      );
      setSettingsDirty(false);
    } catch (error: any) {
      console.error('Failed to save transcription settings:', error);
      setSettingsError(
        error?.message || 'Einstellungen konnten nicht gespeichert werden.'
      );
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar
        apiBaseUrl={apiBaseUrl}
        authToken={authToken}
        backendUrl={backendUrl}
        apiKey={apiKey}
        onBackendUrlChange={handleBackendUrlChange}
        onApiKeyChange={handleApiKeyChange}
        onSaveSettings={handleSaveSettings}
        settingsDirty={settingsDirty}
        settingsSaving={settingsSaving}
        settingsError={settingsError}
        connectionStatus={connectionStatus}
        onConnectionStatusChange={setConnectionStatus}
        transcript={transcript}
        onTranscriptChange={handleTranscriptChange}
        onMetadataChange={setMetadata}
        cursorPosition={cursorPosition}
        selectedText={selectedText}
      />
      <Workspace
        transcript={transcript}
        metadata={metadata}
        onTranscriptChange={handleTranscriptChange}
        onClear={handleClearTranscript}
        onCursorPositionChange={setCursorPosition}
        onSelectedTextChange={setSelectedText}
      />
    </div>
  );
}
