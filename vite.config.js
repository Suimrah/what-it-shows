import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

// Pages are .svx (Markdown with components); every page names the runbook layout.
export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter(),
      extensions: ['.svelte', '.svx'],
      preprocess: [mdsvex({ extensions: ['.svx'], layout: { runbook } })],
      prerender: { handleHttpError: 'warn' },
    }),
  ],
});
