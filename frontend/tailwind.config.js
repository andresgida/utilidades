/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vivid Flux palette
        primary:   '#d0bcff',
        secondary: '#4cd7f6',
        tertiary:  '#ffb0cd',
        'primary-dim':  '#a078ff',
        'primary-deep': '#6d3bd7',
        'secondary-deep': '#03b5d3',
        surface: {
          DEFAULT:  '#0b1326',
          low:      '#131b2e',
          container:'#171f33',
          high:     '#222a3d',
          variant:  '#2d3449',
        },
        'on-surface': '#dae2fd',
        'on-surface-variant': '#cbc3d7',
        outline: '#958ea0',
        glass: {
          light: 'rgba(255,255,255,0.05)',
          dark:  'rgba(0,0,0,0.25)',
        }
      },
      fontFamily: {
        heading: ['Montserrat', '-apple-system', 'sans-serif'],
        sans:    ['Inter', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
        mono:    ['"SF Mono"', '"Fira Code"', 'monospace'],
      },
      backdropBlur: {
        xs: '2px',
        '2xl': '40px',
      },
      animation: {
        'fade-in':    'fadeIn 0.5s ease-out',
        'fade-up':    'fadeUp 0.6s ease-out',
        'scale-in':   'scaleIn 0.3s ease-out',
        'slide-right':'slideRight 0.4s ease-out',
        'shimmer':    'shimmer 2s infinite linear',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
        'float':      'float 10s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
        'blob':       'blobFloat 15s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:     { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        fadeUp:     { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        scaleIn:    { '0%': { opacity: '0', transform: 'scale(0.95)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        slideRight: { '0%': { opacity: '0', transform: 'translateX(-20px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
        shimmer:    { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-20px)' } },
        glow:       { '0%': { boxShadow: '0 0 10px rgba(208,188,255,0.3)' }, '100%': { boxShadow: '0 0 30px rgba(208,188,255,0.6), 0 0 60px rgba(76,215,246,0.2)' } },
        blobFloat:  { '0%,100%': { transform: 'translate(0,0) scale(1)' }, '33%': { transform: 'translate(30px,-50px) scale(1.1)' }, '66%': { transform: 'translate(-20px,20px) scale(0.9)' } },
      },
      boxShadow: {
        'glass':        '0 8px 32px rgba(0,0,0,0.37)',
        'glass-hover':  '0 20px 60px rgba(0,0,0,0.5)',
        'glow-primary': '0 0 20px rgba(208,188,255,0.3)',
        'glow-cyan':    '0 0 20px rgba(76,215,246,0.3)',
        'card':         '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover':   '0 12px 48px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
