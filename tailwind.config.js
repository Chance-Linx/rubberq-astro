/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#0F172A',
        primary: {
          DEFAULT: '#F97316',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#0F172A',
        },
        muted: {
          DEFAULT: '#64748B',
          foreground: '#94A3B8',
        },
        accent: {
          DEFAULT: '#F97316',
          orange: '#F97316',
          blue: '#3B82F6',
          green: '#22C55E',
          foreground: '#FFFFFF',
        },
        border: '#E5E7EB',
        card: '#FFFFFF',
        industrial: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Roboto Mono', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': 'radial-gradient(circle, #262626 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-size': '20px 20px',
      },
      animation: {
        scan: 'scan 3s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
};
