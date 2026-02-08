/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brutalist palette - stark, industrial
        'brutal-black': '#0a0a0a',
        'brutal-white': '#f5f5f5',
        'brutal-gray': '#1a1a1a',
        'brutal-accent': '#ff3e00', // Intense orange-red
        'brutal-yellow': '#ffcc00',
        'brutal-blue': '#0066ff',
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        'display': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'massive': ['12rem', { lineHeight: '0.85' }],
        'huge': ['8rem', { lineHeight: '0.9' }],
        'big': ['5rem', { lineHeight: '0.95' }],
      },
      animation: {
        'glitch': 'glitch 1s infinite',
        'scan': 'scan 2s infinite linear',
        'pulse-slow': 'pulse 3s infinite',
        'blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        glitch: {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
