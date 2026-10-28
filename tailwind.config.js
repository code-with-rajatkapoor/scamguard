/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'red-100': '#fee2e2',
        'red-400': '#ef4444',
        'amber-100': '#fef3c7',
        'amber-400': '#f59e0b',
        'yellow-100': '#fef9c3',
        'yellow-400': '#eab308',
        'red-500': '#ef4444',
        'amber-500': '#f59e0b',
        'cyan-500': '#06b6d4',
        'red-500': '#ef4444',
        'emerald-500': '#10b984',
      },
    },
  },
  plugins: [],
};
