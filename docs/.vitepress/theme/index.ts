import DefaultTheme from 'vitepress/theme'
import { onMounted, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import type { EnhanceAppContext } from 'vitepress'
import mediumZoom from 'medium-zoom'


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
  }
}