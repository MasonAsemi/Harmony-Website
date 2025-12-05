/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
        colors: {
            border: "hsl(var(--border))",
            input: "hsl(var(--input))",
            ring: "hsl(var(--ring))",
            background: "var(--color-bg-light)",
            foreground: "hsl(var(--foreground))",
            primary: {
            DEFAULT: "hsl(var(--color-primary))",
            foreground: "hsl(var(--primary-foreground))",
            },
            secondary: {
            DEFAULT: "hsl(var(--color-secondary))",
            foreground: "hsl(var(--secondary-foreground))",
            },
            accent: {
            DEFAULT: "hsl(var(--color-accent))",
            foreground: "hsl(var(--accent-foreground))",
            },
            tertiary: {
            DEFAULT: "hsl(var(--color-tertiary))",
            foreground: "hsl(var(--tertiary-foreground))",
            },
            text: {
            primary: "var(--color-text-primary)",
            secondary: "var(--color-text-secondary)",
            light: "var(--color-text-light)",
            },
        },
        },
    },
    plugins: [],
}