/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.04)',
        'glow': '0 0 40px rgba(34, 197, 94, 0.15)',
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        'brand-gradient': 'linear-gradient(135deg, #22c55e, #16a34a)',
        'card-gradient': 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(22,163,74,0.05))',
      },
    },
  },
  plugins: [],
}
