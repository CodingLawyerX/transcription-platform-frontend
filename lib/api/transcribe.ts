// API Client for Transcription Service
import type {
  TranscriptionResponse,
  HealthCheckResponse,
  TranscriptionSettings,
  TranscriptionRequest,
} from '@/types/transcribe';
import { buildApiUrl as buildBackendApiUrl, getApiBaseUrl } from '@/lib/api/baseUrl';

type AuthOptions = {
  apiKey?: string;
  authToken?: string;
};

/**
 * Get headers with optional auth token or API key
 */
function getHeaders(options: AuthOptions = {}): HeadersInit {
  const headers: HeadersInit = {};
  if (options.authToken?.trim()) {
    headers['Authorization'] = `Token ${options.authToken.trim()}`;
    return headers;
  }
  if (options.apiKey?.trim()) {
    headers['X-API-KEY'] = options.apiKey.trim();
  }
  return headers;
}

/**
 * Get API base URL for the Django backend
 */
const resolveApiBaseUrl = (apiBaseUrl?: string) => getApiBaseUrl(apiBaseUrl);
const buildApiUrl = (path: string, apiBaseUrl?: string) =>
  buildBackendApiUrl(path, resolveApiBaseUrl(apiBaseUrl));

/**
 * Check health of transcription service (Voxtral backend)
 */
export async function checkHealth(
  apiBaseUrl?: string,
  auth?: AuthOptions
): Promise<HealthCheckResponse> {
  const url = buildApiUrl('transcribe/transcriptions/health/', apiBaseUrl);
  const response = await fetch(url, {
    headers: getHeaders(auth),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(JSON.stringify(data));
  }

  return response.json();
}

/**
 * Check infrastructure health (database, redis, storage, celery)
 */
export async function checkInfrastructureHealth(
  apiBaseUrl?: string,
  auth?: AuthOptions
): Promise<HealthCheckResponse> {
  const url = buildApiUrl('transcribe/health/', apiBaseUrl);
  const response = await fetch(url, {
    headers: getHeaders(auth),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(JSON.stringify(data));
  }

  return response.json();
}

/**
 * Transcribe audio file (direct endpoint)
 */
export async function transcribeAudio(
  request: TranscriptionRequest,
  apiBaseUrl?: string,
  auth?: AuthOptions
): Promise<TranscriptionResponse> {
  const formData = new FormData();
  formData.append('file', request.file);
  
  if (request.language && request.language !== 'auto') {
    formData.append('language', request.language);
  }

  const url = buildApiUrl('transcribe/transcriptions/transcribe/', apiBaseUrl);
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(auth),
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    const message = data?.error || data?.detail || response.statusText || 'Unbekannter Fehler';
    throw new Error(message);
  }

  return data;
}

/**
 * Get all transcriptions (Django API)
 * Supports both API key (X-API-KEY) and Token authentication (Authorization: Token ...)
 */
export async function getTranscriptions(
  apiBaseUrl?: string,
  auth?: AuthOptions
): Promise<TranscriptionResponse[]> {
  const url = buildApiUrl('transcribe/transcriptions/', apiBaseUrl);
  const response = await fetch(url, { headers: getHeaders(auth) });

  if (!response.ok) {
    throw new Error(`Failed to fetch transcriptions: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get transcription settings (Django API)
 */
export async function getSettings(
  apiBaseUrl?: string,
  auth?: AuthOptions
): Promise<TranscriptionSettings> {
  const url = buildApiUrl('transcribe/settings/1/', apiBaseUrl);
  const response = await fetch(url, {
    headers: getHeaders(auth),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch settings: ${response.statusText}`);
  }

  const data = await response.json();
  // Support both list and detail responses.
  return Array.isArray(data) ? data[0] : data;
}

/**
 * Update transcription settings (Django API)
 */
export async function updateSettings(
  settings: Partial<TranscriptionSettings>,
  apiBaseUrl?: string,
  auth?: AuthOptions
): Promise<TranscriptionSettings> {
  const url = buildApiUrl('transcribe/settings/1/', apiBaseUrl);
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      ...getHeaders(auth),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    throw new Error(`Failed to update settings: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get transcription statistics for current user
 */
export async function getStats(
  apiBaseUrl?: string,
  auth?: AuthOptions
): Promise<any> {
  const url = buildApiUrl('transcribe/transcriptions/stats/', apiBaseUrl);
  const response = await fetch(url, {
    headers: getHeaders(auth),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch stats: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get timeline data (last 30 days)
 */
export async function getTimeline(
  days?: number,
  apiBaseUrl?: string,
  auth?: AuthOptions
): Promise<any> {
  const url = new URL(buildApiUrl('transcribe/transcriptions/timeline/', apiBaseUrl));
  if (days) {
    url.searchParams.set('days', days.toString());
  }
  const response = await fetch(url.toString(), {
    headers: getHeaders(auth),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch timeline: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Mask model name for display (hide sensitive info)
 */
export function maskModelName(name?: string): string {
  if (!name) return 'verbunden';
  if (typeof name === 'string' && name.toLowerCase().includes('voxtral')) {
    return 'verbunden';
  }
  return name;
}
