/**
 * projects.data.ts
 * VitePress 数据加载器
 * 职责：使用 createContentLoader 加载 projects/*\/index.md 的 frontmatter 数据
 * 输出：按 category 分组的 { manualProjects, aiProjects, otherProjects, demoProjects } 结构
 * 数据源：docs/projects/<项目名>/index.md 的 frontmatter
 * 排除：projects/index.md（页面本身不会被 glob 匹配到）
 */

import { createContentLoader } from 'vitepress'

export type ProjectCategory = 'manual' | 'ai-vibe' | 'other' | 'demo'

const DEFAULT_CATEGORY: ProjectCategory = 'other'
const DEFAULT_ORDER = 99

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

export interface Project {
  title: string
  slug: string
  category: ProjectCategory
  status?: string
  techStack?: string[]
  stars?: number
  lastPush?: string
  description?: string
  github?: string
  githubUrl?: string
  websiteUrl?: string
  /**
   * @deprecated Step 1 keeps this as a transitional alias for the current Modal.
   * New consumers should use githubUrl / websiteUrl explicitly.
   */
  url?: string
  language?: string
  order?: number
}

function normalizeCategory(category?: string): ProjectCategory {
  if (
    category === 'manual' ||
    category === 'ai-vibe' ||
    category === 'other' ||
    category === 'demo'
  ) {
    return category
  }

  return DEFAULT_CATEGORY
}

function normalizeString(value?: string): string {
  return typeof value === 'string' ? value.trim() : ''
}

function buildGithubUrl(github?: string): string {
  const repo = normalizeString(github)
  return repo ? `https://github.com/${repo}` : ''
}

function compareProjects(a: Project, b: Project): number {
  const orderDiff = (a.order ?? DEFAULT_ORDER) - (b.order ?? DEFAULT_ORDER)
  if (orderDiff !== 0) return orderDiff

  const titleDiff = a.title.localeCompare(b.title, 'zh-CN')
  if (titleDiff !== 0) return titleDiff

  return a.slug.localeCompare(b.slug, 'en')
}

export default createContentLoader('projects/*/index.md', {
  excerpt: false,
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
          category: normalizeCategory(fm.category),
          status: fm.status,
          techStack: fm.techStack || [],
          stars: fm.stars ?? 0,
          lastPush: fm.lastPush || '',
          description: fm.description || '',
          github: normalizeString(fm.github),
          githubUrl,
          websiteUrl: normalizeString(fm.websiteUrl),
          url: githubUrl,
          language: fm.language || '',
          order: fm.order ?? DEFAULT_ORDER,
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
