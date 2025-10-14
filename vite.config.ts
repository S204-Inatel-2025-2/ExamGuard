import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
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
      reporter: ['text', 'json', 'html'],
      exclude: [
        'app/app.css',
        'app/routes.ts',
        'react-router.config.ts',
        '**/*.d.ts',
        '**/node_modules/**',
        '**/__tests__/**', 
        'app/root.tsx',
        'app/main.tsx',
        'app/entry.client.tsx',
        'app/entry.server.tsx',
        'app/+types/**',
        'components.json',
        'vite.config.ts',
        'vitest.setup.ts'
      ],
    },
  },
});