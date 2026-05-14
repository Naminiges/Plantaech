/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ── Design Tokens (modular — frontend team can customize here) ──
      colors: {
        brand: {
          black:  'var(--color-black)',
          white:  'var(--color-white)',
          gray:   'var(--color-gray)',
          'gray-light': 'var(--color-gray-light)',
          'gray-border': 'var(--color-gray-border)',
          accent: 'var(--color-accent)',
          'accent-hover': 'var(--color-accent-hover)',
          danger: 'var(--color-danger)',
          warning: 'var(--color-warning)',
          success: 'var(--color-success)',
        },
      },
      fontFamily: {
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Georgia', 'serif'],
        mono:  ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:    { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp:   { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { '0%': { opacity: '0', transform: 'translateY(-10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.12)',
        'modal': '0 20px 60px rgba(0,0,0,0.3)',
      },
    },
  },
  plugins: [],
}
