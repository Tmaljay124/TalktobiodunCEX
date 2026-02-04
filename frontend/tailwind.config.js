/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Manrope', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            colors: {
                background: '#050505',
                foreground: '#E5E5E5',
                card: {
                    DEFAULT: '#0A0A0A',
                    foreground: '#FFFFFF'
                },
                popover: {
                    DEFAULT: '#0A0A0A',
                    foreground: '#FFFFFF'
                },
                primary: {
                    DEFAULT: '#00E599',
                    foreground: '#000000'
                },
                secondary: {
                    DEFAULT: '#1A1A1A',
                    foreground: '#FFFFFF'
                },
                muted: {
                    DEFAULT: '#1A1A1A',
                    foreground: '#737373'
                },
                accent: {
                    DEFAULT: '#262626',
                    foreground: '#FFFFFF'
                },
                destructive: {
                    DEFAULT: '#FF0055',
                    foreground: '#FFFFFF'
                },
                border: '#262626',
                input: '#1A1A1A',
                ring: '#00E599',
                success: '#00E599',
                warning: '#FFB800',
                error: '#FF0055',
                info: '#00D8FF',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                },
                'fade-in': {
                    from: { opacity: '0', transform: 'translateY(10px)' },
                    to: { opacity: '1', transform: 'translateY(0)' }
                },
                'pulse-glow': {
                    '0%, 100%': { opacity: '1', boxShadow: '0 0 5px currentColor' },
                    '50%': { opacity: '0.5', boxShadow: '0 0 15px currentColor' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
