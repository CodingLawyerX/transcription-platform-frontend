// TypeScript types for Transcription Studio

export interface TranscriptionResponse {
  id: number;
  user: number;
  title: string;
  audio_file: string;
  file_size: number;
  duration_seconds: number;
  transcribed_text: string;
  text?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  language: string;
  model_name: string;
  model?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface HealthCheckResponse {
  status: string;
  model?: string;
  have_key?: boolean;
  checks?: Record<string, boolean>;
}

export interface TranscriptionSettings {
  id?: number;
  user?: number;
  backend_url: string;
  api_key: string;
  default_language: string;
  default_model?: string;
  notifications_enabled: boolean;
  auto_delete_audio: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface TranscriptionRequest {
  file: File | Blob;
  language?: string;
}

export type TranscriptionStatus = 'idle' | 'busy' | 'success' | 'error';

export interface AudioRecorderState {
  isRecording: boolean;
  recordedBlob: Blob | null;
  mediaRecorder: MediaRecorder | null;
}

export interface TranscriptMetadata {
  status: string;
  model: string;
  language: string;
}

export interface ConnectionStatus {
  connected: boolean;
  status: string;
  model: string;
  haveKey: boolean;
}

export interface TranscriptionStats {
  total: number;
  completed: number;
  total_duration: number;
  total_size: number;
  by_language: Record<string, number>;
  by_status: Record<string, number>;
}

export interface TimelineEntry {
  date: string;
  count: number;
  total_duration: number;
}
