/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F2EC',
        'paper-2': '#ECE9E0',
        card: '#FFFFFF',
        ink: '#17201B',
        'ink-2': '#3E4640',
        muted: '#7A8279',
        line: '#DDD9CF',
        'line-2': '#C9C4B6',
        forest: '#0E3B2E',
        'forest-2': '#0A2E24',
        mint: '#A8D9BA',
        'mint-2': '#DCE9DF',
        moss: '#1F6B4A',
        signal: '#2FBF71',
        cream: '#EEF3EA',
      },
      fontFamily: {
        sans: ['DM Sans', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        serif: ['Newsreader', 'Georgia', 'Times New Roman', 'serif'],
        mono: ['DM Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        meta: ['11px', { lineHeight: '1.3', letterSpacing: '0.14em' }],
      },
      maxWidth: { prose2: '760px' },
      keyframes: {
        blink: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.15' } },
        pulseDot: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(47,191,113,0.45)' },
          '70%': { boxShadow: '0 0 0 8px rgba(47,191,113,0)' },
        },
        rise: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
      animation: {
        blink: 'blink 1s steps(2) infinite',
        'pulse-dot': 'pulseDot 2.4s ease-out infinite',
        rise: 'rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}
