/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0A0A0F',
          secondary: '#141419',
          elevated: '#1E1E26',
        },
        accent: {
          copper: '#C97B3A',
          gold: '#E8C47C',
          espresso: '#5C3D2E',
          green: '#7FB069',
          burgundy: '#C75B7A',
          cream: '#F5E6CC',
          muted: '#8A8A9A',
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
