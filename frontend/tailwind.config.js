/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Trust and calming color palette
        primary: {
          50: '#eff6ff',   // Very light blue - calming
          100: '#dbeafe',  // Light blue - peaceful
          200: '#bfdbfe',  // Soft blue - trustworthy
          300: '#93c5fd',  // Medium blue - reliable
          400: '#60a5fa',  // Bright blue - confident
          500: '#3b82f6',  // Primary blue - trustworthy
          600: '#2563eb',  // Dark blue - professional
          700: '#1d4ed8',  // Deep blue - secure
          800: '#1e40af',  // Navy blue - stable
          900: '#1e3a8a',  // Dark navy - authoritative
          950: '#172554',  // Very dark navy - premium
        },
        secondary: {
          50: '#f8fafc',   // Very light gray - clean
          100: '#f1f5f9',  // Light gray - neutral
          200: '#e2e8f0',  // Soft gray - gentle
          300: '#cbd5e1',  // Medium gray - balanced
          400: '#94a3b8',  // Muted gray - subtle
          500: '#64748b',  // Standard gray - reliable
          600: '#475569',  // Dark gray - professional
          700: '#334155',  // Deep gray - sophisticated
          800: '#1e293b',  // Very dark gray - premium
          900: '#0f172a',  // Almost black - authoritative
          950: '#020617',  // Pure black - strong
        },
        success: {
          50: '#f0fdf4',   // Very light green - fresh
          100: '#dcfce7',  // Light green - natural
          200: '#bbf7d0',  // Soft green - organic
          300: '#86efac',  // Medium green - healthy
          400: '#4ade80',  // Bright green - positive
          500: '#22c55e',  // Primary green - success
          600: '#16a34a',  // Dark green - growth
          700: '#15803d',  // Deep green - prosperity
          800: '#166534',  // Very dark green - abundance
          900: '#14532d',  // Darkest green - wealth
          950: '#052e16',  // Almost black green - security
        },
        warning: {
          50: '#fffbeb',   // Very light amber - warm
          100: '#fef3c7',  // Light amber - friendly
          200: '#fde68a',  // Soft amber - approachable
          300: '#fcd34d',  // Medium amber - welcoming
          400: '#fbbf24',  // Bright amber - optimistic
          500: '#f59e0b',  // Primary amber - attention
          600: '#d97706',  // Dark amber - caution
          700: '#b45309',  // Deep amber - warning
          800: '#92400e',  // Very dark amber - alert
          900: '#78350f',  // Darkest amber - critical
          950: '#451a03',  // Almost black amber - urgent
        },
        error: {
          50: '#fef2f2',   // Very light red - gentle
          100: '#fee2e2',  // Light red - soft
          200: '#fecaca',  // Soft red - mild
          300: '#fca5a5',  // Medium red - noticeable
          400: '#f87171',  // Bright red - clear
          500: '#ef4444',  // Primary red - error
          600: '#dc2626',  // Dark red - serious
          700: '#b91c1c',  // Deep red - critical
          800: '#991b1b',  // Very dark red - severe
          900: '#7f1d1d',  // Darkest red - urgent
          950: '#450a0a',  // Almost black red - emergency
        },
        // Calming and trust-inspiring background colors
        background: {
          DEFAULT: '#ffffff',      // Pure white - clean
          secondary: '#f8fafc',    // Very light blue-gray - calming
          tertiary: '#f1f5f9',     // Light blue-gray - peaceful
          warm: '#fefefe',         // Warm white - welcoming
        },
        surface: {
          DEFAULT: '#ffffff',      // Pure white - clean
          secondary: '#f8fafc',    // Very light blue-gray - calming
          tertiary: '#f1f5f9',     // Light blue-gray - peaceful
          elevated: '#ffffff',     // Pure white - elevated
          warm: '#fefefe',         // Warm white - welcoming
        },
        border: {
          DEFAULT: '#e2e8f0',     // Soft gray - gentle
          secondary: '#cbd5e1',    // Medium gray - balanced
          tertiary: '#94a3b8',     // Muted gray - subtle
          warm: '#f1f5f9',        // Light blue-gray - warm
        },
        text: {
          primary: '#0f172a',      // Very dark gray - readable
          secondary: '#475569',    // Medium gray - secondary
          tertiary: '#64748b',     // Muted gray - tertiary
          inverse: '#ffffff',      // White - inverse
          muted: '#94a3b8',        // Muted gray - subtle
          warm: '#334155',         // Warm gray - friendly
        },
        // Semantic colors for trust and calm
        ring: {
          DEFAULT: '#3b82f6',      // Trustworthy blue
          secondary: '#64748b',    // Reliable gray
          error: '#ef4444',        // Clear error
          success: '#22c55e',      // Positive success
          warning: '#f59e0b',      // Attention warning
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          'SF Mono',
          'Monaco',
          'Inconsolata',
          '"Roboto Mono"',
          'monospace',
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        // Softer, more calming shadows
        'sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'none': 'none',
        // Custom shadows for elevated surfaces
        'elevated': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05)',
        'elevated-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.05)',
        // Calming shadows
        'calm': '0 2px 4px 0 rgb(59 130 246 / 0.1), 0 1px 2px -1px rgb(59 130 246 / 0.1)',
        'trust': '0 2px 4px 0 rgb(34 197 94 / 0.1), 0 1px 2px -1px rgb(34 197 94 / 0.1)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'fade-out': 'fadeOut 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'scale-out': 'scaleOut 0.3s ease-in',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'breathe': 'breathe 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.02)' },
        },
      },
    },
  },
  plugins: [],
} 