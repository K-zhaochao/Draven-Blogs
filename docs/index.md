---
layout: home

hero:
  name: "Draven's Blogs"
  text: "写代码，记笔记，偶尔想点有的没的。"
  tagline: 一个计算机专业学生的个人空间，记录学习、实践与思考。
  actions:
    - theme: brand
      text: 进来坐坐 →
      link: /notes/
    - theme: alt
      text: GitHub
      link: https://github.com/K-zhaochao/Draven-Blogs

features:
  - icon: 📝
    title: 学习笔记
    details: Java、JavaWeb、Python…… 这些笔记不是什么权威教程，只是我在学习路上留下的脚印。写下来，才不会忘。
    link: /notes/
  - icon: 🔨
    title: 项目实战
    details: 纸上得来终觉浅。这里记录了我参与或主导的项目，从需求分析到踩坑修复，完整呈现。
    link: /projects/
  - icon: 💭
    title: 思考与总结
    details: 这里是一些我在学习和实践过程中的思考与总结。可能是对某个技术选型的纠结，可能是对某种编程范式的理解。
    link: /thoughts/
---

<script setup>
import { data as projectData } from './projects/projects.data'

const allProjects = [
  ...projectData.manualProjects,
  ...projectData.aiProjects,
  ...projectData.otherProjects,
  ...projectData.demoProjects,
]
const totalStars = allProjects.reduce((sum, p) => sum + (p.stars || 0), 0)
const activeCount = allProjects.filter(p => p.status !== '已归档').length

const noteCategories = [
  { title: 'Java', desc: '基础→集合→IO→多线程', link: '/notes/Java/' },
  { title: 'JavaWeb', desc: 'Spring Boot · MyBatis · MySQL', link: '/notes/JavaWeb/' },
  { title: 'Redis', desc: '缓存 · 分布式锁 · 高并发', link: '/notes/Redis/' },
  { title: '苍穹外卖', desc: 'Spring Boot 实战项目笔记', link: '/notes/苍穹外卖/' },
  { title: 'Python', desc: '基础语法 · 数据容器 · 可视化', link: '/notes/Python/' },
]
</script>

<div class="home-section">
  <h2 class="home-section-title"><span class="section-icon">⚡</span> 技术栈</h2>
  <div class="tech-stack-grid">
    <span class="tech-badge">☕ Java</span>
    <span class="tech-badge">🍃 Spring Boot</span>
    <span class="tech-badge">🗄️ MySQL</span>
    <span class="tech-badge">⚡ Redis</span>
    <span class="tech-badge">🦅 MyBatis</span>
    <span class="tech-badge">💚 Vue 3</span>
    <span class="tech-badge">📘 TypeScript</span>
    <span class="tech-badge">📖 VitePress</span>
    <span class="tech-badge">🦙 TinaCMS</span>
    <span class="tech-badge">🐍 Python</span>
    <span class="tech-badge">🔧 Git / GitHub Actions</span>
  </div>
</div>

<div class="home-section">
  <h2 class="home-section-title"><span class="section-icon">📝</span> 最近笔记</h2>
  <div class="note-category-grid">
    <a
      v-for="cat in noteCategories"
      :key="cat.title"
      :href="cat.link"
      class="note-category-card"
    >
      <div class="note-cat-name">{{ cat.title }}</div>
      <div class="note-cat-desc">{{ cat.desc }}</div>
    </a>
  </div>
</div>

<div class="home-section">
  <h2 class="home-section-title"><span class="section-icon">🚀</span> 项目状态</h2>
  <div class="project-status-row">
    <div class="project-stat-card">
      <div class="stat-number">{{ allProjects.length }}</div>
      <div class="stat-label">开源项目</div>
    </div>
    <div class="project-stat-card">
      <div class="stat-number">{{ activeCount }}</div>
      <div class="stat-label">活跃项目</div>
    </div>
    <a href="/projects/" class="project-stat-card project-stat-link">
      <div class="stat-number">{{ totalStars }}</div>
      <div class="stat-label">⭐ 总 Stars</div>
    </a>
    <a href="https://github.com/K-zhaochao/Draven-Blogs" target="_blank" rel="noopener noreferrer" class="project-stat-card project-stat-link">
      <div class="stat-number">→</div>
      <div class="stat-label">GitHub 主页</div>
    </a>
  </div>
</div>

<div class="home-footer">
  <p>Code like a dreamer, build like an engineer.</p>
</div>
