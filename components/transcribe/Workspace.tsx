'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { TranscriptMetadata } from '@/types/transcribe';

interface WorkspaceProps {
  transcript: string;
  metadata: TranscriptMetadata;
  onTranscriptChange: (text: string) => void;
  onClear: () => void;
  onCursorPositionChange?: (position: number | null) => void;
  onSelectedTextChange?: (text: string) => void;
}

export default function Workspace({
  transcript,
  metadata,
  onTranscriptChange,
  onClear,
  onCursorPositionChange,
  onSelectedTextChange,
}: WorkspaceProps) {
  const [copyStatus, setCopyStatus] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCopy = async () => {
    if (!transcript.trim()) {
      setCopyStatus('Keine Inhalte zum Kopieren vorhanden.');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }

    try {
      await navigator.clipboard.writeText(transcript);
      setCopyStatus('Dokument in Zwischenablage kopiert.');
      setTimeout(() => setCopyStatus(''), 3000);
    } catch (error) {
      setCopyStatus('Kopieren fehlgeschlagen.');
      setTimeout(() => setCopyStatus(''), 3000);
    }
  };

  const handleClear = () => {
    if (!transcript) {
      setCopyStatus('Dokument ist bereits leer.');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }
    onClear();
    setCopyStatus('Dokument geleert.');
    setTimeout(() => setCopyStatus(''), 3000);
  };

  // Track cursor position and selection
  const handleTextareaInteraction = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
      // Text is selected
      const selectedText = transcript.substring(start, end);
      onSelectedTextChange?.(selectedText);
      onCursorPositionChange?.(start);
    } else {
      // No selection, just cursor position
      onSelectedTextChange?.('');
      onCursorPositionChange?.(start);
    }
  }, [transcript, onSelectedTextChange, onCursorPositionChange]);

  // Set up event listeners for textarea interactions
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const events = ['click', 'keyup', 'keydown', 'mouseup', 'select', 'focus', 'input'];
    
    const handleInteraction = () => {
      handleTextareaInteraction();
    };

    events.forEach(event => {
      textarea.addEventListener(event, handleInteraction);
    });

    return () => {
      events.forEach(event => {
        textarea.removeEventListener(event, handleInteraction);
      });
    };
  }, [handleTextareaInteraction]);

  // Update cursor position when transcript changes
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Preserve cursor position after transcript changes
    const currentPosition = textarea.selectionStart;
    if (currentPosition !== null && currentPosition !== undefined) {
      onCursorPositionChange?.(currentPosition);
    }
  }, [transcript, onCursorPositionChange]);

  const getStatusClass = () => {
    if (metadata.status === 'ok') return 'bg-success/[0.16] text-success';
    if (metadata.status === 'Fehler') return 'bg-error/[0.14] text-error';
    return 'bg-[rgba(46,72,121,0.1)] text-muted-strong';
  };

  return (
    <main className="flex-1 flex flex-col px-8 md:px-12 lg:px-[clamp(32px,6vw,72px)] py-12 gap-7 relative">
      <header className="flex items-center justify-start gap-3 px-1 py-3 border-b border-[rgba(36,52,98,0.08)]">
        <div className="flex items-baseline gap-3 text-lg font-semibold tracking-wide">
          <span className="w-8 h-8 rounded-[10px] bg-primary/[0.12] flex-shrink-0 inline-flex items-center justify-center bg-[url('/app-icon.png')] bg-no-repeat bg-center bg-[length:70%]" />
          <span>Dokument</span>
          <small className={`text-xs px-2.5 py-1 rounded-full ${getStatusClass()}`}>
            Status: {metadata.status}
          </small>
        </div>

        <div className="flex gap-4 text-[13px] text-muted tracking-wide ml-auto">
          <span>Modell: {metadata.model}</span>
          <span>Sprache: {metadata.language}</span>
        </div>

        <div className="flex gap-2.5 ml-4">
          <button
            onClick={handleCopy}
            className="border border-[rgba(46,72,121,0.16)] bg-white/90 text-muted-strong rounded-xl px-4 py-2 text-[13px] font-semibold tracking-wide cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(28,36,56,0.12)] active:translate-y-0 active:shadow-none"
          >
            Kopieren
          </button>
          <button
            onClick={handleClear}
            className="border border-[rgba(46,72,121,0.16)] bg-[rgba(247,249,254,0.9)] text-muted-strong rounded-xl px-4 py-2 text-[13px] font-semibold tracking-wide cursor-pointer transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_12px_20px_rgba(28,36,56,0.12)] active:translate-y-0 active:shadow-none"
          >
            Leeren
          </button>
        </div>
      </header>

      {copyStatus && (
        <div className="text-[13px] text-success font-medium px-1">
          {copyStatus}
        </div>
      )}

      <section className="flex-1 flex justify-center pb-12 overflow-y-auto">
        <div className="bg-white w-full max-w-[900px] min-h-[calc(100vh-180px)] rounded-xl shadow-soft p-[72px_70px] relative after:content-[''] after:absolute after:inset-8 after:border after:border-[rgba(35,62,112,0.08)] after:rounded-xl after:pointer-events-none">
          <textarea
            ref={textareaRef}
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="Hier erscheint das Ergebnisdokument."
            className="w-full min-h-full border-0 resize-none font-serif text-lg leading-[1.65] text-text bg-transparent outline-none placeholder:text-muted-strong/40"
          />
        </div>
      </section>
    </main>
  );
}
