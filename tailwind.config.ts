import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
    content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
  	extend: {
  		colors: {
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				dark: '#0f4d4a',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			sidebar: {
  				bg: '#ffffff',
  				border: 'rgba(28, 36, 58, 0.08)'
  			},
			muted: {
				DEFAULT: 'hsl(var(--muted))',
				strong: '#455066',
				foreground: 'hsl(var(--muted-foreground))'
			},
			success: 'hsl(var(--success-green))',
			error: 'hsl(var(--destructive))',
			bg: '#f6f3ef',
			text: '#1f2a31',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
  			serif: ['var(--font-serif)', 'Georgia', 'serif']
  		},
  		boxShadow: {
  			soft: '0 18px 36px rgba(23, 35, 82, 0.12)',
  			sidebar: '12px 0 40px rgba(16, 27, 71, 0.05)'
  		},
  		borderRadius: {
  			xl: '18px',
  			'2xl': '20px',
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		backgroundImage: {
			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
			'gradient-primary': 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)'
		},
  		keyframes: {
  			float: {
  				'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
  				'50%': { transform: 'translateY(-16px) rotate(1deg)' }
  			},
  			'fade-up': {
  				'0%': { opacity: '0', transform: 'translateY(24px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' }
  			},
  			'scale-in': {
  				'0%': { opacity: '0', transform: 'scale(0.96)' },
  				'100%': { opacity: '1', transform: 'scale(1)' }
  			}
  		},
  		animation: {
  			float: 'float 12s ease-in-out infinite',
  			'fade-up': 'fade-up 0.8s ease-out both',
  			'scale-in': 'scale-in 0.6s ease-out both'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
