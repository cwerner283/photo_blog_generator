module.exports = {
  content: [
    "./app/templates/**/*.html",
    "./app/static/js/**/*.js",
  ],
  theme: { /* … */ },
  plugins: [require('@tailwindcss/forms')],
};
