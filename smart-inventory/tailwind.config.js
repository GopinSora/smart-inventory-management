/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#fdfbf5',
          100: '#faf6ec',
          200: '#f3ecd6',
          300: '#e9dcb6',
          400: '#d9c389',
          500: '#c4a662',
          600: '#a78848',
          700: '#85693a',
          800: '#695434',
          900: '#574630',
          950: '#312618',
        },
        ink: {
          50: '#f6f6f5',
          100: '#e7e7e4',
          200: '#cfcec9',
          300: '#aeaca4',
          400: '#8a8880',
          500: '#6f6d65',
          600: '#595851',
          700: '#494842',
          800: '#3d3c38',
          900: '#353430',
          950: '#1c1c1a',
        },
        accent: {
          DEFAULT: '#b45309',
          50: '#fff7ed',
          100: '#ffedd5',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(60, 50, 30, 0.04), 0 4px 16px rgba(60, 50, 30, 0.06)',
        'lifted': '0 4px 12px rgba(60, 50, 30, 0.08), 0 16px 48px rgba(60, 50, 30, 0.10)',
      },
      animation: {
        'fade-up': 'fadeUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.3s ease-out both',
        'scale-in': 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
};
