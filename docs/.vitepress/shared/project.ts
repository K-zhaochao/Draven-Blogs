export type ProjectCategory = 'manual' | 'ai-vibe' | 'other' | 'demo'

export type ProjectStatus = '学习中' | '进行中' | '已完成' | '已归档'

export const DEFAULT_PROJECT_CATEGORY: ProjectCategory = 'other'

export const DEFAULT_PROJECT_ORDER = 99

export const PROJECT_CATEGORY_GROUPS: Array<{
    category: ProjectCategory
    text: string
}> = [
        { category: 'manual', text: '手搓/协助项目' },
        { category: 'ai-vibe', text: 'AI Vibe Coding 项目' },
        { category: 'other', text: '其他项目' },
        { category: 'demo', text: 'Demo' },
    ]

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
    '已完成': '#22c55e',
    '进行中': '#3b82f6',
    '学习中': '#f59e0b',
    '已归档': '#6b7280',
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
    language?: string
    order?: number
    contentHtml: string
}

export function normalizeProjectCategory(category?: string): ProjectCategory {
    return PROJECT_CATEGORY_GROUPS.some((group) => group.category === category)
        ? category as ProjectCategory
        : DEFAULT_PROJECT_CATEGORY
}

export function getProjectStatusColor(status?: string): string {
    if (status && status in PROJECT_STATUS_COLORS) {
        return PROJECT_STATUS_COLORS[status as ProjectStatus]
    }

    return PROJECT_STATUS_COLORS['已归档']
}