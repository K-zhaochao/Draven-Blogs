<template>
  <button
    class="ThemeToggle"
    type="button"
    :title="tooltipText"
    :aria-label="tooltipText"
    @click="cycleTheme"
  >
    <!-- 自动：Monitor 图标（跟随系统） -->
    <Monitor v-if="mode === 'auto'" class="toggle-icon" />

    <!-- 亮色：太阳 -->
    <svg v-else-if="mode === 'light'" class="toggle-icon" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill="currentColor" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>

    <!-- 暗色：月亮 -->
    <svg v-else class="toggle-icon" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" fill="currentColor" />
    </svg>
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useData } from 'vitepress'
import { Monitor } from 'lucide-vue-next'

const { isDark } = useData()

const MODE_KEY = 'vitepress-theme-mode'
const APPEARANCE_KEY = 'vitepress-theme-appearance'

const modes = ['auto', 'light', 'dark'] as const
type ThemeMode = (typeof modes)[number]

const mode = ref<ThemeMode>('auto')
const tooltipText = ref('自动主题（跟随系统）')

let mediaQuery: MediaQueryList | null = null

function applyTheme(m: ThemeMode) {
  if (typeof window === 'undefined') return

  if (m === 'auto') {
    localStorage.removeItem(APPEARANCE_KEY)
    isDark.value = mediaQuery?.matches ?? false
    tooltipText.value = '自动主题（跟随系统）'
  } else if (m === 'light') {
    localStorage.setItem(APPEARANCE_KEY, 'light')
    isDark.value = false
    tooltipText.value = '亮色主题'
  } else {
    localStorage.setItem(APPEARANCE_KEY, 'dark')
    isDark.value = true
    tooltipText.value = '暗色主题'
  }
}

function cycleTheme() {
  const idx = modes.indexOf(mode.value)
  const next = modes[(idx + 1) % modes.length]
  mode.value = next
  localStorage.setItem(MODE_KEY, next)
  applyTheme(next)
}

function onSystemChange(e: MediaQueryListEvent) {
  if (mode.value === 'auto') {
    isDark.value = e.matches
  }
}

onMounted(() => {
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  // 恢复用户之前的选择
  const saved = localStorage.getItem(MODE_KEY)
  if (saved && (modes as readonly string[]).includes(saved)) {
    mode.value = saved as ThemeMode
  }
  applyTheme(mode.value)

  mediaQuery.addEventListener('change', onSystemChange)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', onSystemChange)
})
</script>

<style scoped>
.ThemeToggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  padding: 0;
  margin: 0 0 0 4px;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}

.ThemeToggle:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
}

.ThemeToggle:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  transition: transform 0.3s ease;
}

.ThemeToggle:active .toggle-icon {
  transform: scale(0.85);
}
</style>
