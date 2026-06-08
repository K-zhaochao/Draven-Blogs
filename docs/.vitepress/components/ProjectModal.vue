<script setup lang="ts">
/**
 * ProjectModal.vue
 * 项目详情大卡片弹窗
 *
 * 功能：
 * - 顶部：项目标题 + 状态徽章 + 外链按钮（GitHub / 网站）+ 关闭
 * - 中间：元信息行（stars / language / lastPush / techStack）
 * - 底部：项目 Markdown 正文渲染后的安全 HTML
 *
 * 双链接按钮：从 githubUrl / websiteUrl 渲染，不再使用 url
 * 移动端：bottom sheet 风格，safe-area 适配
 * 生命周期：body overflow 补偿 + keydown 监听完整清理
 */
import { computed, watch, onBeforeUnmount } from 'vue'
import { getProjectStatusColor, type Project } from '../shared/project'

// ------------------------------------------------------------------ Props & Emits
const props = defineProps<{
  modelValue: boolean
  project: Project | null
  contentHtml: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const renderedHtml = computed(() => {
  if (!props.contentHtml) return '<p class="no-readme">暂无项目详情内容</p>'
  return props.contentHtml
})

// ------------------------------------------------------------------ 滚动条补偿
let savedBodyOverflow = ''
let savedBodyPaddingRight = ''

function lockBody() {
  savedBodyOverflow = document.body.style.overflow
  savedBodyPaddingRight = document.body.style.paddingRight
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  document.body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = scrollbarWidth + 'px'
  }
}

function unlockBody() {
  document.body.style.overflow = savedBodyOverflow
  document.body.style.paddingRight = savedBodyPaddingRight
}

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

// 打开/关闭时切换 body 滚动 & 键盘监听（含 immediate 覆盖已打开挂载场景）
// SSR 守卫：server 环境下 document 不存在，跳过
watch(
  () => props.modelValue,
  (val) => {
    if (typeof document === 'undefined') return
    if (val) {
      document.addEventListener('keydown', onKeydown)
      lockBody()
    } else {
      document.removeEventListener('keydown', onKeydown)
      unlockBody()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  if (typeof document === 'undefined') return
  document.removeEventListener('keydown', onKeydown)
  if (props.modelValue) unlockBody()
})

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
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
                  backgroundColor: getProjectStatusColor(project.status) + '22',
                  color: getProjectStatusColor(project.status),
                }"
              >
                {{ project.status }}
              </span>
            </div>
            <div class="modal-header-right">
              <!-- 访问网站按钮 -->
              <a
                v-if="project.websiteUrl"
                :href="project.websiteUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="link-btn website-btn"
              >
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm5.5 8h-1.34c-.13-.43-.28-.84-.45-1.22l.88-.63.88 1.52-1.02.33zm.5-2l-1 1.73c-.24.41-.51.8-.8 1.15l1.57.9-.87 1.51-1.72-.72c-.55.6-1.17 1.09-1.84 1.46l.18 1.83-1.74.64-1.08-1.7c-.5.12-1.02.2-1.56.22v1.84H4.5v-1.84c-.54-.02-1.06-.1-1.56-.22L1.86 14.9l-1.74-.64.18-1.83c-.67-.37-1.29-.86-1.84-1.46L-1.86 11.8l-.87-1.51 1.57-.9c-.29-.35-.56-.74-.8-1.15L-1.48 6H-2.84c.05-.65.16-1.28.34-1.88l-1.08-.6.88-1.52.88.63c-.17.38-.32.79-.45 1.22H-3.4A8 8 0 008 0z" transform="translate(3 0)" />
                </svg>
                访问网站
              </a>
              <!-- GitHub 按钮 -->
              <a
                v-if="project.githubUrl"
                :href="project.githubUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="link-btn github-btn"
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

          <!-- ========== 项目详情正文 ========== -->
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
  flex: 1;
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
  flex-wrap: wrap;
  justify-content: flex-end;
}

/* ================================================================ 外链按钮（通用） */
.link-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.link-btn:hover {
  transform: translateY(-1px);
  text-decoration: none;
}

.link-btn:active {
  transform: translateY(0);
}

.github-btn {
  background: var(--vp-c-brand-1, #B026FF);
  color: #fff;
}

.github-btn:hover {
  background: var(--vp-c-brand-2, #8a1fd6);
  color: #fff;
}

.website-btn {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.website-btn:hover {
  background: var(--vp-c-default-soft);
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
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
  min-height: 0;
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

/* ================================================================ 小屏适配 — bottom sheet */
@media (max-width: 640px) {
  .modal-overlay {
    padding: 0;
    align-items: flex-end;
    /* 半透明遮罩，露出 bottom sheet 上方 */
  }

  .modal-container {
    max-height: 92vh;  /* 回退：不支持 dvh 的浏览器 */
    max-height: 92dvh; /* 优先：支持 dvh 的浏览器覆盖上面 */
    border-radius: 14px 14px 0 0;
    /* safe-area 底部留白 */
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .modal-header {
    padding: 14px 18px;
    flex-wrap: wrap;
    gap: 8px;
  }

  .modal-header-left {
    /* 允许标题换行，不挤压关闭按钮 */
    flex-wrap: wrap;
    min-width: 0;
  }

  .modal-header-right {
    /* 允许按钮换行堆叠 */
    flex-wrap: wrap;
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

  .link-btn {
    padding: 6px 10px;
    font-size: 12px;
  }
}
</style>

<!-- README 溢出控制（非 scoped，深层选择器作用于 v-html 渲染内容） -->
<style>
/* 图片不撑破容器 */
.readme-content img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* 表格可横向滚动 */
.readme-content table {
  display: block;
  overflow-x: auto;
  max-width: 100%;
}

/* 代码块换行 + 断词 */
.readme-content pre {
  white-space: pre-wrap;
  word-break: break-all;
  overflow-x: auto;
  max-width: 100%;
}

.readme-content code {
  word-break: break-all;
}

/* 行内代码不撑破 */
.readme-content p code,
.readme-content li code,
.readme-content td code {
  word-break: break-all;
  white-space: pre-wrap;
}

/* 长链接断词 */
.readme-content a {
  word-break: break-all;
}

/* 嵌套列表/段落不溢出 */
.readme-content * {
  overflow-wrap: break-word;
}
</style>
