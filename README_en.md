# Draven's Blog ☕

English | [简体中文](./README.md)

<p align="center">
  <img src="https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white" alt="Java">
  <img src="https://img.shields.io/badge/VitePress-5C59F7?style=for-the-badge&logo=vite&logoColor=white" alt="VitePress">
  <img src="https://img.shields.io/badge/TinaCMS-6DB33F?style=for-the-badge&logo=tinacms&logoColor=white" alt="TinaCMS">
  <img src="https://img.shields.io/badge/Obsidian-483699?style=for-the-badge&logo=obsidian&logoColor=white" alt="Obsidian">
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white" alt="GitHub Actions">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Markdown-000000?style=for-the-badge&logo=markdown&logoColor=white" alt="Markdown">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
</p>

<p align="center">
  <b>📝 Write Locally &nbsp;·&nbsp; 🔄 Auto Sync &nbsp;·&nbsp; 🚀 One-Click Deploy</b>
</p>

---

Hi, I'm **[K-zhaochao](https://github.com/K-zhaochao)**, an undergraduate majoring in Computer Science and Technology (Class of 2024).

This is my personal blog for recording learning, practice, and reflections. It mainly hosts my learning notes, tech stack documentation (currently focusing on **Java Backend Development**), and project practice experiences.

---

## 🧰 Tech Stack

| Layer | Tech | Purpose |
|:---:|------|------|
| 🖊️ Writing | Obsidian + Markdown | Local note-taking with wikilinks & image management |
| 🧩 CMS | TinaCMS | Visual content management (blog / projects) |
| ⚡ Framework | VitePress + Vue 3 | Static site generation & custom theme |
| 🔧 Scripts | Node.js (chokidar) | Syntax cleaning / hot-reload sync / Wiki link resolver |
| 🛡️ Quality | markdownlint + TypeScript | Content linting & type checking |
| 🚀 Deploy | GitHub Actions + Pages | CI/CD automated build & publish |

---

## ✨ Features

<table>
  <tr>
    <td width="50%">
      <h4>📝 Source-Output Separation</h4>
      <p><code>Draven_Note/</code> as the single editing space; <code>docs/notes/</code> auto-generated & not committed</p>
    </td>
    <td width="50%">
      <h4>🔄 Frictionless Automation</h4>
      <p><code>git push</code> → auto syntax cleaning → build → deploy, fully hands-off</p>
    </td>
  </tr>
  <tr>
    <td>
      <h4>🎨 Cyberpunk Purple Theme</h4>
      <p>Custom VitePress theme with dark mode + neon purple accents</p>
    </td>
    <td>
      <h4>🔍 Full-Text Search</h4>
      <p>Built-in VitePress search — locate notes & articles in seconds</p>
    </td>
  </tr>
  <tr>
    <td>
      <h4>📱 Responsive Design</h4>
      <p>Desktop / tablet / mobile — optimized reading experience across all devices</p>
    </td>
    <td>
      <h4>🚀 Enhanced Project Showcase</h4>
      <p>GitHub status auto-tracking, category grouping, dual-link buttons, mobile bottom sheet</p>
    </td>
  </tr>
  <tr>
    <td>
      <h4>🏠 Homepage Dashboard</h4>
      <p>Tech stack tag cloud, note category shortcuts, project stats (count · Stars)</p>
    </td>
    <td>
      <h4>🤝 Friend Links</h4>
      <p>Dedicated friend-links page, card-style display + JSON-driven data, email-based exchange</p>
    </td>
  </tr>
  <tr>
    <td>
      <h4>📂 Auto Index Markers</h4>
      <p><code>&lt;!-- @auto-index --&gt;</code> markers in note indexes — the script updates only the auto-index section, never overwrites handwritten content</p>
    </td>
    <td></td>
  </tr>
</table>

---

## 💡 Why This Project?

> The faintest ink is better than the best memory. No matter how many tutorials you watch, if you don't turn them into your own output, they will eventually be forgotten.

This site was built to create a **low-friction, local-first content publishing pipeline**:

```
  I just write Markdown, quietly
              ↓
  Layout / Build / Publish → fully automated
```

---

## 🛠️ Workflow Architecture

### 1. 📝 Learning Notes: Obsidian → Auto Sync

If you use Obsidian, you know the struggle: `[[wikilinks]]` and `![[image syntax]]` simply don't render in most frontend frameworks.

My solution: **source isolation + auto cleaning + generated output is not committed**.

```
┌─────────────────────────────────────────────────────┐
│  Draven_Note/  (Obsidian vault — source of truth)   │
│  ├── Java/        ├── Python/      ├── Redis/       │
│  └── Draven_Note_Images/  (image assets, dir junction)│
│                         │                           │
│    Windows mklink /J ──→┘  (public dir, zero copy)  │
│                         │                           │
│  scripts/sync.mjs ──────→  syntax cleaning + index  │
│    • [[wikilink]]  →  [text](./path.md)             │
│    • ![[image]]    →  ![](./image.png)              │
│    • Callout blocks →  VitePress-compatible         │
│    • Auto-index markers →  append-only index blocks │
│    • WikiLink/Image resolvers → smart path matching │
│                         │                           │
│  docs/notes/  ←──────────  auto-generated (ignored) │
│    (consumed by VitePress, generated at build time) │
└─────────────────────────────────────────────────────┘
```

### 2. 🧩 Blog & Projects: TinaCMS Visual Management

- Visit `/admin/` in your browser → WYSIWYG editor
- Content stored as Markdown in Git, fully isolated from Obsidian notes
- `tina/config.ts` defines Collection Schema: `thoughts` / `projects`

### 3. 🚀 Deployment Pipeline

```mermaid
graph LR
    A[git push main] --> B[npm run build]
    B --> C[sync.mjs + sync-projects.mjs]
    C --> D[tinacms build]
    D --> E[vitepress build]
    E --> F[GitHub Pages]
```

---

## 📁 Project Structure

```
Draven-Blogs/
├── Draven_Note/              ← Obsidian vault (just write here)
│   ├── Java/                 #   Java learning notes
│   ├── JavaWeb/              #   JavaWeb notes
│   ├── Python/               #   Python notes
│   ├── Redis/                #   Redis notes
│   ├── 苍穹外卖/              #   Project practice notes
│   └── Draven_Note_Images/   #   Image assets (mklink → public, excluded from sync)
│
├── docs/                     ← VitePress frontend
│   ├── .vitepress/           #   Config & custom theme
│   │   ├── config.mts        #     Site config
│   │   ├── theme/            #     custom.css theme styles
│   │   ├── components/       #     ProjectCard / ProjectModal / FriendCard
│   │   └── shared/           #     project.ts / friend.ts shared types
│   ├── friends/              #   ← Friend-links page (JSON-driven)
│   ├── notes/                #   ← Auto-generated by sync.mjs (not committed)
│   ├── thoughts/             #   ← Managed by TinaCMS
│   ├── projects/             #   ← Managed by TinaCMS + data loaders
│   └── public/               #   Static assets
│       ├── logo.svg          #     Localized logo
│       ├── admin/            #     TinaCMS Admin UI
│       └── Draven_Note_Images/ #   Images (mklink junction)
│
├── tina/                     ← TinaCMS configuration
│   ├── config.ts             #   Collection Schema definitions
│   └── __generated__/        #   Auto-generated Client/Types
│
├── scripts/                  ← Automation toolchain
│   ├── sync.mjs              #   Obsidian → VitePress syntax cleaning + indexing
│   └── sync-projects.mjs     #   GitHub API → project frontmatter + README sync
│
├── .github/workflows/        ← CI/CD auto-deployment
│   └── deploy-vitepress.yml  #   npm run build → GitHub Pages
│
├── .env.example              #   Environment variable template
├── .markdownlint.json        #   Markdown lint config
├── tsconfig.json             #   TypeScript config
├── package.json              #   Dependencies & scripts
└── README.md                 #   You are reading this
```

---

## 🚀 Local Development

```bash
# Install dependencies
npm install

# Setup environment (first time)
cp .env.example .env
# Edit .env and fill in TINA_CLIENT_ID / TINA_TOKEN

# Start dev server (sync notes + sync projects + TinaCMS + VitePress)
npm run dev
```

### Available Commands

| Command | Description |
|------|------|
| `npm run dev` | Sync notes & projects + TinaCMS + VitePress dev server |
| `npm run build` | Sync + TinaCMS build + VitePress production build |
| `npm run build:strict` | Same as build + strict internal dead-link check |
| `npm run sync` | Only sync notes + project info |
| `npm run sync:notes` | Only sync notes |
| `npm run sync:projects` | Only sync project info |
| `npm run watch` | Watch note changes & sync in real-time |
| `npm run lint:md` | Markdown syntax lint |
| `npm run check` | Full check entry (currently = lint:md) |
| `npm run preview` | Preview production build |

After startup:

- 🏠 Blog → `http://localhost:5173/`
- ✏️ TinaCMS Editor → `http://localhost:5173/admin/index.html`

---

## ⚙️ CI/CD Deployment

Automatically deployed to **GitHub Pages** via **GitHub Actions** on every push to `main`. The workflow file is `.github/workflows/deploy-vitepress.yml` and runs `npm run build` for the full pipeline.

### Required Secrets

Configure in **Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `TINA_CLIENT_ID` | TinaCMS Cloud project Client ID |
| `TINA_TOKEN` | TinaCMS Cloud API Token (Content Read-only) |
| `GITHUB_TOKEN` | (Optional) Increases sync-projects.mjs API rate limit |

> `.env.example` provides a local development template — copy it to `.env` and fill in your values.

---

## 📝 Registration Info

- [ICP: 黔ICP备2025056580号](https://beian.miit.gov.cn/)
- [Public Security: 贵公网安备52052302000396号](https://beian.mps.gov.cn/#/query/webSearch?code=52052302000396)

---

<p align="center">
  <sub>📝 Keep coding, keep thinking.</sub>
</p>
