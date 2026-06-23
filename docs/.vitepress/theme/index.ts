import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick, h } from 'vue'
import { useRoute } from 'vitepress'
import type { EnhanceAppContext } from 'vitepress'
import mediumZoom from 'medium-zoom'
import ArtalkComment from '../components/ArtalkComment.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

import './custom.css'

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    const initZoom = () => {
      // 对 class 为 vp-doc 下的所有图片开启缩放（排除带有 no-zoom 类的图）
      mediumZoom('.vp-doc img:not(.no-zoom)', { background: 'var(--vp-c-bg)' })
    }

    onMounted(() => {
      initZoom()
    })

    watch(
      () => route.path,
      () => nextTick(() => initZoom())
    )
  },

  // 如果以后你要添加全局组件，可以在这里注册
  enhanceApp({ app, router, siteData }: EnhanceAppContext) {
    // ...
  },

  Layout() {
    return h(DefaultTheme.Layout, null, {
      // 自定义三段主题切换（自动/亮色/暗色），替换默认的二段开关
      'nav-bar-content-after': () => h(ThemeToggle),
      // 利用 VitePress 的插槽，将评论组件挂载在正文的最后面
      'doc-after': () => h(ArtalkComment)
    })
  }
}