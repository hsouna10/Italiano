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
        parla: {
          cream: '#FBF9F5',
          'cream-sidebar': '#F5F1EA',
          'cream-card': '#FFFFFF',
          'cream-border': '#EAE4DA',
          'cream-border-subtle': '#F2ECE2',
          'cream-muted': '#F2ECE3',
          terracotta: '#C04A33',
          'terracotta-hover': '#AB3E29',
          'terracotta-light': '#FDF2EE',
          'terracotta-border': '#F6D9CE',
          sage: '#2A6F55',
          'sage-light': '#EDF6F2',
          'sage-border': '#CDE3D8',
          charcoal: '#1F1A17',
          'charcoal-muted': '#68605A',
          'charcoal-light': '#8A817A',
        },
        italia: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        terracotta: {
          500: '#C04A33',
          600: '#AB3E29',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'Cambria', '"Times New Roman"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      boxShadow: {
        'parla-sm': '0 1px 3px 0 rgba(70, 50, 30, 0.04), 0 1px 2px -1px rgba(70, 50, 30, 0.04)',
        'parla': '0 4px 6px -1px rgba(70, 50, 30, 0.05), 0 2px 4px -2px rgba(70, 50, 30, 0.05)',
        'parla-lg': '0 10px 15px -3px rgba(70, 50, 30, 0.06), 0 4px 6px -4px rgba(70, 50, 30, 0.06)',
      }
    },
  },
  plugins: [],
}
