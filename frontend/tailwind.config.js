/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Drape brand palette — champagne gold luxury colors
        brand: {
          50:  '#faf9f5',
          100: '#f3f0e5',
          200: '#e5dec8',
          300: '#dfba6b', // Champagne Gold / Primary Accent
          400: '#cda34e',
          500: '#b3883b',
          600: '#986e2d',
          700: '#7d5622',
          800: '#624019',
          900: '#4b3011',
          950: '#1c1b12',
        },
        gold: {
          400: '#e0c068',
          500: '#dfba6b',
          600: '#cda34e',
        },
        surface: {
          DEFAULT: '#08080a', // Vogue Obsidian Black
          card:    '#111115', // Sleek Matte Black
          border:  '#23222a', // Bronze/charcoal border
          muted:   '#18171e', // Sleek Dark Gray
        }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #dfba6b 0%, #a27b38 100%)',
        'gradient-gold':  'linear-gradient(135deg, #dfba6b 0%, #b3883b 100%)',
        'gradient-card':  'linear-gradient(135deg, #111115 0%, #18171e 100%)',
        'gradient-luxury': 'linear-gradient(135deg, #18171e 0%, #08080a 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
