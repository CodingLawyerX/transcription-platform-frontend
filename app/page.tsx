'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { DM_Sans, JetBrains_Mono } from 'next/font/google';
import {
  Activity,
  Code2,
  Download,
  FileText,
  Globe,
  Grid3x3,
  Mic,
  PenLine,
  Radio,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  weight: ['400', '500'],
});

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const revealTargets = document.querySelectorAll('.reveal');
    revealTargets.forEach((el) => observer.observe(el));

    return () => {
      revealTargets.forEach((el) => observer.unobserve(el));
      observer.disconnect();
    };
  }, []);

  const cta = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-12 w-40 rounded-[14px] bg-white/60 animate-pulse" />
          <div className="h-12 w-32 rounded-[14px] bg-white/60 animate-pulse" />
        </div>
      );
    }
    if (isLoggedIn) {
      return (
        <div className="hero-actions mb-10 flex flex-wrap items-center gap-3 hero-fade" style={{ animationDelay: '0.3s' }}>
          <Button
            asChild
            size="lg"
            className="rounded-[14px] px-7 py-3.5 text-sm font-semibold bg-[var(--accent)] text-white shadow-[var(--shadow-accent)] hover:bg-[var(--accent-deep)] hover:-translate-y-0.5"
          >
            <Link href="/transcribe">Zum Workspace</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-[14px] px-6 py-3 text-sm border-[1.5px] border-[var(--border-strong)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
          >
            <Link href="/profile">Profil öffnen</Link>
          </Button>
        </div>
      );
    }
    return (
      <div className="hero-actions mb-10 flex flex-wrap items-center gap-3 hero-fade" style={{ animationDelay: '0.3s' }}>
        <Button
          asChild
          size="lg"
          className="rounded-[14px] px-7 py-3.5 text-sm font-semibold bg-[var(--accent)] text-white shadow-[var(--shadow-accent)] hover:bg-[var(--accent-deep)] hover:-translate-y-0.5"
        >
          <Link href="/register">Kostenlos starten</Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-[14px] px-6 py-3 text-sm border-[1.5px] border-[var(--border-strong)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-white"
        >
          <Link href="/login">Anmelden</Link>
        </Button>
      </div>
    );
  }, [isLoading, isLoggedIn]);

  return (
    <div
      className={`${dmSans.variable} ${jetBrainsMono.variable} min-h-screen bg-[var(--surface)] text-[var(--ink)] font-[var(--font-dm-sans)]`}
      style={
        {
          '--ink': '#0a0f1e',
          '--ink-soft': '#2a3048',
          '--ink-muted': '#6b7194',
          '--surface': '#f8f9fc',
          '--surface-elevated': '#ffffff',
          '--accent': '#2d5bff',
          '--accent-deep': '#1a3fcc',
          '--accent-glow': 'rgba(45, 91, 255, 0.12)',
          '--accent-subtle': '#e8eeff',
          '--success': '#00c781',
          '--success-bg': '#e6faf2',
          '--border': 'rgba(10, 15, 30, 0.08)',
          '--border-strong': 'rgba(10, 15, 30, 0.14)',
          '--radius-sm': '8px',
          '--radius-md': '14px',
          '--radius-lg': '20px',
          '--radius-xl': '28px',
          '--shadow-sm': '0 1px 3px rgba(10, 15, 30, 0.06)',
          '--shadow-md': '0 4px 20px rgba(10, 15, 30, 0.08)',
          '--shadow-lg': '0 12px 40px rgba(10, 15, 30, 0.10)',
          '--shadow-accent': '0 4px 24px rgba(45, 91, 255, 0.25)',
        } as CSSProperties
      }
    >
      <section className="hero-section mx-auto grid max-w-[1280px] grid-cols-1 gap-20 px-6 pb-[100px] pt-[160px] lg:grid-cols-2 lg:px-12">
        <div className="space-y-0">
          <div className="hero-badge hero-fade" style={{ animationDelay: '0s' }}>
            <span className="hero-dot" />
            Simpliant Transcribe · Word Add-in Ready
          </div>
          <h1 className="hero-title hero-fade" style={{ animationDelay: '0.1s' }}>
            Live transkribieren.
            <br />
            Überall.
            <span className="hero-accent">Im Browser oder in Word.</span>
          </h1>
          <p className="hero-desc hero-fade" style={{ animationDelay: '0.2s' }}>
            Einfach sprechen – Simpliant Transcribe schreibt mit. Live im Browser, als Word Add-in
            oder per API. Angetrieben von Europas führender Spracherkennung mit der niedrigsten
            Fehlerrate am Markt. Alle Daten bleiben in der EU.
          </p>
          {cta}
          <div className="hero-tags hero-fade" style={{ animationDelay: '0.4s' }}>
            <span>Verarbeitung komplett in der EU – kein Umweg über US-Server</span>
            <span>DSGVO-konform</span>
          </div>
        </div>

        <div className="stats-panel hero-fade" style={{ animationDelay: '0.3s' }}>
          <div className="stat-card-main">
            <div className="stat-main-header">
              <div className="stat-main-label">Wortfehlerrate</div>
              <Activity size={18} strokeWidth={1.8} className="text-[var(--accent)]/50" />
            </div>
            <div className="stat-main-value font-[var(--font-jetbrains-mono)]">~4%</div>
            <div className="stat-main-desc">
              Niedrigste WER am Markt – genauer als OpenAI, Google &amp; Co.
            </div>
            <div className="stat-row">
              <div className="stat-mini">
                <div className="stat-mini-label">Live-Latenz</div>
                <div className="stat-mini-value font-[var(--font-jetbrains-mono)]">
                  &lt;200ms
                </div>
                <div className="stat-mini-desc">Echtzeit-Transkription</div>
              </div>
              <div className="stat-mini">
                <div className="stat-mini-label">Sprachen</div>
                <div className="stat-mini-value font-[var(--font-jetbrains-mono)]">13</div>
                <div className="stat-mini-desc">inkl. DE, EN, FR, ES, IT</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="trust-strip reveal">
        {[
          { icon: Grid3x3, label: 'Verarbeitung in der EU' },
          { icon: ShieldCheck, label: 'DSGVO-konform' },
          { icon: Globe, label: 'Live im Browser' },
          { icon: FileText, label: 'Word Add-in' },
          { icon: Code2, label: 'REST-API' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="trust-item">
              <div className="trust-icon">
                <Icon size={18} strokeWidth={1.8} />
              </div>
              {item.label}
            </div>
          );
        })}
      </div>

      <section className="workflow-section">
        <div className="reveal">
          <div className="section-label">So funktioniert&apos;s</div>
          <h2>Vom gesprochenen Wort zum fertigen Dokument.</h2>
          <p className="section-desc">
            Live im Browser diktieren oder Audio hochladen – Simpliant Transcribe erkennt Sprecher,
            setzt Satzzeichen und liefert das fertige Transkript direkt in Word oder als PDF.
          </p>
        </div>

        <div className="steps-grid">
          {[
            {
              step: '01',
              title: 'Sprechen oder hochladen',
              text: 'Live im Browser diktieren – von überall, auf jedem Gerät. Oder bestehende Aufnahmen hochladen (MP3, WAV, M4A, FLAC).',
              icon: Mic,
              delay: '0.1s',
            },
            {
              step: '02',
              title: 'Sofort transkribieren',
              text: 'Echtzeit-Spracherkennung mit unter 200 ms Latenz. Automatische Zeichensetzung, Sprechererkennung und Zeitstempel.',
              icon: Radio,
              delay: '0.2s',
            },
            {
              step: '03',
              title: 'Prüfen & Anpassen',
              text: 'Transkript im Editor nachbearbeiten. Sprecher zuordnen, Passagen markieren, Zeitstempel abgleichen.',
              icon: PenLine,
              delay: '0.3s',
            },
            {
              step: '04',
              title: 'Exportieren',
              text: 'Direkt in Word weiterarbeiten, als PDF speichern oder per REST-API in eigene Workflows einbinden.',
              icon: Download,
              delay: '0.4s',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="step-card reveal"
                style={{ transitionDelay: item.delay }}
              >
                <div className="step-header">
                  <div className="step-number">{item.step}</div>
                  <div className="step-icon">
                    <Icon size={20} strokeWidth={1.8} />
                  </div>
                </div>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="feature-section mx-auto max-w-[1280px] px-6 py-20 lg:px-12 animate-fade-in">
        <div className="mb-10 space-y-3">
          <div className="section-label">Warum Simpliant Transcribe</div>
          <h2 className="feature-title">Klarer Output. Schnell weiterarbeiten.</h2>
          <p className="feature-desc">
            Konsistente Qualität, klare Prozesse und schnelle Ergebnisse – für Teams, die Text sofort
            weiterverarbeiten müssen.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
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
            <Card key={item.title} className="feature-card">
              <CardContent className="space-y-3 p-6">
                <h3 className="text-lg font-semibold text-[var(--ink)]">{item.title}</h3>
                <p className="text-sm text-[var(--ink-muted)]">{item.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1280px] px-6 pb-24 lg:px-12">
        <div className="testimonial-panel grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="section-label">Stimmen aus der Praxis</div>
            <h2 className="text-3xl font-semibold text-[var(--ink)]">Teams, die auf Tempo setzen.</h2>
            <p className="text-base text-[var(--ink-muted)]">
              Teams aus Forschung, Medien und Beratung nutzen Simpliant Transcribe für verlässliche
              Dokumentationen.
            </p>
            <div className="space-y-4">
              {testimonials.map((item, index) => (
                <button
                  key={item.author}
                  className={`w-full rounded-[18px] border p-4 text-left transition ${
                    index === activeTestimonial
                      ? 'border-[rgba(45,91,255,0.35)] bg-[rgba(45,91,255,0.1)]'
                      : 'border-[var(--border)] bg-[var(--surface-elevated)]'
                  }`}
                  onClick={() => setActiveTestimonial(index)}
                  aria-label={`Testimonial ${index + 1}`}
                >
                  <p className="text-sm text-[var(--ink)]">“{item.text}”</p>
                  <p className="mt-3 text-xs text-[var(--ink-muted)]">
                    {item.author} · {item.role}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between gap-6">
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
                Aktiv
              </p>
              <p className="mt-4 text-4xl font-semibold text-[var(--ink)] font-[var(--font-jetbrains-mono)]">
                1.2M+
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Audiodateien wurden im letzten Quartal verarbeitet.
              </p>
            </div>
            <div className="rounded-[20px] border border-[var(--border)] bg-[var(--surface-elevated)] p-6 shadow-[var(--shadow-sm)]">
              <p className="text-sm text-[var(--ink-muted)]">SLA</p>
              <p className="mt-2 text-2xl font-semibold text-[var(--ink)] font-[var(--font-jetbrains-mono)]">
                99.95%
              </p>
              <p className="mt-2 text-sm text-[var(--ink-muted)]">
                Kontinuierliche Verfügbarkeit, inklusive Notfallplan.
              </p>
              <Button
                asChild
                className="mt-6 w-full rounded-[14px] bg-[var(--accent)] text-white shadow-[var(--shadow-accent)] hover:bg-[var(--accent-deep)]"
              >
                <Link href="/register">Zugang anfragen</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <style jsx global>{`
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px 6px 8px;
          background: var(--surface-elevated);
          border: 1px solid var(--border-strong);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-soft);
          margin-bottom: 28px;
        }

        .hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: var(--success);
          box-shadow: 0 0 0 3px var(--success-bg);
        }

        .hero-title {
          font-size: 56px;
          font-weight: 700;
          line-height: 1.08;
          letter-spacing: -2.5px;
          color: var(--ink);
          margin-bottom: 24px;
        }

        .hero-accent {
          color: var(--accent);
          display: block;
        }

        .hero-desc {
          font-size: 17px;
          line-height: 1.65;
          color: var(--ink-muted);
          max-width: 460px;
          margin-bottom: 44px;
        }

        .hero-tags {
          display: flex;
          gap: 20px;
          font-size: 13px;
          color: var(--ink-muted);
          font-weight: 500;
          flex-wrap: wrap;
        }

        .hero-tags span {
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .hero-tags span::before {
          content: '';
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--accent);
          opacity: 0.5;
        }

        .stat-card-main {
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 36px;
          box-shadow: var(--shadow-lg);
          position: relative;
          overflow: hidden;
        }

        .stat-card-main::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--accent), var(--success));
          border-radius: var(--radius-xl) var(--radius-xl) 0 0;
        }

        .stat-main-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .stat-main-label {
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1.2px;
          color: var(--ink-muted);
          margin-bottom: 8px;
        }

        .stat-main-value {
          font-size: 52px;
          font-weight: 700;
          letter-spacing: -2px;
          color: var(--ink);
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-main-desc {
          font-size: 14px;
          color: var(--ink-muted);
          margin-bottom: 28px;
        }

        .stat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .stat-mini {
          background: var(--surface);
          border-radius: var(--radius-md);
          padding: 20px 22px;
          border: 1px solid var(--border);
          transition: all 0.25s ease;
        }

        .stat-mini:hover {
          border-color: var(--accent);
          background: var(--accent-glow);
        }

        .stat-mini-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: var(--ink-muted);
          margin-bottom: 8px;
        }

        .stat-mini-value {
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -1px;
          color: var(--ink);
          line-height: 1.1;
        }

        .stat-mini-desc {
          font-size: 12.5px;
          color: var(--ink-muted);
          margin-top: 4px;
        }

        .trust-strip {
          padding: 60px 48px;
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
        }

        .trust-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: var(--ink-muted);
          font-weight: 500;
        }

        .trust-icon {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .trust-item:hover .trust-icon {
          background: var(--accent-glow);
          border-color: rgba(45, 91, 255, 0.2);
        }

        .workflow-section {
          padding: 80px 48px 100px;
          max-width: 1280px;
          margin: 0 auto;
        }

        .feature-section {
          padding: 90px 48px;
        }

        .feature-title {
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -1.6px;
          color: var(--ink);
        }

        .feature-desc {
          font-size: 16px;
          line-height: 1.65;
          color: var(--ink-muted);
          max-width: 520px;
        }

        .feature-card {
          border: 1px solid var(--border);
          background: var(--surface-elevated);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-sm);
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-3px);
          border-color: rgba(45, 91, 255, 0.2);
          box-shadow: var(--shadow-md);
        }

        .testimonial-panel {
          border: 1px solid var(--border);
          background: var(--surface-elevated);
          border-radius: var(--radius-xl);
          padding: 32px;
          box-shadow: var(--shadow-lg);
        }

        .section-label {
          display: inline-flex;
          padding: 6px 14px;
          background: var(--accent-subtle);
          color: var(--accent);
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .workflow-section h2 {
          font-size: 42px;
          font-weight: 700;
          letter-spacing: -1.8px;
          line-height: 1.12;
          color: var(--ink);
          max-width: 520px;
          margin-bottom: 16px;
        }

        .workflow-section .section-desc {
          font-size: 16px;
          line-height: 1.65;
          color: var(--ink-muted);
          max-width: 480px;
          margin-bottom: 48px;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .step-card {
          background: var(--surface-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 30px 26px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .step-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, var(--accent-glow), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .step-card:hover::before {
          opacity: 1;
        }

        .step-card:hover {
          border-color: rgba(45, 91, 255, 0.2);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .step-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 18px;
          position: relative;
          z-index: 1;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: var(--accent-subtle);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 700;
          font-family: var(--font-jetbrains-mono);
        }

        .step-icon {
          color: var(--ink-muted);
          opacity: 0.4;
          transition: all 0.3s ease;
        }

        .step-card:hover .step-icon {
          color: var(--accent);
          opacity: 0.7;
        }

        .step-card h3 {
          font-size: 17px;
          font-weight: 600;
          letter-spacing: -0.3px;
          color: var(--ink);
          margin-bottom: 8px;
          position: relative;
          z-index: 1;
        }

        .step-card p {
          font-size: 14px;
          line-height: 1.55;
          color: var(--ink-muted);
          position: relative;
          z-index: 1;
        }

        .steps-grid .step-card:not(:last-child)::after {
          content: '';
          position: absolute;
          top: 47px;
          right: -12px;
          width: 6px;
          height: 6px;
          border-top: 2px solid var(--border-strong);
          border-right: 2px solid var(--border-strong);
          transform: rotate(45deg);
          z-index: 2;
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-fade {
          animation: fadeUp 0.6s ease both;
        }

        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        @media (max-width: 1024px) {
          .hero-section {
            padding: 140px 32px 60px;
          }

          .hero-title {
            font-size: 44px;
          }

          .steps-grid {
            grid-template-columns: 1fr 1fr;
          }

          .steps-grid .step-card:not(:last-child)::after {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .hero-section {
            padding: 120px 20px 48px;
          }

          .hero-title {
            font-size: 36px;
            letter-spacing: -1.5px;
          }

          .hero-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .hero-tags {
            flex-direction: column;
          }

          .workflow-section {
            padding: 60px 20px 80px;
          }

          .feature-section {
            padding: 60px 20px;
          }

          .testimonial-panel {
            padding: 24px;
          }

          .trust-strip {
            padding: 40px 20px;
            gap: 24px;
          }

          .steps-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
