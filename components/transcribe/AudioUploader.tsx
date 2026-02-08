'use client';

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import type { TranscriptMetadata } from '@/types/transcribe';
import { transcribeAudio, maskModelName } from '@/lib/api/transcribe';

interface AudioUploaderProps {
  apiBaseUrl: string;
  authToken?: string;
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onMetadataChange: (metadata: TranscriptMetadata) => void;
  cursorPosition?: number | null;
  selectedText?: string;
}

const SUPPORTED_LANGUAGES = [
  { value: 'auto', label: 'Automatisch erkennen' },
  { value: 'de', label: 'DE' },
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
  { value: 'es', label: 'ES' },
  { value: 'it', label: 'IT' },
];

export default function AudioUploader({
  apiBaseUrl,
  authToken,
  transcript,
  onTranscriptChange,
  onMetadataChange,
  cursorPosition,
  selectedText,
}: AudioUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('auto');
  const [uploadStatus, setUploadStatus] = useState('Warte auf Audio …');
  const [uploadState, setUploadState] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    if (file) {
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

    const currentText = transcript;
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
    
    // Update cursor position after insertion
    setTimeout(() => {
      if (newCursorPosition !== null && newCursorPosition !== undefined) {
        // This will trigger the cursor position update in Workspace
        const event = new Event('input', { bubbles: true });
        document.dispatchEvent(event);
      }
    }, 0);
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
    <section className="bg-[rgba(246,248,253,0.6)] border border-[rgba(46,72,121,0.08)] rounded-xl p-5 flex flex-col gap-4">
      <h2 className="m-0 text-base font-semibold text-muted-strong tracking-wide">
        Audio hochladen
      </h2>

      <label
        className={`border-2 border-dashed rounded-2xl p-6 bg-primary/[0.05] cursor-pointer transition-all duration-200 ${
          isDragging
            ? 'border-primary bg-primary/[0.15]'
            : 'border-primary/[0.26] hover:-translate-y-0.5 hover:border-primary/[0.55] hover:bg-primary/[0.08]'
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
        <div className="flex flex-col items-center gap-2 text-center text-muted-strong text-sm">
          <strong className="text-base text-primary">Datei auswählen</strong>
          <span>Ziehe Audio hierhin oder klicke zum Durchsuchen.</span>
          <span className="text-muted text-[13px]">
            {selectedFile ? selectedFile.name : 'Keine Datei gewählt'}
          </span>
        </div>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-muted-strong tracking-wider uppercase">
          Bevorzugte Sprache
        </span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-3.5 py-2.5 pr-10 rounded-xl border border-[rgba(35,62,112,0.22)] text-[15px] bg-white/92 appearance-none bg-[url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2712%27%20height=%278%27%20fill=%27none%27%3E%3Cpath%20stroke=%27%2353648f%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%20stroke-width=%271.5%27%20d=%27m1%201.5%205%205%205-5%27/%3E%3C/svg%3E')] bg-no-repeat bg-[right_14px_center] transition-all duration-200 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_4px_rgba(47,74,203,0.18)]"
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
      </label>

      <button
        onClick={handleUpload}
        disabled={uploadState === 'busy'}
        className="btn btn-primary"
      >
        Datei transkribieren
      </button>

      <span className={`text-[13px] min-h-[18px] ${
        uploadState === 'busy' ? 'status-busy' :
        uploadState === 'success' ? 'status-success' :
        uploadState === 'error' ? 'status-error' :
        'status-muted'
      }`}>
        {uploadStatus}
      </span>
    </section>
  );
}
