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

  const handleInsertIntoWord = useCallback(async () => {
    if (!transcript.trim()) {
      setFeedback({ text: 'Keine Inhalte zum Einfügen vorhanden.', tone: 'muted' });
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    try {
      const office = (globalThis as any)?.Office;
      if (office?.context?.host === office.HostType?.Word && office?.context?.document?.setSelectedDataAsync) {
        office.context.document.setSelectedDataAsync(
          transcript,
          { coercionType: office.CoercionType.Text },
          (asyncResult: any) => {
            if (asyncResult.status === office.AsyncResultStatus.Failed) {
              setFeedback({ text: 'Einfügen fehlgeschlagen.', tone: 'error' });
            } else {
              setFeedback({ text: 'Text in Word eingefügt.', tone: 'success' });
            }
            setTimeout(() => setFeedback(null), 3000);
          }
        );
        return;
      }

      await navigator.clipboard.writeText(transcript);
      setFeedback({ text: 'Clipboard gefüllt – in Word einfügen (Strg+V).', tone: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (error) {
      setFeedback({ text: 'Einfügen fehlgeschlagen.', tone: 'error' });
      setTimeout(() => setFeedback(null), 3000);
    }
  }, [transcript]);

  return (
    <div
      className="min-h-screen bg-[radial-gradient(120%_80%_at_50%_0%,hsl(var(--primary)/0.12),transparent_60%),hsl(var(--background))] text-[hsl(var(--foreground))]"
      style={dictationCssVars}
    >
      <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-3 backdrop-blur-xl">
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

          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-[hsl(var(--muted-foreground))]">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </span>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="max-w-[132px] appearance-none rounded-[calc(var(--radius)-2px)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] py-1.5 pl-7 pr-6 text-[11px] font-semibold text-[hsl(var(--foreground))] transition-colors focus:outline-none focus:border-[hsl(var(--ring))]"
              >
                {TRANSCRIBE_LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.value === 'auto' ? 'Auto' : option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={handleInsertIntoWord}
              className="flex h-8 w-8 items-center justify-center rounded-[calc(var(--radius)-2px)] border border-[hsl(var(--primary))/0.4] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_6px_16px_hsl(var(--primary)/0.3)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_20px_hsl(var(--primary)/0.35)]"
              aria-label="In Word einfuegen"
              title="In Word einfuegen"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 19V5" />
                <path d="M5 12h14" />
              </svg>
            </button>
            <button
              onClick={handleCopyTranscript}
              className="flex h-8 w-8 items-center justify-center rounded-[calc(var(--radius)-2px)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--foreground))] hover:border-[hsl(var(--primary))/0.35]"
              aria-label="Kopieren"
              title="Kopieren"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              onClick={handleClearTranscript}
              className="flex h-8 w-8 items-center justify-center rounded-[calc(var(--radius)-2px)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] transition hover:text-[hsl(var(--recording-red))] hover:border-[hsl(var(--recording-red))/0.4]"
              aria-label="Leeren"
              title="Leeren"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 6l1 14a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-14" />
              </svg>
            </button>
          </div>
        </header>

        <main className="flex flex-1 flex-col gap-4 px-4 py-5">
          <section className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
            <AudioRecorder
              apiBaseUrl={apiBaseUrl}
              authToken={authToken}
              language={language}
              transcript={transcript}
              onTranscriptChange={handleTranscriptChange}
              onMetadataChange={setMetadata}
              cursorPosition={cursorPosition}
              selectedText={selectedText}
              className="border-0 bg-transparent p-0 shadow-none"
            />
            <div className="my-4 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
              <span className="h-px flex-1 bg-[hsl(var(--border))]" />
              <span>Upload</span>
              <span className="h-px flex-1 bg-[hsl(var(--border))]" />
            </div>
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
              className="border-0 bg-transparent p-0 shadow-none"
            />
          </section>

          <Workspace
            transcript={transcript}
            metadata={metadata}
            onTranscriptChange={handleTranscriptChange}
            statusMessage={feedback ?? undefined}
            onCursorPositionChange={setCursorPosition}
            onSelectedTextChange={setSelectedText}
          />
        </main>
      </div>
    </div>
  );
}
