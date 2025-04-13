/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        fontFamily: {
          sans: ['Arial', 'Helvetica', 'sans-serif'],
        },
      },
    },
    darkMode: 'class',
    plugins: [],
  };
  