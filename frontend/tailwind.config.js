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
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        'ui-xs': ['12px', '16px'],
        'ui-sm': ['14px', '20px'],
        'ui-base': ['16px', '24px'],
        'ui-lg': ['18px', '26px'],
        'ui-xl': ['20px', '28px'],
        'ui-2xl': ['24px', '32px'],
        'ui-3xl': ['30px', '38px'],
        'ui-4xl': ['40px', '48px'],
      },
      colors: {
        background: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAFC',
        },
        text: {
          primary: '#0F172A',
          secondary: '#475569',
          muted: '#64748B',
        },
        border: {
          DEFAULT: '#E2E8F0',
        },
        primary: {
          DEFAULT: '#1D4ED8',
          hover: '#1E40AF',
        },
        success: {
          text: '#166534',
          bg: '#F0FDF4',
        },
        warning: {
          text: '#92400E',
          bg: '#FFFBEB',
        },
        danger: {
          text: '#B91C1C',
          bg: '#FEF2F2',
        },
      },
      borderRadius: {
        'button': '6px',
        'field': '6px',
        'panel': '8px',
        'modal': '12px',
      },
      maxWidth: {
        'public': '1200px',
        'dashboard': '1280px',
        'form': '640px',
        'column': '720px',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out forwards',
        'slide-up': 'slideUp 0.3s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography'),
  ]
};
