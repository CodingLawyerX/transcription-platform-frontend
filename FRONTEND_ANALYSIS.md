# Frontend-Analyse und Alignment mit Backend

## Überblick

Das Frontend ist eine Next.js 14-Anwendung mit TypeScript, Tailwind CSS und NextAuth.js für Authentifizierung. Die Benutzeroberfläche ist eine Marketing- und Transkriptionsplattform mit Landing Page, Authentifizierung und Transkriptionsfunktionen.

## Aktuelle Frontend-Struktur

### Technologie-Stack
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS** mit benutzerdefinierten Komponenten (shadcn/ui)
- **NextAuth.js** für Authentifizierung (Token-basiert)
- **Axios** für HTTP-Requests
- **Radix UI** Komponenten

### Verzeichnisstruktur
```
frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Next.js)
│   ├── login/             # Login-Seite
│   ├── register/          # Registrierungsseite
│   ├── profile/           # Profilseite
│   ├── transcribe/        # Transkriptionsseite
│   ├── verify-email/      # Email-Verifizierung
│   ├── forgot-password/   # Passwort vergessen
│   ├── reset-password/    # Passwort zurücksetzen
│   ├── layout.tsx         # Root-Layout
│   ├── page.tsx           # Landing Page
│   └── SessionProvider.tsx
├── components/            # UI-Komponenten (shadcn/ui)
├── lib/                   # Hilfsfunktionen
│   ├── auth.ts            # Authentifizierungs-API
│   ├── api/transcribe.ts  # Transkriptions-API
│   └── utils.ts
├── types/                 # TypeScript-Definitionen
├── public/                # Statische Assets
└── ...
```

### API-Integration
- **Base URL**: Konfiguriert über `NEXT_PUBLIC_API_URL` (aktuell `http://localhost:8115/rest/api/v1`)
- **Authentifizierung**: Token-basiert (Django REST Auth)
- **API-Client**: Axios-Instanz in `lib/auth.ts`
- **Transkriptions-API**: Separate Funktionen in `lib/api/transcribe.ts`

## Backend-API-Übersicht (aus Backend-README)

### Wichtige Endpunkte
- **Authentifizierung**: `/rest/api/v1/auth/` (Login, Registrierung, etc.)
- **Benutzer**: `/rest/api/v1/users/`
- **Transkriptionen**: `/rest/api/v1/transcriptions/`
- **Health-Checks**: `/rest/api/v1/transcriptions/health/`
- **Statistiken**: `/rest/api/v1/transcriptions/stats/`
- **Timeline**: `/rest/api/v1/transcriptions/timeline/`
- **Infrastruktur-Health**: `/rest/api/v1/transcribe/health/`

### Backend-Ports
- Django Backend: **8120** (laut README)
- PostgreSQL: 5439
- Redis: 6383
- MinIO: 9000/9001

## Identifizierte Mismatches und Probleme

### 1. Port-Konflikte
- Frontend erwartet Backend auf **Port 8115** (`.env.local`), Backend läuft auf **8120**.
- **Folge**: API-Aufrufe scheitern, da Verbindung nicht hergestellt werden kann.

### 2. API-Pfad-Diskrepanzen
- Frontend-Transkriptions-API verwendet `/rest/api/v1/transcribe/transcriptions/`, Backend bietet `/rest/api/v1/transcriptions/`.
- Frontend-Health-Check verwendet `/health`, Backend hat `/rest/api/v1/transcriptions/health/` und `/rest/api/v1/transcribe/health/`.
- **Folge**: 404-Fehler oder falsche Daten.

### 3. Authentifizierungs-Flow
- Frontend verwendet NextAuth.js mit Token-Authentifizierung, aber die Integration mit Django REST Auth muss validiert werden.
- Backend erwartet `Token <token>` im Authorization-Header, Frontend sendet möglicherweise nicht korrekt.

### 4. Datenmodell-Unterschiede
- **Transcription**-Model im Backend hat viele Felder (`title`, `file_size`, `duration_seconds`, `error_message`, `model_name`, `completed_at`), Frontend-Typen sind minimal.
- **Folge**: Frontend zeigt nicht alle Informationen an; Upload/Status-Updates könnten fehlschlagen.

### 5. Fehlende Features
- Backend bietet **TranscriptionSettings** für benutzerspezifische Einstellungen, Frontend hat rudimentäre Settings-UI.
- Backend bietet **Statistiken** und **Timeline**, Frontend zeigt diese nicht an.
- Backend hat **MinIO Integration** für Audio-Uploads, Frontend muss Multipart-Upload korrekt implementieren.

### 6. CORS-Konfiguration
- Backend CORS ist für `http://localhost:3000` und `http://localhost:3004` konfiguriert, Frontend läuft auf **3005** (laut `.env.local`).
- **Folge**: CORS-Fehler bei API-Aufrufen.

## Wie das Frontend für eine echte Plattform aussehen sollte

Eine professionelle Transkriptionsplattform benötigt eine durchdachte Benutzeroberfläche mit folgenden Kernfunktionen:

### 1. **Dashboard mit Übersicht**
   - Willkommensnachricht mit kurzer Statistik (Anzahl Transkriptionen, verbleibende Stunden, Genauigkeit)
   - Kürzliche Transkriptionen als Liste mit Status
   - Schnellzugriff auf häufige Aktionen (Neue Transkription, Einstellungen, Hilfe)
   - Visualisierungen (Timeline der letzten 30 Tage, Nutzungsdiagramme)

### 2. **Transkriptions-Workflow**
   - **Upload-Seite**: Drag & Drop, Dateiauswahl, Aufnahmefunktion im Browser
   - **Verarbeitungsstatus**: Echtzeit-Fortschritt (Upload → Verarbeitung → Fertig) mit detaillierten Statusmeldungen
   - **Ergebnis-Ansicht**: Transkriptionstext mit Zeitstempeln, Sprechererkennung, Bearbeitungswerkzeuge
   - **Export-Optionen**: PDF, DOCX, TXT, SRT, JSON mit Vorschau

### 3. **Transkriptions-Verwaltung**
   - Liste aller Transkriptionen mit Filter (Status, Datum, Sprache)
   - Suchfunktion nach Titel oder Inhalt
   - Batch-Operationen (Löschen, Exportieren, Status ändern)
   - Detailansicht mit allen Metadaten (Dateigröße, Dauer, Modell, Fehlermeldungen)

### 4. **Benutzerprofil und Einstellungen**
   - Profilinformationen (Name, Email, Avatar)
   - Abonnement- und Nutzungsdaten
   - Transkriptionseinstellungen (Standardsprache, Modell, Benachrichtigungen)
   - API-Schlüssel-Verwaltung (für Entwickler)

### 5. **Team-Kollaboration** (falls im Backend unterstützt)
   - Einladungen von Teammitgliedern
   - Gemeinsame Transkriptionen, Kommentare, Freigaben
   - Rollen und Berechtigungen

### 6. **Hilfe und Dokumentation**
   - Integrierte Hilfe (Tooltips, FAQ)
   - API-Dokumentation für Entwickler
   - Kontaktformular / Support

## Implementierungsplan für Frontend-Änderungen

### Phase 1: Grundlegende Alignment-Fixes (1-2 Tage)
1. **Umgebungsvariablen korrigieren**
   - `.env.local` anpassen: `NEXT_PUBLIC_API_URL=http://localhost:8120/rest/api/v1`
   - CORS im Backend erweitern um `http://localhost:3005`
2. **API-Client anpassen**
   - `lib/api/transcribe.ts` auf korrekte Endpunkte umstellen
   - `lib/auth.ts` Token-Handling validieren
3. **Datenmodelle erweitern**
   - `types/transcribe.ts` um Backend-Felder ergänzen
   - Typen für TranscriptionSettings, User, Statistics hinzufügen

### Phase 2: Kernfunktionen implementieren (3-5 Tage)
4. **Dashboard-Seite erstellen**
   - Neue Route `/dashboard` (geschützt)
   - Integration der Backend-Endpunkte `/stats` und `/timeline`
   - Visuelle Komponenten (Chart.js, D3)
5. **Transkriptions-Liste überarbeiten**
   - Komponente `TranscriptionList` mit Pagination, Filter, Sortierung
   - Detailansicht als Modal oder separate Seite
6. **Upload- und Status-Flow verbessern**
   - Multipart-Upload mit Progress-Bar
   - Polling für Status-Updates (WebSockets optional)
   - Fehlerbehandlung und Retry-Logik

### Phase 3: Erweiterte Features (5-7 Tage)
7. **Einstellungsseite**
   - UI für TranscriptionSettings (Backend-URL, API-Key, Defaults)
   - Validierung und Speicherung
8. **Team-Features** (falls Backend bereit)
   - Einladungsmanagement
   - Kollaborative Bearbeitung
9. **Export und Integration**
   - Export-Komponente mit Formatauswahl
   - Integration mit Cloud-Speichern (Google Drive, Dropbox)

### Phase 4: Polishing und Performance (2-3 Tage)
10. **Responsive Design** für Mobile optimieren
11. **Ladezeiten** optimieren (Code-Splitting, Caching)
12. **Testing** (Unit, Integration, E2E)
13. **Monitoring** (Error Tracking, Analytics)

## Konkrete Umsetzung eines kritischen Teils: Transkriptions-Liste

### Schritt 1: API-Client anpassen
```typescript
// lib/api/transcriptions.ts
import { Transcription } from '@/types/transcribe';

export async function getTranscriptions(token: string): Promise<Transcription[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transcriptions/`, {
    headers: {
      Authorization: `Token ${token}`,
    },
  });
  if (!response.ok) throw new Error('Failed to fetch transcriptions');
  return response.json();
}
```

### Schritt 2: Typen erweitern
```typescript
// types/transcribe.ts
export interface Transcription {
  id: number;
  user: number;
  title: string;
  audio_file: string;
  file_size: number;
  duration_seconds: number;
  transcribed_text: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  language: string;
  model_name: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface TranscriptionStats {
  total: number;
  completed: number;
  total_duration: number;
  total_size: number;
}
```

### Schritt 3: Komponente erstellen
```tsx
// components/transcriptions/TranscriptionList.tsx
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { getTranscriptions } from '@/lib/api/transcriptions';
import { Transcription } from '@/types/transcribe';

export default function TranscriptionList() {
  const { data: session } = useSession();
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.accessToken) {
      getTranscriptions(session.accessToken)
        .then(setTranscriptions)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      {transcriptions.map((t) => (
        <div key={t.id} className="border p-4 rounded-lg">
          <h3 className="font-bold">{t.title}</h3>
          <p>Status: {t.status}</p>
          <p>Duration: {t.duration_seconds}s</p>
          <p>Created: {new Date(t.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

## Empfehlungen für eine echte Plattform

### Technische Empfehlungen
- **State Management**: Zustand für komplexe UI (Zustand, Redux) einführen, wenn nötig.
- **Real-Time Updates**: WebSockets oder Server-Sent Events für Echtzeit-Status.
- **Offline-Fähigkeit**: Service Worker für grundlegende Offline-Funktionen.
- **Internationalisierung**: i18n für mehrsprachige Unterstützung.
- **Barrierefreiheit**: WCAG 2.1 AA Compliance.

### Architektur-Empfehlungen
- **Micro-Frontends**: Bei Wachstum können verschiedene Bereiche (Dashboard, Editor, Einstellungen) als separate Micro-Frontends aufgeteilt werden.
- **API-Gateway**: Einheitlicher Zugangspunkt für alle Backend-Dienste.
- **CDN**: Statische Assets über CDN ausliefern für bessere Performance.

### Betriebliche Empfehlungen
- **CI/CD**: Automatisierte Tests und Deployment-Pipelines.
- **Monitoring**: Application Performance Monitoring (APM) und Error Tracking.
- **Security**: Regelmäßige Security Audits, Penetrationstests.

## Fazit

Das Frontend hat eine solide Basis, benötigt jedoch Anpassungen an die Backend-API und Erweiterungen für eine professionelle Plattform. Durch schrittweise Umsetzung des Implementierungsplans kann eine vollständige, benutzerfreundliche Transkriptionsplattform entstehen, die alle Backend-Features nutzt und eine hervorragende User Experience bietet.

Die Priorität liegt zunächst auf der Behebung der technischen Mismatches (Ports, API-Pfade, CORS), danach auf der Implementierung der Kernfunktionen (Dashboard, Transkriptionsliste, Upload-Flow). Mit diesem Ansatz wird das Frontend zu einer echten Produktionsplattform, die skalierbar, wartbar und benutzerfreundlich ist.