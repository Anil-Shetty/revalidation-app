/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0059C8',
        blue: {
          100: '#98CBFF',
          200: 'rgb(3, 111, 227)',
          700: 'rgb(27, 39, 58)',
          800: 'rgb(17, 27, 43)',
          900: '#111B2B',
        },
        gray: {
          100: '#CFD9E0',
          200: 'rgb(207, 217, 224)',
          400: 'rgb(231, 235, 238)',
        },
      },
      boxShadow: {
        focus: 'rgb(152, 203, 255) 0px 0px 0px 3px',
      },
    },
  },
  plugins: [],
}
