/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'orbitron': ['var(--font-orbitron)', 'monospace'],
        'rajdhani': ['var(--font-rajdhani)', 'sans-serif'],
      },
      colors: {
        'neon-blue': '#00d4ff',
        'neon-green': '#39ff14',
        'electric-purple': '#bf00ff',
      },
      animation: {
        'float': 'float 20s ease-in-out infinite',
        'neon-pulse': 'neon-pulse 2s ease-in-out infinite',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(1deg)' },
          '66%': { transform: 'translateY(10px) rotate(-1deg)' },
        },
        'neon-pulse': {
          '0%, 100%': { 
            borderColor: '#00d4ff',
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)',
          },
          '50%': { 
            borderColor: '#39ff14',
            boxShadow: '0 0 30px rgba(57, 255, 20, 0.7)',
          },
        },
        'slide-in-right': {
          from: {
            transform: 'translateX(100%)',
            opacity: '0',
          },
          to: {
            transform: 'translateX(0)',
            opacity: '1',
          },
        },
        'pulse-glow': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.6)',
          },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-blue': '0 0 20px rgba(0, 212, 255, 0.5)',
        'glow-green': '0 0 20px rgba(57, 255, 20, 0.5)',
        'glow-purple': '0 0 20px rgba(191, 0, 255, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
        'glow-yellow': '0 0 20px rgba(245, 158, 11, 0.5)',
      },
    },
  },
  plugins: [],
} 