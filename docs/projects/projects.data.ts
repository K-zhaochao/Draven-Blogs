/**
 * projects.data.ts
 * VitePress 数据加载器
 * 职责：使用 createContentLoader 加载 projects/*\/index.md 的 frontmatter 数据
 * 输出：按 category 分组的 { manualProjects, aiProjects } 结构
 * 数据源：docs/projects/<项目名>/index.md 的 frontmatter
 * 排除：projects/index.md（页面本身不会被 glob 匹配到）
 */

import { createContentLoader } from 'vitepress'

export interface ProjectFrontmatter {
  title: string
  category: string
  status?: string
  techStack?: string[]
  stars?: number
  lastPush?: string
  description?: string
  github?: string
  url?: string
  language?: string
  order?: number
}

export interface Project {
  title: string
  slug: string
  category: string
  status?: string
  techStack?: string[]
  stars?: number
  lastPush?: string
  description?: string
  github?: string
  url?: string
  language?: string
  order?: number
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
        return {
          title: fm.title || '未命名项目',
          slug: slug || '',
          category: fm.category || 'manual',
          status: fm.status,
          techStack: fm.techStack || [],
          stars: fm.stars ?? 0,
          lastPush: fm.lastPush || '',
          description: fm.description || '',
          github: fm.github || '',
          url: fm.url || (fm.github ? `https://github.com/${fm.github}` : ''),
          language: fm.language || '',
          order: fm.order ?? 99,
        } satisfies Project
      })
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))

    const manualProjects = allProjects.filter(
      (p) => p.category === 'manual'
    )
    const aiProjects = allProjects.filter(
      (p) => p.category === 'ai-vibe' || p.category === 'ai'
    )

    return { manualProjects, aiProjects }
  }
})
