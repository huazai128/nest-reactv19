#!/usr/bin/env node
/**
 * @module scripts/run-entry
 * @layer root
 * @responsibility 交互选择 client entry，启动 dev:client + dev:server（参考开放平台 run-entry）
 * @troubleshoot 菜单无反应 → 在仓库根目录执行 pnpm run-entry
 */
import { spawn } from 'node:child_process';
import readline from 'node:readline/promises';
import path from 'node:path';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import { DEV_ENTRY_MENU } from '../apps/client/scripts/entries.config.mjs';

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

function runDev(env) {
  const common = {
    cwd: repoRoot,
    env: { ...process.env, NODE_ENV: 'development', ...env },
    stdio: 'inherit',
    shell: true,
  };
  spawn('pnpm', ['dev:client'], common);
  spawn('pnpm', ['dev:server'], common);
}

async function main() {
  const fromEnv = process.env.DEV_CLIENT_ENTRIES;
  if (fromEnv) {
    console.log(`[run-entry] 使用环境变量 DEV_CLIENT_ENTRIES=${fromEnv}`);
    runDev({ DEV_CLIENT_ENTRIES: fromEnv });
    return;
  }

  console.log('\n可用的入口列表：\n');
  DEV_ENTRY_MENU.forEach((item, index) => {
    console.log(
      `  ${index}) ${item.id.padEnd(8)} ${item.label}  →  ${item.path}`,
    );
  });
  console.log('');

  const rl = readline.createInterface({ input, output });
  const answer = await rl.question('请选择要运行的入口 (输入数字): ');
  rl.close();

  const index = Number.parseInt(answer.trim(), 10);
  const choice = DEV_ENTRY_MENU[index];
  if (!choice) {
    console.error('[run-entry] 无效选择');
    process.exit(1);
  }

  console.log(
    `\n[run-entry] 已选：${choice.label}（DEV_CLIENT_ENTRIES=${choice.entries}）`,
  );
  console.log('[run-entry] 启动 Rspack :3100 + Nest :3008 …\n');

  runDev({ DEV_CLIENT_ENTRIES: choice.entries });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
