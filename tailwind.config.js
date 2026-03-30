/** @type {import('tailwindcss').Config} */

// All gray shades point to CSS variables so opacity modifiers (bg-gray-800/40)
// AND text/border classes automatically adapt to light/dark mode.
const grayWithVar = Object.fromEntries(
  ['50','100','200','300','400','500','600','700','800','900','950'].map(s => [
    s, `rgb(var(--color-gray-${s}) / <alpha-value>)`
  ])
)

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: { gray: grayWithVar },
    },
  },
  plugins: [],
}
