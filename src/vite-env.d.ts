/// <reference types="vite/client" />

// vite-plugin-eslint ships types but they don't resolve under "bundler"
// moduleResolution because of its package.json "exports" map.
declare module "vite-plugin-eslint" {
  import type { Plugin } from "vite";
  const eslintPlugin: (options?: Record<string, unknown>) => Plugin;
  export default eslintPlugin;
}
