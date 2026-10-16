/**
 * @module client/entries/landing.client
 * @layer client-ssr
 * @responsibility MPA landing 入口水合（Rspack entry: landing）
 */
import { hydrateRoot } from 'react-dom/client';
import { hydrateSsrFromWindow } from '@src/stores/index.js';
import { LandingPage } from '@src/pages/landing/LandingPage';
import '@src/styles/bundle.css';

hydrateSsrFromWindow();

const container = document.getElementById('root');
if (!container) {
  throw new Error('#root not found');
}

hydrateRoot(container, <LandingPage />);
