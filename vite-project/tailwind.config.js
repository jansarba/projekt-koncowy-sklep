/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#343131",
        dark: "#272525",
        darker: "#1a1919",
        darkes: "#141313",
        darkest: "#0d0c0c",
        light: "#3B3737",
        lighter: "#413d3d",
        lightest: "#4e4a4a",
        secondary: "#A04747",
        tertiary: "#D8A25E",
        detail: "#EEDF7A",
        text: "#F1F5F9",
        texthover: "#C0C4C7",
      },
      keyframes: {
        popOut: {
          '0%': { transform: 'scale(0.9)', opacity: 0 },
          '50%': { transform: 'scale(1.1)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
      animation: {
        'pop-out': 'popOut 0.4s ease-out',
      },
    },
  },
  plugins: [],
}

