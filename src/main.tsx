import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fonts first: hand-rolled @font-face (latin only) ahead of the token sheet
// so Tailwind's generated layers stay last in source order.
import '@/styles/fonts.css';
import '@/styles/globals.css';
import { App } from '@/App';

const container = document.getElementById('root');
if (!container) throw new Error('Root element #root not found');

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
