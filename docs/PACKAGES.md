# packages/ 目录说明

本仓库是 **pnpm workspace** monorepo：`apps/*` 放可运行应用，`packages/*` 放**跨应用复用的库**（不单独部署、不监听端口）。

```
nest-reactv19/
├── apps/          # 可运行：client（Rspack）、server（Nest）、remote-demo（MF）
└── packages/      # 纯 TypeScript 契约与工具，被 apps 依赖
    └── shared/    # 包名 @app/shared（当前唯一 workspace 包）
```

工作区声明见根目录 [`pnpm-workspace.yaml`](../pnpm-workspace.yaml)。

## packages/ 主要作用

| 目的 | 说明 |
|------|------|
| **避免双份真相** | 同一份路由表、SSR 状态形状在 **Nest 与 React** 里各写一遍会漂移；集中到 `packages/shared`。 |
| **无 UI、无 IO** | 不放 React 组件、不放 Nest 模块、不访问 `fs`/`fetch`；只做类型、常量、纯函数。 |
| **构建边界清晰** | `apps/client` / `apps/server` 各自 Rspack、tsc 构建；shared 仅 `tsc --noEmit` 做类型检查。 |
| **可扩展** | 未来可增加 `packages/eslint-config`、`packages/api-types` 等；**业务页面仍在 `apps/client`**。 |

与参考项目 mark-open-platform-preview 对比：对方路由/类型多在单仓 `src/` 内；本仓库把 **SSR 契约** 抽到 `packages/shared`，对应其「前后端必须一致」的那部分逻辑。

## 当前包：`@app/shared`

路径：`packages/shared/`  
引用：`import { … } from '@app/shared'`（`apps/client`、`apps/server` 的 `package.json` 里为 `workspace:*`）。

### 职责一览

| 模块 | 文件 | 谁在用 | 内容 |
|------|------|--------|------|
| 页面路由契约 | `src/routing.ts` | server `matchPage`、Guard；client SSR 选树 | `PAGE_ROUTES`、`matchPage`、`PageRouteDefinition` |
| SSR 状态 | `src/index.ts` | `entry.server` 序列化；client `hydrateSsrFromWindow` | `SSR_STATE_KEY`、`SsrPageState`、`createInitialState` |
| 服务端上下文 | `SsrServerContext` | Enricher 写入 `state.server` | 权限演示字段等 |

### 数据流（为何必须放 packages）

```text
请求 pathname
    → server: matchPage(pathname)     // @app/shared
    → Guard / Enricher 改 statePatch
    → client bundle: createInitialState + pipeDocument
    → HTML 内 <script>__SSR_STATE__</script>
    → browser: hydrateSsrFromWindow()  // 同一 SsrPageState 类型
```

任一步的类型或字段在 client/server 各定义一份，极易出现「服务端有字段、前端 TS 不知道」或 entry 名不一致。

### 与 `apps/client` 的分工

| 放在 `@app/shared` | 放在 `apps/client` |
|--------------------|---------------------|
| `PAGE_ROUTES`、`clientEntry` 名称（`main` / `landing`） | Rspack `entry` 文件路径（`entries.config.mjs`） |
| `matchPage` 规则 | `routes/spa.routes.tsx` 内 react-router 子路由 |
| `SsrPageState` 字段 | Zustand store、页面 UI |
| `SSR_STATE_KEY` 常量 | `window` 读写实现 |

**规则**：改 `PAGE_ROUTES` 或 `SsrPageState` 时，必须同时检查 server Enricher、client `entry.server.tsx` / stores，并跑 `pnpm typecheck`。

### 与 `apps/server` 的分工

| server 负责 | shared 只提供 |
|-------------|----------------|
| HTTP、中间件、流式 HTML | 路由匹配结果、状态 **形状** |
| `PageAccessGuard` 读 `access.permissions` | `PageRouteDefinition.access` 元数据 |
| 加载 `ssr.mjs`、写 Response | 无运行时 Nest 代码 |

## 如何新增 workspace 包

1. 在 `packages/<name>/` 新建 `package.json`，`name` 建议 `@app/<name>`。
2. 根 `pnpm-workspace.yaml` 已包含 `packages/*`，无需改（新目录自动纳入）。
3. 在需要的 app 里：`"@app/<name>": "workspace:*"`，然后 `pnpm install`。
4. **何时新建包**：多 app 共用且与 UI/框架无关（契约、校验、纯工具）。仅 client 用的放 `apps/client/src`。

## 命令

```bash
pnpm --filter @app/shared typecheck
pnpm -r typecheck   # 含 shared + 各 app
```

## 相关文档

- [ARCHITECTURE.md](./ARCHITECTURE.md) — 管道与页面模型
- [CLIENT-STATE.md](./CLIENT-STATE.md) — 浏览器侧如何消费 `SsrPageState`
- [REFERENCE-OPEN-PLATFORM.md](./REFERENCE-OPEN-PLATFORM.md) — 与开放平台仓库对照
