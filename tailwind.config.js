/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        saas: {
          bg: '#f4f7fe',
          sidebar: '#ffffff',
          card: '#ffffff',
          border: '#eef2f6',
          teal: '#2bb398',
          tealDark: '#1e8e78',
          blue: '#0284c7',
          sky: '#0ea5e9',
          amber: '#f59e0b',
          pink: '#f43f5e',
          purple: '#8b5cf6',
          textMain: '#1e293b',
          textMuted: '#64748b',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.04), 0 4px 10px -2px rgba(0, 0, 0, 0.02)',
        'card': '0 2px 12px -2px rgba(30, 41, 59, 0.05)',
      }
    },
  },
  plugins: [],
}
