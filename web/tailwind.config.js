/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // Class strategy, not media: the site defaults to LIGHT and the visitor chooses. `media` would
  // hand that decision to the operating system and make the default whatever the machine happens
  // to be set to, which is not a default at all.
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        slate: {
          925: "#0d1320",
        },
        iris: {
          400: "#8b8cf7",
          500: "#6366f1",
          600: "#4f46e5",
        },
      },
    },
  },
  plugins: [],
};
