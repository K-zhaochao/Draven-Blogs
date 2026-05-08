# Draven's Blog ☕

English | [简体中文](./README.md)

![Java](https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=java&logoColor=white)
![VitePress](https://img.shields.io/badge/VitePress-5C59F7?style=flat-square&logo=vite&logoColor=white)
![Obsidian](https://img.shields.io/badge/Obsidian-483699?style=flat-square&logo=obsidian&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=github-actions&logoColor=white)

Hi, I'm **[K-zhaochao](https://github.com/K-zhaochao)**, an undergraduate majoring in Computer Science and Technology (Class of 2024).

This is my personal blog and digital garden. It serves as a repository for my learning notes, a place to document my tech stack (currently focusing on **Java Backend Development**), and a log of the pitfalls I've encountered during real-world projects. Occasionally, apart from emotionless code, you'll also find my personal thoughts and random ideas here.

---

## 💡 Why this project?

The faintest ink is better than the best memory. No matter how many tutorials you watch, if you don't turn them into your own output, they will eventually be forgotten.
My original intention for building this site was to create a **low-friction, pure-local experience** for content publishing. In this workflow, I just want to quietly write [Markdown](https://daringfireball.net/projects/markdown/), and let automation handle the layout, formatting, building, and publishing.

---

## 🛠️ Highlights & Workflow Implementation

This repository is more than just a [VitePress](https://vitepress.dev/) template; it runs a heavily customized automated publishing workflow specifically designed for **[Obsidian](https://obsidian.md/)**.

If you also use Obsidian for note-taking, you might understand the pain: Obsidian's convenient wikilinks `[[ ]]` and image syntax `![[ ]]` cannot be displayed out-of-the-box by most frontend frameworks. To solve this, I pieced together the following solution:

### 1. Writing Experience: Fully Local, Zero Friction

- **Source Isolation**: The original files containing real content are placed in the `Draven_Note` folder, isolated from the frontend project. VitePress doesn't read them directly. My note management relies entirely on local Obsidian.
- **Zero Image Redundancy**: Through Windows Directory Junction (`mklink /J`), the local folder where Obsidian saves images is mapped directly into VitePress's `public` directory. As a result, the frontend server can hot-reload images during local writing without duplicating files on the hard drive.

### 2. Deployment: Automated Syntax "Washing" & Publish

Every time notes are `push`ed to GitHub, `.github/workflows` intercepts and completes the remaining hard work on cloud servers:

- **Execute Polish Script (`scripts/sync.mjs`)**: The script traverses my `Draven_Note` in the cloud. Using regular expressions, it "formats" Obsidian-specific `[[Wikilinks]]`, Callout syntax, and inline image paths into standard VitePress/Vue component syntax.
- **Silent Publish**: Right after the code is polished, `npm run build` generates the static pages and deploys them to [GitHub Pages](https://pages.github.com/).

**In short: Thanks to symlinks locally, I can open Obsidian, write freely, and preview instantly. Once done, a `git push` triggers [GitHub Actions](https://github.com/features/actions) to handle everything else.**

---

## 🚀 Run Locally

If you'd like to experience this geeky workflow yourself, clone the repository and follow these steps:

```bash
# 1. Install dependencies
npm install

# 2. Mount the image directory symlink (Must run CMD or PowerShell as Administrator)
mklink /J "docs\public\Draven_Note_Images" "Draven_Note\Draven_Note_Images"

# 3. Start the dev server (local live preview)
npm run docs:dev
```

> **Note**: A `.gitignore` has been configured to ignore the frontend image symlink, ensuring our cloud code repository does not bulge from duplicated assets.

---

📝 *Keep coding, keep thinking.*
