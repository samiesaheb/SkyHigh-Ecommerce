/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // ✅ Enables `class`-based dark mode (you’re using `.dark`)
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px', 
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      // Mobile-first custom breakpoints
      'mobile': {'max': '767px'},
      'tablet': {'min': '768px', 'max': '1023px'},
      'desktop': {'min': '1024px'},
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primary-foreground)",
        secondary: "var(--color-secondary)",
        "secondary-foreground": "var(--color-secondary-foreground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-muted-foreground)",
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
        destructive: "var(--color-destructive)",
        accent: "var(--color-accent)",
        "accent-foreground": "var(--color-accent-foreground)",
        card: "var(--color-card)",
        "card-foreground": "var(--color-card-foreground)",
        popover: "var(--color-popover)",
        "popover-foreground": "var(--color-popover-foreground)",
        // Enhanced accent colors
        "accent-rose": "var(--accent-rose)",
        "accent-rose-foreground": "var(--accent-rose-foreground)",
        "accent-gold": "var(--accent-gold)", 
        "accent-gold-foreground": "var(--accent-gold-foreground)",
        "accent-sage": "var(--accent-sage)",
        "accent-sage-foreground": "var(--accent-sage-foreground)",
        success: "var(--success)",
        "success-foreground": "var(--success-foreground)",
        warning: "var(--warning)",
        "warning-foreground": "var(--warning-foreground)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"), // ✅ If you're using `tw-animate-css`
    // require("@tailwindcss/forms"), // Optional but useful for styled <form> elements
  ],
};
