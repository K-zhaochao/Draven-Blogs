---
order: 999
title: "TinaCMS写作注意事项"
---

# TinaCMS 写作注意事项

> 本文档记录在 TinaCMS 编辑器中写作时需要注意的事项，避免常见的格式问题。

## 1. 行内代码不要加粗或斜体

### 问题描述

在 TinaCMS 编辑器中，对**行内代码**（`code`）再施加**加粗**或**斜体**，最终渲染结果会只显示 `*` 星号字面量，而不是加粗/斜体的行内代码。

### 错误示例

```
*`TinaCMS`*     → 渲染为字面量 *`TinaCMS`*（星号未被解析为斜体）
**`GitHub`**    → 渲染为字面量 **`GitHub`**（星号未被解析为加粗）
```

### 正确写法

| 需求 | ❌ 错误写法 | ✅ 推荐写法 |
|------|-----------|-----------|
| 想强调行内代码 | `*`code`*` | 只用 `code`（行内代码本身已有视觉区分） |
| 想加粗行内代码 | `**`code`**` | 用 **code**（加粗普通文字，不用行内代码） |
| 必须两者兼有 | 在编辑器中操作 | 手动在 Markdown 文件中写 `**`code`**` |

### 原因

这是 TinaCMS rich-text 编辑器的已知限制。TinaCMS 基于 Slate 编辑器，将行内代码视为一种"元素类型"，将加粗/斜体视为"文本标记"，两者在序列化为 Markdown 时无法正确嵌套输出。

## 2. 图片使用建议

### 推荐方式

在 TinaCMS 编辑器中使用**媒体管理器**上传图片，图片会自动保存到 `docs/public/uploads/` 目录。

### 注意事项

- TinaCMS 上传的图片与 Obsidian 笔记的图片**完全隔离**，不会互相影响
- 图片路径会自动处理，无需手动编写路径
- 建议图片命名使用英文，避免中文路径的兼容性问题

## 3. Frontmatter 字段说明

TinaCMS 管理的文章包含以下 frontmatter 字段：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `title` | string | ✅ | 文章标题 |
| `order` | number | ❌ | 排序权重，数字越小越靠前，默认 999 |
| `tags` | string[] | ❌ | 文章标签列表 |

> ⚠️ 请不要手动修改 frontmatter 中 TinaCMS 自动生成的字段结构，以免造成编辑器识别异常。

## 4. 标题层级

- 文章的**一级标题**（`# 标题`）通常由 frontmatter 的 `title` 字段自动生成
- 文章正文建议从**二级标题**（`## 标题`）开始
- 不要跳级使用标题（如从 `##` 直接到 `####`）

## 5. 代码块

行内代码（`` `code` ``）和代码块（` ``` `）在 TinaCMS 中都可以正常使用：

````markdown
行内代码：使用 `console.log()` 输出

代码块：
```java
System.out.println("Hello");
```
````

> ⚠️ 注意：代码块中的内容不会被 TinaCMS 解析为富文本，所以代码块内不存在第 1 点的问题。

## 6. 链接

在 TinaCMS 编辑器中插入链接时：

- **外部链接**：直接输入完整 URL，如 `https://example.com`
- **站内链接**：使用相对路径，如 `[文章名](./文章名.md)`

## 7. 与 Obsidian 笔记的区别

| 维度 | Obsidian 笔记 | TinaCMS 文章 |
|------|-------------|-------------|
| 编辑器 | Obsidian 桌面端 | 浏览器 Web 端 |
| 存储位置 | `Draven_Note/` | `docs/thoughts/`、`docs/projects/` |
| 语法支持 | Obsidian 扩展语法（双链、Callout） | 标准 Markdown |
| 图片目录 | `Draven_Note_Images/` | `docs/public/uploads/` |
| 发布方式 | Obsidian Git 插件 → sync.mjs → CI | TinaCMS 直接提交 → CI |

> ⚠️ 不要在 TinaCMS 中使用 Obsidian 特有语法（如 `[双链](./双链.md)`、`> [!callout]`），TinaCMS 不认识这些语法。

## 8. 常见问题

### Q: 为什么我的文章没有出现在侧边栏？

A: 检查 frontmatter 中的 `order` 字段。如果 `order` 值很大（如 999），文章会排在最后。同时确保文件名不是 `index.md`（index.md 被 TinaCMS 排除管理）。

### Q: 如何预览文章效果？

A: 本地运行 `npm run tina:dev`，访问 `http://localhost:5173/admin/index.html` 即可在 TinaCMS 编辑器中预览。也可以直接访问文章对应的 URL 查看最终渲染效果。

### Q: TinaCMS 编辑器中看不到已有的文章？

A: 确保文章位于 TinaCMS 管理的目录中（`docs/thoughts/` 或 `docs/projects/`），且文件名不是 `index.md`。
