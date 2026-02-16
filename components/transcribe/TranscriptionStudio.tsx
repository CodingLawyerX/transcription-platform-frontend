'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import type { TranscriptMetadata } from '@/types/transcribe';
import { checkHealth } from '@/lib/api/transcribe';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import Image from 'next/image';
import { dictationCssVars } from '@/lib/design-tokens';
import { TRANSCRIBE_LANGUAGE_OPTIONS } from '@/lib/transcribe-languages';
import AudioRecorder from './AudioRecorder';
import AudioUploader from './AudioUploader';
import Workspace from './Workspace';

const STORAGE_KEY = 'transcription_studio_text';
export default function TranscriptionStudio() {
  const { data: session } = useSession();
  const authToken = useMemo(
    () => (session?.accessToken as string | undefined) ?? undefined,
    [session]
  );

  // Transcript state
  const [transcript, setTranscript] = useState('');
  const [metadata, setMetadata] = useState<TranscriptMetadata>({
    status: '–',
    model: '–',
    language: '–',
  });
  const [connectionReady, setConnectionReady] = useState(false);
  const [language, setLanguage] = useState('auto');
  const [feedback, setFeedback] = useState<{ text: string; tone: 'success' | 'error' | 'muted' } | null>(null);
  
  // Cursor and selection state
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [selectedText, setSelectedText] = useState<string>('');

  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const refreshConnection = useCallback(async () => {
    if (!authToken) {
      setConnectionReady(false);
      return;
    }
    try {
      const data = await checkHealth(apiBaseUrl, { authToken });
      setConnectionReady(Boolean(data?.have_key));
    } catch (error: any) {
      setConnectionReady(false);
    }
  }, [apiBaseUrl, authToken]);

  // Load saved transcript from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setTranscript(saved);
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      refreshConnection();
    }
  }, [authToken, refreshConnection]);


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

  const handleClearTranscript = useCallback(() => {
    if (!transcript) {
      setFeedback({ text: 'Dokument ist bereits leer.', tone: 'muted' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    setTranscript('');
    localStorage.removeItem(STORAGE_KEY);
    setMetadata({
      status: '–',
      model: '–',
      language: '–',
    });
    setFeedback({ text: 'Dokument geleert.', tone: 'success' });
    setTimeout(() => setFeedback(null), 3000);
  }, [transcript]);

  const handleCopyTranscript = useCallback(async () => {
    if (!transcript.trim()) {
      setFeedback({ text: 'Keine Inhalte zum Kopieren vorhanden.', tone: 'muted' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }
    try {
      await navigator.clipboard.writeText(transcript);
      setFeedback({ text: 'Dokument in Zwischenablage kopiert.', tone: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ text: 'Kopieren fehlgeschlagen.', tone: 'error' });
      setTimeout(() => setFeedback(null), 3000);
    }
  }, [transcript]);

  return (
    <div
      className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_0%,hsl(var(--primary)/0.12),transparent_60%),hsl(var(--background))] text-[hsl(var(--foreground))]"
      style={dictationCssVars}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] text-[12px] font-bold text-white shadow-[0_2px_8px_hsl(var(--primary)/0.2)]">
              <Image
                src="/assets/simpliant-icon.svg"
                alt="Simpliant"
                width={16}
                height={16}
                className="h-4 w-4 object-contain"
                priority
              />
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.3px]">Simpliant Transcribe</span>
          </div>

          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[hsl(var(--muted-foreground))]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="max-w-[150px] appearance-none rounded-[calc(var(--radius)-2px)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] py-1.5 pl-9 pr-7 text-[12px] font-semibold text-[hsl(var(--foreground))] transition-colors focus:outline-none focus:border-[hsl(var(--ring))]"
            >
              {TRANSCRIBE_LANGUAGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.value === 'auto' ? 'Auto' : option.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <main className="grid flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="flex flex-col gap-5">
            <AudioRecorder
              apiBaseUrl={apiBaseUrl}
              authToken={authToken}
              language={language}
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
              statusMessage={feedback ?? undefined}
              onCursorPositionChange={setCursorPosition}
              onSelectedTextChange={setSelectedText}
            />

            <button
              type="button"
              onClick={() => document.getElementById('dictation-upload-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="flex items-center justify-center gap-2 rounded-[calc(var(--radius)-2px)] border border-dashed border-[hsl(var(--border))] px-3 py-2 text-[12px] font-semibold text-[hsl(var(--muted-foreground))] transition-all hover:border-[hsl(var(--primary))/0.4] hover:text-[hsl(var(--foreground))] lg:hidden"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Audio-Datei hochladen</span>
            </button>
          </div>

          <div className="flex flex-col gap-5" id="dictation-upload-section">
            <AudioUploader
              apiBaseUrl={apiBaseUrl}
              authToken={authToken}
              connectionReady={connectionReady}
              transcript={transcript}
              language={language}
              onLanguageChange={setLanguage}
              onTranscriptChange={handleTranscriptChange}
              onMetadataChange={setMetadata}
              cursorPosition={cursorPosition}
              selectedText={selectedText}
            />
            <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 text-[12px] text-[hsl(var(--muted-foreground))] shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
              <p className="font-semibold text-[hsl(var(--foreground))]">Upload-Tipps</p>
              <p className="mt-2">
                Für beste Ergebnisse nutze klare Aufnahmen ohne Hintergrundgeräusche. Max. 50 MB pro Datei.
              </p>
            </div>
          </div>
        </main>

        <footer className="flex flex-col gap-2 border-t border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-4 backdrop-blur-xl sm:px-6 sm:flex-row sm:justify-end">
          <button
            onClick={handleCopyTranscript}
            className="flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] px-4 py-3 text-[13px] font-semibold text-[hsl(var(--primary-foreground))] shadow-[0_2px_8px_hsl(var(--primary)/0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_hsl(var(--primary)/0.35)]"
          >
            Kopieren
          </button>
          <button
            onClick={handleClearTranscript}
            className="flex items-center justify-center gap-2 rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-4 py-3 text-[13px] font-semibold text-[hsl(var(--foreground))] transition-all hover:bg-[hsl(var(--accent))]"
          >
            Leeren
          </button>
        </footer>
      </div>
    </div>
  );
}
