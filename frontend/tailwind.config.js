/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2481cc',
          dark: '#1a6ba8',
          light: '#e8f4fd',
        },
        background: '#ffffff',
        surface: '#f8f9fa',
        text: {
          DEFAULT: '#1a1a1a',
          secondary: '#6c757d',
          light: '#adb5bd',
        },
        border: {
          DEFAULT: '#e9ecef',
          light: '#f1f3f5',
        },
        success: '#28a745',
        warning: '#ffc107',
        error: '#dc3545',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '24px',
      },
      boxShadow: {
        'sm': '0 1px 2px rgba(0, 0, 0, 0.05)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
