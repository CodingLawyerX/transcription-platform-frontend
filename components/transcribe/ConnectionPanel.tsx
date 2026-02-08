'use client';

import { useState } from 'react';
import type { ConnectionStatus } from '@/types/transcribe';
import { checkHealth, maskModelName } from '@/lib/api/transcribe';

interface ConnectionPanelProps {
  apiBaseUrl: string;
  authToken?: string;
  backendUrl: string;
  apiKey: string;
  onBackendUrlChange: (url: string) => void;
  onApiKeyChange: (key: string) => void;
  onSaveSettings: () => Promise<void> | void;
  settingsDirty: boolean;
  settingsSaving: boolean;
  settingsError: string | null;
  connectionStatus: ConnectionStatus;
  onConnectionStatusChange: (status: ConnectionStatus) => void;
}

export default function ConnectionPanel({
  apiBaseUrl,
  authToken,
  backendUrl,
  apiKey,
  onBackendUrlChange,
  onApiKeyChange,
  onSaveSettings,
  settingsDirty,
  settingsSaving,
  settingsError,
  connectionStatus,
  onConnectionStatusChange,
}: ConnectionPanelProps) {
  const [pingStatus, setPingStatus] = useState('Bereit');
  const [pingState, setPingState] = useState<'idle' | 'busy' | 'success' | 'error'>('idle');

  const handlePing = async () => {
    setPingStatus('Prüfe Verbindung …');
    setPingState('busy');

    try {
      if (!authToken) {
        throw new Error('Bitte melde dich an, um die Verbindung zu prüfen.');
      }

      const data = await checkHealth(apiBaseUrl, { authToken });
      
      const statusText = data?.status || 'ok';
      setPingStatus(`Verbunden (${statusText})`);
      setPingState('success');

      const displayModel = data?.model ? maskModelName(data.model) : '–';
      
      onConnectionStatusChange({
        connected: true,
        status: statusText,
        model: displayModel,
        haveKey: data?.have_key ?? false,
      });
    } catch (error) {
      setPingStatus(`Fehler: ${error}`);
      setPingState('error');
      
      onConnectionStatusChange({
        connected: false,
        status: 'nicht erreichbar',
        model: '–',
        haveKey: false,
      });
    }
  };

  return (
    <section className="bg-[rgba(246,248,253,0.6)] border border-[rgba(46,72,121,0.08)] rounded-xl p-5 flex flex-col gap-4">
      <h2 className="m-0 text-base font-semibold text-muted-strong tracking-wide">Verbindung</h2>
      
      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-muted-strong tracking-wider uppercase">
          Service-URL
        </span>
        <input
          type="url"
          value={backendUrl}
          onChange={(e) => onBackendUrlChange(e.target.value)}
          placeholder="https://api.simpliant-ds.eu"
          className="px-3.5 py-2.5 rounded-xl border border-[rgba(35,62,112,0.22)] text-[15px] bg-white/92 transition-all duration-200 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_4px_rgba(47,74,203,0.18)]"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[13px] font-medium text-muted-strong tracking-wider uppercase">
          API-Key (optional)
        </span>
        <input
          type="password"
          value={apiKey}
          onChange={(e) => onApiKeyChange(e.target.value)}
          placeholder="Paste key"
          className="px-3.5 py-2.5 rounded-xl border border-[rgba(35,62,112,0.22)] text-[15px] bg-white/92 transition-all duration-200 focus:outline-none focus:border-primary/60 focus:shadow-[0_0_0_4px_rgba(47,74,203,0.18)]"
        />
      </label>

      <div className="flex flex-col gap-2">
        <button
          onClick={onSaveSettings}
          className="btn btn-primary"
          disabled={settingsSaving || !settingsDirty || !authToken}
        >
          {settingsSaving ? 'Speichere …' : 'Einstellungen speichern'}
        </button>
        <button
          onClick={handlePing}
          className="btn btn-outline"
        >
          Verbindung testen
        </button>
        {settingsError && (
          <span className="text-[13px] text-error">{settingsError}</span>
        )}
        {!authToken && (
          <span className="text-[13px] text-muted">
            Melde dich an, um die Verbindung zu speichern und zu testen.
          </span>
        )}
        {settingsDirty && !settingsSaving && (
          <span className="text-[13px] text-muted">
            Änderungen wurden noch nicht gespeichert.
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={`text-[13px] min-h-[18px] ${
          pingState === 'busy' ? 'status-busy' :
          pingState === 'success' ? 'status-success' :
          pingState === 'error' ? 'status-error' :
          'status-muted'
        }`}>
          {pingStatus}
        </span>
        
        <span className={`status-pill ${
          connectionStatus.status === 'ok' ? 'status-pill-success' : 'status-pill-muted'
        }`}>
          Status: {connectionStatus.status}
        </span>
        
        <span className={`status-pill ${
          connectionStatus.model !== '–' ? 'status-pill-muted' : 'status-pill-error'
        }`}>
          Modell: {connectionStatus.model}
        </span>
        
        <span className={`status-pill ${
          connectionStatus.haveKey ? 'status-pill-success' : 'status-pill-error'
        }`}>
          API-Key: {connectionStatus.haveKey ? 'aktiv' : 'fehlt'}
        </span>
      </div>
    </section>
  );
}
