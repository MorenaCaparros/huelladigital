import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta del evento IAxMarDelPlata - ampliada para complementar el logo
        primary: {
          50: '#e6f2ff',
          100: '#b3d9ff',
          200: '#80c0ff',
          300: '#4da6ff',
          400: '#1a8cff',
          500: '#0066cc', // Azul principal
          600: '#0052a3',
          700: '#003d7a',
          800: '#002952',
          900: '#001429',
        },
        accent: {
          50: '#e6f7ff',
          100: '#b3e6ff',
          200: '#80d5ff',
          300: '#4dc4ff',
          400: '#1ab3ff',
          500: '#00a2e8', // Celeste
          600: '#0082ba',
          700: '#00618b',
          800: '#00415d',
          900: '#00202e',
        },
        // Tonos oscuros que complementan el logo
        dark: {
          50: '#f5f7fa',
          100: '#e4e9f0',
          200: '#c9d3e0',
          300: '#a1b1c7',
          400: '#7088a8',
          500: '#1a2332', // Azul oscuro del logo
          600: '#151c28',
          700: '#10161f',
          800: '#0a0f15',
          900: '#05070b',
        },
        neural: {
          light: '#a3c9e8', // Azul claro de los nodos
          medium: '#2d7bb6', // Azul medio
          dark: '#1e5a8e', // Azul oscuro
          darker: '#0f2d47', // Azul muy oscuro
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neural-bg': 'linear-gradient(135deg, #e6f2ff 0%, #b3d9ff 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in',
        'slide-up': 'slideUp 0.5s ease-out',
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
        }
      }
    },
  },
  plugins: [],
};
export default config;
