/**
 * @module client/scripts/compile-styles
 * @layer client-bundle
 * @responsibility 将 src/styles/index.scss 编译为 bundle.css（Rspack 仅消费 CSS）
 */
import { watch, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as sass from 'sass-embedded';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const stylesDir = path.join(root, 'src/styles');
const entryScss = path.join(stylesDir, 'index.scss');
const outCss = path.join(stylesDir, 'bundle.css');

export function compileStyles() {
  const result = sass.compile(entryScss, {
    loadPaths: [stylesDir],
    style: 'expanded',
  });
  return result.css;
}

function writeBundle() {
  const banner =
    '/* generated from index.scss — do not edit; pnpm compile:styles */\n';
  writeFileSync(outCss, banner + compileStyles(), 'utf8');
  console.log('[styles] wrote src/styles/bundle.css');
}

writeBundle();

if (process.argv.includes('--watch')) {
  watch(stylesDir, { recursive: true }, (_event, filename) => {
    if (!filename || filename === 'bundle.css') {
      return;
    }
    try {
      writeBundle();
    } catch (err) {
      console.error('[styles] compile failed:', err);
    }
  });
  console.log('[styles] watching src/styles…');
}
