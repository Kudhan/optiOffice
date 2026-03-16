/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0B1120', // Deep Dark Navy from image
          900: '#111827',
          800: '#1F2937',
        },
        sky: {
          400: '#38BDF8',
          500: '#0EA5E9', // Clock In button Blue
        },
        slate: {
          900: '#0B1120',
        },
        action: {
          DEFAULT: '#0EA5E9',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      scale: {
        '102': '1.02',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards',
      }
    },
  },
  plugins: [],
}
