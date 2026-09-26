import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#FDFBF5',
          100: '#FBF5E6',
          200: '#F6E8C5',
          300: '#F0D69A',
          400: '#E7BD65',
          500: '#D49D34',
          600: '#B87F22',
          700: '#94601A',
          800: '#754917',
          900: '#5A3614',
          950: '#38200A',
        },
        royal: {
          50: '#F0F7F5',
          100: '#DBEDE8',
          200: '#B8DBD2',
          300: '#8AC1B3',
          400: '#5DA392',
          500: '#3D8574',
          600: '#2C695B',
          700: '#1F4F44',
          800: '#173D35',
          900: '#0F2C26',
          950: '#071A16',
        },
        burgundy: {
          500: '#8A1C29',
          600: '#721320',
          700: '#580B16',
        },
        cream: {
          50: '#FAF8F5',
          100: '#F5F2EB',
          200: '#ECE6D9',
          300: '#DFD7C4',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-outfit)', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'gold-sm': '0 2px 8px -2px rgba(212, 157, 52, 0.15)',
        'gold-md': '0 8px 24px -4px rgba(212, 157, 52, 0.2)',
        'gold-lg': '0 16px 32px -6px rgba(212, 157, 52, 0.25)',
      },
    },
  },
  plugins: [],
};

export default config;
