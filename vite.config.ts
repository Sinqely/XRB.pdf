// Bygget ger en enda HTML-fil med all kod, alla arbetstrådar och typsnitt inbakade (ADR-001, ADR-009).
import preact from '@preact/preset-vite'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

export default defineConfig({
  plugins: [preact(), viteSingleFile({ removeViteModuleLoader: true })],
  build: {
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    modulePreload: false,
    target: 'es2022',
  },
  // Klassiska arbetstrådar: Chromium startar inte modul-arbetstrådar från blob när filen öppnas direkt från disken (file://).
  worker: { format: 'iife' },
})
