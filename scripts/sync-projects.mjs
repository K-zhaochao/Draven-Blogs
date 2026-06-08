#!/usr/bin/env node

/**
 * sync-projects.mjs
 * 从 GitHub API 拉取项目状态与 README.md，写回 docs/projects/<项目名>/index.md。
 *
 * 用法：
 *   node scripts/sync-projects.mjs
 *
 * 环境变量：
 *   GITHUB_TOKEN — 可选，用于提高 GitHub API rate limit
 *
 * 文件结构要求：
 *   docs/projects/
 *   ├── index.md               ← 项目列表页（跳过）
 *   ├── sky-take-out/
 *   │   └── index.md           ← 项目的 frontmatter + 正文
 *   └── answer-system/
 *       └── index.md
 *
 * 写入 index.md 时，README 内容包裹在标记注释之间，便于增量更新：
 *   <!-- @sync-readme:start --> … <!-- @sync-readme:end -->
 *
 * 注意：README 只写入项目 Markdown，不再额外生成 readme-cache.json。
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

/** 构建 GitHub API 请求头 */
function buildHeaders() {
  const headers = {
    "User-Agent": "sync-projects-script",
  };
  if (GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
  }
  return headers;
}

/**
 * 调用 GitHub API 获取仓库信息
 * @param {string} ownerRepo - 格式 "owner/repo"
 * @returns {Promise<object|null>} 仓库信息或 null（失败时）
 */
async function fetchRepoInfo(ownerRepo) {
  const url = `${GITHUB_API}/${ownerRepo}`;
  try {
    const res = await fetch(url, {
      headers: { ...buildHeaders(), Accept: "application/vnd.github+json" },
    });
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

/**
 * 获取仓库 README.md 原始内容
 * 使用 vnd.github.raw+json 直接返回解码后的 markdown 文本
 * @param {string} ownerRepo - 格式 "owner/repo"
 * @returns {Promise<string|null>} README 文本或 null
 */
async function fetchReadme(ownerRepo) {
  const url = `${GITHUB_API}/${ownerRepo}/readme`;
  try {
    const res = await fetch(url, {
      headers: { ...buildHeaders(), Accept: "application/vnd.github.raw+json" },
    });
    if (!res.ok) {
      console.warn(`  ⚠ README 获取失败 (${res.status})：${ownerRepo}`);
      return null;
    }
    return await res.text();
  } catch (err) {
    console.warn(`  ⚠ README 请求失败：${ownerRepo} — ${err.message}`);
    return null;
  }
}

// ------------------------------------------------------------------ README 替换标记
const README_START = "<!-- @sync-readme:start -->";
const README_END = "<!-- @sync-readme:end -->";

/**
 * 将 README 内容以标记形式包裹，便于后续更新
 */
function wrapReadme(readmeMd, ownerRepo) {
  const repoUrl = `https://github.com/${ownerRepo}`;
  return [
    README_START,
    "",
    `> 以下内容由 \`sync-projects.mjs\` 自动从 [GitHub 仓库](${repoUrl}) 的 README.md 同步。`,
    "",
    readmeMd.trim(),
    "",
    README_END,
  ].join("\n");
}

/**
 * 将 README 区块写入或替换到文件正文中
 * @param {string} fileContent - 原文件内容（不含 frontmatter 的 body 部分）
 * @param {string} readmeWrapped - 包裹好标记的 README 区块
 * @returns {string} 更新后的 body 内容
 */
function upsertReadmeSection(fileContent, readmeWrapped) {
  const startIdx = fileContent.indexOf(README_START);
  const endIdx = fileContent.indexOf(README_END);

  if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
    // 已有标记 → 替换区间
    const before = fileContent.slice(0, startIdx);
    const after = fileContent.slice(endIdx + README_END.length);
    // 保留 before 尾部空白但确保 README 与上文有间距
    return before.trimEnd() + "\n\n" + readmeWrapped + "\n" + after;
  }

  // 首次写入 → 追加到文件末尾
  return fileContent.trimEnd() + "\n\n" + readmeWrapped + "\n";
}

// ------------------------------------------------------------------ 主流程
async function main() {
  // 1. 收集 docs/projects/ 下所有含 index.md 的子文件夹
  const entries = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true });
  const projectDirs = entries
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  if (projectDirs.length === 0) {
    console.log("没有找到项目子文件夹，跳过。");
    return;
  }

  console.log(`找到 ${projectDirs.length} 个项目文件夹，开始同步…\n`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const dir of projectDirs) {
    const indexMdPath = path.join(PROJECTS_DIR, dir, "index.md");

    // 子文件夹没有 index.md → 跳过
    if (!fs.existsSync(indexMdPath)) {
      console.log(`⏭  ${dir}/ — 缺少 index.md，跳过`);
      skipped++;
      continue;
    }

    const raw = fs.readFileSync(indexMdPath, "utf-8");
    const { data: frontmatter, content } = matter(raw);

    const github = frontmatter.github;

    // 没有 github 字段 → 跳过
    if (!github || typeof github !== "string") {
      console.log(`⏭  ${dir}/ — 无 github 字段，跳过`);
      skipped++;
      continue;
    }

    console.log(`🔍 ${dir}/ — 正在获取 ${github} …`);

    // ---------------------------------------------------------------- 拉取数据
    const [repo, readme] = await Promise.all([
      fetchRepoInfo(github),
      fetchReadme(github),
    ]);

    if (!repo) {
      failed++;
      continue;
    }

    // ---------------------------------------------------------------- 写回 frontmatter
    frontmatter.stars = repo.stargazers_count ?? 0;
    frontmatter.lastPush = (repo.pushed_at || "").slice(0, 10);
    frontmatter.language = repo.language ?? "";

    // 仅当 description 为空时，用仓库描述回填
    if (!frontmatter.description && repo.description) {
      frontmatter.description = repo.description;
    }

    // ---------------------------------------------------------------- 写回 README
    let newContent = content;
    if (readme) {
      newContent = upsertReadmeSection(content, wrapReadme(readme, github));
    }

    // ---------------------------------------------------------------- 写回文件
    const finalMd = matter.stringify(newContent, frontmatter);
    fs.writeFileSync(indexMdPath, finalMd, "utf-8");

    const starInfo = frontmatter.stars != null ? `⭐ ${frontmatter.stars}` : "";
    const readmeStatus = readme ? "📄 README ✓" : "📄 README ✗";
    console.log(
      `✅ ${dir}/ — ${starInfo}  📅 ${frontmatter.lastPush}  🔤 ${frontmatter.language}  ${readmeStatus}`
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
