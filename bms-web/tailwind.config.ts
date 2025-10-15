import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/app/**/*.{ts,tsx}',
    './src/components/**/*.{ts,tsx}',
    './src/styles/**/*.{ts,tsx,css}',
  ],
  theme: {
    extend: {
      colors: {
        app: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          border: '#E5E7EB',
          sidebar: '#0F3D3A',
          sidebarHover: '#134E4A',
          topbar: '#0F3D3A',
          accent: '#F3C316',
          primary: '#0D9488',
        },
        success: {
          500: '#22C55E',
        },
        danger: {
          500: '#EF4444',
        },
        warning: {
          500: '#F59E0B',
        },
      },
      boxShadow: {
        sm: '0 1px 3px rgba(2, 6, 23, 0.08), 0 1px 2px rgba(2, 6, 23, 0.04)',
        md: '0 4px 6px rgba(2, 6, 23, 0.08), 0 2px 4px rgba(2, 6, 23, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        md: '8px',
      },
      spacing: {
        sidebar: '264px',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
}
export default config
