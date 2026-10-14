/**
 * @module client/mpa/landing.client
 * @layer client-ssr
 * @responsibility MPA landing 入口水合
 */
import { hydrateRoot } from 'react-dom/client';
import { hydrateSsrFromWindow } from '@src/stores/index.js';
import { LandingPage } from '@src/mpa/LandingPage';
import '@src/styles/global.css';

hydrateSsrFromWindow();

const container = document.getElementById('root');
if (!container) {
  throw new Error('#root not found');
}

hydrateRoot(container, <LandingPage />);
