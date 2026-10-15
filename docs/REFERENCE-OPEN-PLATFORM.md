# 参考：mark-open-platform-preview

本仓库在**目录约定**与**部分能力**上对齐同事项目  
`/Users/JOYY/Downloads/project/mark-open-platform-preview`（Nest + 前端构建 + SSR 多页）。  
技术栈不同：参考项目为 **EMP + Nest 10**；本仓库为 **Rspack 2 + React 19 + pnpm monorepo**。

## 目录对照

| mark-open-platform-preview | nest-reactv19 | 说明 |
|----------------------------|---------------|------|
| `server/` | `apps/server/` | Nest HTTP、SSR 入口、静态/代理 |
| `src/` | `apps/client/src/` | React 页面、组件、路由 |
| `src/routes/` | `apps/client/src/routes/` | 路由表、导航配置（SPA） |
| `src/pages/` | `apps/client/src/pages/`、`mpa/` | 页面；MPA 独立 entry |
| `src/components/` | `apps/client/src/components/` | 可复用 UI |
| `src/hooks/` | `apps/client/src/hooks/` | 客户端 hooks（按需扩展） |
| `src/constants/` | `apps/client/src/constants/` | 布局、端口等常量 |
| `src/stores/` | `apps/client/src/stores/` | 状态（本仓库 Zustand 分层见 CLIENT-STATE） |
| `src/styles/` | `apps/client/src/styles/` | 全局样式 |
| `emp-config.js` / `webpack` | `apps/client/rspack.*.mjs` | 构建与 MF |
| `packages/shared`（无） | `packages/shared/` | 路由契约、`SsrPageState`（见 [PACKAGES.md](./PACKAGES.md)） |
| `LOCAL_RUN_GUIDE.md` | [LOCAL-RUN.md](./LOCAL-RUN.md) | 本地端口与启动顺序 |
| `.cursor/skills/open-platform` | `.cursor/skills/nest-reactv19-architecture` | AI 规范与 Git 提交说明 |

## 能力对照（可参考、不必 1:1）

| 能力 | 参考项目 | 本仓库 |
|------|----------|--------|
| SSR | Nest 渲染 | Nest `StreamDocumentStrategy` + `ssr.mjs` 流式 |
| 多页 | 多 EMP entry | SPA `main` + MPA `landing`（可增 entry） |
| 开发双进程 | Nest :3002 + EMP :8008 | Nest :3008 + Rspack :3100 |
| 权限演示 | 业务中间件 | `x-demo-role` + `PageAccessGuard` |
| MF | 有 | MF v2 + `mf-preload` 中间件 |
| 选页开发 `run-entry` | EMP 菜单 | `pnpm run-entry` + `DEV_CLIENT_ENTRIES` |
| Prettier | `format` / `format:platform` | `pnpm format` / `format:client` / `format:check` |
| 文档站 `docs:index` | 有 | 未移植 |
| 环境脚本 `env-start.sh` | 多环境 | 当前 `NODE_ENV` + `PORT`；见 LOCAL-RUN |

## 扩展新页面（对齐参考项目习惯）

1. **SPA 子路由**：改 `apps/client/src/routes/spa.routes.tsx`，页面放 `pages/`。
2. **MPA**：`PAGE_ROUTES` + `mpa/*.client.tsx` + `rspack.client.config.mjs` `entry`。
3. **服务端**：一般只改 `packages/shared` 路由契约；权限加 Guard。

## 本地路径

参考仓库默认在：

`~/Downloads/project/mark-open-platform-preview`

阅读其 `LOCAL_RUN_GUIDE.md`、`src/routes/index.tsx`、`.cursor/skills/open-platform/SKILL.md` 时，用上表映射到本 monorepo 路径即可。
