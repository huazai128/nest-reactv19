/**
 * @module client/scripts/entries.config
 * @layer client-bundle
 * @responsibility Rspack client entry 清单与 DEV_CLIENT_ENTRIES 解析（run-entry 选页）
 * @troubleshoot 选页后 404 → PAGE_ROUTES clientEntry 与此处 key 须一致
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const clientRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
export const srcDir = path.join(clientRoot, 'src');

/** @type {Record<string, string>} */
export const CLIENT_ENTRIES = {
  main: path.join(srcDir, 'entries/main.client.tsx'),
  landing: path.join(srcDir, 'entries/landing.client.tsx'),
};

/** run-entry 菜单（与 packages/shared PAGE_ROUTES.clientEntry 对齐） */
export const DEV_ENTRY_MENU = [
  {
    id: 'main',
    label: 'SPA（main）',
    path: '/、/about …',
    entries: 'main',
  },
  {
    id: 'landing',
    label: 'MPA（landing）',
    path: '/landing',
    entries: 'landing',
  },
  {
    id: 'all',
    label: '全部入口',
    path: 'main + landing',
    entries: 'all',
  },
];

/**
 * @returns {Record<string, string>}
 */
export function resolveDevClientEntries() {
  const raw = process.env.DEV_CLIENT_ENTRIES;
  if (!raw || raw === 'all') {
    return { ...CLIENT_ENTRIES };
  }

  const names = raw.split(',').map((s) => s.trim()).filter(Boolean);
  /** @type {Record<string, string>} */
  const picked = {};
  for (const name of names) {
    if (CLIENT_ENTRIES[name]) {
      picked[name] = CLIENT_ENTRIES[name];
    }
  }
  return Object.keys(picked).length > 0 ? picked : { ...CLIENT_ENTRIES };
}
