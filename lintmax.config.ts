import { defineConfig } from 'lintmax'
export default defineConfig({
  ignores: ['lib/ui/**'],
  oxlint: {
    off: ['react/no-unstable-default-props']
  }
})
