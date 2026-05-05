// 1. 导入 VitePress 的默认主题
import DefaultTheme from 'vitepress/theme'
// 2. 导入你刚才写的赛博朋克紫色 CSS
import './custom.css'

// 3. 导出这个主题
// 这里使用了 extends 语法，表示我们在默认主题的基础上进行扩展
export default {
  extends: DefaultTheme,
  // 如果以后你要添加全局组件，可以在这里注册
  enhanceApp({ app, router, siteData }) {
    // ...
  }
}