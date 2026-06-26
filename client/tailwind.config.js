/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: { 50: '#eef2ff', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      borderRadius: {
        btn: '10px',
        card: '16px',
        modal: '20px',
      },
      boxShadow: {
        'ds-sm': '0 1px 2px rgba(16,24,40,0.04)',
        'ds-md': '0 4px 8px rgba(16,24,40,0.08)',
        'ds-lg': '0 10px 30px rgba(16,24,40,0.12)',
      },
    },
  },
  plugins: [],
};
