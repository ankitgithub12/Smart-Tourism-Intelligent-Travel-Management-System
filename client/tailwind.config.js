/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: 'hsl(var(--primary-light))',
          DEFAULT: 'hsl(var(--primary))',
          dark: 'hsl(var(--primary-dark))',
        },
        accent: {
          light: 'hsl(var(--accent-light))',
          DEFAULT: 'hsl(var(--accent))',
          dark: 'hsl(var(--accent-dark))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
        }
      },
      animation: {
        'float': 'float 4s ease-in-out infinite',
        'wave': 'wave 12s linear infinite',
        'blob': 'blob 8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        wave: {
          '0%': { transform: 'translateX(0) translateZ(0) scaleY(1)' },
          '50%': { transform: 'translateX(-25%) translateZ(0) scaleY(0.55)' },
          '100%': { transform: 'translateX(-50%) translateZ(0) scaleY(1)' },
        },
        blob: {
          '0%, 100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
          '50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px hsl(var(--primary) / 0.3)' },
          '50%': { boxShadow: '0 0 40px hsl(var(--primary) / 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
