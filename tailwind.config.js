/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'pixel': ['"Press Start 2P"', 'cursive'],
      },
      colors: {
        'gba-green': '#A8C64E',
        'gba-dark': '#4A5E2B',
        'gba-bg': '#F8F8F8',
      }
    },
  },
  plugins: [],
}

