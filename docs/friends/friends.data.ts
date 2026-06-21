/**
 * friends.data.ts
 * VitePress 数据加载器 — 友链
 * 职责：读取 docs/friends/friends.json，暴露为 { friends } 供页面消费
 */

import { createContentLoader } from 'vitepress'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Friend } from '../.vitepress/shared/friend'

// ---------- 数据导出 ----------

export default {
    async load(): Promise<{ friends: Friend[] }> {
        const configDir = dirname(fileURLToPath(import.meta.url))
        const jsonPath = join(configDir, 'friends.json')
        const raw = readFileSync(jsonPath, 'utf-8')
        const friends: Friend[] = JSON.parse(raw)
        return { friends }
    }
}
