/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Institutional Dark Mode Canvas System
        canvas: {
          DEFAULT: '#0B0E11',
          light: '#0D1117',
        },
        surface: {
          DEFAULT: '#181A20',
          hover: '#1E2329',
        },
        elevated: {
          DEFAULT: '#202630',
          hover: '#262C36',
        },
        'b-border': {
          DEFAULT: '#2B313A',
          light: '#363E4A',
        },
        // Brand Accents
        gold: {
          DEFAULT: '#F0B90B',
          hover: '#FCD535',
          muted: '#F0B90B20',
          border: '#F0B90B40',
        },
        // Financial Telemetry
        bullish: {
          DEFAULT: '#0ECB81',
          muted: '#0ECB8120',
          border: '#0ECB8140',
        },
        bearish: {
          DEFAULT: '#F6465D',
          muted: '#F6465D20',
          border: '#F6465D40',
        },
        // Protocol Colors
        'protocol-blue': {
          DEFAULT: '#0E76FD',
          muted: '#0E76FD20',
        },
        // Text Hierarchy
        'text-primary': '#EAECEF',
        'text-secondary': '#B7BDC6',
        'text-tertiary': '#848E9C',
        'text-disabled': '#5E6673',
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"Roboto Mono"', '"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(240, 185, 11, 0.3)' },
          '50%': { boxShadow: '0 0 0 8px rgba(240, 185, 11, 0)' },
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};
