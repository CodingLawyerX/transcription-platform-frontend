'use client';

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type { TranscriptMetadata } from '@/types/transcribe';

interface WorkspaceProps {
  transcript: string;
  metadata: TranscriptMetadata;
  onTranscriptChange: (text: string) => void;
  statusMessage?: { text: string; tone: 'success' | 'error' | 'muted' };
  onCursorPositionChange?: (position: number | null) => void;
  onSelectedTextChange?: (text: string) => void;
}

export default function Workspace({
  transcript,
  metadata,
  onTranscriptChange,
  statusMessage,
  onCursorPositionChange,
  onSelectedTextChange,
}: WorkspaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track cursor position and selection
  const handleTextareaInteraction = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = textarea.value || '';
    
    if (start !== end) {
      // Text is selected
      const selectedText = currentValue.substring(start, end);
      onSelectedTextChange?.(selectedText);
      onCursorPositionChange?.(start);
    } else {
      // No selection, just cursor position
      onSelectedTextChange?.('');
      onCursorPositionChange?.(start);
    }
  }, [onSelectedTextChange, onCursorPositionChange]);

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

  const wordCount = useMemo(() => {
    const trimmed = transcript.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).length;
  }, [transcript]);

  const statusToneClass = useMemo(() => {
    if (!statusMessage) return '';
    if (statusMessage.tone === 'success') return 'text-[hsl(var(--success-green))]';
    if (statusMessage.tone === 'error') return 'text-[hsl(var(--recording-red))]';
    return 'text-[hsl(var(--muted-foreground))]';
  }, [statusMessage]);

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
            Transkription
          </span>
          <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
            Status: {metadata.status} · Modell: {metadata.model} · Sprache: {metadata.language}
          </span>
        </div>
        <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
          {wordCount} {wordCount === 1 ? 'Wort' : 'Wörter'}
        </span>
      </div>

      <div className="rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] p-3 shadow-[inset_0_1px_2px_rgba(0,0,0,0.06)]">
        <textarea
          ref={textareaRef}
          value={transcript}
          onChange={(e) => onTranscriptChange(e.target.value)}
          onClick={handleTextareaInteraction}
          onKeyUp={handleTextareaInteraction}
          onKeyDown={handleTextareaInteraction}
          onSelect={handleTextareaInteraction}
          onInput={handleTextareaInteraction}
          placeholder="Transkription erscheint hier …"
          className="dictation-scroll min-h-[200px] w-full resize-none border-0 bg-transparent text-[14px] leading-6 text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground))]"
        />
      </div>

      {statusMessage?.text && (
        <div className={`text-[12px] ${statusToneClass}`}>
          {statusMessage.text}
        </div>
      )}
    </section>
  );
}
