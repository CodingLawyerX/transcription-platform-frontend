// TypeScript declarations for ALTCHA widget
// https://altcha.org/

declare namespace JSX {
  interface IntrinsicElements {
    'altcha-widget': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        challengeurl?: string;
        auto?: string;
        'maxnumber'?: number;
        'strings'?: string;
        'delay'?: number;
      },
      HTMLElement
    >;
  }
}

// ALTCHA state change event detail
export interface AltchaStateChangeEvent extends CustomEvent {
  detail: {
    payload?: string;
    state?: 'idle' | 'verifying' | 'verified' | 'error';
  };
}
