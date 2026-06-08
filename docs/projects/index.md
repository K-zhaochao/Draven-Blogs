---
title: 项目实战
layout: page
---

<script setup>
import { ref } from 'vue'
import { data } from './projects.data'
import ProjectCard from '../.vitepress/components/ProjectCard.vue'
import ProjectModal from '../.vitepress/components/ProjectModal.vue'

const manualProjects = data.manualProjects
const aiProjects = data.aiProjects
const otherProjects = data.otherProjects
const demoProjects = data.demoProjects

// Modal 状态
const modalVisible = ref(false)
const selectedProject = ref(null)

function onProjectSelect(project) {
  selectedProject.value = project
  modalVisible.value = true
}
</script>

# 项目实战

> 纸上得来终觉浅，绝知此事要躬行。

学习的最终目的是解决问题。这个板块记录了我参与或主导的项目，从需求分析到技术选型，从编码实现到踩坑修复，尽量完整地还原整个过程。

<div v-if="manualProjects.length > 0">

## 🛠 手搓 / 协作项目

<div class="project-grid">
  <ProjectCard
    v-for="p in manualProjects"
    :key="p.slug"
    :project="p"
    @select="onProjectSelect"
  />
</div>

</div>

<div v-if="aiProjects.length > 0">

## 🤖 AI Vibe Coding

<div class="project-grid">
  <ProjectCard
    v-for="p in aiProjects"
    :key="p.slug"
    :project="p"
    @select="onProjectSelect"
  />
</div>

</div>

<div v-if="otherProjects.length > 0">

## 📂 其他项目

<div class="project-grid">
  <ProjectCard
    v-for="p in otherProjects"
    :key="p.slug"
    :project="p"
    @select="onProjectSelect"
  />
</div>

</div>

<div v-if="demoProjects.length > 0">

## 🧪 Demo

<div class="project-grid">
  <ProjectCard
    v-for="p in demoProjects"
    :key="p.slug"
    :project="p"
    @select="onProjectSelect"
  />
</div>

</div>

<!-- 大卡片弹窗 -->
<ProjectModal
  v-model="modalVisible"
  :project="selectedProject"
  :content-html="selectedProject?.contentHtml || ''"
/>
