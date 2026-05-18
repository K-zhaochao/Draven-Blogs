<script setup lang="ts">
/**
 * ProjectCard.vue
 * 项目实战看板卡片组件
 * 职责：展示单一项目信息（标题、状态、描述、技术栈、Stars、更新时间）
 * Props: project - 包含 title, category, status, techStack, stars, lastPush, description, url
 * Hover: 上浮 + 品牌色发光边框
 * 缺省防御：stars / techStack 为空时不渲染对应区域
 */

interface Project {
  title: string
  category: string
  status?: string
  techStack?: string[]
  stars?: number
  lastPush?: string
  description?: string
  url?: string
}

defineProps<{
  project: Project
}>()

/** 状态映射：不同 status 对应不同颜色 */
const statusColorMap: Record<string, string> = {
  '已完成': '#22c55e',
  '进行中': '#3b82f6',
  '学习中': '#f59e0b',
  '规划中': '#a78bfa',
}

function getStatusColor(status?: string): string {
  return statusColorMap[status || ''] || '#6b7280'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<template>
  <a
    class="project-card"
    :href="project.url"
    :aria-label="`项目: ${project.title}`"
  >
    <!-- 顶部：标题 + 状态徽章 -->
    <div class="card-header">
      <h3 class="card-title">{{ project.title }}</h3>
      <span
        v-if="project.status"
        class="card-status"
        :style="{ backgroundColor: getStatusColor(project.status) + '22', color: getStatusColor(project.status) }"
      >
        {{ project.status }}
      </span>
    </div>

    <!-- 描述：两行截断 -->
    <p v-if="project.description" class="card-desc">
      {{ project.description }}
    </p>

    <!-- 技术栈：紧凑 Tag 列表 -->
    <div v-if="project.techStack && project.techStack.length" class="card-tags">
      <span
        v-for="tag in project.techStack"
        :key="tag"
        class="card-tag"
      >
        {{ tag }}
      </span>
    </div>

    <!-- 底部：Stars + 更新时间 -->
    <div class="card-footer">
      <span v-if="project.stars != null && project.stars > 0" class="card-stars" aria-label="GitHub stars">
        <svg class="star-icon" viewBox="0 0 16 16" width="14" height="14" fill="currentColor">
          <path d="M8 .25a.75.75 0 01.673.418l1.882 3.815 4.21.612a.75.75 0 01.416 1.279l-3.046 2.97.719 4.192a.75.75 0 01-1.088.791L8 12.347l-3.766 1.98a.75.75 0 01-1.088-.79l.72-4.194L.818 6.374a.75.75 0 01.416-1.28l4.21-.611L7.327.668A.75.75 0 018 .25z" />
        </svg>
        {{ project.stars }}
      </span>
      <span v-if="project.lastPush" class="card-date">
        {{ formatDate(project.lastPush) }}
      </span>
    </div>
  </a>
</template>

<style scoped>
.project-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px 20px;
  border-radius: 10px;
  border: 1px solid var(--vp-c-divider, #e2e2e2);
  background: var(--vp-c-bg, #fff);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.25s ease;
  cursor: pointer;
}

/* :where() 包裹后 Vue 追加的 [data-v-xxx] 不额外增加权重，保持与源选择器一致 */
.project-card:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-1, #B026FF);
  box-shadow: 0 0 14px rgba(176, 38, 255, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
}

.project-card:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #B026FF);
  outline-offset: 2px;
  text-decoration: none;
  color: inherit;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}

.card-status {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 999px;
  white-space: nowrap;
  line-height: 1.5;
}

.card-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.card-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--vp-c-default-soft, rgba(176, 38, 255, 0.08));
  color: var(--vp-c-text-2);
  line-height: 1.5;
  white-space: nowrap;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 4px;
}

.card-stars {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.star-icon {
  flex-shrink: 0;
}

.card-date {
  font-size: 12px;
  color: var(--vp-c-text-3, #999);
}

/* 暗色模式适配 */
:root.dark .project-card {
  background: var(--vp-c-bg-soft, #1a1a2e);
  border-color: var(--vp-c-divider, #333);
}

:root.dark .project-card:hover {
  box-shadow: 0 0 18px rgba(176, 38, 255, 0.25), 0 4px 16px rgba(0, 0, 0, 0.3);
}
</style>
