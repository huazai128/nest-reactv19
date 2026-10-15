# 本地编译运行（nest-reactv19）

写法参考 mark-open-platform-preview 的 `LOCAL_RUN_GUIDE.md`，端口与命令以**本仓库**为准。

## 架构

| 角色 | 端口 | 说明 |
|------|------|------|
| **Nest（用户访问）** | **3008** | SSR、静态资源（生产）或代理 `/static`（开发） |
| **Rspack dev** | **3100** | 仅开发：HMR、client + server bundle watch |
| **MF remote（可选）** | **3101** | `apps/remote-demo` |

常量定义：`apps/client/src/constants/ports.ts`（与 README 同步）。

## 开发（推荐）

### 选页开发（对齐开放平台 `run-entry`）

只编译选中的 Rspack entry，加快 MPA 单页迭代：

```bash
pnpm install
pnpm run-entry
# 按提示选择 0=main(SPA) 1=landing(MPA) 2=全部
```

非交互（CI / 脚本）：

```bash
DEV_CLIENT_ENTRIES=landing pnpm dev:client
DEV_CLIENT_ENTRIES=main pnpm dev:client
```

### 全量开发

两个终端，或根目录并行：

```bash
pnpm install
pnpm dev:client   # Rspack :3100 + ssr.mjs watch（全部 entry）
pnpm dev:server   # Nest  http://localhost:3008
```

可选第三终端：

```bash
pnpm dev:remote   # :3101
```

**访问**

- SPA：<http://localhost:3008/>、<http://localhost:3008/about>
- MPA：<http://localhost:3008/landing>
- 权限演示：`curl -H 'x-demo-role: admin' http://localhost:3008/about`

勿把 **3100** 当作站点地址；浏览器应打开 **3008**（与参考项目「只访问 Nest、构建服务仅 HMR」一致）。

## 生产

```bash
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start
```

## 环境变量

| 变量 | 默认 | 说明 |
|------|------|------|
| `PORT` | `3008` | Nest 监听 |
| `CLIENT_DEV_ORIGIN` | `http://localhost:3100` | 开发静态代理目标 |
| `NODE_ENV` | `development` | 生产构建/启动设为 `production` |
| `RSPACK_STAGE_TIMING` | 开启 | 设 `0` 关闭 Rspack 阶段耗时日志 |
| `REACT_COMPILER` | 开启 | 设 `0` 关闭 React Compiler |

## 代码格式（Prettier）

与 mark-open-platform-preview 相同规则（根目录 `.prettierrc`）：

```bash
pnpm format          # 写入
pnpm format:check    # CI 校验
pnpm format:client   # 仅 apps/client
```

## 排查

| 现象 | 处理 |
|------|------|
| 503 / SSR 未就绪 | 先 `pnpm dev:client`，确认 `apps/client/dist/server/ssr.mjs` |
| 静态 404 | 开发：Rspack 是否在 3100；生产：是否 `pnpm build:client` |
| MF 远程失败 | `pnpm dev:remote`；Home 页 RemoteWidget |

更多架构说明：[ARCHITECTURE.md](./ARCHITECTURE.md)。
