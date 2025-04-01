/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': {
          DEFAULT: '#4F46E5',
          'light': '#6366F1',
          'dark': '#4338CA'
        },
        'mountain': {
          'dark': '#1a1a2e',
          'light': '#e6e6e6',
          'accent': '#4a90e2',
        },
      },
      backgroundImage: {
        'mountain-gradient': 'linear-gradient(to bottom, #1a1a2e, #16213e)',
      },
      animation: {
        'climb': 'climb 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        climb: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: .5 },
        },
      },
    },
  },
  plugins: [],
} 