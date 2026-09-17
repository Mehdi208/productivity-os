/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        card: 'var(--color-card)',
        primary: '#6C63FF',
        secondary: '#00D4AA',
        textMain: 'var(--color-text-main)',
        textMuted: 'var(--color-text-muted)',
        borderBase: 'var(--color-border)',
        danger: '#FF4757',
        warning: '#FFA502',
        darkBg: '#0F0F1A',
        darkCard: '#181828',
        darkCardElevated: '#202036',
        darkBorder: '#282844',
        darkTextMain: '#F0F0FF',
        darkTextMuted: '#9494B8',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}