/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#090D16',       // Deep navy dark base
          panel: '#101725',    // Lighter dark panels
          border: '#1E293B',   // Premium subtle borders
          cyan: '#06B6D4',     // Primary cyber cyan
          blue: '#3B82F6',     // Electric blue accent
          green: '#10B981',    // Verified green
          red: '#EF4444',      // Tampered red
          muted: '#64748B'     // Cool gray description
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif']
      },
      boxShadow: {
        'glow-cyan': '0 0 15px rgba(6, 182, 212, 0.15)',
        'glow-blue': '0 0 15px rgba(59, 130, 246, 0.15)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.25)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.25)'
      }
    },
  },
  plugins: [],
}
