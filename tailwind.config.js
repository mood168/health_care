/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF7A3D',
          light: '#FFB23D',
          dark: '#E56A2D',
        },
        secondary: {
          DEFAULT: '#2196F3',
          light: '#4DB6FF',
          dark: '#0D87E9',
        },
        success: {
          DEFAULT: '#7ED957',
          light: '#A0E878',
          dark: '#5EBD37',
        },
        danger: {
          DEFAULT: '#e74c3c',
          light: '#ff6b6b',
          dark: '#c0392b',
        },
        warning: {
          DEFAULT: '#f39c12',
          light: '#ffb74d',
          dark: '#d68910',
        },
        background: {
          DEFAULT: '#f5f5f5',
          dark: '#121212',
        },
        card: {
          DEFAULT: '#ffffff',
          dark: '#1e1e1e',
        },
        text: {
          DEFAULT: '#333333',
          light: '#777777',
          dark: '#e0e0e0',
          'dark-light': '#a0a0a0',
        },
        border: {
          DEFAULT: '#e0e0e0',
          dark: '#333333',
        },
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      boxShadow: {
        'app': '0 10px 25px rgba(0, 0, 0, 0.1)',
        'card': '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
} 