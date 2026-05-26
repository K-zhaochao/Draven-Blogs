---
title: Draven's Blogs
category: other
github: K-zhaochao/Draven-Blogs
status: 进行中
techStack:
  - VitePress
  - Vue 3
  - TypeScript
  - TinaCMS
  - GitHub Actions
order: 1
stars: 0
lastPush: '2026-05-26'
language: JavaScript
description: 个人技术博客，记录学习笔记、项目实战与思考总结。
---

基于 VitePress + TinaCMS 的个人技术博客，自动同步 Obsidian 笔记，GitHub Actions 自动构建部署。

<!-- @sync-readme:start -->

> 以下内容由 `sync-projects.mjs` 自动从 [GitHub 仓库]() 的 README.md 同步。

# Draven's Blog ☕

[English](./README_en.md) | 简体中文

![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=java&logoColor=white)
![VitePress](https://img.shields.io/badge/VitePress-5C59F7?style=flat-square&logo=vite&logoColor=white)
![TinaCMS](https://img.shields.io/badge/TinaCMS-6DB33F?style=flat-square&logo=tinacms&logoColor=white)
![Obsidian](https://img.shields.io/badge/Obsidian-483699?style=flat-square&logo=obsidian&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

Hi，我是 **[K-zhaochao](https://github.com/K-zhaochao)**，一名 24 级计算机科学与技术专业的在校生。

这里是我的个人博客，用于记录学习、实践与思考。主要存放学习笔记、梳理技术栈（目前主攻 **Java 后端开发**），以及记录项目实战的踩坑过程。

### ✨ 特性

- 📝 **学习笔记** — Java、JavaWeb、Python 等，通过 Obsidian 编写，自动同步
- 💭 **思考与总结** — 通过 TinaCMS Cloud 可视化编辑
- 🚀 **项目实战** — 手搓/协作项目 + AI Vibe Coding，GitHub 状态自动追踪
- 🎨 **赛博朋克紫色主题** — 定制化的紫色调设计
- 🔍 **全文搜索** — 快速定位笔记内容
- 📱 **响应式设计** — 支持多端访问

---

## 💡 为什么有这个项目？

好记性不如烂笔头。看过再多教程，如果不转化为自己的输出，最终也会被慢慢遗忘。
建这个站的初衷，就是想搭建一个**低阻力、纯本地体验**的内容输出平台。在这个流程里，我只想安静地写 [Markdown](https://daringfireball.net/projects/markdown/)，剩下的排版和编译发布，统统交给自动化去完成。

---

## 🛠️ 核心亮点 & 工作流实现

这个仓库不仅仅是一套 [VitePress](https://vitepress.dev/) 模板，它同时运行着一套 **Obsidian + TinaCMS 双路径**的内容管理方案。

### 1. 学习笔记：Obsidian 本地编写

如果你也用 Obsidian 记笔记，你可能会懂这种痛楚：Obsidian 方便的双链 `[[ ]]` 和图片语法 `![[ ]]` 在绝大多数前端框架里根本没法直接展示。为了解决这个问题，我折腾了这样一套方案：

- **笔记源隔离**：记录真实内容的源文件全部放在 `Draven_Note` 文件夹中，VitePress 并不直接读取它们。我对笔记的管理完全依靠本地的 Obsidian。
- **图片素材零冗余**：通过 Windows 目录联接（`mklink /J`），把 Obsidian 存图片的本地文件夹，直接映射进了 VitePress 的 `public` 目录下。本地编写时前端服务器能热加载图片，却不需要在硬盘里存两份文件。
- **自动化语法清洗**：每次 `push` 到 GitHub 后，`scripts/sync.mjs` 会在云端自动遍历 `Draven_Note`，运用正则替换，把 Obsidian 专属的 `[[双向链接]]`、Callout 语法、内联图片路径，全部"格式化"成标准的 VitePress 语法。

### 2. 思考与项目：TinaCMS 可视化管理

除了学习笔记，博客中的**思考与总结**（`docs/thoughts/`）和**项目实战**（`docs/projects/`）部分通过 [TinaCMS](https://tina.io/) 进行管理：

- **Web 端编辑**：通过浏览器访问 `/admin/` 路径，即可使用 TinaCMS 的所见即所得编辑器
- **Git-based 存储**：所有内容直接存储在 Git 仓库的 Markdown 文件中，与 Obsidian 笔记完全隔离
- **零冲突**：TinaCMS 管理的内容与 Obsidian 笔记互不干扰，两套系统各司其职

### 3. 部署流程：全自动流水线

每次把代码 `push` 到 GitHub 后，`.github/workflows` 会自动完成以下步骤：

```
push to main
  → sync.mjs          (清洗 Obsidian 笔记语法)
  → tinacms build      (构建 TinaCMS Admin 面板)
  → vitepress build    (生成静态站点)
  → deploy to GitHub Pages
```

**一句话总结：Obsidian 管笔记、TinaCMS 管文章，本地写完 `git push`，剩下的交给 GitHub Actions 自动搞定。**

---

## 📁 项目结构

```
Draven-Blogs/
├── Draven_Note/              # Obsidian 笔记源（学习笔记）
│   ├── Java/                 #   Java 学习笔记
│   ├── JavaWeb/              #   JavaWeb 笔记
│   ├── Python/               #   Python 笔记
│   ├── 苍穹外卖/              #   项目实战笔记
│   └── Draven_Note_Images/   #   笔记图片资源
├── docs/                     # VitePress 前端项目
│   ├── .vitepress/           #   VitePress 配置 & 自定义主题
│   ├── notes/                #   ← sync.mjs 自动生成
│   ├── thoughts/             #   ← TinaCMS 管理（思考与总结）
│   ├── projects/             #   ← TinaCMS 管理（项目实战）
│   └── public/               #   静态资源（图片、Admin UI）
├── tina/                     # TinaCMS 配置
│   └── config.ts             #   Collection 定义
├── scripts/
│   └── sync.mjs              # Obsidian → VitePress 语法清洗脚本
└── .github/workflows/        # CI/CD 自动部署
```

---

## 🚀 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

> 💡 首次使用需要配置 TinaCMS 环境变量（详见下方 [CI/CD 部署](#️-cicd-部署) 章节）

> **Note**: `.env` 文件已配置在 `.gitignore` 中，不会被提交到仓库。

### 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 同步笔记 + 启动 TinaCMS + VitePress 开发服务器 |
| `npm run build` | 同步 + TinaCMS 构建 + VitePress 构建（生产环境） |
| `npm run sync` | 仅执行 Obsidian 笔记同步 |
| `npm run watch` | 监听笔记变化，实时同步 |
| `npm run tina:dev` | 仅启动 TinaCMS + VitePress（不同步笔记） |
| `npm run preview` | 预览构建产物 |

启动后：

- 博客首页：`http://localhost:5173/`
- TinaCMS 编辑器：`http://localhost:5173/admin/index.html`

---

## ⚙️ CI/CD 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages。Push 到 `main` 分支即可触发。

### 所需 Secrets

在仓库 **Settings → Secrets and variables → Actions** 中配置：

| Secret | 说明 |
|--------|------|
| `TINA_CLIENT_ID` | TinaCMS Cloud 项目 Client ID |
| `TINA_TOKEN` | TinaCMS Cloud API Token（Content Read-only） |

---

## 📝 备案信息

- [黔ICP备2025056580号](https://beian.miit.gov.cn/)
- [贵公网安备52052302000396号](https://beian.mps.gov.cn/#/query/webSearch?code=52052302000396)

---

📝 *Keep coding, keep thinking.*

<!-- @sync-readme:end -->
