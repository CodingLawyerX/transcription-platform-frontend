import type { Config } from 'tailwindcss'

const config: Config = {
    darkMode: ['class'],
  content: [
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
			warning: 'hsl(var(--warning-orange))',
			recording: 'hsl(var(--recording-red))',
			error: 'hsl(var(--destructive))',
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
  			serif: ['var(--font-sans)', 'system-ui', 'sans-serif']
  		},
  		boxShadow: {
  			soft: '0 18px 36px rgba(23, 35, 82, 0.12)',
  			sidebar: '12px 0 40px rgba(16, 27, 71, 0.05)',
			card: '0 16px 30px rgba(18, 24, 32, 0.06)',
			'card-lg': '0 16px 32px rgba(29, 36, 43, 0.08)',
			'card-xl': '0 22px 44px rgba(18, 24, 32, 0.08)',
			'primary-soft': '0 6px 16px hsl(var(--primary) / 0.25)',
			'primary-strong': '0 10px 20px hsl(var(--primary) / 0.3)',
			'primary-deep': '0 16px 36px rgba(37, 99, 235, 0.26)',
			'primary-deeper': '0 22px 42px rgba(37, 99, 235, 0.32)',
			'primary-outline': '0 8px 18px rgba(37, 99, 235, 0.18)',
			'primary-ghost': '0 10px 20px rgba(30, 64, 175, 0.14)',
			panel: '0 1px 3px rgba(0, 0, 0, 0.08)',
			'inset-soft': 'inset 0 1px 2px rgba(0, 0, 0, 0.05)',
			'recording-soft': '0 4px 12px rgba(244, 67, 54, 0.12)',
			'recording-glow': '0 0 8px rgba(244, 67, 54, 0.5)'
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
			'gradient-primary': 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-light)))',
			'hero-radial': 'radial-gradient(120%_80%_at_50%_0%, hsl(var(--primary) / 0.18), transparent 60%), radial-gradient(80%_60%_at_70%_30%, hsl(var(--primary) / 0.12), transparent 55%)',
			'hero-top': 'linear-gradient(180deg, hsl(var(--background) / 0.9), transparent)',
			'auth-glow': 'radial-gradient(circle_at_15%_20%, hsl(var(--primary) / 0.14), transparent 45%), radial-gradient(circle_at_85%_25%, hsl(var(--muted-foreground) / 0.2), transparent 45%), radial-gradient(circle_at_70%_80%, hsl(var(--primary) / 0.12), transparent 40%)',
			'profile-header': 'linear-gradient(120deg, hsl(var(--primary) / 0.16), hsl(var(--primary) / 0.06))',
			'studio-radial': 'radial-gradient(120%_80%_at_50%_0%, hsl(var(--primary) / 0.12), transparent 60%), linear-gradient(hsl(var(--background)), hsl(var(--background)))',
			'hero-subtle': 'radial-gradient(600px 260px at 28% 22%, rgba(59, 111, 245, 0.05), transparent 70%)'
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
  			},
  			wave: {
  				'0%': { transform: 'translateX(-12%)' },
  				'50%': { transform: 'translateX(12%)' },
  				'100%': { transform: 'translateX(-12%)' }
  			}
  		},
  		animation: {
  			float: 'float 12s ease-in-out infinite',
  			'fade-up': 'fade-up 0.8s ease-out both',
  			'scale-in': 'scale-in 0.6s ease-out both',
  			wave: 'wave 12s ease-in-out infinite',
  			'wave-slow': 'wave 20s ease-in-out infinite'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
export default config
