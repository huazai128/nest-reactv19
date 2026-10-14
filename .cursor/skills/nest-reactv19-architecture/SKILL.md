---
name: nest-reactv19-architecture
description: >-
  MANDATORY for every nest-reactv19 session (see .cursor/rules
  mandatory-skill-and-git-commit.mdc alwaysApply). Read this SKILL first each
  turn. Every reply MUST start with Git 提交说明 for git commit (run git status
  before answering). Also enforces code @module headers and docs sync.
---

# nest-reactv19 基础架构修改规范

> **触发方式**：`.cursor/rules/mandatory-skill-and-git-commit.mdc`（`alwaysApply: true`）要求**每条对话**先读本文并置顶 Git 提交说明。用户无需每次 @skill。

## 0. 硬性要求（未满足 = 任务未完成）

0. **会话入口**：处理任意用户消息前，Agent **必须先 Read 本 SKILL**（路径见上），再执行 §4 工作流。

1. **代码备注**：凡触及 §1 范围的新增/修改文件，**必须在首个 import 之前**写入 §2.1 头块注释；改动逻辑时**同步改注释**。禁止只改代码不备注。
2. **扩展点类注释**：Guard / Enricher / Strategy / Middleware 实现类**必须有** §2.2 类级说明（触发条件、副作用、顺序）。
3. **文档**：按 §3 更新 `docs/ARCHITECTURE.md`；用户可见行为改 `README.md`。
4. **交付**：回复必须包含 §5 **全部小节**（含 **Git 提交说明**），且列出**本次新增/更新了哪些文件的代码备注**。
5. **Git 提交说明（每次回复必写）**：结束前执行 `git status -sb`（有改动则加 `git diff --stat`），在回复中给出**可直接用于 `git commit -m` 的功能说明**（见 §5.1）。用户未要求执行 `git commit` 时**只输出说明、不自动提交**。

> 代码备注、文档、Git 说明三者同等重要：排查靠注释，协作靠提交说明。

修改本仓库**基础架构**（非纯 UI 文案）时，必须同时交付：**可排查的代码备注** + **同步的文档**。完成前对照 §6 检查清单。

## 1. 何时视为「基础架构变更」

- `apps/server/src/middleware/**`
- `apps/server/src/ssr/**`（含 `render/`、`assets/`）
- `apps/client` 的 `entry.*`、`rspack*.mjs`、`routing/`、`render/`、`stores/`
- `packages/shared` 的路由契约、`SsrPageState`、`SSR_STATE_KEY`
- 根 `package.json` / workspace 脚本 / Node 引擎要求

纯页面组件（`pages/`、`mpa/*` 展示）无管道契约变化时，可只改 UI，但仍建议更新相关 README 小节（若行为对用户可见）。

## 2. 代码备注标准（便于排查）— **强制**

**任何架构 PR / AI 改动**： touched 文件若无头块注释，须在本轮补全；仅改一行逻辑也须检查 `@troubleshoot` 是否仍准确。

### 2.1 文件头块注释（新增或改动的架构文件必写，无例外）

在**首个 import 之前**写块注释，固定字段：

```ts
/**
 * @module 相对路径，如 ssr/render/page-render.service
 * @layer   middleware | ssr-http | ssr-render | ssr-assets | client-ssr | client-bundle | shared-contract
 * @responsibility 一句话职责（禁止写「工具类」等空话）
 * @inputs  主要输入（Request、RenderContext、url…）
 * @outputs 主要输出（Response 流、statePatch、HTML 片段…）
 * @deps    关键依赖类名或模块
 * @troubleshoot 常见故障与定位方式（1～3 条）
 */
```

### 2.2 管道扩展点（Guard / Enricher / Strategy / Middleware）

实现类必须在类注释中写明：

- **触发条件**：什么请求 / 什么 `pathname` / 什么 `page.access`
- **拒绝或副作用**：HTTP 状态码、写入 `res.locals` / `statePatch` 的字段
- **顺序依赖**：是否必须在某个 Enricher 之后（在 `ssr.module.ts` 注册顺序中体现）

接口文件（`*interface.ts`）用 1～2 句说明扩展方式和注册位置（`RENDER_GUARDS` / `RENDER_ENRICHERS`）。

### 2.3 禁止与提倡

| 禁止 | 提倡 |
|------|------|
| 无信息注释 `// 处理请求` | `// Guard 拒绝时勿调用 Strategy，避免 headersSent 竞态` |
| 大段叙述业务背景 | 可链接 `docs/ARCHITECTURE.md` 章节 |
| 注释与实现不一致 | 改逻辑必须同 PR 改注释 |

### 2.4 日志与错误

- Nest `Logger` 上下文用**类名**；捕获 SSR bundle 缺失时保留 `bundlePath` 或 `renderer not loaded` 原文。
- 对用户可见的 403/503 HTML 应含**可行动提示**（如 `pnpm dev:client`、`x-demo-role`）。

### 2.5 模块导入（`apps/client` / `apps/server` 强制）

| 范围 | 写法 | 示例 |
|------|------|------|
| `apps/client/src/**` 内部互相引用 | **`@src/…`** | `import { HomePage } from '@src/pages/HomePage'` |
| `apps/server/src/**` 内部互相引用 | **`@src/…` + `.js` 后缀** | `import { SsrModule } from '@src/ssr/ssr.module.js'` |
| monorepo 共享契约 | **`@app/shared`** | `import { matchPage } from '@app/shared'` |
| npm 依赖 | 包名 | `import { Link } from 'react-router'` |

禁止在 `apps/client/src`、`apps/server/src` 内新增 `../` / `./` 跨目录相对路径。

| 应用 | TS / 构建 |
|------|-----------|
| **client** | `tsconfig` `moduleResolution: bundler` + `paths`；Rspack `createResolve()`（`alias` + `TsconfigPathsPlugin`，`rspack.shared.mjs`） |
| **server** | `tsconfig` `moduleResolution: bundler` + `paths` `@src/*`；**生产** `tsc` 后须跑 **`tsc-alias`**（见 `apps/server` `build` 脚本）；**开发** `tsx` 按 tsconfig 解析别名 |

ESM 下 **server** 与 client store 入口 import 建议带 **`.js` 后缀**（指向 emit 后的模块 id）：`@src/stores/index.js`、`@src/health.controller.js`。

## 3. 文档标准（必须同步）

| 变更类型 | 必须更新 |
|----------|----------|
| 新中间件 / locals 约定 | `middleware.constants.ts` 注释 + `docs/ARCHITECTURE.md` §Middleware |
| 新 Guard / Enricher / Strategy | `docs/ARCHITECTURE.md` §渲染管道 + `README.md` 扩展一节 |
| 路由 / MPA 入口 / `PAGE_ROUTES` | `packages/shared` 注释 + `docs/ARCHITECTURE.md` §页面模型 |
| Rspack / MF / 环境变量 | `README.md` 快速开始 + `docs/ARCHITECTURE.md` §构建 |
| 破坏性契约（state 字段、端口） | `docs/ARCHITECTURE.md` §契约与变更记录（追加一行日期说明） |

`README.md`：面向「怎么跑」；`docs/ARCHITECTURE.md`：面向「怎么拆、怎么查」。

## 4. AI 修改工作流（强制顺序）

1. **读**：`docs/ARCHITECTURE.md` + 受影响目录现有文件头注释。
2. **设计**：用 3～5 行说明层级是否仍满足（middleware 不渲染 React；render 不解析 JWT 细节等）。
3. **实现**：新文件带 §2.1 头块；扩展点带 §2.2 类注释。
4. **文档**：按 §3 表格更新；README 只写增量，细节进 ARCHITECTURE。
5. **Git**（三条命令必跑，结果写入「提交内容」）：
   - `git status -sb`
   - `git status --short`（或 `git diff --name-status`）
   - `git diff --stat`（已跟踪文件）；未跟踪新文件在文件列表标 `??`
6. **自检**：运行 §6 检查清单；若改了权限演示，写明请求头示例。

## 5. 输出给用户的消息格式

**本仓库内每一次 AI 回复**均须使用以下结构（不要省略、不要调换「Git 提交说明」位置）：

```markdown
## Git 提交说明
（见 §5.1：先 **提交内容**，**建议标题** 放在本节**最后**）

## 变更摘要
- …

## 代码备注
- 已补充/更新头块或类注释的文件：`path/a.ts`, …（无架构文件改动则写「无」）

## 文档
- 已更新：…（无则写「无」）

## 排查指引
- 现象 → 查哪一层 / 哪个文件 / 哪个 locals 或日志

## 验证
- 命令或 curl 示例
```

### 5.1 Git 提交说明（必填字段）

在回复**最前面**输出本节。须包含 **§5.1.1 提交内容**（文件 + diff），不能只给一行标题。

参考开放平台 Skill 习惯：标题单行可复制；**本仓库额外强制展示「提交内容」**，便于 review 后再 `git commit`。

#### 5.1.1 提交内容（强制展示）

用三级标题 `### 提交内容`，包含：

1. **分支**：`git status -sb` 首行原文。
2. **文件列表**：表格两列 `状态` | `路径`  
   - 来自 `git status --short`（`M`/`A`/`D`/`??`）或 `git diff --name-status` + 未跟踪文件。  
   - **仅列与本轮对话相关的路径**；若全仓未提交很多，注明「以下为本轮建议纳入本次 commit」。
3. **diff 统计**：`git diff --stat` **原文代码块贴出**（无已跟踪 diff 时写「无已跟踪文件 diff（均为新文件）」）。
4. **变更说明（commit body  bullets）**：2～8 条中文，写清**做了什么**（可对齐文件列表，禁止空泛「更新代码」）。
5. **可复制命令**（仍写在 `### 提交内容` 内）：`git add` + `git commit` HEREDOC（body 与「变更说明」一致；HEREDOC 第一行 subject 与 §5.1.2 标题相同）。

| 字段 | 要求 |
|------|------|
| **建议 git add** | 写在「提交内容」内，与文件表一致 |

#### 5.1.2 建议标题（Git 节**最后一节**，单独三级标题）

在 `### 提交内容` **全部写完后**，另起 **`### 建议标题（单行复制）`**（不得并入「提交内容」正文、不得放在其前面）：

- 仅含一个 `text` 代码块，一整行 subject，格式见 §5.2（例：`feat: server0.0.1-服务端源码统一@src别名并更新Skill`）。
- **`## Git 提交说明` 下最后一个三级标题必须是本节**；本节之后**只能**接 `## 变更摘要`（中间可有一条 `---`），禁止在标题后再补命令、表格或说明。

**Git 节推荐排版（照抄结构）**

```markdown
## Git 提交说明

### 提交内容

**分支**：\`## main...origin/main\`

| 状态 | 路径 |
|------|------|
| M | apps/client/src/routing/SpaRoot.tsx |
| M | apps/client/tsconfig.json |

**diff 统计**：
\`\`\`text
（粘贴 git diff --stat 输出）
\`\`\`

**变更说明（写入 commit body）**：
- …
- …

**可复制命令**：
\`\`\`bash
git add …
git commit -m "$(cat <<'EOF'
feat: client16.3.0-…

- …
EOF
)"
\`\`\`

### 建议标题（单行复制）
\`\`\`text
feat: client16.3.0-侧栏组织名称超长省略
\`\`\`
```

| 字段 | 要求 |
|------|------|
| **建议 commit 类型** | `feat` \| `fix` \| `docs` \| `refactor` \| `chore` \| `build` |
| **禁止** | 只有标题、无文件列表、无 diff 统计、无 body bullets；**禁止**把 `### 建议标题` 放在 `### 提交内容` 之前或夹在提交内容中间 |

**可复制 commit 模板（每次尽量给出）**

```bash
git add path/to/file1 path/to/file2
git commit -m "$(cat <<'EOF'
feat: client0.0.1-一句话功能简述

- 改动点与原因 1
- 改动点与原因 2
EOF
)"
```

### 5.2 提交标题格式（强制）

与团队规范一致，**subject 单行**写法：

```text
<type>: <应用标识><版本号>-<中文功能简述>
```

| 部分 | 规则 | 示例 |
|------|------|------|
| `type` | `feat` / `fix` / `docs` / `refactor` / `chore` / `build` | `feat` |
| `应用标识` | `client` \| `server` \| `remote` \| `shared` \| `root`（多包） \| `cursor`（规则/Skill） | `client` |
| `版本号` | 对应包 `package.json` 的 `version`（无点分隔符，紧接在标识后） | `16.3.0` → 合写 `client16.3.0` |
| `功能简述` | 中文，用户可感知的变化，不用文件名堆砌 | `侧栏组织名称超长省略` |

**标准示例（用户提供的格式）**

```text
feat: client16.3.0-侧栏组织名称超长省略
```

**本 monorepo 示例（版本取自各 app `package.json`，当前多为 `0.0.1`）**

- `feat: client0.0.1-接入Zustand颗粒化订阅`
- `build: client0.0.1-样式编译改用LightningCSS`
- `feat: server0.0.1-SSR渲染管道Guard与Enricher`
- `docs: cursor0.0.1-强制Skill与Git提交标题格式`

说明：

- **不要**使用 `feat(scope): 英文` 作为本仓库首选标题，除非用户明确要求旧格式。
- 多应用同次提交：用 `root0.0.1-…` 或拆成多个 commit。
- AI 输出「建议标题」时，必须给出**一整行**可直接粘贴的字符串（与上表一致）。

**纯问答、未改任何文件时**：仍输出「Git 提交说明」；`### 提交内容` 写「本轮无代码改动，无需提交」，可贴当前 `git status -sb` 备查。

## 6. 完成检查清单

```
架构修改检查清单：
- [ ] **所有**本次 touched 的架构文件含 @module @layer @responsibility @troubleshoot 头块（含 .mjs 构建配置）
- [ ] 未 touched 但逻辑依赖已变的外部文件，注释已交叉更新
- [ ] Guard/Enricher/Middleware 含触发条件与副作用说明
- [ ] middleware 与 ssr/render 职责未混写
- [ ] packages/shared 契约变更已反映到 client entry.server 与 types
- [ ] docs/ARCHITECTURE.md 已更新
- [ ] README.md 必要时已更新（命令、端口、演示头）
- [ ] 回复含「排查指引」小节
- [ ] 回复**开头**含「Git 提交说明」（§5.1 全字段）
- [ ] 已执行 status + status --short + diff --stat
- [ ] Git 节含 **§5.1.1 提交内容**（文件表 + diff + bullets + 命令），**建议标题在 Git 节最末**
```

## 附加说明

- 字段详解与示例见 [reference.md](reference.md)
- 仓库架构总览见 [docs/ARCHITECTURE.md](../../../docs/ARCHITECTURE.md)
