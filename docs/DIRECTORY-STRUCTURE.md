# 目录结构（apps/client / apps/server）

面向「源码放哪、入口怎么挂」的快速索引。管道与契约见 [ARCHITECTURE.md](./ARCHITECTURE.md)。  
**server** 布局参考本地项目 `marki-info/server`（`modules/` + `middlewares/`）。

## apps/server

```
apps/server/src/
├── main.ts                 # 启动；dev 代理 / 生产静态
├── app.module.ts           # imports: modules/index
├── modules/
│   ├── index.ts            # 聚合 HealthModule、SsrModule…
│   ├── health/
│   └── ssr/
│       ├── ssr.controller.ts
│       ├── ssr.module.ts
│       ├── assets/
│       └── render/         # Guard → Enricher → Strategy → RendererLoader
├── middlewares/
│   ├── middleware.module.ts
│   ├── request-context/
│   ├── mf-preload/
│   ├── dev-proxy/          # main.ts 挂载
│   └── static/
```

| 场景 | 位置 |
|------|------|
| 新业务 Nest 模块 | `modules/<name>/` + 在 `modules/index.ts` 注册 |
| SSR 管道扩展 | `modules/ssr/render/{guards,enrichers,strategies}/` + `ssr.module.ts` |
| 请求横切（locals） | `middlewares/` + `middleware.constants.ts` |

内部 import：`@src/modules/…`、`@src/middlewares/…`（带 `.js` 后缀）。

## apps/client

```
apps/client/
├── rspack.*.mjs              # Rspack client / server 配置
├── scripts/
│   ├── dev.mjs
│   └── entries.config.mjs    # DEV_CLIENT_ENTRIES / CLIENT_ENTRIES 路径
└── src/
    ├── entries/              # Rspack entry（与 PAGE_ROUTES 的 script entry 对应）
    │   ├── main.client.tsx   # SPA → main.js
    │   ├── main.server.tsx   # SSR bundle → ssr.mjs（pipeDocument）
    │   └── landing.client.tsx# MPA → landing.js
    ├── pages/                # 按路由/页面分目录
    │   ├── home/
    │   ├── about/
    │   └── landing/
    ├── routes/               # SPA 壳与子路由表
    │   ├── SpaRoot.tsx
    │   └── spa.routes.tsx
    ├── render/
    │   └── createPageTree.tsx# SSR 按 matchPage 组树
    ├── components/           # 跨页面 UI
    ├── stores/               # Zustand + hydrate
    ├── mf/
    │   └── stubs/            # SSR 构建占位（远程仅浏览器 MF）
    ├── constants/
    ├── hooks/
    └── styles/               # marki-info 同源：reset/flex/common + index.scss 入口
        ├── index.scss          # SCSS 源入口
        ├── bundle.css          # compile-styles 生成（gitignore）
        ├── _reset.scss
        ├── _var.scss
        ├── flex.scss
        ├── common.scss
        └── _global.scss    # 本仓库演示页（.app / .ssr-meta）
```

## 约定

| 场景 | 位置 |
|------|------|
| 新 SPA 子路由 | `pages/<name>/` + `routes/spa.routes.tsx` + `packages/shared` `PAGE_ROUTES` |
| 新 MPA | `pages/<name>/` + `entries/<name>.client.tsx` + `entries.config.mjs` / `rspack.client.config.mjs` |
| SSR React 树分支 | `render/createPageTree.tsx` |
| MF 远程 SSR 占位 | `mf/stubs/*.stub.tsx`（`rspack.server.config.mjs` alias） |

内部 import 统一 `@src/…`；共享契约 `@app/shared`。
