<template>
  <div class="comment-container">
    <!-- Artalk 挂载点 -->
    <div id="artalk-comments"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useData } from 'vitepress'

const route = useRoute()
const { isDark } = useData()

let artalkInstance = null
let retryTimers = []

/**
 * 强制将 Artalk 主题同步到 VitePress 当前状态。
 * 由于 Artalk 内部有异步流程（服务端配置加载、matchMedia 监听）会覆盖我们的设置，
 * 这里用 setTimeout 链在 init 后 0~1s 内反复纠正，直到 Artalk 稳定。
 */
const forceTheme = (dark, attempt = 0) => {
  if (!artalkInstance) return
  artalkInstance.setDarkMode(dark)
  // 共重试 5 次：0ms, 200ms, 400ms, 600ms, 1000ms
  if (attempt < 4) {
    const timer = setTimeout(() => forceTheme(dark, attempt + 1), 200)
    retryTimers.push(timer)
  }
}

const initArtalk = async () => {
  const el = document.getElementById('artalk-comments')
  if (!el) return

  const Artalk = (await import('artalk')).default
  await import('artalk/dist/Artalk.css')

  // 不传 darkMode —— 不让 Artalk 进入 auto 模式去监听系统偏好
  artalkInstance = Artalk.init({
    el: '#artalk-comments',
    pageKey: route.path,
    pageTitle: document.title || '无标题',
    server: import.meta.env.DEV ? '/artalk-api' : 'https://comment.matehub.top/',
    site: 'Draven\'s Blog',
  })

  // 初始强制同步主题（带延迟重试，覆盖 Artalk 的异步初始化）
  await nextTick()
  forceTheme(isDark.value)
}

const clearTimers = () => {
  retryTimers.forEach(clearTimeout)
  retryTimers = []
}

onMounted(() => {
  initArtalk()
})

// 用户切换 VitePress 主题时，强制同步（带重试）
watch(
  () => isDark.value,
  (dark) => {
    clearTimers()
    forceTheme(dark)
  },
)

// 路由切换
watch(
  () => route.path,
  async () => {
    clearTimers()
    if (artalkInstance) {
      artalkInstance.destroy()
      artalkInstance = null
    }
    await nextTick()
    await initArtalk()
  }
)

onBeforeUnmount(() => {
  clearTimers()
  if (artalkInstance) {
    artalkInstance.destroy()
    artalkInstance = null
  }
})
</script>

<style scoped>
.comment-container {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
}
</style>