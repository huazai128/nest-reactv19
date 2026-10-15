# nest-reactv19 — NestJS + React 19 SSR（Rspack 2 / MF v2 / React Router 8）

基于 **pnpm monorepo** 的全栈 SSR：**流式 `renderToPipeableStream`**、**Rspack 2 + React Compiler**、**MF manifest 预加载中间件**，并支持 **SPA / MPA / SPA 内多路由**（React Router v8）。

## 文档与 AI 修改规范

| 文档 | 用途 |
|------|------|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | 分层、管道、契约、**排查指引** |
| [docs/CLIENT-STATE.md](docs/CLIENT-STATE.md) | Zustand：SSR 快照 vs UI store、颗粒化订阅 |
| [docs/LOCAL-RUN.md](docs/LOCAL-RUN.md) | 本地端口、双进程开发（对齐开放平台 LOCAL_RUN_GUIDE） |
| [docs/REFERENCE-OPEN-PLATFORM.md](docs/REFERENCE-OPEN-PLATFORM.md) | 与 mark-open-platform-preview 目录/能力对照 |
| [docs/PACKAGES.md](docs/PACKAGES.md) | **`packages/` 目录作用**、`@app/shared` 契约与分工 |
| [.cursor/skills/nest-reactv19-architecture/SKILL.md](.cursor/skills/nest-reactv19-architecture/SKILL.md) | **每次 AI 回复**须含 Git 提交说明 + 架构代码备注与文档标准 |
| [AGENTS.md](AGENTS.md) | Cursor Agent 入口摘要 |
| `.cursor/rules/mandatory-skill-and-git-commit.mdc` | **alwaysApply**：强制 Skill + 每条回复 Git 提交说明 |

改 middleware / SSR 管道 / 共享契约 / Rspack 配置时，**必须**按 Skill 为 touched 文件补充头块注释（`@module`、`@layer`、`@troubleshoot`）；**无代码备注不得视为改动完成**，并同步 `docs/ARCHITECTURE.md`。

## 架构

| 包 | 职责 |
|---|---|
| `apps/server` | HTTP 入口；`middleware/` 处理横切能力；`ssr/render/` 通用渲染管道（Guard → Enricher → Strategy） |
| `apps/client` | `pipeDocument` 流式 SSR、`main`（SPA）与 `landing`（MPA）双入口、MF v2 宿主 |
| `apps/remote-demo` | 可选 MF 远程 |
| [`packages/shared`](packages/shared/)（[`@app/shared`](docs/PACKAGES.md)） | 跨 client/server 的**纯契约**：路由表、SSR 状态（详见 [PACKAGES.md](docs/PACKAGES.md)） |

### 页面模式（`packages/shared/src/routing.ts`）

| 模式 | 说明 | 示例 |
|------|------|------|
| **SPA** | 单入口 `main.js`，`react-router` 管理 `/`、`/about` 等 | `path: '/*'` |
| **MPA** | 独立入口整页刷新 | `/landing` → `landing.js` |
| **SPA 多路由** | 路由表集中在 `routes/spa.routes.tsx` | `SpaRoot.tsx` 壳 |

### React Router v8 说明

v8 **已移除 `react-router-dom` 包**。本项目使用：

- `react-router` — `Link`、`Routes`、`StaticRouter` 等
- `react-router/dom` — `BrowserRouter`

Rspack 中提供别名 `react-router-dom` → `react-router`，便于迁移旧代码。

**最低版本（Router v8）：** Node 22.22+、React 19.2.7+。

### 流式 SSR

`entry.server.tsx` 导出 `pipeDocument(url, writable, meta)`，Nest `PageRenderService` + `StreamDocumentStrategy` 将响应设为 chunked 并 pipe 到客户端。

### Node 分层（`apps/server`）

```
middleware/          # 仅 HTTP 横切：鉴权上下文、MF 预加载、静态资源/dev 代理
  request-context/   # 解析 x-demo-role → res.locals.renderAuth
  mf-preload/        # manifest → res.locals.mfPreloadTags
ssr/
  ssr.controller.ts  # 薄控制器
  render/
    page-render.service.ts   # 编排 Guard → Enricher → Strategy
    guards/                  # 权限 / 业务准入（可增删）
    enrichers/               # head、脚本、__SSR_STATE__.server
    strategies/              # 流式 React SSR（可换 JSON/缓存策略）
    renderer/                # 加载 client ssr.mjs
  assets/                    # 按 entry 解析脚本
```

扩展新业务：实现 `RenderGuard` 或 `RenderEnricher` 并在 `ssr.module.ts` 注册到 `RENDER_GUARDS` / `RENDER_ENRICHERS`。

演示权限：`/about` 需 `about:read`，请求头 `x-demo-role: user` 或 `admin`。

### MF 预加载

`middleware/mf-preload` 解析 manifest，`MfPreloadEnricher` 写入 HTML `<head>`。

### 构建

- **Rspack 2.1+**：`builtin:swc-loader` 开启 `reactCompiler`（`REACT_COMPILER=0` 可关闭）
- **MF**：`shared.treeShaking: true`（client 构建）
- **MF + ESM**：client 侧保持 `output.module: false`；SSR bundle 为 **ESM `ssr.mjs`**
- **CSS**：Lightning CSS（`builtin:lightningcss-loader` + 生产环境 `LightningCssMinimizerRspackPlugin`）
- **构建耗时**：`rspack.stage-timing.plugin.mjs` 默认打印各阶段耗时（`[rspack:client]` / `[rspack:server]`）；关闭：`RSPACK_STAGE_TIMING=0`

## 环境

- **Node ≥ 22.22.0**（`package.json` `engines`）；可选在本目录 `fnm use` / `nvm use`（`.node-version` / `.nvmrc`），只影响当前终端。
- **pnpm@9.15.0**（与 `packageManager` 一致）：本机已全局安装即可；未安装时可用 `npm i -g pnpm@9.15.0` 或 `corepack enable`（若你其它项目用 yarn 且不想动 corepack，则只装 pnpm 全局即可）。

## 快速开始

```bash
pnpm install
pnpm run-entry    # 选 main / landing / 全部，并启动 client+server（推荐）
# 或
pnpm dev:client   # :3100
pnpm dev:server   # :3008
pnpm dev:remote   # 可选 :3101
```

```bash
pnpm format       # Prettier（见 .prettierrc）
pnpm format:check
```

- SPA：<http://localhost:3008/>、<http://localhost:3008/about>
- MPA：<http://localhost:3008/landing>

## 生产

```bash
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start
```

## 扩展新页面

1. 在 `PAGE_ROUTES` 增加 MPA 或调整 SPA 回落规则
2. MPA：新增 `mpa/*.client.tsx` 并在 `rspack.client.config.mjs` `entry` 注册
3. SPA 子路由：在 `SpaRoot.tsx` 增加 `<Route>`
4. 服务端无需改路由逻辑（自动 `matchPage` + 对应 script entry）
