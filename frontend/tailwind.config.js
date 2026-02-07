/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // We will force dark mode mostly
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      colors: {
        gaming: {
          bg: '#050B14', // Darker, richer background
          card: '#0F172A', // Deep slate for cards
          text: '#F8FAFC',
          accent: '#1E293B',
        },
        neon: {
          blue: '#00F0FF', // Cyberpunk Cyan
          purple: '#BC13FE', // Electric Purple
          pink: '#FF003C', // Cyberpunk Red/Pink
          green: '#00FF9F', // Matrix Green
          gold: '#FACC15',
          dark: '#0B1221',
        },
        glass: {
           light: 'rgba(255, 255, 255, 0.05)',
           medium: 'rgba(255, 255, 255, 0.1)',
           heavy: 'rgba(15, 23, 42, 0.6)',
           stroke: 'rgba(255, 255, 255, 0.08)',
        }
      },
      backgroundImage: {
         'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
         'hero-glow': 'conic-gradient(from 180deg at 50% 50%, #00F0FF 0deg, #BC13FE 180deg, #00F0FF 360deg)',
      },
      boxShadow: {
        'neon-blue': '0 0 10px rgba(0, 240, 255, 0.5), 0 0 20px rgba(0, 240, 255, 0.3)',
        'neon-purple': '0 0 10px rgba(188, 19, 254, 0.5), 0 0 20px rgba(188, 19, 254, 0.3)',
        'neon-green': '0 0 10px rgba(0, 255, 159, 0.5), 0 0 20px rgba(0, 255, 159, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'spin-slow': 'spin 12s linear infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        }
      }
    },
  },
  plugins: [],
}
