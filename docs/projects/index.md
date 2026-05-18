---
title: 项目实战
layout: page
---

<script setup>
import { data } from './projects.data'
import ProjectCard from '../.vitepress/components/ProjectCard.vue'

const manualProjects = data.manualProjects
const aiProjects = data.aiProjects
</script>

# 项目实战

> 纸上得来终觉浅，绝知此事要躬行。

学习的最终目的是解决问题。这个板块记录了我参与或主导的项目，从需求分析到技术选型，从编码实现到踩坑修复，尽量完整地还原整个过程。

## 🛠 手搓 / 协作项目

<div class="project-grid">
  <ProjectCard v-for="p in manualProjects" :key="p.title" :project="p" />
</div>

## 🤖 AI Vibe Coding

<div class="project-grid">
  <ProjectCard v-for="p in aiProjects" :key="p.title" :project="p" />
</div>
