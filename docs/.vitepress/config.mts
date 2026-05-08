import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import taskLists from 'markdown-it-task-lists'

export default defineConfig({
  base: '/',
  title: "Draven's Blogs",
  description: "Code like a dreamer, build like an engineer.",
  lastUpdated: true, // 3.开启最后更新时间
  // 配置 markdown
  markdown: {
    config: (md) => {
      md.use(taskLists) // 2.任务列表支持
    }
  },
  // 赛博朋克紫色调的主色设置
  themeConfig: {
    lastUpdated: {
      text: '最后更新于'
    },
    logo: 'https://skillicons.dev/icons?i=java', 
    nav: [
      { text: '首页', link: '/' },
      { text: 'Java 核心', link: '/java/index' },
      { text: '项目实战', link: '/projects/index' },
      { text: '思考与总结', link: '/thoughts/index' },
      { text: '学习笔记', link: '/notes/index' }, 
      { text: 'GitHub', link: 'https://github.com/K-zhaochao' }
    ],

    // 搜索功能配置
    search: {
      provider: 'local',
      options: {
        locales: {
          root: { // 注意：如果要汉化，建议放在 root 节点下
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },

    // 1.自动生成侧边栏
    sidebar: generateSidebar({
      documentRootPath: 'docs', // 文档根目录
      useTitleFromFileHeading: true, // 从文件标题获取侧边栏名称
      useTitleFromFrontmatter: true, // 优先使用 frontmatter 中的 title
      useFolderTitleFromIndexFile: true, // 文件夹标题使用其内部的 index.md
      sortMenusByFrontmatterOrder: true, // 支持按 frontmatter order 排序
      collapsed: false // 是否默认折叠
    }),

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/K-zhaochao' }
    ],

    outline: {
      label: '本页目录', 
      level: [2, 4], 
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026-present Draven | <a href="https://beian.miit.gov.cn/" target="_blank" style="color: var(--vp-c-brand-1); text-decoration: none;">黔ICP备2025056580号</a>'
    }
  }
})