# Agent 指南（nest-reactv19）

## 强制（每条对话）

1. **Cursor Rule**：[`.cursor/rules/mandatory-skill-and-git-commit.mdc`](.cursor/rules/mandatory-skill-and-git-commit.mdc)（`alwaysApply: true`）— 无需用户每次 @skill。
2. **Skill（必须先 Read）**：[`.cursor/skills/nest-reactv19-architecture/SKILL.md`](.cursor/skills/nest-reactv19-architecture/SKILL.md)
3. **回复第一节**：`## Git 提交说明` 先 **`### 提交内容`**，**`### 建议标题`**（`feat: client16.3.0-中文简述`）放在本节**末尾**（Skill §5.1.1、§5.2）。写之前跑：`git status -sb`、`git status --short`、`git diff --stat`。
4. **勿自动 commit**：除非用户明确要求。

## 其它硬性要求

- 架构文件：`@module` `@layer` `@troubleshoot` 头块（Skill §2）
- 文档：`docs/ARCHITECTURE.md` 等（Skill §3）
- 完整回复结构：Skill §5

架构总览：[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
