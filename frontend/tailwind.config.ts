// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}'
    ],
    theme: {
        extend: {
            colors: {
                border: 'var(--color-border)',
                input: 'var(--color-input)',
                ring: 'var(--color-ring)',
                background: 'var(--color-background)',
                foreground: 'var(--color-foreground)',
                primary: {
                    DEFAULT: 'var(--color-primary)',
                    foreground: 'var(--color-primary-foreground)',
                },
                secondary: {
                    DEFAULT: 'var(--color-secondary)',
                    foreground: 'var(--color-secondary-foreground)',
                },
                muted: {
                    DEFAULT: 'var(--color-muted)',
                    foreground: 'var(--color-muted-foreground)',
                },
                accent: {
                    DEFAULT: 'var(--color-accent)',
                    foreground: 'var(--color-accent-foreground)',
                },
                destructive: {
                    DEFAULT: 'var(--color-destructive)',
                },
                chart: {
                    1: 'var(--color-chart-1)',
                    2: 'var(--color-chart-2)',
                    3: 'var(--color-chart-3)',
                    4: 'var(--color-chart-4)',
                    5: 'var(--color-chart-5)',
                },
            },
            borderRadius: {
                lg: 'var(--radius-lg)',
                md: 'var(--radius-md)',
                sm: 'var(--radius-sm)',
                xl: 'var(--radius-xl)',
            },
        },
    },
    plugins: [],
};

export default config;
