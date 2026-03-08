/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: '#DF7623',
        background: '#0a0a0f',
        foreground: '#e5e5e5',
        card: '#1a1a2e',
        'card-foreground': '#e5e5e5',
        popover: '#1a1a2e',
        'popover-foreground': '#e5e5e5',
        border: 'rgba(223, 118, 35, 0.2)',
        input: 'rgba(223, 118, 35, 0.2)',
        ring: '#DF7623',
        muted: '#1a1a2e',
        'muted-foreground': '#8a8a9e',
        accent: '#DF7623',
        'accent-foreground': '#ffffff',
        destructive: '#ff4757',
        'destructive-foreground': '#ffffff',
        secondary: '#1a1a2e',
        'secondary-foreground': '#e5e5e5',
        'tech-blue': '#00f5ff',
        'warning-red': '#ff4757',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Orbitron', 'sans-serif'],
      },
    },
  },
  plugins: [],
}