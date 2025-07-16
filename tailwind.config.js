/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./views/**/*.ejs",
    "./views/*.ejs",
    "./partials/**/*.ejs",
    "./public/**/*.js" 
  ],
  theme: {
    extend: {},
  },
  
  plugins: [require('@tailwindcss/typography'), require('daisyui')],

    daisyui: {
    themes: ["light", "dark", "pastel"], 
  },

};

