'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const testimonials = [
  {
    text: 'Die Workflows sind klar, schnell und nachvollziehbar. Wir sparen jede Woche echte Zeit.',
    author: 'Dr. Sarah Müller',
    role: 'Leiterin Forschung, TechMed GmbH',
  },
  {
    text: 'Endlich eine Plattform, die unsere Freigaben strukturiert und transparent macht.',
    author: 'Michael Weber',
    role: 'Podcast-Host & Journalist',
  },
  {
    text: 'Vom Start bis zur Freigabe: alles sitzt. Das ist ein Game-Changer.',
    author: 'Lisa Hoffmann',
    role: 'Geschäftsführerin, Content Studio',
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
    <div className="min-h-screen bg-bg text-text">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(43,165,153,0.18),transparent_50%),radial-gradient(circle_at_80%_30%,rgba(242,190,111,0.18),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(34,88,102,0.16),transparent_40%)]" />
        <div className="absolute right-[-6%] top-10 h-72 w-72 rounded-full bg-[rgba(69,178,167,0.22)] blur-3xl animate-float" />
        <div className="absolute left-[-10%] bottom-10 h-80 w-80 rounded-full bg-[rgba(242,190,111,0.18)] blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-28 grain">
          <div className="grid items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-8">
              <Badge className="bg-white/80 text-text shadow-sm" variant="outline">
                Neu: Team-Kollaboration & Audit-Logs
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-text sm:text-5xl lg:text-6xl">
                Arbeit wird zu Ergebnissen. <span className="font-serif italic text-primary">Präzise.</span>
              </h1>
              <p className="max-w-xl text-lg text-muted-strong">
                Simpliant App verbindet sichere Arbeitsbereiche mit klaren Prozessen. Verfolgen Sie
                Fortschritte live, bündeln Sie Entscheidungen und liefern Sie Ergebnisse, die sofort
                verwendbar sind.
              </p>
              {cta}
              <div className="flex flex-wrap gap-6 text-sm text-muted-strong">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  DSGVO-konformes Hosting
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  Rollen, Freigaben, Audit-Logs
                </div>
              </div>
            </div>

            <Card className="border-[rgba(28,45,58,0.08)] bg-white/90 shadow-soft animate-scale-in">
              <CardContent className="space-y-8 p-8">
                <div>
                  <p className="text-sm uppercase tracking-widest text-muted-foreground">
                    Live-Status
                  </p>
                  <p className="mt-2 text-4xl font-semibold text-text">99.9%</p>
                  <p className="text-sm text-muted-strong">
                    Verfügbarkeit in der DACH-Region
                  </p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[rgba(28,45,58,0.08)] p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Onboarding
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-text">2:30</p>
                    <p className="text-xs text-muted-strong">Stunden bis zum Start</p>
                  </div>
                  <div className="rounded-2xl border border-[rgba(28,45,58,0.08)] p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Zufriedenheit
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-text">97%</p>
                    <p className="text-xs text-muted-strong">Teams & Stakeholder</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-[rgba(26,111,106,0.08)] p-4">
                  <p className="text-sm font-medium text-primary">
                    „Wir sparen wöchentlich zwei Arbeitstage pro Team.“
                  </p>
                  <p className="mt-2 text-xs text-muted-strong">— KPMG Innovation Lab</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            {
              title: 'Sichere Abläufe',
              text: 'Daten bleiben verschlüsselt, Zugriffe und Rechte werden revisionssicher protokolliert.',
            },
            {
              title: 'Präzise Workflows',
              text: 'Strukturieren Sie Aufgaben, Freigaben und Reviews direkt in Ihrer Organisation.',
            },
            {
              title: 'Skalierbar on Demand',
              text: 'Von Pilotprojekt bis Konzern: die Infrastruktur skaliert automatisch mit Ihren Teams.',
            },
          ].map((item) => (
            <Card key={item.title} className="border-[rgba(28,45,58,0.08)] bg-white">
              <CardContent className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-text">{item.title}</h3>
                <p className="text-sm text-muted-strong">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <Badge className="bg-white/80 text-text shadow-sm" variant="outline">
              Workflow
            </Badge>
            <h2 className="text-3xl font-semibold text-text sm:text-4xl">
              Ein Workspace, der sich an Ihr Team anpasst.
            </h2>
            <p className="text-base text-muted-strong">
              Von der Anforderung bis zur Freigabe ist jeder Schritt klar definiert. Bleiben Sie nah
              an den Aufgaben, sorgen Sie für nachvollziehbare Entscheidungen und liefern Sie
              Ergebnisse, die auditfähig sind.
            </p>
            <div className="space-y-4 text-sm text-muted-strong">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                Live-Status, Review-Queues und Freigabe-Logs in einem Dashboard.
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                Individuelle Rollen pro Team, Projekt oder Bereich.
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                API-first Integration in bestehende DMS- und CRM-Systeme.
              </div>
            </div>
            <Button asChild className="rounded-full px-8">
              <Link href="/transcribe">Studio öffnen</Link>
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {['Upload', 'Verarbeitung', 'Review', 'Export'].map((step, index) => (
              <div
                key={step}
                className="rounded-2xl border border-[rgba(28,45,58,0.08)] bg-white p-5 shadow-[0_16px_32px_rgba(29,36,43,0.08)]"
              >
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Schritt {index + 1}
                </p>
                <h3 className="mt-2 text-lg font-semibold text-text">{step}</h3>
                <p className="mt-2 text-sm text-muted-strong">
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

      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <div className="grid gap-8 rounded-3xl border border-[rgba(28,45,58,0.08)] bg-white p-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold text-text">Stimmen aus der Praxis</h2>
            <p className="text-base text-muted-strong">
              Teams aus Forschung, Medien und Beratung nutzen Simpliant Transcribe für verlässliche
              Dokumentationen.
            </p>
            <div className="space-y-4">
              {testimonials.map((item, index) => (
                <button
                  key={item.author}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    index === activeTestimonial
                      ? 'border-primary/40 bg-[rgba(26,111,106,0.08)]'
                      : 'border-[rgba(28,45,58,0.08)] bg-white'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Testimonial ${index + 1}`}
                >
                  <p className="text-sm text-text">“{item.text}”</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {item.author} · {item.role}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="rounded-2xl bg-[rgba(26,111,106,0.12)] p-6">
              <p className="text-sm uppercase tracking-widest text-primary/80">Aktiv</p>
              <p className="mt-4 text-4xl font-semibold text-text">1.2M+</p>
              <p className="mt-2 text-sm text-muted-strong">
                Audiodateien wurden im letzten Quartal verarbeitet.
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(28,45,58,0.08)] p-6">
              <p className="text-sm text-muted-foreground">SLA</p>
              <p className="mt-2 text-2xl font-semibold text-text">99.95%</p>
              <p className="mt-2 text-sm text-muted-strong">
                Kontinuierliche Verfügbarkeit, inklusive Notfallplan.
              </p>
              <Button asChild className="mt-6 w-full rounded-full">
                <Link href="/register">Demo anfragen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
