'use client';

import { useState } from 'react';
import type { ConnectionStatus } from '@/types/transcribe';
import { checkHealth, maskModelName } from '@/lib/api/transcribe';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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
    <section className="rounded-2xl border border-border bg-card/90 p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="m-0 text-sm font-semibold text-muted-strong tracking-wide">
          Verbindung
        </h2>
        <Button
          onClick={handlePing}
          variant="outline"
          size="sm"
          className="px-3 py-1.5 text-xs"
        >
          Verbindung testen
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={connectionStatus.status === 'ok' ? 'status-success' : 'status-muted'}>
          Status: {connectionStatus.status}
        </Badge>
        <Badge variant={connectionStatus.model !== '–' ? 'status-muted' : 'status-error'}>
          Modell: {connectionStatus.model}
        </Badge>
        <Badge variant={connectionStatus.haveKey ? 'status-success' : 'status-error'}>
          API-Key: {connectionStatus.haveKey ? 'aktiv' : 'fehlt'}
        </Badge>
      </div>

      <span className={`text-xs min-h-[18px] ${
        pingState === 'busy' ? 'text-primary font-medium' :
        pingState === 'success' ? 'text-success font-medium' :
        pingState === 'error' ? 'text-destructive font-medium' :
        'text-muted-foreground'
      }`}>
        {pingStatus}
      </span>

      <details className="group rounded-xl border border-border bg-secondary px-4 py-3">
        <summary className="cursor-pointer list-none text-xs font-semibold text-muted-strong tracking-wide">
          Verbindungseinstellungen
        </summary>

        <div className="mt-3 flex flex-col gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-strong tracking-wider uppercase">
              Service-URL
            </span>
            <Input
              type="url"
              value={backendUrl}
              onChange={(e) => onBackendUrlChange(e.target.value)}
              placeholder="https://transcribe.simpliant-ds.eu"
              className="rounded-xl px-3.5 py-2.5 text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-strong tracking-wider uppercase">
              API-Key
            </span>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder="API-Key einfügen"
              className="rounded-xl px-3.5 py-2.5 text-sm"
            />
          </label>

          <div className="flex flex-col gap-2">
            <Button
              onClick={onSaveSettings}
              disabled={settingsSaving || !settingsDirty || !authToken}
            >
              {settingsSaving ? 'Speichere …' : 'Speichern'}
            </Button>
            {settingsError && (
              <span className="text-xs text-destructive">{settingsError}</span>
            )}
            {!authToken && (
              <span className="text-xs text-muted-foreground">
                Melde dich an, um die Verbindung zu speichern und zu testen.
              </span>
            )}
            {settingsDirty && !settingsSaving && (
              <span className="text-xs text-muted-foreground">
                Änderungen wurden noch nicht gespeichert.
              </span>
            )}
          </div>
        </div>
      </details>
    </section>
  );
}
