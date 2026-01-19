/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic System Colors
        sys: {
          bg: {
            base: 'var(--sys-bg-base)',
            alt: 'var(--sys-bg-alt)',
          },
          text: {
            primary: 'var(--sys-text-primary)',
            secondary: 'var(--sys-text-secondary)',
            tertiary: 'var(--sys-text-tertiary)',
          },
          separator: 'var(--sys-separator)',
        },
        // Action / Key Colors
        action: {
          primary: 'var(--action-primary)',
          hover: 'var(--action-hover)',
        },
        // Feedback Colors
        feedback: {
          success: 'var(--feedback-success)',
          warning: 'var(--feedback-warning)',
          danger: 'var(--feedback-danger)',
        },
        // Apple Intelligence Gradient Colors
        ai: {
          cyan: '#00FFFF',
          magenta: '#FF00FF',
          yellow: '#FFD60A',
          blue: '#007AFF',
        },
        // Glass Materials
        glass: {
          sidebar: 'var(--mat-sidebar)',
          header: 'var(--mat-header)',
          hud: 'var(--mat-hud)',
          popover: 'var(--mat-popover)',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro"',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
        rounded: [
          '"SF Pro Rounded"',
          '-apple-system',
          'BlinkMacSystemFont',
          'sans-serif',
        ],
      },
      fontSize: {
        'large-title': ['34px', { lineHeight: '1.2', letterSpacing: '-0.02em' }],
        'title-1': ['28px', { lineHeight: '1.25', letterSpacing: '-0.015em' }],
        'title-2': ['22px', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'headline': ['17px', { lineHeight: '1.4', letterSpacing: '-0.01em', fontWeight: '600' }],
        'body': ['17px', { lineHeight: '1.5', letterSpacing: '0' }],
        'callout': ['16px', { lineHeight: '1.5', letterSpacing: '0' }],
        'subheadline': ['15px', { lineHeight: '1.4', letterSpacing: '0' }],
        'footnote': ['13px', { lineHeight: '1.4', letterSpacing: '0.01em' }],
        'caption-1': ['12px', { lineHeight: '1.3', letterSpacing: '0.02em', fontWeight: '500' }],
        'caption-2': ['11px', { lineHeight: '1.3', letterSpacing: '0.03em', fontWeight: '500' }],
      },
      borderRadius: {
        'window': '20px',
        'panel': '16px',
        'card': '12px',
        'button': '8px',
        'input': '8px',
      },
      spacing: {
        'sidebar': '260px',
        'inspector': '320px',
        'toolbar': '52px',
      },
      boxShadow: {
        'window': '0 20px 50px rgba(0, 0, 0, 0.15)',
        'panel': '0 10px 30px rgba(0, 0, 0, 0.1)',
        'hud': '0 20px 50px rgba(0, 0, 0, 0.15), 0 0 0 0.5px rgba(255, 255, 255, 0.5) inset',
        'button': '0 1px 2px rgba(0, 0, 0, 0.1)',
        'focus': '0 0 0 1px #FFFFFF, 0 0 0 4px rgba(0, 122, 255, 0.5)',
      },
      backdropBlur: {
        'sidebar': '20px',
        'header': '30px',
        'hud': '50px',
        'popover': '40px',
      },
      animation: {
        'ai-spin': 'ai-spin 4s linear infinite',
        'ai-shimmer': 'ai-shimmer 2s linear infinite',
        'fade-in': 'fade-in 0.3s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
      keyframes: {
        'ai-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'ai-shimmer': {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
