import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Draven's Blogs",
  description: "Code like a dreamer, build like an engineer.",
  // 赛博朋克紫色调的主色设置
  themeConfig: {
    logo: 'https://skillicons.dev/icons?i=java', 
    nav: [
      { text: '首页', link: '/' },
      { text: 'Java 核心', link: '/java/index' },
      { text: '项目实战', link: '/projects/index' },
      { text: '思考与总结', link: '/thoughts/index' },
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

    sidebar: {
      '/java/': [
        {
          text: 'Java 基础进阶',
          items: [
            { text: 'HashMap 源码深度解析', link: '/java/hashmap' },
            { text: 'JVM 内存模型总结', link: '/java/jvm' },
          ]
        }
      ],
      '/projects/': [
        {
          text: '实战项目',
          items: [
            { text: '苍穹外卖：核心架构设计', link: '/projects/sky-takeout' },
            { text: 'Redis 在外卖业务中的应用', link: '/projects/redis-action' },
          ]
        }
      ],
      '/thoughts/': [
        {
          text: '技术随笔',
          items: [
            { text: '大二下学期的迷茫与突破', link: '/thoughts/2024-summary' },
            { text: '为什么我选择自建博客', link: '/thoughts/why-blog' },
          ]
        }
      ]
    },

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