/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        carbon: {
          bg: '#05070A',
          card: '#0B0E15',
          cardTop: '#121722',
          sidebar: '#090D14',
          border: 'rgba(255, 255, 255, 0.08)',
          well: '#070A0F',
        },
        electric: {
          emerald: '#10B981',
          emeraldDark: '#059669',
          emeraldShadow: '#047857',
          teal: '#2DD4BF',
          cyan: '#0EA5E9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Fira Code', 'Menlo', 'monospace']
      },
      boxShadow: {
        '3d-emerald': '0 4px 0 #047857, 0 12px 24px -4px rgba(16, 185, 129, 0.5)',
        '3d-emerald-active': '0 1px 0 #047857, 0 2px 5px -1px rgba(16, 185, 129, 0.35)',
        '3d-card-glass': '0 24px 48px -12px rgba(0, 0, 0, 0.85), 0 0 1px 1px rgba(255, 255, 255, 0.06)',
        '3d-card-light': '0 15px 35px -5px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.05)',
        'well-dark': 'inset 0 3px 14px rgba(0, 0, 0, 0.9), inset 0 0 1px 1px rgba(255, 255, 255, 0.04)',
        'well-light': 'inset 0 2px 8px rgba(15, 23, 42, 0.06), 0 1px 0 rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
}
