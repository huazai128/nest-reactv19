# 架构说明（nest-reactv19）

面向排查与扩展的说明。运行命令见 [LOCAL-RUN.md](./LOCAL-RUN.md)、[REFERENCE-OPEN-PLATFORM.md](./REFERENCE-OPEN-PLATFORM.md)。概览见 [README.md](../README.md)。  
AI 或人工修改基础架构时请遵循 [.cursor/skills/nest-reactv19-architecture/SKILL.md](../.cursor/skills/nest-reactv19-architecture/SKILL.md)。  
**所有架构文件须有 `@module` 头块注释（见 Skill §0）；无备注视为改动未完成。**  
AI 协作：每次回复须含 **Git 提交说明**（见 Skill §5.1）、[AGENTS.md](../AGENTS.md)。

## 1. 总览

```
浏览器 ──► Nest (apps/server)
              ├── middlewares/    横切：鉴权快照、MF 预加载（不写 React）
              ├── modules/ssr/    控制器 + render 管道 → ssr.mjs
              └── modules/health/  API 探针
                        ▲
                        └── apps/client dist/server/ssr.mjs（流式 React）
```

| 包 | 职责 |
|----|------|
| `packages/*` | Workspace **共享库**（非可运行应用）；见 [PACKAGES.md](./PACKAGES.md) |
| `packages/shared`（`@app/shared`） | `PAGE_ROUTES`、`matchPage`、`SsrPageState` / `SSR_STATE_KEY` |
| `apps/client` | Rspack 构建、`pipeDocument`、SPA/MPA 入口、Zustand（见 [CLIENT-STATE.md](./CLIENT-STATE.md)） |
| `apps/server` | 中间件 + 渲染管道 + 静态资源 |

## 2. Middleware 层

路径：`apps/server/src/middlewares/`（`MiddlewareModule` 由 `SsrModule` 引入）

| 组件 | 作用 | locals / 头 |
|------|------|-------------|
| `RequestContextMiddleware` | 演示鉴权（`x-demo-role`） | `Locals.renderAuth` |
| `MfPreloadMiddleware` | 拉取 MF manifest | `Locals.mfPreloadTags`、`x-mf-preload-ready` |
| `mountDevProxy` / `mountProdStatic` | 静态资源（在 `main.ts` 挂载） | — |

**排查**

- 无预加载 link：dev 时 Rspack `:3100` 是否启动；看响应头 `x-mf-preload-ready`
- 权限始终 guest：是否传 `x-demo-role: user|admin`

## 3. 渲染管道（modules/ssr/render）

入口：`PageRenderService.renderDocument`

```
matchPage(pathname) → RenderContext
  → foreach Guard（403 则结束）
  → foreach Enricher（headFragments / scriptTags / statePatch）
  → StreamDocumentStrategy → renderer.pipeDocument → Response chunked
```

| 扩展点 | 接口 | 注册 |
|--------|------|------|
| Guard | `RenderGuard` | `RENDER_GUARDS` in `ssr.module.ts` |
| Enricher | `RenderEnricher` | `RENDER_ENRICHERS` |
| Strategy | 新建 `execute(ctx)` 服务 | 替换 `PageRenderService` 注入 |

内置 Guard 示例：

- `SpaPathGuard`：`/about` 需要 `about:read`（见 `x-demo-role`）

Enricher：

- `ServerStateEnricher` → `window.__SSR_STATE__.server`（permissions / userId / roles）

**排查**

- **503 SSR 未就绪**：`RendererLoader` 找不到 `apps/client/dist/server/ssr.mjs` → `pnpm dev:client` 或 `pnpm build:client`
- **403**：看 Guard 返回 body；对照 `renderAuth.permissions`
- **白屏但 200**：浏览器控制台；确认 `scriptTags` 指向正确 entry（`main` / `landing`）

## 4. 页面模型（SPA / MPA）

定义：`packages/shared/src/routing.ts`

1. 先匹配 **MPA** 精确路径（如 `/landing` → `landing.js`）
2. 其余回落 **SPA**（`main.js` + `react-router` 子路由）

服务端与客户端共用 `matchPage`，避免入口不一致。

## 5. 流式 SSR 契约

客户端 `pipeDocument(url, writable, meta)`（`apps/client/src/entries/main.server.tsx`）：

| 字段 | 来源 |
|------|------|
| `meta.headExtra` | Enricher 拼接（含 MF preload） |
| `meta.scriptTags` | `AssetScriptEnricher` |
| `meta.statePatch` | 含 `server` 等，合并进 `SsrPageState` |

## 6. 构建与 Module Federation

- **路径别名**：`apps/client` / `apps/server` 源码内统一 `@src/…`（见 [CLIENT-STATE.md](./CLIENT-STATE.md) §别名、Skill §2.5）；server 生产构建 `tsc` 后执行 `tsc-alias` 将别名改写为相对路径供 Node ESM 加载
- Client：`rspack.client.config.mjs`（MF v2、`output.module: false`）
- Server bundle：ESM `ssr.mjs`，无 MF remotes（远程仅浏览器 lazy）
- React Compiler：`rspack.shared.mjs`，`REACT_COMPILER=0` 关闭
- **样式**：`builtin:lightningcss-loader`（`createCssRule`）；生产 client 叠加 `LightningCssMinimizerRspackPlugin`；`browserTargets` / `browserslist` 在 `rspack.shared.mjs`

## 7. 变更记录

### 2026-10-15 — server 源码目录对齐 marki-info

- **动机**：功能模块进 `modules/` 聚合；HTTP 横切统一 `middlewares/` 命名
- **影响**：`ssr/` → `modules/ssr/`；`middleware/` → `middlewares/`；`health` → `modules/health/`；`AppModule` 经 `modules/index.ts` 注册
- **排查**： [DIRECTORY-STRUCTURE.md](./DIRECTORY-STRUCTURE.md) §server

### 2026-10-15 — client 源码目录整理

- **动机**：入口、路由、页面、MF 占位职责分离，便于扩展 MPA/SPA
- **影响**：`entry.*` → `entries/`；`routing/` → `routes/`；`mpa/` 页面 → `pages/landing/`；MF stub → `mf/stubs/`
- **排查**： [DIRECTORY-STRUCTURE.md](./DIRECTORY-STRUCTURE.md)；Rspack entry 路径见 `scripts/entries.config.mjs`

### 2026-10-14 — Nest 默认端口 3008

- **动机**：与本地其它服务错开默认 3000
- **影响**：默认 `PORT` 未设置时监听 **3008**（仍可用环境变量 `PORT` 覆盖）
- **排查**：`apps/server/src/main.ts`；访问 <http://localhost:3008/>

### 2026-10-14 — 中间件目录 + 通用渲染管道

- **动机**：middleware 与 SSR 职责分离；Guard/Enricher 可扩展权限与业务
- **影响**：无破坏性；`SsrPageState.server` 为增量字段
- **排查**：见本文 §2、§3
