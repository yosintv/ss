import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      boxShadow: {
        card: 'var(--card-shadow)'
      }
    }
  },
  plugins: []
} satisfies Config
