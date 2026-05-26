<script setup lang="ts">
/**
 * ProjectModal.vue
 * 项目详情大卡片弹窗
 * Props: modelValue (显示/隐藏), project (项目信息), readmeRaw (原始 markdown)
 * 顶部：项目标题 + 状态徽章 + GitHub 按钮
 * 下方：GitHub README 渲染为 Markdown 阅读模式
 */
import { computed, watch } from 'vue'
import MarkdownIt from 'markdown-it'

// ------------------------------------------------------------------ Props & Emits
interface Project {
  title: string
  slug: string
  category: string
  status?: string
  techStack?: string[]
  stars?: number
  lastPush?: string
  description?: string
  url?: string
  language?: string
}

const props = defineProps<{
  modelValue: boolean
  project: Project | null
  readmeRaw: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// ------------------------------------------------------------------ Markdown 渲染器
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const renderedHtml = computed(() => {
  if (!props.readmeRaw) return '<p class="no-readme">暂无 README 内容</p>'
  return md.render(props.readmeRaw)
})

// ------------------------------------------------------------------ 交互方法
function close() {
  emit('update:modelValue', false)
}

function onOverlayClick(e: MouseEvent) {
  if ((e.target as HTMLElement).classList.contains('modal-overlay')) {
    close()
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

// 打开/关闭时切换 body 滚动 & 键盘监听
watch(() => props.modelValue, (val) => {
  if (val) {
    document.addEventListener('keydown', onKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', onKeydown)
    document.body.style.overflow = ''
  }
})

// ------------------------------------------------------------------ 状态颜色
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
  <Teleport to="body">
    <Transition name="modal-fade">
      <div
        v-if="modelValue && project"
        class="modal-overlay"
        @click="onOverlayClick"
        role="dialog"
        aria-modal="true"
        :aria-label="`项目详情: ${project.title}`"
      >
        <div class="modal-container">
          <!-- ========== 顶部栏 ========== -->
          <div class="modal-header">
            <div class="modal-header-left">
              <h2 class="modal-title">{{ project.title }}</h2>
              <span
                v-if="project.status"
                class="modal-status"
                :style="{
                  backgroundColor: getStatusColor(project.status) + '22',
                  color: getStatusColor(project.status),
                }"
              >
                {{ project.status }}
              </span>
            </div>
            <div class="modal-header-right">
              <a
                v-if="project.url"
                :href="project.url"
                target="_blank"
                rel="noopener noreferrer"
                class="github-btn"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" class="github-icon">
                  <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                </svg>
                在 GitHub 上查看
              </a>
              <button class="close-btn" @click="close" aria-label="关闭">
                <svg viewBox="0 0 16 16" width="18" height="18" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 01.708 0L8 7.293l2.646-2.647a.5.5 0 01.708.708L8.707 8l2.647 2.646a.5.5 0 01-.708.708L8 8.707l-2.646 2.647a.5.5 0 01-.708-.708L7.293 8 4.646 5.354a.5.5 0 010-.708z"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- ========== 元信息行 ========== -->
          <div class="modal-meta">
            <span v-if="project.stars != null && project.stars > 0" class="meta-item">
              ⭐ {{ project.stars }}
            </span>
            <span v-if="project.language" class="meta-item">
              🔤 {{ project.language }}
            </span>
            <span v-if="project.lastPush" class="meta-item">
              🗓 {{ formatDate(project.lastPush) }}
            </span>
            <div v-if="project.techStack && project.techStack.length" class="meta-tags">
              <span v-for="tag in project.techStack" :key="tag" class="meta-tag">{{ tag }}</span>
            </div>
          </div>

          <!-- ========== README 正文 ========== -->
          <div class="modal-body">
            <div class="vp-doc readme-content" v-html="renderedHtml" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* ================================================================ 遮罩 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

/* ================================================================ 大卡片容器 */
.modal-container {
  width: 100%;
  max-width: 920px;
  max-height: 88vh;
  background: var(--vp-c-bg);
  border-radius: 14px;
  border: 1px solid var(--vp-c-divider);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25), 0 0 40px rgba(176, 38, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ================================================================ 顶部栏 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 28px;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-shrink: 0;
}

.modal-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.modal-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-status {
  flex-shrink: 0;
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 999px;
  white-space: nowrap;
}

.modal-header-right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

/* ================================================================ GitHub 按钮 */
.github-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  background: var(--vp-c-brand-1, #B026FF);
  color: #fff;
  transition: background 0.2s, transform 0.15s;
  white-space: nowrap;
}

.github-btn:hover {
  background: var(--vp-c-brand-2, #8a1fd6);
  transform: translateY(-1px);
  text-decoration: none;
  color: #fff;
}

.github-icon {
  flex-shrink: 0;
}

/* ================================================================ 关闭按钮 */
.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--vp-c-danger-1, #e05555);
  color: #fff;
  border-color: transparent;
}

/* ================================================================ 元信息行 */
.modal-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  padding: 12px 28px;
  border-bottom: 1px solid var(--vp-c-divider);
  font-size: 13px;
  color: var(--vp-c-text-2);
  flex-shrink: 0;
}

.meta-item {
  white-space: nowrap;
}

.meta-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.meta-tag {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--vp-c-default-soft, rgba(176, 38, 255, 0.08));
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

/* ================================================================ README 正文区 */
.modal-body {
  padding: 20px 28px 32px;
  overflow-y: auto;
  flex: 1;
}

.modal-body .vp-doc {
  /* 继承 VitePress 默认文档排版 */
}

.no-readme {
  text-align: center;
  color: var(--vp-c-text-3);
  padding: 40px 0;
  font-style: italic;
}

/* ================================================================ 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .modal-container,
.modal-fade-leave-active .modal-container {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-container {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

.modal-fade-leave-to .modal-container {
  transform: scale(0.95) translateY(10px);
  opacity: 0;
}

/* ================================================================ 暗色模式 */
:root.dark .modal-container {
  background: var(--vp-c-bg-soft, #1a1a2e);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 60px rgba(176, 38, 255, 0.12);
}

/* ================================================================ 小屏适配 */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 12px;
    align-items: flex-end;
  }

  .modal-container {
    max-height: 92vh;
    border-radius: 14px 14px 0 0;
  }

  .modal-header {
    padding: 14px 18px;
  }

  .modal-body {
    padding: 14px 18px 24px;
  }

  .modal-meta {
    padding: 10px 18px;
  }

  .modal-title {
    font-size: 17px;
  }

  .github-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>
