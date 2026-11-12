/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5fa',
          100: '#e1ecf5',
          200: '#c3d9eb',
          300: '#95bde0',
          400: '#619dd1',
          500: '#3b80bf',
          600: '#2a66a3',
          700: '#235284',
          800: '#1e446d',
          900: '#0f2d59', // Primary Corporate Blue
          950: '#0a1d3b'
        }
      }
    },
  },
  plugins: [],
}
