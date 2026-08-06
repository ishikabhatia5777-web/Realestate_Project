/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          500: '#0052cc',
          600: '#0043a8',
          700: '#003585',
          800: '#002868',
          900: '#001a47',
          gold: '#D4AF37',
          accent: '#06B6D4'
        },
        dark: {
          100: '#1E293B',
          200: '#0F172A',
          300: '#0B0F19'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};
