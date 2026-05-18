/**
 * projects.data.ts
 * VitePress 数据加载器
 * 职责：使用 createContentLoader 加载 projects/*.md（排除 index.md）的 frontmatter 数据
 * 输出：按 category 分组的 { manualProjects, aiProjects } 结构
 * 数据源：docs/projects/*.md 的 frontmatter
 * 排除：index.md（页面本身）
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

export default createContentLoader('projects/*.md', {
  excerpt: false,
  transform(rawData: any[]) {
    const allProjects = rawData
      .filter((page: any) => {
        // 排除 index.md 页面（其 URL 不含项目文件名）
        const url = page.url || ''
        return !url.endsWith('/') && !url.endsWith('/index.html')
      })
      .map((page: any) => {
        const fm = page.frontmatter as ProjectFrontmatter
        return {
          title: fm.title || page.frontmatter.title || '未命名项目',
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
        }
      })
      .sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99))

    const manualProjects = allProjects.filter(
      (p: any) => p.category === 'manual'
    )
    const aiProjects = allProjects.filter(
      (p: any) => p.category === 'ai-vibe' || p.category === 'ai'
    )

    return { manualProjects, aiProjects }
  }
})
