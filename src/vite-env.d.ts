/// <reference types="vite/client" />

/**
 * Injected by `define` in vite.config.ts. These are literal string
 * substitutions at build time, not runtime lookups — which is why they are
 * bare globals rather than `import.meta.env` keys.
 */
declare const __COMMIT_SHA__: string;
declare const __COMMIT_DATE__: string;

interface ImportMetaEnv {
  /**
   * Where the contact form POSTs. A Formspree endpoint, e.g.
   * `https://formspree.io/f/xxxxxxxx`. Unset → the form does not pretend to
   * send anything; see `src/data/contact.ts`.
   */
  readonly VITE_FORM_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
