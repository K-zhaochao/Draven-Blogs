import { defineConfig } from 'vitepress'
import { generateSidebar } from 'vitepress-sidebar'
import taskLists from 'markdown-it-task-lists'

// 递归为侧边栏所有 link 添加前缀，并清理 index.md 后缀
function prefixSidebarLinks(items: any[], prefix: string): any[] {
  return items.map((item) => {
    const newItem = { ...item };
    if (newItem.link) {
      let link = newItem.link;
      // 去掉末尾的 /index.md，让 VitePress 正确路由到文件夹首页
      link = link.replace(/\/index\.md$/, '/');
      newItem.link = prefix + link;
    }
    if (newItem.items) {
      newItem.items = prefixSidebarLinks(newItem.items, prefix);
    }
    return newItem;
  });
}

export default defineConfig({
  ignoreDeadLinks: true,
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

    // 1.按路径分区域生成侧边栏（不同导航区域显示各自的目录）
    sidebar: {
      // Java 核心区域
      '/java/': prefixSidebarLinks(generateSidebar({
        documentRootPath: 'docs/java',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        useFolderLinkFromIndexFile: true,
        folderLinkNotIncludesFileName: true,
        sortMenusByFrontmatterOrder: true,
        collapsed: false
      }), '/java/'),
      // 学习笔记区域
      '/notes/': prefixSidebarLinks(generateSidebar({
        documentRootPath: 'docs/notes',
        useTitleFromFrontmatter: true,
        useFolderTitleFromIndexFile: true,
        useFolderLinkFromIndexFile: true,
        folderLinkNotIncludesFileName: true,
        sortMenusByFrontmatterOrder: true,
        collapsed: false
      }), '/notes/')
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