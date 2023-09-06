/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{tsx,ts,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1677ff',
        'gray-6': '#666',
      },
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
