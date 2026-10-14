# 客户端（apps/client）

## 路径别名 `@src/`

`apps/client/src` 内模块互相引用使用 `@src/…`（配置见 `rspack.shared.mjs`、`tsconfig.json`）。共享类型使用 `@app/shared`。

TypeScript 须使用 `moduleResolution: "bundler"`（见 `apps/client/tsconfig.json`），否则继承根 `NodeNext` 时 IDE/`tsc` 无法解析 `@src/*`。Rspack 侧见 `rspack.shared.mjs` 的 `createResolve()`（`alias` + `TsconfigPathsPlugin`）。根目录已安装 `typescript` 并配置 `.vscode/settings.json` 使用工作区 TS；若仍红线，执行 **TypeScript: Restart TS Server**。若 dev 报 `Can't resolve '@src/…'`，在 `apps/client` 下重启 `pnpm dev`。

---

# 客户端状态（Zustand）

## 分层（保持清晰）

| Store | 文件 | 数据来源 | 谁可写 |
|-------|------|----------|--------|
| **SSR 快照** | `stores/ssr-store.ts` | Node `__SSR_STATE__` | 仅 `hydrateSsrFromWindow()` 一次 |
| **UI** | `stores/ui-store.ts` | 浏览器交互 | 客户端 action |

SSR 与 UI **分 store**，避免「点一下按钮 → 整页重读 SSR JSON」。

## 水合顺序

```
entry.client / landing.client
  → hydrateSsrFromWindow()   // 读 window，写入 ssrStore，删除 window 上的 key
  → hydrateRoot(…)           // React 树内用 selector hooks
```

## 颗粒化订阅约定

1. **页面组件**（如 `HomePage`）尽量不 `useStore`，只组合子组件。
2. **字段级 selector**：`useStore(store, (s) => s.oneField)` 或导出的 `useSsrPageId()`。
3. **动作与状态分离**：`useToggleSsrMetaExpanded()` 只拿函数，不订阅 `ssrMetaExpanded`。
4. 多字段对象用 `useShallow`（见 [Zustand docs](https://zustand.docs.pmnd.rs/hooks/use-shallow)），避免引用变化导致多余渲染。

## 扩展新业务状态

- 与权限/页面快照相关 → 扩展 `SsrPageState.server`（Node `ServerStateEnricher`）+ `ssr-store` selector。
- 纯前端交互 → 新建 `stores/xxx-store.ts` 或扩 `ui-store`，勿写入 `ssr-store`。
