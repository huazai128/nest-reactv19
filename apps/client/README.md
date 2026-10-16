# apps/client

React 19 + Rspack 2 宿主：浏览器 bundle（`main` / `landing`）与 SSR bundle（`ssr.mjs`）。

## 开发

```bash
pnpm dev:client   # :3100
```

根目录 `pnpm run-entry` 可选只编译部分 entry。

## 源码布局

见 [docs/DIRECTORY-STRUCTURE.md](../../docs/DIRECTORY-STRUCTURE.md)。

要点：

- **entries/** — Rspack 入口，勿与 `pages/` 混放
- **routes/** — SPA 导航与 `Route` 配置
- **render/createPageTree.tsx** — 服务端与 `matchPage` 对齐的 React 树
- **styles/** — marki-info 同源 SCSS（`index.scss`）；开发/构建前由 `pnpm compile:styles` 生成 `bundle.css` 供 Rspack 引用
