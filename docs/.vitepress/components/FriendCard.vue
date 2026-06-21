<script setup lang="ts">
/**
 * FriendCard.vue
 * 友链卡片组件
 * 职责：渲染单个友链（头像、名称、简介、标签、RSS）
 * Props: friend — 包含 name, avatar, desc, url, topics, rss
 * 整卡可点击跳转到对方博客
 */

import type { Friend } from '../shared/friend'

defineProps<{
  friend: Friend
}>()
</script>

<template>
  <a
    class="friend-card"
    :href="friend.url"
    target="_blank"
    rel="noopener noreferrer"
    :aria-label="`访问友链: ${friend.name}`"
  >
    <!-- 顶部：头像 + 名称 -->
    <div class="friend-header">
      <img
        class="friend-avatar"
        :src="friend.avatar"
        :alt="`${friend.name} 头像`"
        width="48"
        height="48"
        loading="lazy"
      />
      <div class="friend-info">
        <h3 class="friend-name">{{ friend.name }}</h3>
        <p class="friend-desc">{{ friend.desc }}</p>
      </div>
    </div>

    <!-- 标签列表 -->
    <div v-if="friend.topics && friend.topics.length" class="friend-tags">
      <span v-for="tag in friend.topics" :key="tag" class="friend-tag">
        {{ tag }}
      </span>
      <!-- RSS 图标 -->
      <a
        v-if="friend.rss"
        :href="friend.rss"
        target="_blank"
        rel="noopener noreferrer"
        class="friend-rss-link"
        :aria-label="`${friend.name} 的 RSS`"
        title="RSS 订阅"
        @click.stop
      >
        <svg class="rss-icon" viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20C5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
        </svg>
      </a>
    </div>
  </a>
</template>

<style scoped>
.friend-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 22px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider, #e2e2e2);
  background: var(--vp-c-bg-soft, #f9f9f9);
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.25s ease;
}

.friend-card:hover {
  transform: translateY(-3px);
  border-color: var(--vp-c-brand-1, #B026FF);
  box-shadow: 0 0 14px rgba(176, 38, 255, 0.18), 0 4px 12px rgba(0, 0, 0, 0.08);
  text-decoration: none;
  color: inherit;
}

.friend-card:focus-visible {
  outline: 2px solid var(--vp-c-brand-1, #B026FF);
  outline-offset: 2px;
}

/* ---- 头像 + 信息 ---- */
.friend-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.friend-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  background: var(--vp-c-divider, #e2e2e2);
}

.friend-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.friend-name {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.friend-desc {
  font-size: 13px;
  color: var(--vp-c-text-2, #666);
  line-height: 1.45;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ---- 标签 ---- */
.friend-tags {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.friend-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  line-height: 1.6;
  background: var(--vp-c-brand-1, #B026FF);
  color: #fff;
  opacity: 0.82;
}

.friend-rss-link {
  display: inline-flex;
  align-items: center;
  margin-left: auto;
  padding: 4px;
  border-radius: 6px;
  color: var(--vp-c-text-2, #999);
  transition: color 0.2s ease, background 0.2s ease;
}

.friend-rss-link:hover {
  color: #f97316;
  background: rgba(249, 115, 22, 0.1);
}

.rss-icon {
  display: block;
}
</style>
