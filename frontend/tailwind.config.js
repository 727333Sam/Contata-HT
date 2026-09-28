/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#4f46e5', dark: '#3730a3' },
        success: '#059669',
        warning: '#d97706',
        error: '#e11d48',
        info: '#2563eb',
      },
    },
  },
  plugins: [],
};
