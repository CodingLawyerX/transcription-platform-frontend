'use client';

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import type { TranscriptMetadata } from '@/types/transcribe';
import { transcribeAudio, maskModelName } from '@/lib/api/transcribe';
import { TRANSCRIBE_LANGUAGE_OPTIONS } from '@/lib/transcribe-languages';

interface AudioUploaderProps {
  apiBaseUrl: string;
  authToken?: string;
  connectionReady?: boolean;
  transcript: string;
  language: string;
  onLanguageChange: (language: string) => void;
  onTranscriptChange: (text: string) => void;
  onMetadataChange: (metadata: TranscriptMetadata) => void;
  cursorPosition?: number | null;
  selectedText?: string;
  className?: string;
}

export default function AudioUploader({
  apiBaseUrl,
  authToken,
  connectionReady,
  transcript,
  language,
  onLanguageChange,
  onTranscriptChange,
  onMetadataChange,
  cursorPosition,
  selectedText,
  className,
}: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState('Warte auf Audio …');
  const [uploadState, setUploadState] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const transcriptRef = useRef(transcript);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setUploadStatus('Datei ist zu groß (max. 50 MB).');
        setUploadState('error');
        return;
      }
      if (!file.type.startsWith('audio/')) {
        setUploadStatus('Diese Datei ist kein Audioformat.');
        setUploadState('error');
        return;
      }
      setUploadStatus(`Bereit: ${file.name}`);
      setUploadState('idle');
    } else {
      setUploadStatus('Warte auf Audio …');
      setUploadState('idle');
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const handleDragEnter = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = Array.from(e.dataTransfer?.files || []);
    const audioFile = items.find((f) => f.type.startsWith('audio/'));

    if (!audioFile) {
      setUploadStatus('Diese Datei ist kein Audioformat.');
      setUploadState('error');
      return;
    }

    if (fileInputRef.current) {
      const dt = new DataTransfer();
      dt.items.add(audioFile);
      fileInputRef.current.files = dt.files;
    }
    handleFileSelect(audioFile);
  };

  const insertTranscript = (newText: string) => {
    const cleaned = (newText || '').trim();
    if (!cleaned) return;

    const currentText = transcriptRef.current;
    let newValue = '';
    let newCursorPosition = cursorPosition;

    if (selectedText && cursorPosition !== null && cursorPosition !== undefined) {
      // Replace selected text
      const beforeSelection = currentText.substring(0, cursorPosition);
      const afterSelection = currentText.substring(cursorPosition + selectedText.length);
      
      let snippet = cleaned;
      // Add space before if needed
      if (cursorPosition > 0 && !/\s/.test(currentText[cursorPosition - 1])) {
        snippet = ` ${snippet}`;
      }
      // Add space after if needed
      if (afterSelection.length > 0 && !/\s/.test(afterSelection[0])) {
        snippet = `${snippet} `;
      }
      
      newValue = beforeSelection + snippet + afterSelection;
      newCursorPosition = cursorPosition + snippet.length;
    } else if (cursorPosition !== null && cursorPosition !== undefined) {
      // Insert at cursor position
      const beforeCursor = currentText.substring(0, cursorPosition);
      const afterCursor = currentText.substring(cursorPosition);
      
      let snippet = cleaned;
      // Add space before if needed
      if (cursorPosition > 0 && !/\s/.test(currentText[cursorPosition - 1])) {
        snippet = ` ${snippet}`;
      }
      // Add space after if needed
      if (afterCursor.length > 0 && !/\s/.test(afterCursor[0])) {
        snippet = `${snippet} `;
      }
      
      newValue = beforeCursor + snippet + afterCursor;
      newCursorPosition = cursorPosition + snippet.length;
    } else {
      // Fallback: append to end
      const pos = currentText.length;
      let snippet = cleaned;
      const beforeChar = pos > 0 ? currentText[pos - 1] : '';
      
      if (beforeChar && !/\s/.test(beforeChar)) {
        snippet = ` ${snippet}`;
      }

      newValue = currentText + snippet;
      newCursorPosition = newValue.length;
    }

    onTranscriptChange(newValue);
    
    // Cursor position updates are handled by the Workspace handlers.
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Bitte zuerst eine Audiodatei wählen.');
      setUploadState('error');
      return;
    }
    if (!authToken) {
      setUploadStatus('Bitte melde dich an, um zu transkribieren.');
      setUploadState('error');
      return;
    }
    if (connectionReady === false) {
      setUploadStatus('API-Key fehlt. Bitte im Profil hinterlegen.');
      setUploadState('error');
      return;
    }

    setUploadStatus('Übertrage und transkribiere …');
    setUploadState('busy');
    
    onMetadataChange({
      status: 'läuft …',
      model: '–',
      language: '–',
    });

    try {
      const data = await transcribeAudio(
        { file: selectedFile, language },
        apiBaseUrl,
        { authToken }
      );

      insertTranscript(data?.text || '');

      if (data?.text?.trim()) {
        setUploadStatus('Vorgang abgeschlossen.');
        setUploadState('success');
      } else {
        setUploadStatus('Keine Sprache erkannt.');
        setUploadState('error');
      }

      const statusText = data?.status || 'ok';
      const displayModel = data?.model ? maskModelName(data.model) : '–';
      const detectedLanguage = data?.language || (language !== 'auto' ? language : 'auto');

      onMetadataChange({
        status: statusText,
        model: displayModel,
        language: detectedLanguage,
      });
    } catch (error: any) {
      setUploadStatus(`Fehler: ${error.message || error}`);
      setUploadState('error');
      
      onMetadataChange({
        status: 'Fehler',
        model: '–',
        language: '–',
      });
    }
  };

  return (
    <section className={`rounded-[var(--radius)] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 flex flex-col gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.08)] ${className ?? ''}`}>
      <div className="flex items-center justify-between">
        <h2 className="m-0 text-[12px] font-semibold uppercase tracking-[0.2em] text-[hsl(var(--muted-foreground))]">
          Audio-Upload
        </h2>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[12px] font-semibold text-[hsl(var(--primary))] hover:text-[hsl(var(--primary-dark))] transition-colors"
        >
          Datei wählen
        </button>
      </div>

      <label
        className={`rounded-[calc(var(--radius)+4px)] border border-dashed px-4 py-4 text-center text-[13px] text-[hsl(var(--muted-foreground))] transition-all ${
          isDragging
            ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10'
            : 'border-[hsl(var(--border))] bg-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary))/0.8]'
        }`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-[13px] font-semibold text-[hsl(var(--foreground))]">
            Ziehe Audio hierhin oder tippe zum Auswählen
          </span>
          <span className="text-[12px] text-[hsl(var(--muted-foreground))]">
            {selectedFile ? selectedFile.name : 'Keine Datei gewählt'}
          </span>
        </div>
      </label>

      <div className="flex items-center gap-2">
        <label className="flex-1">
          <span className="sr-only">Bevorzugte Sprache</span>
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full rounded-[calc(var(--radius)-2px)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 py-2 text-[13px] font-medium text-[hsl(var(--foreground))] appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%278%27%20fill=%27none%27%3E%3Cpath%20stroke=%27%2353648f%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27m1%201.5%205%205%205-5%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] transition-all focus:outline-none focus:border-[hsl(var(--ring))] focus:shadow-[0_0_0_3px_hsl(var(--ring)/0.12)]"
          >
            {TRANSCRIBE_LANGUAGE_OPTIONS.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={handleUpload}
          disabled={uploadState === 'busy'}
          className="rounded-[calc(var(--radius)-2px)] px-3 py-2 text-[13px] font-semibold text-[hsl(var(--primary-foreground))] bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary-light)))] shadow-[0_6px_16px_hsl(var(--primary)/0.25)] transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_hsl(var(--primary)/0.3)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
        >
          Transkribieren
        </button>
      </div>

      <span className={`text-[12px] min-h-[16px] ${
        uploadState === 'busy' ? 'text-[hsl(var(--primary))]' :
        uploadState === 'success' ? 'text-[hsl(var(--success-green))]' :
        uploadState === 'error' ? 'text-[hsl(var(--recording-red))]' :
        'text-[hsl(var(--muted-foreground))]'
      }`}>
        {uploadStatus}
      </span>
    </section>
  );
}
