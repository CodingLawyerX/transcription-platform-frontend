'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { TranscriptMetadata } from '@/types/transcribe';
import { transcribeAudio, maskModelName } from '@/lib/api/transcribe';

interface AudioRecorderProps {
  apiBaseUrl: string;
  authToken?: string;
  language: string;
  transcript: string;
  onTranscriptChange: (text: string) => void;
  onMetadataChange: (metadata: TranscriptMetadata) => void;
  cursorPosition?: number | null;
  selectedText?: string;
  className?: string;
}

export default function AudioRecorder({
  apiBaseUrl,
  authToken,
  language,
  transcript,
  onTranscriptChange,
  onMetadataChange,
  cursorPosition,
  selectedText,
  className,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recStatus, setRecStatus] = useState('Mikrofon ist bereit.');
  const [recState, setRecState] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const transcriptRef = useRef(transcript);
  const isRecordingRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Check if browser supports media devices
  const isMediaDevicesSupported = useCallback(() => {
    return typeof navigator !== 'undefined' &&
           navigator.mediaDevices &&
           typeof navigator.mediaDevices.getUserMedia === 'function';
  }, []);

  // Check if running in secure context (HTTPS)
  const isSecureContext = useCallback(() => {
    return typeof window !== 'undefined' && window.isSecureContext;
  }, []);

  // Check browser compatibility on component mount
  useEffect(() => {
    const supported = isMediaDevicesSupported() && isSecureContext();
    setIsAudioSupported(supported);
    
    if (!isMediaDevicesSupported()) {
      setRecStatus('Audio-Aufnahme wird von diesem Browser nicht unterstützt.');
      setRecState('error');
    } else if (!isSecureContext()) {
      setRecStatus('Audio-Aufnahme erfordert HTTPS-Verbindung.');
      setRecState('error');
    }
  }, [isMediaDevicesSupported, isSecureContext]);

  // Update ref when transcript changes
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const insertTranscript = useCallback((newText: string) => {
    const cleaned = (newText || '').trim();
    if (!cleaned) return;

    const currentText = transcriptRef.current;
    let newValue = '';

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
    } else {
      // Fallback: append to end
      const pos = currentText.length;
      let snippet = cleaned;
      const beforeChar = pos > 0 ? currentText[pos - 1] : '';
      
      if (beforeChar && !/\s/.test(beforeChar)) {
        snippet = ` ${snippet}`;
      }

      newValue = currentText + snippet;
    }

    onTranscriptChange(newValue);
  }, [cursorPosition, selectedText, onTranscriptChange]);

  const handleTranscribe = useCallback(async (blob: Blob) => {
    setIsProcessing(true);
    setRecStatus('Verarbeite Live-Aufnahme …');
    setRecState('busy');

    onMetadataChange({
      status: 'läuft …',
      model: '–',
      language: '–',
    });

    try {
      const data = await transcribeAudio(
        { file: blob, language },
        apiBaseUrl,
        { authToken }
      );

      insertTranscript(data?.text || '');

      if (data?.text?.trim()) {
        setRecStatus('Vorgang abgeschlossen.');
        setRecState('success');
      } else {
        setRecStatus('Keine Sprache erkannt.');
        setRecState('error');
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
      setRecStatus(`Fehler: ${error.message || error}`);
      setRecState('error');
      
      onMetadataChange({
        status: 'Fehler',
        model: '–',
        language: '–',
      });
    } finally {
      setIsProcessing(false);
      setElapsedMs(0);
    }
  }, [apiBaseUrl, authToken, language, onMetadataChange, insertTranscript]);

  const startRecording = useCallback(async () => {
    if (!authToken) {
      setRecStatus('Bitte melde dich an, um Audio aufzunehmen.');
      setRecState('error');
      setIsRecording(false);
      return;
    }
    setRecStatus('Fordere Mikrofon-Zugriff an …');
    setRecState('busy');

    // Hide player and clear previous recording
    if (audioPlayerRef.current) {
      audioPlayerRef.current.hidden = true;
      if (audioPlayerRef.current.src) {
        URL.revokeObjectURL(audioPlayerRef.current.src);
        audioPlayerRef.current.removeAttribute('src');
        audioPlayerRef.current.load();
      }
    }
    chunksRef.current = [];

    // Check browser compatibility
    if (!isMediaDevicesSupported()) {
      setRecStatus('Mikrofon-Fehler: Browser unterstützt keine Audio-Aufnahme.');
      setRecState('error');
      setIsRecording(false);
      return;
    }

    // Check secure context for HTTPS
    if (!isSecureContext()) {
      setRecStatus('Mikrofon-Fehler: Audio-Aufnahme erfordert HTTPS-Verbindung.');
      setRecState('error');
      setIsRecording(false);
      return;
    }

    try {
      // Additional safety check before calling getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('getUserMedia API not available');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true },
      });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstart = () => {
        setRecStatus('Aufnahme läuft …');
        setRecState('busy');
        setIsRecording(true);
        isRecordingRef.current = true;
        startTimeRef.current = Date.now();
        setElapsedMs(0);
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        timerRef.current = setInterval(() => {
          if (startTimeRef.current) {
            setElapsedMs(Date.now() - startTimeRef.current);
          }
        }, 100);
      };

      mediaRecorder.onstop = async () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        startTimeRef.current = null;
        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
        
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        chunksRef.current = [];
        setIsRecording(false);
        isRecordingRef.current = false;

        if (blob.size === 0) {
          setRecStatus('Keine Audio-Daten aufgenommen.');
          setRecState('error');
          return;
        }

        // Show player
        if (audioPlayerRef.current) {
          audioPlayerRef.current.src = URL.createObjectURL(blob);
          audioPlayerRef.current.hidden = false;
        }

        const sizeKB = (blob.size / 1024).toFixed(0);
        setRecStatus(`Aufnahme gespeichert (${sizeKB} KB).`);
        setRecState('success');

        // Auto-transcribe
        await handleTranscribe(blob);
      };

      mediaRecorder.start();
    } catch (error: any) {
      let errorMessage = 'Unbekannter Mikrofon-Fehler';
      
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Mikrofon-Zugriff wurde verweigert. Bitte erlauben Sie den Zugriff in Ihren Browser-Einstellungen.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'Kein Mikrofon gefunden. Bitte stellen Sie sicher, dass ein Mikrofon angeschlossen ist.';
      } else if (error.name === 'NotSupportedError') {
        errorMessage = 'Audio-Aufnahme wird von diesem Browser nicht unterstützt.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Audio-Aufnahme ist aus Sicherheitsgründen nicht erlaubt. Stellen Sie sicher, dass Sie HTTPS verwenden.';
      } else if (error.message === 'getUserMedia API not available') {
        errorMessage = 'Mikrofon-Fehler: Audio-Aufnahme-API nicht verfügbar. Bitte verwenden Sie einen modernen Browser.';
      } else {
        errorMessage = `Mikrofon-Fehler: ${error.message || error}`;
      }
      
      setRecStatus(errorMessage);
      setRecState('error');
      setIsRecording(false);
    }
  }, [authToken, isMediaDevicesSupported, isSecureContext, handleTranscribe]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    isRecordingRef.current = false;
  }, []);

  const toggleRecording = useCallback(() => {
    if (isRecordingRef.current) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [startRecording, stopRecording]);

  // Keyboard shortcut: Hold Ctrl to record
  useEffect(() => {
    const ctrlState = {
      timer: null as NodeJS.Timeout | null,
      isRecording: false,
      ctrlPressed: false
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Control' && !event.repeat) {
        ctrlState.ctrlPressed = true;
        
        // Only start timer if not already recording and no timer running
        if (!ctrlState.isRecording && !ctrlState.timer && !isRecordingRef.current) {
          ctrlState.timer = setTimeout(() => {
            ctrlState.timer = null;
            ctrlState.isRecording = true;
            startRecording();
          }, 160);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Control') {
        ctrlState.ctrlPressed = false;
        
        // Clear any pending timer
        if (ctrlState.timer) {
          clearTimeout(ctrlState.timer);
          ctrlState.timer = null;
          ctrlState.isRecording = false;
        }
        
        // Stop recording if currently recording
        if (ctrlState.isRecording || isRecordingRef.current) {
          ctrlState.isRecording = false;
          stopRecording();
        }
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      if (ctrlState.timer) {
        clearTimeout(ctrlState.timer);
      }
    };
  }, [startRecording, stopRecording]);


  const durationLabel = useMemo(() => {
    const totalSeconds = Math.floor(elapsedMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }, [elapsedMs]);

  const statusBadge = useMemo(() => {
    if (isRecording) {
      return { label: 'Aufnahme', tone: 'recording' as const };
    }
    if (isProcessing || recState === 'busy') {
      return { label: 'Verarbeitung', tone: 'processing' as const };
    }
    if (recState === 'error') {
      return { label: 'Fehler', tone: 'error' as const };
    }
    return { label: 'Bereit', tone: 'ready' as const };
  }, [isRecording, isProcessing, recState]);

  const badgeClass = useMemo(() => {
    switch (statusBadge.tone) {
      case 'recording':
        return 'bg-recording/15 text-recording border-recording/30';
      case 'processing':
        return 'bg-warning/15 text-warning border-warning/30';
      case 'error':
        return 'bg-recording/12 text-recording border-recording/30';
      default:
        return 'bg-primary/12 text-primary border-primary/25';
    }
  }, [statusBadge.tone]);

  return (
    <section
      className={`rounded-[var(--radius)] border p-5 transition-all ${
        isRecording
          ? 'border-recording/25 bg-recording/5 shadow-recording-soft'
          : 'border-border bg-card shadow-panel'
      } ${className ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-2 rounded-[calc(var(--radius)-2px)] border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${badgeClass}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          <span>{statusBadge.label}</span>
        </div>
        <span className={`text-sm font-semibold ${isRecording ? 'text-recording' : 'text-muted-foreground'}`}>
          {durationLabel}
        </span>
      </div>

      <div className="mt-5 flex flex-col items-center gap-4">
        <button
          onClick={toggleRecording}
          disabled={!isAudioSupported}
          className={`relative flex h-[88px] w-[88px] items-center justify-center rounded-full text-white transition-all ${
            isRecording
              ? 'bg-gradient-to-br from-recording to-red-500 animate-[dictation-ring_2s_cubic-bezier(0.4,0,0.6,1)_infinite]'
              : 'bg-gradient-primary shadow-primary-soft hover:scale-[1.05] hover:shadow-primary-strong'
          } disabled:opacity-60 disabled:cursor-not-allowed`}
          aria-label={isRecording ? 'Aufnahme stoppen' : 'Aufnahme starten'}
          title={!isAudioSupported ? 'Audio-Aufnahme wird von diesem Browser nicht unterstützt' : ''}
        >
          {isRecording ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          )}
        </button>

        <div className={`flex h-12 items-center justify-center gap-1.5 ${isRecording ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          {Array.from({ length: 7 }).map((_, index) => (
            <span
              key={index}
              className="w-[3px] rounded-full bg-gradient-to-t from-recording to-red-500 shadow-recording-glow animate-[dictation-wave_1.2s_ease-in-out_infinite]"
              style={{ animationDelay: `${index * 0.08}s` }}
            />
          ))}
        </div>
      </div>

      <audio
        ref={audioPlayerRef}
        controls
        hidden
        className="w-full rounded-xl mt-4"
      />

      <div className={`mt-4 text-xs ${
        recState === 'busy' ? 'text-primary' :
        recState === 'success' ? 'text-success' :
        recState === 'error' ? 'text-recording' :
        'text-muted-foreground'
      }`}>
        {recStatus}
      </div>
    </section>
  );
}
