/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        primary: '#136dec',
        'background-light': '#f6f7f8',
        'background-dark': '#101822',
        'text-light': '#111418',
        'text-dark': '#f0f2f4',
        'text-secondary-light': '#617289',
        'text-secondary-dark': '#a0b1c5',
        'border-light': '#dbe0e6',
        'border-dark': '#344154',
        'card-light': '#ffffff',
        'card-dark': '#182330',
        'hover-light': '#f0f2f4',
        'hover-dark': '#212e3d',
        success: '#36B37E',
        warning: '#FFAB00',
        error: '#DE350B',
        apple: {
          blue: '#007AFF',
          gray: {
            1: '#F5F5F7',
            2: '#E5E5EA',
            3: '#D1D1D6',
            4: '#8E8E93',
            5: '#636366',
            6: '#48484A',
            7: '#1C1C1E',
          },
        },
      },
      fontFamily: {
        display: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'apple': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'apple-lg': '0 8px 30px rgba(0, 0, 0, 0.12)',
        'apple-xl': '0 12px 40px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'apple': '18px',
        'apple-lg': '24px',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}

