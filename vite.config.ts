import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Vite inlines files under 4 KB as data: URIs. The CSP in vercel.json only
    // allows fonts from the site itself (font-src 'self'), so a tiny font subset
    // (Cyrillic-ext, ~1.7 KB) would be blocked. Keep fonts as real files;
    // everything else uses Vite's default rule.
    assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|otf)$/.test(filePath) ? false : undefined),
  },
})
