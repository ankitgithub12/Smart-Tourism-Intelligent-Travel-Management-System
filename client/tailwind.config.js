/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: '#050816',
          light: '#0B1120',
          card: '#0B1120',
        },
        neon: {
          purple: '#8B5CF6',
          blue: '#3B82F6',
          cyan: '#06B6D4',
          pink: '#EC4899',
        },
        soft: {
          white: '#F8FAFC',
          gray: '#94A3B8',
          dark: '#64748B',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          light: 'hsl(var(--primary-light))',
          dark: 'hsl(var(--primary-dark))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          light: 'hsl(var(--accent-light))',
          dark: 'hsl(var(--accent-dark))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
        },
        surface: {
          DEFAULT: 'hsl(var(--surface))',
          dark: 'hsl(var(--surface-dark))',
        },
      },
      animation: {
        float: 'float 4s ease-in-out infinite',
        wave: 'wave 12s linear infinite',
        blob: 'blob 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'float-slow': 'float-slow 8s ease-in-out infinite',
        'float-medium': 'float-medium 6s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
        ticker: 'ticker 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.05)' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(139,92,246,0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(139,92,246,0.6)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(20px, -30px)' },
          '50%': { transform: 'translate(-15px, 20px)' },
          '75%': { transform: 'translate(25px, 15px)' },
        },
        'float-medium': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '25%': { transform: 'translate(-18px, 22px)' },
          '50%': { transform: 'translate(12px, -25px)' },
          '75%': { transform: 'translate(-20px, -10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(139,92,246,0.3)' },
          '50%': { borderColor: 'rgba(6,182,212,0.6)' },
        },
        ticker: {
          from: { opacity: '0', transform: 'translateY(-10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        '3xl': '64px',
      },
      boxShadow: {
        'neon-purple': '0 0 20px rgba(139,92,246,0.3), 0 0 60px rgba(139,92,246,0.1)',
        'neon-blue': '0 0 20px rgba(59,130,246,0.3), 0 0 60px rgba(59,130,246,0.1)',
        'neon-cyan': '0 0 20px rgba(6,182,212,0.3), 0 0 60px rgba(6,182,212,0.1)',
        glass: '0 8px 32px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
};
