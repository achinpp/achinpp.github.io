import { execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * Build-time git info for the footer's `LAST_BUILD` line.
 *
 * Wrapped in try/catch rather than assumed: a deploy may run from a tarball
 * with no `.git` at all, and a build that dies because it couldn't find a
 * commit hash for a footer label would be an absurd way to fail. Shallow
 * clones (the default on most CI) still answer `rev-parse HEAD` and
 * `log -1`, so this works on Vercel and Netlify as-is.
 */
function git(command: string, fallback: string) {
  try {
    return execSync(`git ${command}`, { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return fallback;
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    __COMMIT_SHA__: JSON.stringify(git('rev-parse --short HEAD', 'unknown')),
    __COMMIT_DATE__: JSON.stringify(git('log -1 --format=%cI', new Date().toISOString())),
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
});
