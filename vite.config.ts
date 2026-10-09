import { execSync } from 'node:child_process';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
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

/** The repo's GitHub Pages URL — a working default, not a placeholder. */
const DEFAULT_SITE_URL = 'https://achinpp.github.io/APC';

export default defineConfig(({ mode }) => {
  // `loadEnv` with an empty prefix reads .env files the way the client does.
  // `process.env` alone would miss them: Vite does not load .env into the
  // Node process for the config file itself.
  const env = loadEnv(mode, process.cwd(), '');

  /**
   * Open Graph requires ABSOLUTE urls. A relative `og:image` is the classic
   * way to ship a link preview that renders blank on half the platforms that
   * read it, so the canonical origin is substituted into index.html at build
   * time rather than left to the crawler to resolve.
   */
  const siteUrl = (env.VITE_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, '');

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'inject-site-url',
        // `order: 'pre'` so the placeholders are gone before Vite's own HTML
        // handling walks the document looking for assets to rewrite.
        transformIndexHtml: {
          order: 'pre' as const,
          handler: (html: string) => html.replaceAll('%SITE_URL%', siteUrl),
        },
      },
    ],
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
  };
});
