import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const config = {
  plugins: [
    tailwindcss(),
    !process.env.VITEST && reactRouter(),
    tsconfigPaths()
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    include: ['app/**/*.test.{ts,tsx}'], 
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'html'], 
      exclude: [
        '**/node_modules/**',
        '**/__tests__/**', 
        '**/*.d.ts',
        'app/app.css',
        'app/routes.ts',
        'react-router.config.ts',
        'components.json',
        'vite.config.ts',
        'vitest.setup.ts',
        'cypress.config.ts',
        'build/**',
        'html/**',
        'cypress/**',
        'scripts/**',
        '.react-router/**',
        'app/+types/**',
        'app/root.tsx',
        'app/main.tsx',
        'app/entry.client.tsx',
        'app/entry.server.tsx',
      ],
    },
  },
};

export default defineConfig(config as any);