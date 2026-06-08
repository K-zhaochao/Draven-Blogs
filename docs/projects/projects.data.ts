/**
 * projects.data.ts
 * VitePress 数据加载器
 * 职责：使用 createContentLoader 加载 projects/*\/index.md 的 frontmatter 与正文 HTML
 * 输出：按 category 分组的 { manualProjects, aiProjects, otherProjects, demoProjects } 结构
 * 数据源：docs/projects/<项目名>/index.md 的 frontmatter + Markdown 正文
 * 排除：projects/index.md（页面本身不会被 glob 匹配到）
 */

import { createContentLoader } from 'vitepress'
import sanitizeHtml from 'sanitize-html'
import {
  DEFAULT_PROJECT_ORDER,
  normalizeProjectCategory,
  type Project,
} from '../.vitepress/shared/project'

export interface ProjectFrontmatter {
  title?: string
  category?: string
  status?: string
  techStack?: string[]
  stars?: number
  lastPush?: string
  description?: string
  github?: string
  websiteUrl?: string
  language?: string
  order?: number
}

function normalizeString(value?: string): string {
  return typeof value === 'string' ? value.trim() : ''
}

function buildGithubUrl(github?: string): string {
  const repo = normalizeString(github)
  return repo ? `https://github.com/${repo}` : ''
}

function sanitizeProjectHtml(html?: string): string {
  if (!html) return ''

  return sanitizeHtml(html, {
    allowedTags: [
      'address', 'article', 'aside', 'blockquote', 'br', 'caption', 'code',
      'col', 'colgroup', 'dd', 'details', 'div', 'dl', 'dt', 'em', 'figcaption',
      'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'img', 'kbd', 'li',
      'mark', 'ol', 'p', 'pre', 's', 'section', 'small', 'span', 'strong',
      'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead',
      'tr', 'ul', 'a',
    ],
    allowedAttributes: {
      '*': ['class', 'id', 'aria-label', 'title'],
      a: ['href', 'name', 'target', 'rel', 'class', 'id', 'aria-label', 'title'],
      img: ['src', 'alt', 'width', 'height', 'loading', 'class', 'id', 'title'],
      p: ['align', 'class', 'id'],
      table: ['class', 'id'],
      th: ['align', 'colspan', 'rowspan', 'class', 'id'],
      td: ['align', 'colspan', 'rowspan', 'width', 'class', 'id'],
      code: ['class'],
      pre: ['class'],
      span: ['class', 'aria-hidden'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
    },
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', {
        rel: 'noopener noreferrer',
      }, true),
      img: sanitizeHtml.simpleTransform('img', {
        loading: 'lazy',
      }, true),
    },
  })
}

function compareProjects(a: Project, b: Project): number {
  const orderDiff = (a.order ?? DEFAULT_PROJECT_ORDER) - (b.order ?? DEFAULT_PROJECT_ORDER)
  if (orderDiff !== 0) return orderDiff

  const titleDiff = a.title.localeCompare(b.title, 'zh-CN')
  if (titleDiff !== 0) return titleDiff

  return a.slug.localeCompare(b.slug, 'en')
}

export default createContentLoader('projects/*/index.md', {
  excerpt: false,
  render: true,
  transform(rawData: any[]) {
    const allProjects = rawData
      .map((page: any) => {
        const fm = (page.frontmatter || {}) as ProjectFrontmatter
        // 从 URL 提取文件夹名作为 slug
        // URL 形如 /projects/sky-take-out/ → slug = 'sky-take-out'
        const slug = ((page.url || '') as string)
          .replace(/^\/projects\//, '')
          .replace(/\/$/, '')
        const githubUrl = buildGithubUrl(fm.github)

        return {
          title: normalizeString(fm.title) || '未命名项目',
          slug: slug || '',
          category: normalizeProjectCategory(fm.category),
          status: fm.status,
          techStack: fm.techStack || [],
          stars: fm.stars ?? 0,
          lastPush: fm.lastPush || '',
          description: fm.description || '',
          github: normalizeString(fm.github),
          githubUrl,
          websiteUrl: normalizeString(fm.websiteUrl),
          language: fm.language || '',
          order: fm.order ?? DEFAULT_PROJECT_ORDER,
          contentHtml: sanitizeProjectHtml(page.html),
        } satisfies Project
      })
      .sort(compareProjects)

    const manualProjects = allProjects.filter(
      (p) => p.category === 'manual'
    )
    const aiProjects = allProjects.filter(
      (p) => p.category === 'ai-vibe'
    )
    const otherProjects = allProjects.filter(
      (p) => p.category === 'other'
    )
    const demoProjects = allProjects.filter(
      (p) => p.category === 'demo'
    )

    return { manualProjects, aiProjects, otherProjects, demoProjects }
  }
})
