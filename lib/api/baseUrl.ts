const DEFAULT_DEV_API_BASE = 'http://localhost:8120/rest/api/v1';
const DEFAULT_PROD_API_BASE = 'https://backend.simpliant-ds.eu/rest/api/v1';

const normalizeBase = (value: string) => value.replace(/\/+$/, '');

export const getApiBaseUrl = (explicitBaseUrl?: string): string => {
  const candidate = explicitBaseUrl?.trim() || process.env.NEXT_PUBLIC_API_URL?.trim();
  if (candidate) {
    return normalizeBase(candidate);
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'transcription-frontend') {
      return 'http://transcription-platform-backendgit-django-1:8112/rest/api/v1';
    }
    if (host.endsWith('simpliant-ds.eu')) {
      return DEFAULT_PROD_API_BASE;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return DEFAULT_PROD_API_BASE;
  }

  return DEFAULT_DEV_API_BASE;
};

export const buildApiUrl = (path: string, explicitBaseUrl?: string): string => {
  const base = getApiBaseUrl(explicitBaseUrl);
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${base}/${normalized}`;
};
