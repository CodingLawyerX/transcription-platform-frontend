# Simpliant App Frontend

Next.js-basiertes Frontend für die Simpliant App. Bietet eine moderne Benutzeroberfläche für sichere Workspaces, strukturierte Prozesse und Benutzerauthentifizierung.

## Überblick

Dieses Frontend ist Teil der Simpliant App, die aus einem Django-Backend und diesem Next.js-Frontend besteht.

### Wichtige Pfade & Deploy-Kontext (Server)

- Frontend-Repo: `/srv/transcription-platform-frontend`
- Backend-Repo: `/srv/transcription-platform-backend.git`
- Frontend Docker Compose (Prod): `/srv/transcription-platform-frontend/docker-compose.prod.yml`
- Domains: Frontend `https://app.simpliant-ds.eu`, Backend `https://backend.simpliant-ds.eu`
- API-Base (Prod): `https://backend.simpliant-ds.eu/rest/api/v1`

### Kernfunktionen

- **Landing Page** mit Marketing-Inhalten
- **Benutzerauthentifizierung** (Registrierung, Login, Passwort-Reset) via Django REST Auth
- **Workspace** mit Upload, Aufnahme und Echtzeit-Status
- **Einträge** mit Filter, Sortierung und Detailansicht
- **Dashboard** mit Statistiken und Timeline (geplant)
- **Benutzerprofil** und Einstellungen
- **Responsive Design** für Desktop und Mobile

## Technologie-Stack

- **Next.js 14** (App Router)
- **React 18** mit TypeScript
- **Tailwind CSS** für Styling
- **shadcn/ui** für UI-Komponenten
- **NextAuth.js** für Client-seitige Authentifizierung
- **Axios** für HTTP-Requests
- **Radix UI** für zugängliche Komponenten
- **Lucide React** für Icons

## Projektstruktur

```
transcription-platform-frontend/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Next.js)
│   ├── login/             # Login-Seite
│   ├── register/          # Registrierungsseite
│   ├── profile/           # Profilseite
│   ├── transcribe/        # Workspace
│   ├── verify-email/      # Email-Verifizierung
│   ├── forgot-password/   # Passwort vergessen
│   ├── reset-password/    # Passwort zurücksetzen
│   ├── layout.tsx         # Root-Layout
│   ├── page.tsx           # Landing Page
│   └── SessionProvider.tsx
├── components/            # UI-Komponenten
│   ├── auth/              # Authentifizierungs-Formulare
│   ├── transcribe/        # Workspace-Komponenten
│   └── ui/                # shadcn/ui Komponenten
├── lib/                   # Hilfsfunktionen
│   ├── auth.ts            # Authentifizierungs-API (Axios)
│   ├── api/transcribe.ts  # Workspace-API (Fetch)
│   └── utils.ts
├── types/                 # TypeScript-Definitionen
├── public/                # Statische Assets
└── ...
```

## API-Integration

Das Frontend kommuniziert mit dem Django-Backend über REST-API unter `/rest/api/v1/`.

### Wichtige Endpunkte

- **Authentifizierung**: `/rest/api/v1/auth/` (Login, Registrierung, etc.)
- **Profil**: `/rest/api/v1/auth/profile/`
- **Transkription**: `/rest/api/v1/transcribe/transcriptions/` (Upload, Liste, Status)
- **Transkription Health**: `/rest/api/v1/transcribe/transcriptions/health/`
- **Infrastruktur Health**: `/rest/api/v1/transcribe/health/`
- **Settings**: `/rest/api/v1/transcribe/settings/1/`

### Authentifizierung

Das Backend verwendet Token-basierte Authentifizierung (Django REST Auth). Das Frontend sendet den Token im `Authorization`-Header:

```
Authorization: Token <token>
```

NextAuth.js verwaltet die Session und stellt den Token über `useSession()` bereit.

## Entwicklungsumgebung einrichten

### Voraussetzungen

- Node.js 18+ und npm/yarn/pnpm
- Laufendes Backend

### Installation

1. Repository öffnen und ins Frontend-Verzeichnis wechseln:

   ```bash
   cd /srv/transcription-platform-frontend
   ```

2. Abhängigkeiten installieren:

   ```bash
   npm install
   # oder
   yarn install
   # oder
   pnpm install
   ```

3. Umgebungsvariablen konfigurieren:

   Kopiere `.env.example` zu `.env.local` und passe die Werte an:

   ```bash
   cp .env.example .env.local
   ```

   Standardwerte für lokale Entwicklung:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8112/rest/api/v1
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-nextauth-secret-key-change-in-production
   NEXTAUTH_BACKEND_URL=http://localhost:8112/rest/api/v1
   NEXT_PUBLIC_ENABLE_DEBUG=true
   ```

4. Entwicklungsserver starten:

   ```bash
   npm run dev
   # oder
   yarn dev
   # oder
   pnpm dev
   ```

5. Frontend öffnen unter [http://localhost:3000](http://localhost:3000)

### Mit Docker

Ein `Dockerfile` ist vorhanden. Zum Bauen und Ausführen:

```bash
docker build -t transcription-frontend .
docker run -p 3005:3005 transcription-frontend
```

## Hinweise für Agents

- Transcription Settings werden **im Profil** gepflegt (Tab „Transkription“).
- Upload/Record nutzen die gleichen Endpunkte unter `/rest/api/v1/transcribe/…`.
- API-Key wird serverseitig gespeichert; Frontend prüft Health, bevor Upload freigegeben wird.

## Implementierungsplan

### Phase 1: Grundlegende Alignment-Fixes (abgeschlossen)
- Umgebungsvariablen korrigiert
- API-Client angepasst
- Datenmodelle erweitert

### Phase 2: Kernfunktionen implementieren (in Arbeit)
- Dashboard-Seite mit Statistiken und Timeline
- Eintrags-Liste mit Pagination und Filter
- Verbesserter Upload- und Status-Flow

### Phase 3: Erweiterte Features (geplant)
- Einstellungsseite für Service-Settings
- Team-Kollaboration (falls Backend unterstützt)
- Export-Integration (PDF, DOCX, SRT)

### Phase 4: Polishing und Performance
- Responsive Design optimieren
- Ladezeiten optimieren (Code-Splitting, Caching)
- Testing (Unit, Integration, E2E)
- Monitoring (Error Tracking, Analytics)

## Beispielkomponente: Eintrags-Liste

Eine neue Komponente `TranscriptionList` wurde implementiert, die alle Einträge des aktuellen Benutzers anzeigt. Sie demonstriert:

- Token-basierte API-Aufrufe
- Typisierung mit erweiterten Transcription-Interfaces
- Responsive Grid-Layout
- Status-Badges und Formatierung

Siehe `components/transcribe/TranscriptionList.tsx`.

## Empfehlungen für eine echte Plattform

### Technische Empfehlungen
- **State Management**: Zustand für komplexe UI (Zustand, Redux) einführen, wenn nötig
- **Real-Time Updates**: WebSockets oder Server-Sent Events für Echtzeit-Status
- **Offline-Fähigkeit**: Service Worker für grundlegende Offline-Funktionen
- **Internationalisierung**: i18n für mehrsprachige Unterstützung
- **Barrierefreiheit**: WCAG 2.1 AA Compliance

### Architektur-Empfehlungen
- **Micro-Frontends**: Bei Wachstum verschiedene Bereiche als separate Micro-Frontends aufteilen
- **API-Gateway**: Einheitlicher Zugangspunkt für alle Backend-Dienste
- **CDN**: Statische Assets über CDN ausliefern für bessere Performance

### Betriebliche Empfehlungen
- **CI/CD**: Automatisierte Tests und Deployment-Pipelines
- **Monitoring**: Application Performance Monitoring (APM) und Error Tracking
- **Security**: Regelmäßige Security Audits, Penetrationstests

## Skripte

- `npm run dev` – Entwicklungsserver starten
- `npm run build` – Produktions-Build erstellen
- `npm run start` – Produktionsserver starten
- `npm run lint` – ESLint ausführen
- `npm run type-check` – TypeScript-Typen prüfen

## Docker Compose Integration

### Production (Traefik / app.simpliant-ds.eu)

Für das bestehende Traefik-Setup (siehe `/srv/voxtral-backend`) gibt es nun eine eigene
`docker-compose.prod.yml` mit Labels und SSL-Resolver (`myresolver`):

```bash
cd /srv/transcription-platform-frontend
docker compose -f docker-compose.prod.yml up -d --build
```

Stelle sicher, dass folgende Variablen gesetzt sind:

- `NEXT_PUBLIC_API_URL` (z. B. `https://backend.simpliant-ds.eu/rest/api/v1`)
- `NEXTAUTH_URL` (`https://app.simpliant-ds.eu`)
- `NEXTAUTH_SECRET` (neu generiert)
- `NEXTAUTH_BACKEND_URL` (`https://backend.simpliant-ds.eu/rest/api/v1`)
- `NEXTAUTH_INTERNAL_BACKEND_URL` (`http://transcription-platform-backendgit-django-1:8112/rest/api/v1`)

Außerdem müssen die Traefik-Netzwerke `voxtral-backend_voxtral-network` und
`transcription-platform-backendgit_default` existieren.

## Lizenz

Proprietär – Nur für interne Nutzung.

## Weitere Dokumentation

- Backend README: `/srv/transcription-platform-backend.git/README.md`
- `FRONTEND_ANALYSIS.md` – Technische Analyse und Alignment-Plan
- API-Dokumentation (lokal): `http://localhost:8120/api/docs/`
- API-Dokumentation (prod): `https://backend.simpliant-ds.eu/api/docs/`
