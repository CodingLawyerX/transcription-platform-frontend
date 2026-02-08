'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getTranscriptions } from '@/lib/api/transcribe';
import { getApiBaseUrl } from '@/lib/api/baseUrl';
import { TranscriptionResponse } from '@/types/transcribe';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, FileAudio, Calendar, Clock, Download } from 'lucide-react';

export default function TranscriptionList() {
  const { data: session, status } = useSession();
  const [transcriptions, setTranscriptions] = useState<TranscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.accessToken) {
      setLoading(false);
      setError('Bitte melde dich an, um deine Einträge zu sehen.');
      return;
    }

    const fetchTranscriptions = async () => {
      try {
        setLoading(true);
        // Verwende den Token aus der Session
        const token = session.accessToken as string;
        const apiBaseUrl = getApiBaseUrl();
        const data = await getTranscriptions(apiBaseUrl, { authToken: token });
        setTranscriptions(data);
        setError(null);
      } catch (err: any) {
        console.error('Fehler beim Laden der Einträge:', err);
        setError(err.message || 'Ein unbekannter Fehler ist aufgetreten.');
      } finally {
        setLoading(false);
      }
    };

    fetchTranscriptions();
  }, [session, status]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Lade Einträge...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (transcriptions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <FileAudio className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">Keine Einträge gefunden</h3>
          <p className="text-muted-foreground mt-2">
            Du hast noch keine Einträge erstellt. Starte einen neuen Vorgang.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Deine Einträge</h2>
        <span className="text-sm text-muted-foreground">
          {transcriptions.length} {transcriptions.length === 1 ? 'Eintrag' : 'Einträge'}
        </span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {transcriptions.map((transcription) => (
          <Card key={transcription.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg truncate">{transcription.title || 'Ohne Titel'}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(transcription.created_at)}
                  </CardDescription>
                </div>
                <Badge className={`${getStatusColor(transcription.status)} font-medium`}>
                  {transcription.status === 'completed' ? 'Fertig' :
                   transcription.status === 'processing' ? 'Verarbeitung' :
                   transcription.status === 'pending' ? 'Ausstehend' : 'Fehlgeschlagen'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Sprache</span>
                  <span className="font-medium">{transcription.language.toUpperCase()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dateigröße</span>
                  <span className="font-medium">{formatBytes(transcription.file_size)}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dauer</span>
                  <span className="font-medium flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {transcription.duration_seconds} s
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Modell</span>
                  <span className="font-medium">{transcription.model_name}</span>
                </div>
                {transcription.error_message && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    <strong>Fehler:</strong> {transcription.error_message}
                  </div>
                )}
                <div className="pt-3 border-t flex justify-between">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/transcribe/${transcription.id}`}>Details</a>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Export
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
