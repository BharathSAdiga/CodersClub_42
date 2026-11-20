/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // UDYOGA Core Brand Identity
        brand: {
          forest: '#173F35',       // Primary Deep Forest Green
          'forest-hover': '#112F28',
          'forest-light': '#23594C',
          ivory: '#F7F4EC',        // Primary Warm Ivory Canvas
          'ivory-dark': '#EBE5D8',
          terracotta: '#C96B4B',   // Primary Accent / Highlight Terracotta
          'terracotta-hover': '#B35839',
          'terracotta-light': '#F5E6E0',
          charcoal: '#1A1A1A',     // Editorial Deep Charcoal
          'charcoal-dark': '#111815',
          'off-white': '#FAFAF7',
          mint: '#34D399',         // Validation & Metric Accent
          'mint-light': '#ECFDF5',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#173F35',
          foreground: '#F7F4EC',
        },
        secondary: {
          DEFAULT: '#F7F4EC',
          foreground: '#173F35',
        },
        accent: {
          DEFAULT: '#C96B4B',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#EFECE4',
          foreground: '#64748B',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Manrope', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(23, 63, 53, 0.05)',
        'card': '0 10px 30px -4px rgba(23, 63, 53, 0.08)',
        'elevated': '0 20px 40px -8px rgba(17, 24, 21, 0.12)',
        'glow-terracotta': '0 0 25px -4px rgba(201, 107, 75, 0.35)',
        'glow-forest': '0 0 25px -4px rgba(23, 63, 53, 0.25)',
      },
    },
  },
  plugins: [],
};
