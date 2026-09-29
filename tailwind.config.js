/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Deep sea-glass palette: one dark base, one raised surface, three text tones.
        deep: '#06121a',
        panel: '#0a1c25',
        foam: { DEFAULT: '#eaf4f5', 2: '#a3bbc0', 3: '#6f8a90' },
      },
      fontFamily: {
        sans: ['"Bricolage Grotesque"', 'ui-sans-serif', 'system-ui', '-apple-system', '"Segoe UI"', 'sans-serif'],
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-in': {
          from: { transform: 'translateX(2rem)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        grow: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 450ms ease-out both',
        'slide-in': 'slide-in 280ms cubic-bezier(0.22, 1, 0.36, 1) both',
        grow: 'grow 900ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};
