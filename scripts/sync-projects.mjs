#!/usr/bin/env node

/**
 * sync-projects.mjs
 * 从 GitHub API 拉取项目状态，写回 docs/projects/*.md 的 frontmatter。
 *
 * 用法：
 *   node scripts/sync-projects.mjs
 *
 * 环境变量：
 *   GITHUB_TOKEN — 可选，用于提高 GitHub API rate limit
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";

// ------------------------------------------------------------------ 路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const PROJECTS_DIR = path.join(ROOT_DIR, "docs", "projects");

// ------------------------------------------------------------------ GitHub 请求
const GITHUB_API = "https://api.github.com/repos";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";

/**
 * 调用 GitHub API 获取仓库信息
 * @param {string} ownerRepo - 格式 "owner/repo"
 * @returns {Promise<object|null>} 仓库信息或 null（失败时）
 */
async function fetchRepoInfo(ownerRepo) {
  const url = `${GITHUB_API}/${ownerRepo}`;
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "sync-projects-script",
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(`  ⚠ GitHub API 返回 ${res.status}：${ownerRepo}`);
      return null;
    }
    return await res.json();
  } catch (err) {
    console.warn(`  ⚠ 请求失败：${ownerRepo} — ${err.message}`);
    return null;
  }
}

// ------------------------------------------------------------------ 主流程
async function main() {
  // 1. 收集 docs/projects/ 下所有 .md（排除 index.md）
  const files = fs.readdirSync(PROJECTS_DIR).filter((f) => {
    return f.endsWith(".md") && f.toLowerCase() !== "index.md";
  });

  if (files.length === 0) {
    console.log("没有找到项目文件，跳过。");
    return;
  }

  console.log(`找到 ${files.length} 个项目文件，开始同步…\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of files) {
    const filePath = path.join(PROJECTS_DIR, file);
    const raw = fs.readFileSync(filePath, "utf-8");
    const { data: frontmatter, content } = matter(raw);

    const slug = file.replace(/\.md$/i, "");
    const github = frontmatter.github;

    // 没有 github 字段 → 跳过
    if (!github || typeof github !== "string") {
      console.log(`⏭  ${slug} — 无 github 字段，跳过`);
      skipped++;
      continue;
    }

    console.log(`🔍 ${slug} — 正在获取 ${github} …`);

    const repo = await fetchRepoInfo(github);
    if (!repo) {
      failed++;
      continue;
    }

    // 2. 写回 frontmatter 字段
    frontmatter.stars = repo.stargazers_count ?? 0;
    frontmatter.lastPush = (repo.pushed_at || "").slice(0, 10); // YYYY-MM-DD
    frontmatter.language = repo.language ?? "";

    // 仅当项目 md 中 description 为空时，才用仓库描述回填
    if (!frontmatter.description && repo.description) {
      frontmatter.description = repo.description;
    }

    // 3. 写回文件
    const updatedContent = matter.stringify(content, frontmatter);
    fs.writeFileSync(filePath, updatedContent, "utf-8");

    console.log(
      `✅ ${slug} — ⭐ ${frontmatter.stars}  📅 ${frontmatter.lastPush}  🔤 ${frontmatter.language}`,
    );
    updated++;
  }

  // ---------------------------------------------------------------- 汇总
  console.log("\n—— 同步完成 ——");
  console.log(`更新：${updated}  跳过：${skipped}  失败：${failed}`);
}

main().catch((err) => {
  console.error("脚本异常退出：", err);
  process.exit(1);
});
