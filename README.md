# Draven's Blog ☕

[English](./README_en.md) | 简体中文

![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=java&logoColor=white)
![VitePress](https://img.shields.io/badge/VitePress-5C59F7?style=flat-square&logo=vite&logoColor=white)
![Obsidian](https://img.shields.io/badge/Obsidian-483699?style=flat-square&logo=obsidian&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

Hi，我是 **[K-zhaochao](https://github.com/K-zhaochao)**，一名 24 级计算机科学与技术专业的在校生。

这里是我的个人博客，主要用于存放我的学习笔记、梳理技术栈（目前主攻 **Java 后端开发**），以及记录一些项目实战的踩坑过程。当然，除了毫无感情的代码，这里也会偶尔掉落一些个人的思考和脑洞。

---

## 💡 为什么有这个项目？

好记性不如烂笔头。看过再多教程，如果不转化为自己的输出，最终也会被慢慢遗忘。
建这个站的初衷，就是想搭建一个**低阻力、纯本地体验**的内容输出平台。在这个流程里，我只想安静地写 [Markdown](https://daringfireball.net/projects/markdown/)，剩下的排版和编译发布，统统交给自动化去完成。

---

## 🛠️ 核心亮点 & 工作流实现

这个仓库不仅仅是一套 [VitePress](https://vitepress.dev/) 模板，它同时运行着一套针对 **[Obsidian](https://obsidian.md/)** 深度定制的自动化发布工作流。

如果你也用 Obsidian 记笔记，你可能会懂这种痛楚：Obsidian 方便的双链 `[[ ]]` 和图片语法 `![[ ]]` 在绝大多数前端框架里根本没法直接展示。为了解决这个问题，我折腾了这样一套方案：

### 1. 写作体验：完全本地化，0 割裂感

- **笔记源隔离隔离**：记录真实内容的源文件全部放在前端项目外的 `Draven_Note` 文件夹中，VitePress 并不直接读取它们。我对笔记的管理完全依靠本地的 Obsidian。
- **图片素材零冗余**：通过 Windows 目录联接（`mklink /J`），把 Obsidian 存图片的本地文件夹，直接穿透映射进了 VitePress 的 `public` 目录下。结果就是，本地编写时前端服务器同样能热加载图片，却不需要在硬盘里存两份一模一样的文件。

### 2. 部署流程：自动化语法“洗稿”与发布

在每次把笔记 `push` 到 GitHub 之后，`.github/workflows` 会在云服务器上拦截并完成剩下的苦力活：

- **执行清洗脚本 (`scripts/sync.mjs`)**：脚本会在云端自动遍历我的 `Draven_Note`，运用正则替换，把 Obsidian 专属的 `[[双向链接]]`、Callout 语法、甚至是内联图片路径，全部“格式化”成标准的 VitePress/Vue 组件语法，塞入正轨。
- **无感发布**：代码洗好之后，紧接着跑 `npm run build`，将生成的静态页面扔到 [GitHub Pages](https://pages.github.com/) 部署。

**一句话总结：本地由于有了软链接，Obsidian 打开就能随便写并实时预览；写完 `git push`，剩下的事情交给 [GitHub Actions](https://github.com/features/actions) 自动搞定。**

---

## 🚀 本地运行

如果你也想尝鲜体验这套极客工作流，拉取代码后请按以下步骤操作：

```bash
# 1. 安装依赖
npm install

# 2. 挂载图片目录的软链接（必须以管理员身份运行 CMD 或 PowerShell）
mklink /J "docs\public\Draven_Note_Images" "Draven_Note\Draven_Note_Images"

# 3. 启动开发服务器（本地实时预览）
npm run docs:dev
```

> **Note**: 项目已配置 `.gitignore` 忽略了刚才在前端建立的那层图片软连接，这保证了我们的云端代码仓库不会因为素材被重复收录而拉升体积。

---

📝 *Keep coding, keep thinking.*
