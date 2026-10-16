# apps/server

NestJS 宿主：中间件横切 + SSR 渲染管道（加载 `apps/client/dist/server/ssr.mjs`）。

## 开发

```bash
pnpm dev:server   # 默认 :3008
```

需先或并行 `pnpm dev:client` 以生成 / watch `ssr.mjs`。

## 源码布局

见 [docs/DIRECTORY-STRUCTURE.md](../../docs/DIRECTORY-STRUCTURE.md) §apps/server。

与 marki-info `server/` 对齐的约定：

- **`modules/`** — 按功能拆分 Nest Module，由 `modules/index.ts` 统一导出给 `AppModule`
- **`middlewares/`** — Express 横切（鉴权快照、MF preload）；`main.ts` 另挂 dev 代理与生产静态
