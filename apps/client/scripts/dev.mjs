import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const env = { ...process.env, NODE_ENV: 'development' };

function run(cmd, args, label) {
  const child = spawn(cmd, args, {
    cwd: root,
    env,
    stdio: 'inherit',
    shell: true,
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.error(`[${label}] exited with ${code}`);
      process.exit(code);
    }
  });
  return child;
}

run('node', ['scripts/compile-styles.mjs', '--watch'], 'styles');
run('rspack', ['build', '-c', 'rspack.server.config.mjs', '--watch'], 'server');
run('rspack', ['serve', '-c', 'rspack.client.config.mjs'], 'client');
