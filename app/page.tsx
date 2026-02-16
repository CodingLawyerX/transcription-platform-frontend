'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { dictationCssVars } from '@/lib/design-tokens';

const testimonials = [
  {
    text: 'Die Transkripte sind schneller fertig als unsere Redaktionszyklen.',
    author: 'Leitung Forschung',
    role: 'Medizinische Einrichtung',
  },
  {
    text: 'Einmal aufnehmen, sofort weiterbearbeiten – genau so muss es sein.',
    author: 'Redaktion',
    role: 'Medienhaus',
  },
  {
    text: 'Unsere Teams liefern jetzt strukturierte Protokolle in Minuten statt Stunden.',
    author: 'Operations',
    role: 'Unternehmensgruppe',
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const isLoggedIn = !!session;
  const isLoading = status === 'loading';
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const cta = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-12 w-40 rounded-full bg-white/60 animate-pulse" />
          <div className="h-12 w-32 rounded-full bg-white/60 animate-pulse" />
        </div>
      );
    }
    if (isLoggedIn) {
      return (
        <div className="flex flex-wrap items-center gap-4">
          <Button asChild size="lg" className="rounded-full px-8">
            <Link href="/transcribe">Zum Workspace</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-full px-8">
            <Link href="/profile">Profil öffnen</Link>
          </Button>
        </div>
      );
    }
    return (
      <div className="flex flex-wrap items-center gap-4">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/register">Kostenlos starten</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="rounded-full px-8">
          <Link href="/login">Anmelden</Link>
        </Button>
      </div>
    );
  }, [isLoading, isLoggedIn]);

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={dictationCssVars}
    >
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-radial" />
        <div className="absolute inset-x-0 top-0 h-48 bg-hero-top" />
        <div className="absolute inset-x-0 top-0 h-56 bg-hero-waves opacity-90 blur-xl animate-wave" />
        <div className="absolute inset-x-0 top-10 h-48 bg-hero-waves opacity-60 blur-2xl animate-wave-slow" />
        <div className="absolute right-[-8%] top-6 h-72 w-72 rounded-full bg-primary/15 blur-3xl animate-float" />
        <div className="absolute left-[-12%] bottom-6 h-80 w-80 rounded-full bg-primary/12 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-28 grain">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8 animate-fade-up">
              <Badge className="bg-card/90 text-foreground shadow-sm" variant="outline">
                Simpliant Transcribe · Word Add-in Ready
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Sprache wird zu fertigem Text. <span className="font-semibold text-primary">Sofort.</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-foreground">
                Simpliant Transcribe liefert strukturierte Transkripte für Meetings, Gutachten und
                Diktate – direkt im Workspace oder als Word Add-in. Schnell, präzise und DSGVO-konform.
              </p>
              {cta}
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  DSGVO-konforme Datenhaltung
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  Word, Web & API in einem Flow
                </div>
              </div>
            </div>

            <Card className="border-border bg-card/90 shadow-soft animate-scale-in">
              <CardContent className="space-y-6 p-8">
                <div>
                  <p className="text-sm uppercase tracking-widest text-muted-foreground">
                    Verfügbarkeit
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-foreground">99.9%</p>
                  <p className="text-sm text-muted-foreground">
                    Zuverlässiger Betrieb in der DACH-Region
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Startklar
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">2:30</p>
                    <p className="text-xs text-muted-foreground">Stunden bis zur Nutzung</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Genauigkeit
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-foreground">97%</p>
                    <p className="text-xs text-muted-foreground">Fachspezifische Modelle</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Badge className="bg-card/90 text-foreground shadow-sm" variant="outline">
              Workflow für Transkription
            </Badge>
            <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
              Ein Workspace für Audio, Text und Freigaben.
            </h2>
            <p className="text-base text-muted-foreground">
              Vom Upload bis zum fertigen Dokument: Aufnahme, Transkription, Review und Export laufen
              in einem konsistenten Flow – im Web oder direkt in Word.
            </p>
            <div className="space-y-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                Live-Status, Wortzählung und Einfügen an der Cursor-Position.
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                Fachsprachliche Modelle und Sprachwahl pro Auftrag.
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                API-first Integration in DMS, CRM und Archivsysteme.
              </div>
            </div>
            <Button asChild className="rounded-full px-8">
              <Link href="/transcribe">Workspace öffnen</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {['Upload', 'Verarbeitung', 'Review', 'Export'].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-border bg-card p-5 shadow-card-lg transition-transform hover:-translate-y-1"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Schritt {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-foreground">{step}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step === 'Upload'
                    ? 'Audio-Dateien zentral sammeln, automatisch kategorisieren.'
                    : step === 'Verarbeitung'
                      ? 'KI-Modelle mit Fachlexika und Sprecherprofilen kombinieren.'
                      : step === 'Review'
                        ? 'Ergebnisse prüfen, kommentieren und freigeben.'
                        : 'Exporte in strukturierte Formate oder direkte API-Übergabe.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 animate-fade-in">
        <div className="mb-10 space-y-3">
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Warum Simpliant Transcribe
          </h2>
          <p className="max-w-2xl text-base text-muted-foreground">
            Konsistente Qualität, klare Prozesse und schnelle Ergebnisse – für Teams, die Text sofort
            weiterverarbeiten müssen.
          </p>
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: 'Sichere Transkripte',
              text: 'Verschlüsselung, Zugriffsschutz und protokollierte Änderungen für jedes Dokument.',
            },
            {
              title: 'Word Add-in Ready',
              text: 'Direkt in Word diktieren, einfügen oder ersetzen – ohne Medienbrüche.',
            },
            {
              title: 'Skalierbar',
              text: 'Vom Einzelplatz bis Enterprise: automatische Skalierung und Teamverwaltung.',
            },
          ].map((item) => (
            <Card key={item.title} className="border-border bg-card/95 shadow-card transition-transform hover:-translate-y-1">
              <CardContent className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-8 rounded-3xl border border-border bg-card p-8 shadow-card-xl lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-foreground">Stimmen aus der Praxis</h2>
            <p className="text-base text-muted-foreground">
              Teams aus Forschung, Medien und Beratung nutzen Simpliant Transcribe für verlässliche
              Dokumentationen.
            </p>
            <div className="space-y-4">
              {testimonials.map((item, index) => (
                <button
                  key={item.author}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    index === activeTestimonial
                      ? 'border-primary/40 bg-primary/10'
                      : 'border-border bg-card'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Testimonial ${index + 1}`}
                >
                  <p className="text-sm text-foreground">“{item.text}”</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {item.author} · {item.role}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="rounded-2xl bg-primary/12 p-6">
              <p className="text-sm uppercase tracking-widest text-primary">Aktiv</p>
              <p className="mt-4 text-4xl font-semibold text-foreground">1.2M+</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Audiodateien wurden im letzten Quartal verarbeitet.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-6">
              <p className="text-sm text-muted-foreground">SLA</p>
              <p className="mt-2 text-2xl font-semibold text-foreground">99.95%</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Kontinuierliche Verfügbarkeit, inklusive Notfallplan.
              </p>
              <Button asChild className="mt-6 w-full rounded-full">
                <Link href="/register">Zugang anfragen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
