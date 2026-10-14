# nest-reactv19 架构备注与文档 — 参考

## 代码备注（硬性）

- **无头块注释 = 架构改动未完成**（见 SKILL §0）。
- 每个架构文件第一个语句前必须有 `/** @module … */` 块。

## 导入别名（apps/client / apps/server）

- `@src/*` → `apps/<app>/src/*`（各自 `tsconfig` `paths`）
- **client**：Rspack `srcPathAlias`；**server**：`tsc` + `tsc-alias`（`build` 脚本）
- 新代码禁止 `../` 跨目录相对路径；server ESM import 带 `.js` 后缀

## Git 提交标题（本仓库）

```text
<type>: <应用标识><版本号>-<中文功能简述>
```

示例：`feat: client16.3.0-侧栏组织名称超长省略`

## Git 提交说明模板（每条回复第一节）

`## Git 提交说明` 下**仅两个**三级标题；**最后一个**必须是 `### 建议标题（单行复制）`。

```markdown
## Git 提交说明

### 提交内容

**分支**：\`## main...origin/main\`

| 状态 | 路径 |
|------|------|
| M | path/to/file.tsx |

**diff 统计**：
\`\`\`text
（git diff --stat 完整输出）
\`\`\`

**变更说明（写入 commit body）**：
- 具体做了什么 1
- 具体做了什么 2

**可复制命令**：
\`\`\`bash
git add path/to/file.tsx
git commit -m "$(cat <<'EOF'
feat: client16.3.0-侧栏组织名称超长省略

- 具体做了什么 1
- 具体做了什么 2
EOF
)"
\`\`\`

### 建议标题（单行复制）
\`\`\`text
feat: client16.3.0-侧栏组织名称超长省略
\`\`\`
```

## @layer 枚举

（见原 SKILL reference — layer 表略，以 SKILL.md 为准）

## 变更记录行模板

```markdown
### YYYY-MM-DD — 简短标题
- **动机**：…
- **影响**：Breaking / 无
- **排查**：…
```
