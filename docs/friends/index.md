---
layout: page
title: 友链
---

<script setup>
import { data } from './friends.data'
import FriendCard from '../.vitepress/components/FriendCard.vue'
</script>

# 🤝 友链

欢迎来访，也欢迎交换友链！

> **想和我交换友链？** 请发送邮件到 [Draven323@matehub.top[点击跳转]](mailto:Draven323@matehub.top?subject=友链交换申请&body=你好%20Draven,%0D%0A%0D%0A我想与你交换友链，以下是我的博客信息：%0D%0A%0D%0A-%20名称：%0D%0A-%20头像URL：%0D%0A-%20简介：%0D%0A-%20URL：%0D%0A-%20博客主题[选填]：%0D%0A-%20RSS[选填]：)**，附上你的博客名称、URL、头像URL和一句话简介。**

<div v-if="data.friends.length === 0" class="empty-hint">
  🏗️ 还没有友链，快来成为第一个吧～
</div>

<div v-else class="friend-grid">
  <FriendCard v-for="friend in data.friends" :key="friend.url" :friend="friend" />
</div>
