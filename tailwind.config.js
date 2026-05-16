/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        foreground: '#0A0A0A',
        primary: {
          DEFAULT: '#F97316',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F5F5F5',
          foreground: '#0A0A0A',
        },
        muted: {
          DEFAULT: '#737373',
          foreground: '#A3A3A3',
        },
        accent: {
          DEFAULT: '#F97316',
          orange: '#F97316',
          foreground: '#FFFFFF',
        },
        border: '#E5E5E5',
        card: '#FFFFFF',
        rubber: {
          black: '#0A0A0A',
          carbon: '#171717',
          graphite: '#262626',
        },
        industrial: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#0A0A0A',
          950: '#050505',
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
