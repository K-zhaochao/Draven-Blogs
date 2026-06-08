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

<div class="hero-strip">
  <a href="/notes/" class="strip-card">
    <span class="strip-icon">📝</span>
    <span class="strip-num">{{ noteCategories.length }}</span>
    <span class="strip-label">门笔记</span>
  </a>
  <a href="/projects/" class="strip-card">
    <span class="strip-icon">📦</span>
    <span class="strip-num">{{ allProjects.length }}</span>
    <span class="strip-label">个项目</span>
  </a>
  <a href="/thoughts/" class="strip-card">
    <span class="strip-icon">✍️</span>
    <span class="strip-num">博客</span>
    <span class="strip-label">技术 & 生活</span>
  </a>
  <a href="https://github.com/K-zhaochao" target=_blank class="strip-card">
    <span class="strip-icon">☕</span>
    <span class="strip-num">Java</span>
    <span class="strip-label">主攻方向</span>
  </a>
</div>

<div class="home-section">
  <h2 class="home-section-title"><span class="section-icon">📝</span> 学习笔记</h2>
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
    <a href="/projects/" class="project-stat-card">
      <div class="stat-number">{{ allProjects.length }}</div>
      <div class="stat-label">开源项目</div>
    </a>
    <a href="/projects/" class="project-stat-card">
      <div class="stat-number">{{ activeCount }}</div>
      <div class="stat-label">活跃项目</div>
    </a>
    <!-- <a href="/projects/" class="project-stat-card project-stat-link">
      <div class="stat-number">{{ totalStars }}</div>
      <div class="stat-label">⭐ 总 Stars</div>
    </a> -->
    <a href="https://github.com/K-zhaochao" target="_blank" rel="noopener noreferrer" class="project-stat-card project-stat-link">
      <div class="stat-number">→</div>
      <div class="stat-label">GitHub 主页</div>
    </a>
  </div>
</div>

<div class="home-section">
  <h2 class="home-section-title"><span class="section-icon">⚡</span> 技术栈 & 学习资源</h2>
  <div class="tech-stack-grid">
    <a href="https://www.liaoxuefeng.com/wiki/1252599548343744" target="_blank" rel="noopener noreferrer" class="tech-badge">☕ Java</a>
    <a href="https://spring.io/projects/spring-boot" target="_blank" rel="noopener noreferrer" class="tech-badge">🍃 Spring Boot</a>
    <a href="https://www.runoob.com/mysql/mysql-tutorial.html" target="_blank" rel="noopener noreferrer" class="tech-badge">🗄️ MySQL</a>
    <a href="https://www.runoob.com/redis/redis-tutorial.html" target="_blank" rel="noopener noreferrer" class="tech-badge">⚡ Redis</a>
    <a href="https://mybatis.org/mybatis-3/zh/" target="_blank" rel="noopener noreferrer" class="tech-badge">🦅 MyBatis</a>
    <a href="https://baomidou.com/" target="_blank" rel="noopener noreferrer" class="tech-badge">➕ MyBatis-Plus</a>
    <a href="https://maven.apache.org/guides/" target="_blank" rel="noopener noreferrer" class="tech-badge">📦 Maven</a>
    <a href="https://tomcat.apache.org/" target="_blank" rel="noopener noreferrer" class="tech-badge">🐱 Tomcat</a>
    <a href="https://www.runoob.com/w3cnote/nginx-tutorial.html" target="_blank" rel="noopener noreferrer" class="tech-badge">🌐 Nginx</a>
    <a href="https://www.liaoxuefeng.com/wiki/1016959663602400" target="_blank" rel="noopener noreferrer" class="tech-badge">🐍 Python</a>
    <a href="https://www.runoob.com/cprogramming/c-tutorial.html" target="_blank" rel="noopener noreferrer" class="tech-badge">🔵 C</a>
    <a href="https://www.runoob.com/cplusplus/cpp-tutorial.html" target="_blank" rel="noopener noreferrer" class="tech-badge">🔷 C++</a>
    <a href="https://developer.mozilla.org/zh-CN/docs/Web/HTML" target="_blank" rel="noopener noreferrer" class="tech-badge">🏗️ HTML</a>
    <a href="https://developer.mozilla.org/zh-CN/docs/Web/CSS" target="_blank" rel="noopener noreferrer" class="tech-badge">🎨 CSS</a>
    <a href="https://zh.javascript.info/" target="_blank" rel="noopener noreferrer" class="tech-badge">📜 JavaScript</a>
    <a href="https://cn.vuejs.org/" target="_blank" rel="noopener noreferrer" class="tech-badge">💚 Vue 3</a>
    <a href="https://vitepress.dev/zh/" target="_blank" rel="noopener noreferrer" class="tech-badge">📖 VitePress</a>
    <a href="https://www.liaoxuefeng.com/wiki/896043488029600" target="_blank" rel="noopener noreferrer" class="tech-badge">🔀 Git</a>
    <a href="https://www.runoob.com/docker/docker-tutorial.html" target="_blank" rel="noopener noreferrer" class="tech-badge">🐳 Docker</a>
    <a href="https://www.runoob.com/linux/linux-tutorial.html" target="_blank" rel="noopener noreferrer" class="tech-badge">🐧 Linux</a>
    <a href="https://www.jetbrains.com/zh-cn/idea/" target="_blank" rel="noopener noreferrer" class="tech-badge">🧠 IDEA</a>
    <a href="https://code.visualstudio.com/" target="_blank" rel="noopener noreferrer" class="tech-badge">🔧 VS Code</a>
  </div>
</div>

<div class="home-footer">
  <p>Code like a dreamer, build like an engineer.</p>
</div>
