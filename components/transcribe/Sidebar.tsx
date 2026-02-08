'use client';

import { useState } from 'react';
import type { ConnectionStatus, TranscriptMetadata } from '@/types/transcribe';
import ConnectionPanel from './ConnectionPanel';
import AudioUploader from './AudioUploader';
import AudioRecorder from './AudioRecorder';

interface SidebarProps {
  apiBaseUrl: string;
  authToken?: string;
  backendUrl: string;
  apiKey: string;
  onBackendUrlChange: (url: string) => void;
  onApiKeyChange: (key: string) => void;
  onSaveSettings: () => Promise<void> | void;
  settingsDirty: boolean;
  settingsSaving: boolean;
  settingsError: string | null;
  connectionStatus: ConnectionStatus;
  onConnectionStatusChange: (status: ConnectionStatus) => void;
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onMetadataChange: (metadata: TranscriptMetadata) => void;
  cursorPosition?: number | null;
  selectedText?: string;
}

export default function Sidebar({
  apiBaseUrl,
  authToken,
  backendUrl,
  apiKey,
  onBackendUrlChange,
  onApiKeyChange,
  onSaveSettings,
  settingsDirty,
  settingsSaving,
  settingsError,
  connectionStatus,
  onConnectionStatusChange,
  transcript,
  onTranscriptChange,
  onMetadataChange,
  cursorPosition,
  selectedText,
}: SidebarProps) {
  const [language, setLanguage] = useState('auto');

  return (
    <aside className="w-full md:w-[400px] lg:w-[min(400px,32vw)] bg-sidebar-bg border-r border-sidebar-border px-8 py-9 flex flex-col gap-7 shadow-sidebar relative z-[2]">
      <header>
        <h1 className="m-0 text-2xl font-semibold tracking-tight">
          Workspace
        </h1>
        <p className="mt-2.5 mb-0 text-muted leading-relaxed">
          Verbinde deinen Dienst, lade Dateien hoch oder arbeite direkt im Browser.
        </p>
      </header>

      <ConnectionPanel
        apiBaseUrl={apiBaseUrl}
        authToken={authToken}
        backendUrl={backendUrl}
        apiKey={apiKey}
        onBackendUrlChange={onBackendUrlChange}
        onApiKeyChange={onApiKeyChange}
        onSaveSettings={onSaveSettings}
        settingsDirty={settingsDirty}
        settingsSaving={settingsSaving}
        settingsError={settingsError}
        connectionStatus={connectionStatus}
        onConnectionStatusChange={onConnectionStatusChange}
      />

      <AudioUploader
        apiBaseUrl={apiBaseUrl}
        authToken={authToken}
        transcript={transcript}
        onTranscriptChange={onTranscriptChange}
        onMetadataChange={onMetadataChange}
        cursorPosition={cursorPosition}
        selectedText={selectedText}
      />

      <AudioRecorder
        apiBaseUrl={apiBaseUrl}
        authToken={authToken}
        language={language}
        transcript={transcript}
        onTranscriptChange={onTranscriptChange}
        onMetadataChange={onMetadataChange}
        cursorPosition={cursorPosition}
        selectedText={selectedText}
      />

      <section className="text-[13px] leading-relaxed text-muted bg-primary/[0.06] border border-[rgba(46,72,121,0.05)] rounded-xl p-5">
        <p className="m-0">
          Der Dienst erlaubt 5 Requests pro Minute (Burst 10). Unterstützte Formate: MP3, M4A, WAV, FLAC, OGG, WebM bis 50&nbsp;MB.
        </p>
      </section>
    </aside>
  );
}
