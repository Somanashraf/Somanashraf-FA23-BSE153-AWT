/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563EB',
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#14B8A6',
          50: '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
          700: '#0F766E',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#8B5CF6',
          foreground: '#FFFFFF',
        },
        success: { DEFAULT: '#22C55E', foreground: '#FFFFFF' },
        warning: { DEFAULT: '#F59E0B', foreground: '#FFFFFF' },
        destructive: { DEFAULT: '#EF4444', foreground: '#FFFFFF' },
        background: '#F8FAFC',
        foreground: '#0F172A',
        card: { DEFAULT: '#FFFFFF', foreground: '#0F172A' },
        popover: { DEFAULT: '#FFFFFF', foreground: '#0F172A' },
        muted: { DEFAULT: '#F1F5F9', foreground: '#64748B' },
        border: '#E2E8F0',
        input: '#E2E8F0',
        ring: '#2563EB',
      },
      borderRadius: {
        lg: '0.75rem',
        md: '0.5rem',
        sm: '0.375rem',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 40px rgba(37,99,235,0.12), 0 4px 15px rgba(0,0,0,0.06)',
        premium: '0 20px 60px rgba(37,99,235,0.15)',
        glass: '0 8px 32px rgba(31, 38, 135, 0.08)',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #2563EB 0%, #14B8A6 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
};
