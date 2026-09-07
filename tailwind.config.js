/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        mq: {
          primary: 'var(--mq-primary)',
          'primary-hover': 'var(--mq-primary-hover)',
          secondary: 'var(--mq-secondary)',
          'secondary-hover': 'var(--mq-secondary-hover)',
          accent: 'var(--mq-accent)',
          background: 'var(--mq-background)',
          surface: 'var(--mq-surface)',
          'surface-muted': 'var(--mq-surface-muted)',
          border: 'var(--mq-border)',
        },
      },
      fontFamily: {
        display: ['var(--font-outfit)', 'sans-serif'],
        sans: ['var(--font-jakarta)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};
