'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface AltchaProps {
  onStateChange?: (ev: Event | CustomEvent) => void;
}

export interface AltchaRef {
  value: string | null;
  reset: () => void;
}

const Altcha = forwardRef<AltchaRef, AltchaProps>(
  ({ onStateChange }, ref) => {
    const widgetRef = useRef<HTMLElement>(null);
    const [value, setValue] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useImperativeHandle(ref, () => ({
      get value() { return value; },
      reset: () => {
        setValue(null);
        if (widgetRef.current && typeof window !== 'undefined') {
          // Reset by reloading the component
          setIsLoaded(false);
          setTimeout(() => setIsLoaded(true), 100);
        }
      },
    }), [value]);

    useEffect(() => {
      // Only load altcha on client side
      if (typeof window === 'undefined') return;
      
      // Dynamically import altcha
      import('altcha').then(() => {
        setIsLoaded(true);
      });
    }, []);

    useEffect(() => {
      if (!isLoaded || typeof window === 'undefined') return;
      
      const handleStateChange = (ev: Event | CustomEvent) => {
        if ('detail' in ev) {
          const customEv = ev as CustomEvent;
          setValue(customEv.detail.payload || null);
          onStateChange?.(ev);
        }
      };
      
      const { current } = widgetRef;
      if (current) {
        current.addEventListener('statechange', handleStateChange);
        return () => current.removeEventListener('statechange', handleStateChange);
      }
    }, [isLoaded, onStateChange]);

    if (!isLoaded) {
      return (
        <div className="flex justify-center py-4">
          <div className="animate-pulse bg-muted h-12 w-full max-w-md rounded"></div>
        </div>
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend.simpliant-ds.eu/rest/api/v1';
    const challengeUrl = `${apiUrl}/altcha/challenge`;

    return (
      <div className="flex justify-center">
        {/* @ts-ignore - Custom element defined by altcha package */}
        <altcha-widget
          ref={widgetRef}
          challengeurl={challengeUrl}
        />
      </div>
    );
  }
);

Altcha.displayName = 'Altcha';

export default Altcha;
