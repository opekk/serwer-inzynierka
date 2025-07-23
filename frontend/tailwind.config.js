/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily:{
        inter: ['inter', 'sans-serif']
      },
      colors: {
        'custom-gray': '#3A404E'
      }
    },
  },
  plugins: [],
};
