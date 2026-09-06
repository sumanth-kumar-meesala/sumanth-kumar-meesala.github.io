/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        void: '#0B0D12',
        surface: '#12151D',
        'surface-2': '#171B26',
        line: '#232838',
        'line-2': '#1A1E2A',
        text: '#E8EAF0',
        muted: '#9AA1B4',
        dim: '#6B7285',
        teal: '#22D3C5',
        'teal-dim': '#159A90',
        amber: '#F0A93B',
        'amber-dim': '#B87C22',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SF Mono', 'Menlo', 'monospace'],
      },
      fontSize: {
        meta: ['11px', { lineHeight: '1.3', letterSpacing: '0.16em' }],
      },
      maxWidth: { shell: '1200px' },
      animation: {
        'pulse-dot': 'pulseDot 2.4s ease-in-out infinite',
        'scan': 'scan 5s linear infinite',
      },
      keyframes: {
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.7)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [],
}
