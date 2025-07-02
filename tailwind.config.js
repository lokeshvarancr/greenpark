/** @type {import('tailwindcss').Config} */
module.exports = {
  // 1. Content: Where Tailwind looks for classes to purge (optimize)
  content: [
    "./index.html", // Your main HTML file
    "./src/**/*.{js,ts,jsx,tsx}", // All your React components
    // If you have a 'pages' directory like Next.js, add:
    // "./pages/**/*.{js,ts,jsx,tsx}",

    // Shadcn UI components (IMPORTANT!)
    // This path depends on where shadcn-ui adds its components.
    // It's usually in `src/components/ui` if you've run `npx shadcn-ui@latest init`
    "./components/**/*.{ts,tsx}",
  ],
  // 2. Dark Mode: How Tailwind handles dark mode
  darkMode: ["class"], // 'class' means it applies based on a 'dark' class on the HTML tag
  // 3. Theme: Where you define your design system's colors, fonts, spacing, etc.
  theme: {
    // Container: Optional, can define default container properties
    container: {
      center: true, // Centers the container horizontally
      padding: "2rem", // Adds padding to the container
      screens: {
        "2xl": "1400px", // Sets max-width for 2xl breakpoint
      },
    },
    // Extend: Add new theme values or override existing ones
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // --- Custom Colors for your dashboard, if you want them as Tailwind utilities ---
        // While your dashboard uses `Colors` object from `dashboardStyles.ts` with Styled Components,
        // if you wanted to use these colors directly as Tailwind classes (e.g., `bg-dashboard-card`),
        // you would define them here.
        'dashboard-background': '#F0F2F5',
        'dashboard-card': '#FFFFFF',
        'dashboard-text-primary': '#333333',
        'dashboard-text-secondary': '#666666',
        'dashboard-border': '#E0E0E0',
        'dashboard-accent-blue': '#3B82F6',
        'dashboard-accent-green': '#10B981',
        'dashboard-accent-red': '#EF4444',
        'dashboard-accent-yellow': '#F59E0B',
        'dashboard-accent-purple': '#8B5CF6',
        'dashboard-chart-grid': '#E5E7EB',
        'dashboard-chart-bar': '#60A5FA',
      },
      // Keyframes for custom animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      // Animation utilities using defined keyframes
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      // Spacing (optional, if you want to add more granular spacing than default)
      // E.g., `spacing: { '13': '3.25rem' }`
      // Fonts (optional, if you want to configure specific font families)
      fontFamily: {
        sans: ['Tenorite', 'sans-serif'],
      },
    },
  },
  // 4. Plugins: Add Tailwind CSS plugins
  plugins: [
    require("tailwindcss-animate"), // Used by Shadcn UI for animations
    require("daisyui"), // Added DaisyUI for dropdown and UI components
  ],
  daisyui: {
    themes: [
      {
        mytheme: {
          primary: "#1a1a1a",
          secondary: "#003cff",
          accent: "#00B0F0",
          neutral: "#190d25",
          "base-100": "#ffffff",
        },
      },
    ],
    defaultTheme: "mytheme",
  },
};