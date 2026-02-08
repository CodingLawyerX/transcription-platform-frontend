'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
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
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recStatus, setRecStatus] = useState('Mikrofon ist bereit.');
  const [recState, setRecState] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement>(null);
  const [isAudioSupported, setIsAudioSupported] = useState(true);
  const transcriptRef = useRef(transcript);
  const isRecordingRef = useRef(false);

  // Check if browser supports media devices
  const isMediaDevicesSupported = () => {
    return typeof navigator !== 'undefined' &&
           navigator.mediaDevices &&
           typeof navigator.mediaDevices.getUserMedia === 'function';
  };

  // Check if running in secure context (HTTPS)
  const isSecureContext = () => {
    return typeof window !== 'undefined' && window.isSecureContext;
  };

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
  }, []);

  // Update ref when transcript changes
  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

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
      };

      mediaRecorder.onstop = async () => {
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

        setRecordedBlob(blob);

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


  return (
    <section className="bg-[rgba(246,248,253,0.6)] border border-[rgba(46,72,121,0.08)] rounded-xl p-5 flex flex-col gap-4">
      <h2 className="m-0 text-base font-semibold text-muted-strong tracking-wide">
        Live-Aufnahme
      </h2>

      <div className="flex gap-3">
        <button
          onClick={startRecording}
          disabled={isRecording || !isAudioSupported}
          className="btn btn-primary flex-1"
          title={!isAudioSupported ? "Audio-Aufnahme wird von diesem Browser nicht unterstützt" : ""}
        >
          Aufnahme starten
        </button>
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className="btn btn-ghost flex-1"
        >
          Stopp
        </button>
      </div>

      <audio
        ref={audioPlayerRef}
        controls
        hidden
        className="w-full rounded-xl mt-1.5"
      />

      <div className={`text-[13px] ${
        recState === 'busy' ? 'status-busy' :
        recState === 'success' ? 'status-success' :
        recState === 'error' ? 'status-error' :
        'status-muted'
      }`}>
        {recStatus}
      </div>
    </section>
  );
}
