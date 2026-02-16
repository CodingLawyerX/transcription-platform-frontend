'use client';

import { useState } from 'react';
import type { TranscriptMetadata } from '@/types/transcribe';
import AudioUploader from './AudioUploader';
import AudioRecorder from './AudioRecorder';

interface SidebarProps {
  apiBaseUrl: string;
  authToken?: string;
  connectionReady: boolean;
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onMetadataChange: (metadata: TranscriptMetadata) => void;
  cursorPosition?: number | null;
  selectedText?: string;
}

export default function Sidebar({
  apiBaseUrl,
  authToken,
  connectionReady,
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

      <AudioUploader
        apiBaseUrl={apiBaseUrl}
        authToken={authToken}
        connectionReady={connectionReady}
        transcript={transcript}
        language={language}
        onLanguageChange={setLanguage}
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

      <section className="text-sm leading-relaxed text-muted bg-primary/10 border border-border/40 rounded-xl p-5">
        <p className="m-0">
          Der Dienst erlaubt 5 Requests pro Minute (Burst 10). Unterstützte Formate: MP3, M4A, WAV, FLAC, OGG, WebM bis 50&nbsp;MB.
        </p>
      </section>
    </aside>
  );
}
