/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/content/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      zIndex: {
        9999: "9999",
      },
    },
  },
};
