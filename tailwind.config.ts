import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        elx: {
          midnight: '#090B12',
          ink: '#171A20',
          graphite: '#393C41',
          muted: '#6B7280',
          fog: '#F4F4F4',
          blue: '#3E6AE1',
          violet: '#6C63FF',
          green: '#16A34A',
          gold: '#EAB308'
        },
      },
      boxShadow: {
        'elx-soft': '0 24px 80px rgba(9, 11, 18, 0.10)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
    },
  },
  plugins: [],
};
export default config;
