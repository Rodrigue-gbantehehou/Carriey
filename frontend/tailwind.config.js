/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      screens: {
        'xs': '300px',
      },
      colors: {
        brand: {
          bg: 'var(--bg-main)',
          text: 'var(--text-main)',
          muted: 'var(--text-muted)',
          cta: 'var(--color-cta)',
          'cta-hover': 'var(--color-cta-hover)',
        },
        // Surcharge globale de la couleur indigo pour adopter la couleur du logo (Bleu dominant #0771ea) partout
        indigo: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9deff',
          300: '#7cc2fe',
          400: '#36a3fa',
          500: '#0c87f2',
          600: '#0771ea',
          700: '#0055bd',
          800: '#054898',
          900: '#0b3e79',
          950: '#072753',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 1s ease-out forwards',
        'bounce-slow': 'bounceSlow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        bounceSlow: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-15px)' },
        },
      }
    }
  },
  plugins: []
};
