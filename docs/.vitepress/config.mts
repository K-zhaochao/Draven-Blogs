import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import taskLists from 'markdown-it-task-lists'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

type ProjectCategory = 'manual' | 'ai-vibe' | 'other' | 'demo'

type ProjectSidebarEntry = {
  slug: string
  title: string
  category: ProjectCategory
  order: number
}

const PROJECT_CATEGORY_GROUPS: Array<{ category: ProjectCategory; text: string }> = [
  { category: 'manual', text: '手搓/协助项目' },
  { category: 'ai-vibe', text: 'AI Vibe Coding 项目' },
  { category: 'other', text: '其他项目' },
  { category: 'demo', text: 'Demo' }
]

const configDir = dirname(fileURLToPath(import.meta.url))
const projectsRoot = join(configDir, '..', 'projects')

function unquoteFrontmatterValue(value: string): string {
  const trimmed = value.trim()
  if (trimmed.length >= 2) {
    const first = trimmed[0]
    const last = trimmed[trimmed.length - 1]
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      return trimmed.slice(1, -1)
    }
  }
  return trimmed
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) return {}

  return match[1].split(/\r?\n/).reduce<Record<string, string>>((fields, line) => {
    const field = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (field) {
      fields[field[1]] = unquoteFrontmatterValue(field[2])
    }
    return fields
  }, {})
}

function normalizeProjectCategory(category: string | undefined): ProjectCategory {
  return PROJECT_CATEGORY_GROUPS.some((group) => group.category === category)
    ? category as ProjectCategory
    : 'other'
}

function parseProjectOrder(order: string | undefined): number {
  const parsed = Number.parseFloat(order ?? '')
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER
}

function readProjectsForSidebar(): ProjectSidebarEntry[] {
  if (!existsSync(projectsRoot)) return []

  return readdirSync(projectsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry): ProjectSidebarEntry | null => {
      const slug = entry.name
      const indexPath = join(projectsRoot, slug, 'index.md')
      if (!existsSync(indexPath)) return null

      const frontmatter = parseFrontmatter(readFileSync(indexPath, 'utf-8'))
      const title = frontmatter.title || slug

      return {
        slug,
        title,
        category: normalizeProjectCategory(frontmatter.category),
        order: parseProjectOrder(frontmatter.order)
      }
    })
    .filter((project): project is ProjectSidebarEntry => Boolean(project))
}

function generateProjectsSidebarItems(): any[] {
  const projects = readProjectsForSidebar().sort((left, right) => {
    if (left.category !== right.category) {
      return PROJECT_CATEGORY_GROUPS.findIndex((group) => group.category === left.category)
        - PROJECT_CATEGORY_GROUPS.findIndex((group) => group.category === right.category)
    }
    if (left.order !== right.order) return left.order - right.order

    const titleCompare = left.title.localeCompare(right.title, 'zh-CN')
    if (titleCompare !== 0) return titleCompare
    return left.slug.localeCompare(right.slug, 'en-US')
  })

  return PROJECT_CATEGORY_GROUPS
    .map((group) => {
      const items = projects
        .filter((project) => project.category === group.category)
        .map((project) => ({
          text: project.title,
          link: `/projects/${project.slug}/`
        }))

      if (items.length === 0) return null

      return {
        text: group.text,
        collapsed: false,
        items
      }
    })
    .filter((group): group is any => Boolean(group))
}

// ============================================================
// 导航下拉分类（集中管理，方便后期维护）
// ============================================================
const NOTE_CATEGORIES = [
  { key: 'Java', title: 'Java' },
  { key: 'JavaWeb', title: 'JavaWeb' },
  { key: 'Redis', title: 'Redis' },
  { key: '苍穹外卖', title: '苍穹外卖' },
  { key: 'Python', title: 'Python' },
]

const THOUGHT_CATEGORIES = [
  { key: '技术总结', title: '技术总结' },
  { key: '认知感悟', title: '认知感悟' },
  { key: '生活分享', title: '生活分享' },
]

// 学习笔记导航下拉
function noteNavItems() {
  return NOTE_CATEGORIES.map(c => ({ text: c.title, link: `/notes/${c.key}/` }))
}

// 我的博客导航下拉
function thoughtNavItems() {
  return THOUGHT_CATEGORIES.map(c => ({ text: c.title, link: `/thoughts/${c.key}/` }))
}

/** 为每个"我的博客"子栏目生成独立的侧边栏 */
function buildThoughtsSidebar(): Record<string, any[]> {
  const thoughtsRoot = join(configDir, '..', 'thoughts')
  const sidebar: Record<string, any[]> = {}

  for (const cat of THOUGHT_CATEGORIES) {
    const catDir = join(thoughtsRoot, cat.key)
    if (!existsSync(catDir)) continue

    sidebar[`/thoughts/${cat.key}/`] = [{
      text: cat.title,
      link: `/thoughts/${cat.key}/`,
      items: prefixSidebarLinks(generateSidebar({
        documentRootPath: `docs/thoughts/${cat.key}`,
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        useFolderLinkFromIndexFile: true,
        folderLinkNotIncludesFileName: true,
        sortMenusByFrontmatterOrder: true,
        collapsed: false
      }), `/thoughts/${cat.key}/`)
    }]
  }

  return sidebar
}

/** 为每个笔记类别路径生成独立的侧边栏，进入子分类只看到对应笔记 */
function buildNotesSidebar(): Record<string, any[]> {
  const notesRoot = join(configDir, '..', 'notes')
  const sidebar: Record<string, any[]> = {}

  for (const cat of NOTE_CATEGORIES) {
    const catDir = join(notesRoot, cat.key)
    if (!existsSync(catDir)) continue

    sidebar[`/notes/${cat.key}/`] = [{
      text: cat.title,
      link: `/notes/${cat.key}/`,
      items: prefixSidebarLinks(generateSidebar({
        documentRootPath: `docs/notes/${cat.key}`,
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        useFolderLinkFromIndexFile: true,
        folderLinkNotIncludesFileName: true,
        sortMenusByFrontmatterOrder: true,
        collapsed: false
      }), `/notes/${cat.key}/`)
    }]
  }

  // /notes/ 聚合页保留全量展开
  sidebar['/notes/'] = [{
    text: '学习笔记',
    link: '/notes/',
    items: prefixSidebarLinks(generateSidebar({
      documentRootPath: 'docs/notes',
      useTitleFromFrontmatter: true,
      useFolderTitleFromIndexFile: true,
      useFolderLinkFromIndexFile: true,
      folderLinkNotIncludesFileName: true,
      sortMenusByFrontmatterOrder: true,
      collapsed: false
    }), '/notes/')
  }]

  return sidebar
}

// 递归为侧边栏所有 link 添加前缀，并清理 index.md 后缀
function prefixSidebarLinks(items: any, prefix: string): any[] {
  const arr = Array.isArray(items) ? items : [items];
  return arr.map((item: any) => {
    const newItem = { ...item };
    if (newItem.link) {
      let link = newItem.link;
      // 去掉末尾的 /index.md，让 VitePress 正确路由到文件夹首页
      link = link.replace(/\/index\.md$/, '/');
      // 拼接前缀与链接，去除中间可能产生的双斜杠
      newItem.link = (prefix + link).replace(/\/{2,}/g, '/');
    }
    if (newItem.items) {
      newItem.items = prefixSidebarLinks(newItem.items, prefix);
    }
    return newItem;
  });
}

export default defineConfig({
  // 外观模式：检测系统主题（prefers-color-scheme），首次访问默认跟随系统
  // 用户手动切换后，偏好会存入 localStorage；清除 localStorage 后恢复跟随系统
  appearance: true,

  head: [
    ["link", { rel: "icon", href: "/logo.svg" }],
    // 霞鹜文楷（全站字体）
    ["link", { rel: "preconnect", href: "https://chinese-fonts-cdn.netlify.app" }],
    ["link", { rel: "stylesheet", href: "https://chinese-fonts-cdn.netlify.app/packages/lxgwwenkai/dist/LXGWWenKai-Regular/result.css" }],
  ],
  // 本地开发宽松处理死链；CI 构建时通过环境变量 STRICT_LINKS=1 开启严格检查
  ignoreDeadLinks: !process.env.STRICT_LINKS,
  base: '/',
  title: "Draven's Blog",
  description: "Code like a dreamer, build like an engineer.",
  lastUpdated: true, // 3.开启最后更新时间
  // 配置 markdown
  markdown: {
    config: (md) => {
      md.use(taskLists) // 2.任务列表支持
    }
  },
  // Vite 开发服务器代理：将 /artalk-api 开头的请求转发到 Artalk 后端，解决本地 CORS 问题
  vite: {
    server: {
      proxy: {
        '/artalk-api': {
          target: 'https://comment.matehub.top',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/artalk-api/, '')
        }
      }
    }
  },
  // 赛博朋克紫色调的主色设置
  themeConfig: {
    lastUpdated: {
      text: '最后更新于'
    },
    // 使用自定义域名 base: '/' 部署；如果改为 GitHub Pages 项目站需改成 '/Draven-Blogs/'
    logo: '/logo.svg',
    nav: [
      { text: '首页', link: '/' },
      {
        text: '我的博客',
        items: thoughtNavItems(),
      },
      {
        text: '学习笔记',
        items: noteNavItems(),
      },
      { text: '项目实战', link: '/projects/' },
      { text: '友链', link: '/friends/' },
      { text: 'GitHub', link: 'https://github.com/K-zhaochao/Draven-Blogs' }
    ],

    // 搜索功能配置
    search: {
      provider: 'local',
      options: {
        locales: {
          root: { // 注意：如果要汉化，建议放在 root 节点下
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    // 1.按路径分区域生成侧边栏（不同导航区域显示各自的目录）
    sidebar: {
      // 我的博客区域（按子栏目独立侧边栏）
      ...buildThoughtsSidebar(),
      // /thoughts/ 聚合页
      '/thoughts/': [{
        text: '我的博客',
        link: '/thoughts/',
        collapsed: false,
        items: THOUGHT_CATEGORIES.map(c => ({ text: c.title, link: `/thoughts/${c.key}/` })),
      }],
      // 学习笔记区域（按类别独立侧边栏）
      ...buildNotesSidebar(),
      // 项目实战区域
      '/projects/': [{
        text: '项目实战',
        link: '/projects/',
        items: generateProjectsSidebarItems()
      }]
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/K-zhaochao' }
    ],

    outline: {
      label: '本页目录',
      level: [2, 4],
    },

    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '菜单',
    returnToTopLabel: '返回顶部',
    darkModeSwitchTitle: '切换到暗色主题',
    lightModeSwitchTitle: '切换到亮色主题',

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Draven | <a href="https://beian.miit.gov.cn/" target="_blank" style="color: var(--vp-c-brand-1); text-decoration: none;">黔ICP备2025056580号</a><br><a href="https://beian.mps.gov.cn/#/query/webSearch?code=52052302000396" rel="noreferrer" target="_blank" style="color: var(--vp-c-brand-1); text-decoration: none;"><img src="/gongan.png" style="width:16px;height:17px;vertical-align:middle;margin-right:4px;display:inline;">贵公网安备52052302000396号</a>'
    }
  }
})