import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
    './styles/**/*.{css}'
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFCFA',
          100: '#F6F3EE',
          200: '#EDE9E3',
          300: '#E8E4DE',
          400: '#D4CFC8'
        },
        navy: {
          900: '#1B2A4A',
          800: '#243558',
          700: '#2D4066'
        },
        terracotta: {
          50: '#FDF0EB',
          100: '#F9DDD2',
          400: '#D4764A',
          500: '#C75C2A',
          600: '#B34E20',
          700: '#8C3D18'
        },
        sage: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          500: '#2D8A56',
          600: '#24713F'
        },
        amber: {
          50: '#FFF3E0',
          500: '#D4880F'
        },
        danger: {
          50: '#FDECEC',
          500: '#C43D3D'
        },
        info: {
          50: '#E3F2FD',
          500: '#3478C7'
        }
      },
      borderRadius: {
        card: '20px',
        button: '14px',
        chip: '100px'
      },
      boxShadow: {
        warmSm: '0 1px 3px rgba(120, 100, 80, 0.06)',
        warmMd: '0 4px 12px rgba(120, 100, 80, 0.08)',
        warmLg: '0 8px 30px rgba(120, 100, 80, 0.12)',
        warmXl: '0 16px 48px rgba(120, 100, 80, 0.16)'
      },
      fontFamily: {
        display: ['var(--font-display)', 'DM Sans', 'sans-serif'],
        body: ['var(--font-body)', 'Inter', 'sans-serif']
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      },
      animation: {
        shimmer: 'shimmer 1.5s linear infinite'
      }
    }
  },
  plugins: []
}

export default config
