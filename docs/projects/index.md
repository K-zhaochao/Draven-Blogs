---
title: 项目实战
layout: page
---

<script setup>
import { ref } from 'vue'
import { data } from './projects.data'
import ProjectCard from '../.vitepress/components/ProjectCard.vue'
import ProjectModal from '../.vitepress/components/ProjectModal.vue'
import readmeCache from './readme-cache.json'

const manualProjects = data.manualProjects
const aiProjects = data.aiProjects
const otherProjects = data.otherProjects

// Modal 状态
const modalVisible = ref(false)
const selectedProject = ref(null)
const readmeContent = ref('')

function onProjectSelect(project) {
  selectedProject.value = project
  readmeContent.value = readmeCache[project.slug] || ''
  modalVisible.value = true
}
</script>

# 项目实战

> 纸上得来终觉浅，绝知此事要躬行。

学习的最终目的是解决问题。这个板块记录了我参与或主导的项目，从需求分析到技术选型，从编码实现到踩坑修复，尽量完整地还原整个过程。

## 🛠 手搓 / 协作项目

<div class="project-grid">
  <ProjectCard
    v-for="p in manualProjects"
    :key="p.title"
    :project="p"
    @select="onProjectSelect"
  />
</div>

## 🤖 AI Vibe Coding

<div class="project-grid">
  <ProjectCard
    v-for="p in aiProjects"
    :key="p.title"
    :project="p"
    @select="onProjectSelect"
  />
</div>

## 📂 其他项目

<div class="project-grid">
  <ProjectCard
    v-for="p in otherProjects"
    :key="p.title"
    :project="p"
    @select="onProjectSelect"
  />
</div>

<!-- 大卡片弹窗 -->
<ProjectModal
  v-model="modalVisible"
  :project="selectedProject"
  :readme-raw="readmeContent"
/>

<style>
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 16px;
}
</style>
