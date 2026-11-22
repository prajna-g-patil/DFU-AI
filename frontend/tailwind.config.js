/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          DEFAULT: "#8B1538",
          dark: "#650D28",
          light: "#A81D45",
          hover: "#73112E",
          50: "#FDF2F4",
          100: "#FCE7EB",
          200: "#F7C5CD",
          800: "#650D28",
          900: "#4B091D",
        },
        canvas: "#F7F8FA",
        cardBg: "#FFFFFF",
        primaryText: "#202938",
        secondaryText: "#64748B",
        borderColor: "#E5E7EB",
        accent: {
          DEFAULT: "#EAF1F7",
          dark: "#D4E3F0",
          text: "#1E3A8A",
        },
        med: {
          success: "#13866A",
          warning: "#D99124",
          critical: "#D94848",
          info: "#2563EB",
          dark: "#1A2232",
          navy: "#202938",
          slate: "#334155",
        },
        wagner: {
          g1: "#13866A",
          g2: "#D99124",
          g3: "#EA580C",
          g4: "#D94848",
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'card': '0 2px 8px -1px rgba(32, 41, 56, 0.06), 0 1px 4px -1px rgba(32, 41, 56, 0.04)',
        'card-hover': '0 8px 24px -3px rgba(32, 41, 56, 0.09), 0 3px 8px -2px rgba(32, 41, 56, 0.05)',
        'burgundy-glow': '0 4px 14px 0 rgba(139, 21, 56, 0.25)',
      },
      borderRadius: {
        'card': '12px',
        'subtle': '8px',
      }
    },
  },
  plugins: [],
}
