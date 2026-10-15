# packages/

本目录存放 **pnpm workspace 共享包**（库，非可运行应用）。

当前仅有 [`shared/`](./shared/)（npm 名 `@app/shared`）：SSR 路由表与页面状态契约，供 `apps/client` 与 `apps/server` 共同引用。

完整说明见仓库根目录 **[docs/PACKAGES.md](../docs/PACKAGES.md)**。
