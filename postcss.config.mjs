/*
 * postcss.config.mjs
 * PostCSS configuration integrating Tailwind CSS v4 for Next.js.
 * Processes @import "tailwindcss" into utility classes and design tokens.
 */

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
