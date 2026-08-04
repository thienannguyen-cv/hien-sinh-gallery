/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        obsidian: '#0A0A0B',
        charcoal: '#141416',
        subpixel: '#222226',
        primary: '#EDEDED',
        muted: '#71717A',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'ui-monospace', 'monospace'],
        sans: ['Geist', 'Inter', 'Neue Haas Grotesk', 'sans-serif'],
      },
      backgroundImage: {
        'radial-gradient': 'radial-gradient(circle at center, var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
