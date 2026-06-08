import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import chokidar from "chokidar";

// 获取当前目录与根目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");

const SRC_DIR = path.join(ROOT_DIR, "Draven_Note");
const DEST_DIR = path.join(ROOT_DIR, "docs", "notes"); // 最终要在博客展示的目录
const SRC_IMG_DIR = path.join(ROOT_DIR, "Draven_Note", "Draven_Note_Images");
const PUBLIC_IMG_DIR = path.join(ROOT_DIR, "docs", "public", "Draven_Note_Images");

const AUTO_INDEX_START = "<!-- @auto-index:start -->";
const AUTO_INDEX_END = "<!-- @auto-index:end -->";

/**
 * 这些目录不属于笔记内容树：
 * - Draven_Note_Images 只作为 Obsidian 图片资源目录；
 * - .obsidian/.vscode/.git 等工具目录不参与同步和索引。
 */
const IGNORED_DIR_NAMES = new Set([
  ".git",
  ".obsidian",
  ".vscode",
  "Draven_Note_Images",
]);

function isMarkdownFileName(name) {
  return name.toLowerCase().endsWith(".md");
}

function isIndexFileName(name) {
  return path.basename(name).toLowerCase() === "index.md";
}

function shouldIgnoreEntry(name) {
  return name.startsWith(".") || IGNORED_DIR_NAMES.has(name);
}

function pathHasIgnoredSegment(targetPath, rootDir = SRC_DIR) {
  const relPath = path.relative(rootDir, targetPath);
  if (!relPath || relPath === "." || relPath.startsWith("..")) return false;

  return relPath
    .split(path.sep)
    .filter(Boolean)
    .some((segment) => shouldIgnoreEntry(segment));
}

function readText(filePath) {
  return fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");
}

function ensureTrailingNewline(content) {
  return content.endsWith("\n") ? content : `${content}\n`;
}

function cleanOutputRelPath(relPath) {
  return relPath
    .split(path.sep)
    .map((segment) => segment.replace(/\s+/g, ""))
    .join(path.sep);
}

// 递归遍历所有 Markdown 文件，跳过图片资源目录和工具目录
function getAllMdFiles(dir, fileList = []) {
  if (!fs.existsSync(dir) || pathHasIgnoredSegment(dir)) return fileList;

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (shouldIgnoreEntry(entry.name)) continue;

    const filePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllMdFiles(filePath, fileList);
    } else if (entry.isFile() && isMarkdownFileName(entry.name)) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

function splitFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!match) {
    return {
      frontmatter: "",
      body: content,
    };
  }

  return {
    frontmatter: match[1],
    body: content.slice(match[0].length),
  };
}

function getOrderFromFrontmatter(content) {
  const match = content.match(/^order:\s*(\d+)/m);
  return match ? parseInt(match[1], 10) : null;
}

function getTitleFromFrontmatter(content) {
  const match = content.match(/^title:\s*["']?([^"'\n]+)["']?/m);
  return match ? match[1].trim() : null;
}

// 提取文件排序权重
function getFileOrder(fileName) {
  const name = fileName.replace(/\.md$/i, "");
  const numMatch = name.match(/^(\d+)\./);
  if (numMatch) return parseInt(numMatch[1], 10);
  const appendixMatch = name.match(/^(?:附录|附件)(\d+)/);
  if (appendixMatch) return 1000 + parseInt(appendixMatch[1], 10);
  if (name.match(/^(?:附录|附件)/)) return 1000;
  return 999;
}

function parseMarkdownMetadata(content, sourceRelPath) {
  const fileName = path.basename(sourceRelPath);
  const dirName = path.basename(path.dirname(sourceRelPath));
  const isIndex = isIndexFileName(fileName);
  let title = isIndex ? dirName : fileName.replace(/\.md$/i, "");

  // 对于根 index.md，从 H1 标题提取名称；没有 H1 时使用站点笔记标题
  if (sourceRelPath === "index.md") {
    const h1Match = content.match(/^#\s+(.+)/m);
    title = h1Match ? h1Match[1].trim() : "闲云野鹤笔记";
  }

  const existingOrder = getOrderFromFrontmatter(content);
  const order = existingOrder ?? getFileOrder(title);

  return { title, order };
}

function upsertGeneratedFrontmatter(content, metadata) {
  const { frontmatter, body } = splitFrontmatter(content);
  const preservedFrontmatter = frontmatter
    .split(/\r?\n/)
    .filter((line) => !/^order:\s*/.test(line))
    .filter((line) => !/^title:\s*/.test(line))
    .join("\n")
    .trim();

  const nextFrontmatter = [
    `order: ${metadata.order}`,
    `title: ${JSON.stringify(metadata.title)}`,
    preservedFrontmatter,
  ]
    .filter(Boolean)
    .join("\n");

  return `---\n${nextFrontmatter}\n---\n\n${body.trimStart()}`;
}

// 核心转换正则
function transformContent(content, outputRelPath, sourceRelPath = outputRelPath, resolver = null) {
  // -- 自动注入 Frontmatter 元数据，用于控制 VitePress 侧边栏标题与排序 --
  if (outputRelPath) {
    content = upsertGeneratedFrontmatter(
      content,
      parseMarkdownMetadata(content, sourceRelPath),
    );
  }

  // 辅助函数：将路径中的空格编码为 %20，保留中文字符
  function encodeImagePath(p) {
    return p.replace(/\s+/g, "%20");
  }

  // Obsidian 图片语法支持 ![[path|width]]，构建时路径中不能保留 |width
  function stripObsidianImageOptions(p) {
    return p.split("|")[0].trim();
  }

  // 1. 转换内部图片引用的路径 (放到双链转换前面，防止被误伤)
  // 处理 Obsidian 特有的 Wiki 图片格式: ![[Draven_Note_Images/图片名.png]] 或者 ![[图片名.png]]
  content = content.replace(/!\[\[(.*?)\]\]/g, (match, imgPath) => {
    const cleanImgPath = stripObsidianImageOptions(imgPath);
    // 尝试提取 Draven_Note_Images 之后的完整目录结构
    const matchDir = cleanImgPath.match(/Draven_Note_Images\/(.*)/);
    if (matchDir && matchDir[1]) {
      return `![img](/Draven_Note_Images/${encodeImagePath(
        matchDir[1].trim(),
      )})`;
    }
    // 如果没有，退回到仅保留文件名
    const fileName = path.basename(cleanImgPath);
    return `![img](/Draven_Note_Images/${encodeImagePath(fileName.trim())})`;
  });

  // 处理由于拖拽引起的传统 Markdown 形式图片，包含所有可能的上级目录如 ![](.../Draven_Note_Images/图片.png)
  content = content.replace(
    /!\[.*?\]\(.*?(Draven_Note_Images\/.*?)\)/g,
    (match, imgPath) => {
      return `![img](/${encodeImagePath(stripObsidianImageOptions(imgPath))})`;
    },
  );

  // 1.1 处理 ./img/ 相对路径图片引用（如 Maven 笔记中的 ./img/6Q2D8D5Tei33CxSQ/xxx.png）
  // 不转换路径，而是在 run() 中将图片复制到目标目录的 ./img/ 下，保持相对路径可用
  // 这里只做标记，不做路径转换

  // 兜底处理：其他无效相对路径图片 (如 ./img/xxx.png 无子目录，即 img/ 后面没有 /)
  content = content.replace(
    /!\[(.*?)\]\(\.\/?img\/([^\/]+)\)/g,
    "> ⚠️ [图片丢失: $2]",
  );

  // 2. 转换 Obsidian 双链：通过 Wiki 链接解析器查找目标文件的正确相对路径
  content = content.replace(/\[\[(.*?)\]\]/g, (match, rawName) => {
    const pipeIdx = rawName.lastIndexOf("|");
    const target = pipeIdx === -1 ? rawName : rawName.slice(0, pipeIdx);
    const display = pipeIdx === -1 ? rawName : rawName.slice(pipeIdx + 1);

    if (resolver) {
      const resolved = resolver.resolveWikiLink(sourceRelPath, target.trim());
      if (resolved) {
        return `[${display.trim()}](${resolved})`;
      }
      console.warn(`  ⚠ Wiki 链接未解析: [[${rawName}]] (${sourceRelPath})`);
    }

    // 兜底：直接拼接
    const cleanLink = target.trim().replace(/\s+/g, "");
    return `[${display.trim()}](./${cleanLink}.md)`;
  });

  // 3. 转换 Obsidian Callout: > [!info] 标题 -> ::: info 标题 \n :::
  // (简易版本，针对单行或简单多行)
  content = content.replace(
    /^> \[!(\w+)\](.*?)\n([\s\S]*?)(?=\n[^>]|$)/gm,
    (match, type, title, body) => {
      // 去掉 blockquote 的 "> " 前缀
      const cleanBody = body.replace(/^> ?/gm, "");
      return `::: ${type.toLowerCase()} ${title.trim()}\n${cleanBody}\n:::\n`;
    },
  );

  // 4. 转义可能引起 Vue 报错的无闭合标签/泛型（如 ArrayList<E>）
  // 匹配类似 <E>, <T>, <K, V>, <String> 这种泛型写法，将其左右括号转义
  content = content.replace(/<([A-Z][a-zA-Z0-9_,\s]*)>/g, "&lt;$1&gt;");

  return content;
}

// Wiki 链接解析器：根据 Obsidian 笔记文件树，重建 [[目标]] 到输出路径的映射
class WikiLinkResolver {
  /**
   * @param {string} srcDir - Draven_Note 根目录
   * @param {string[]} mdFiles - 所有源 Markdown 文件的绝对路径
   */
  constructor(srcDir, mdFiles) {
    this.srcDir = srcDir;

    // fileName -> 相对输出路径（不带 .md，经过空格清理）
    // 多个同名文件时保留第一次出现的；后续同名覆盖并发出警告
    this.nameMap = new Map();
    // "目录/文件名" -> 相对输出路径
    this.pathMap = new Map();

    for (const absPath of mdFiles) {
      const relPath = path.relative(srcDir, absPath);
      if (isIndexFileName(relPath)) continue;

      const clean = cleanOutputRelPath(relPath).replace(/\.md$/i, "");
      const fileName = path.basename(relPath).replace(/\.md$/i, "");
      const cleanFileName = fileName.replace(/\s+/g, "");

      // 记录 cleaned 相对路径
      this.pathMap.set(clean, clean);
      const dirPart = path.dirname(clean);
      if (dirPart && dirPart !== ".") {
        this.pathMap.set(path.join(dirPart, cleanFileName).replace(/\\/g, "/"), clean);
      }

      // 记录文件名
      if (this.nameMap.has(cleanFileName)) {
        console.warn(`  ⚠ 同名文件冲突: ${cleanFileName} (${clean} vs ${this.nameMap.get(cleanFileName)})`);
      }
      this.nameMap.set(cleanFileName, clean);
    }
  }

  /**
   * 解析到目标文件 ./相对路径.md
   * @param {string} sourceRelPath - 当前文件的源相对路径
   * @param {string} target - [[目标]] 中的原始文本（可能包含路径分隔符 /）
   * @returns {string|null} 从当前文件到目标文件的相对 Markdown 链接，如 './Java/集合.md'
   */
  resolveWikiLink(sourceRelPath, target) {
    if (!target) return null;

    const cleanTarget = target.replace(/\s+/g, "");

    // 优先精确匹配路径
    if (this.pathMap.has(cleanTarget)) {
      return this.toRelativeLink(sourceRelPath, this.pathMap.get(cleanTarget));
    }

    // 尝试 "目录/文件名" 组合匹配
    if (cleanTarget.includes("/")) {
      const normalized = cleanTarget.replace(/\\/g, "/");
      if (this.pathMap.has(normalized)) {
        return this.toRelativeLink(sourceRelPath, this.pathMap.get(normalized));
      }
      const fileNameOnly = path.basename(normalized);
      if (this.nameMap.has(fileNameOnly)) {
        return this.toRelativeLink(sourceRelPath, this.nameMap.get(fileNameOnly));
      }
    }

    // 文件名匹配
    if (this.nameMap.has(cleanTarget)) {
      return this.toRelativeLink(sourceRelPath, this.nameMap.get(cleanTarget));
    }

    return null;
  }

  toRelativeLink(sourceRelPath, targetCleanPath) {
    const sourceDir = path.dirname(cleanOutputRelPath(sourceRelPath));
    let rel = path.relative(sourceDir, targetCleanPath).replace(/\\/g, "/");
    if (!rel.startsWith(".")) rel = "./" + rel;
    return rel + ".md";
  }
}

// 图片资源解析器：扫描 Draven_Note_Images 建立文件名到路径的索引
class ImageResolver {
  /**
   * @param {string} imagesDir - Draven_Note/Draven_Note_Images 绝对路径
   */
  constructor(imagesDir) {
    this.imagesDir = imagesDir;
    // 文件名 -> 相对于 Draven_Note_Images 的路径（用于 /Draven_Note_Images/... URL）
    this.nameMap = new Map();
    // 相对路径 -> 相对于 Draven_Note_Images 的路径
    this.pathMap = new Map();

    if (!fs.existsSync(imagesDir)) return;
    this._scan(imagesDir, "");
  }

  _scan(dir, relativePrefix) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      if (entry.isFile() && isMarkdownFileName(entry.name)) continue;

      const full = path.join(dir, entry.name);
      const rel = relativePrefix ? `${relativePrefix}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        this._scan(full, rel);
      } else {
        this.nameMap.set(entry.name, rel);
        this.pathMap.set(rel, rel);
      }
    }
  }

  /**
   * 根据图片引用片段查找图片在 Draven_Note_Images 中的路径
   * @param {string} imgRef - 图片引用中的路径部分，如 "Java/11.数组/xxx.png" 或 "xxx.png"
   * @returns {string|null} /Draven_Note_Images/... 形式的公开 URL 路径，或 null
   */
  resolve(imgRef) {
    const clean = imgRef.replace(/\s+/g, "%20");

    const unencodedRef = imgRef.trim();
    if (this.pathMap.has(unencodedRef)) {
      return `/Draven_Note_Images/${this.pathMap.get(unencodedRef).replace(/\s+/g, "%20")}`;
    }

    const fileName = path.basename(unencodedRef);
    if (this.nameMap.has(fileName)) {
      return `/Draven_Note_Images/${this.nameMap.get(fileName).replace(/\s+/g, "%20")}`;
    }

    return null;
  }
}

// 核心复制目录方法：图片资源同步时跳过 Markdown 索引，避免图片目录继续携带文章内容
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.isFile() && isMarkdownFileName(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function getItemInfo(fullPath, entry) {
  if (entry.isDirectory()) {
    const indexPath = path.join(fullPath, "index.md");
    let order = getFileOrder(entry.name);
    let title = entry.name;
    if (fs.existsSync(indexPath)) {
      const content = readText(indexPath);
      const fmOrder = getOrderFromFrontmatter(content);
      if (fmOrder !== null) order = fmOrder;
      const fmTitle = getTitleFromFrontmatter(content);
      if (fmTitle) title = fmTitle;
    }
    return { type: "dir", name: entry.name, title, order };
  }

  const content = readText(fullPath);
  let order = getFileOrder(entry.name);
  let title = entry.name.replace(/\.md$/i, "");
  const fmOrder = getOrderFromFrontmatter(content);
  if (fmOrder !== null) order = fmOrder;
  const fmTitle = getTitleFromFrontmatter(content);
  if (fmTitle) title = fmTitle;
  return { type: "file", name: entry.name, title, order };
}

// 判断目录是否为“真正的内容目录”（包含 .md 文件或有意义的子目录）
function isRealContentDir(dir) {
  if (!fs.existsSync(dir) || pathHasIgnoredSegment(dir)) return false;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  const hasMd = entries.some(
    (entry) =>
      entry.isFile() &&
      isMarkdownFileName(entry.name) &&
      !isIndexFileName(entry.name),
  );
  if (hasMd) return true;

  return entries.some(
    (entry) =>
      entry.isDirectory() &&
      !shouldIgnoreEntry(entry.name) &&
      isRealContentDir(path.join(dir, entry.name)),
  );
}

function collectIndexItems(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items = [];

  for (const entry of entries) {
    if (shouldIgnoreEntry(entry.name) || isIndexFileName(entry.name)) continue;
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (isRealContentDir(fullPath)) {
        items.push(getItemInfo(fullPath, entry));
      }
    } else if (entry.isFile() && isMarkdownFileName(entry.name)) {
      items.push(getItemInfo(fullPath, entry));
    }
  }

  items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, "zh-CN"));
  return items;
}

function generateListForDir(dirPath, basePath, depth = 0) {
  const items = collectIndexItems(dirPath);
  const lines = [];
  const indent = "  ".repeat(depth);

  for (const item of items) {
    const relPath = path
      .relative(basePath, path.join(dirPath, item.name))
      .replace(/\\/g, "/");

    if (item.type === "dir") {
      lines.push(`${indent}- [${item.title}](${relPath}/index.md)`);
      lines.push(...generateListForDir(path.join(dirPath, item.name), basePath, depth + 1));
    } else {
      lines.push(`${indent}- [${item.title}](${relPath})`);
    }
  }

  return lines;
}

function generateAutoIndexContent(dirPath, isRoot) {
  const items = collectIndexItems(dirPath);
  if (items.length === 0) return "> 暂无内容。";

  if (!isRoot) {
    return generateListForDir(dirPath, dirPath, 0).join("\n");
  }

  const sections = [];
  for (const item of items) {
    if (item.type === "dir") {
      sections.push(`## [${item.title}](${item.name}/index.md)`);
      const subLines = generateListForDir(path.join(dirPath, item.name), dirPath, 0);
      if (subLines.length > 0) sections.push(subLines.join("\n"));
    } else {
      sections.push(`- [${item.title}](${item.name})`);
    }
  }

  return sections.join("\n\n");
}

function buildDefaultIndexContent(dirPath, isRoot, autoIndexContent) {
  if (isRoot) {
    const title = "闲云野鹤笔记";
    return ensureTrailingNewline(
      `---\ntitle: ${JSON.stringify(title)}\n---\n\n` +
        `# ${title}\n\n` +
        `> 学习笔记。\n\n` +
        `${AUTO_INDEX_START}\n${autoIndexContent}\n${AUTO_INDEX_END}\n`,
    );
  }

  const dirName = path.basename(dirPath);
  const indexPath = path.join(dirPath, "index.md");
  let order = getFileOrder(dirName);
  let title = dirName;

  if (fs.existsSync(indexPath)) {
    const existing = readText(indexPath);
    const fmOrder = getOrderFromFrontmatter(existing);
    if (fmOrder !== null) order = fmOrder;
    const fmTitle = getTitleFromFrontmatter(existing);
    if (fmTitle) title = fmTitle;
  }

  return ensureTrailingNewline(
    `---\norder: ${order}\ntitle: ${JSON.stringify(title)}\n---\n\n` +
      `# ${title}\n\n` +
      `${AUTO_INDEX_START}\n${autoIndexContent}\n${AUTO_INDEX_END}\n`,
  );
}

function replaceAutoIndexBlock(existingContent, autoIndexContent) {
  const startIdx = existingContent.indexOf(AUTO_INDEX_START);
  const endIdx = existingContent.indexOf(AUTO_INDEX_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) return null;

  const before = existingContent.slice(0, startIdx);
  const after = existingContent.slice(endIdx + AUTO_INDEX_END.length);
  return ensureTrailingNewline(
    `${before}${AUTO_INDEX_START}\n${autoIndexContent}\n${AUTO_INDEX_END}${after}`,
  );
}

function writeIndexFile(dirPath, isRoot) {
  const indexPath = path.join(dirPath, "index.md");
  const autoIndexContent = generateAutoIndexContent(dirPath, isRoot);
  let nextContent = null;

  if (fs.existsSync(indexPath)) {
    const existing = readText(indexPath);
    nextContent = replaceAutoIndexBlock(existing, autoIndexContent);
  }

  // 第一次迁移：没有自动目录标记的 index.md 直接覆盖为规范结构。
  if (nextContent === null) {
    nextContent = buildDefaultIndexContent(dirPath, isRoot, autoIndexContent);
  }

  const currentContent = fs.existsSync(indexPath) ? readText(indexPath) : "";
  if (currentContent !== nextContent) {
    fs.writeFileSync(indexPath, nextContent, "utf-8");
    const relPath = path.relative(path.dirname(dirPath), indexPath);
    console.log(`  📄 已更新索引: ${relPath}`);
  }
}

function regenerateAllIndexes(dirPath, isRoot = true) {
  if (!fs.existsSync(dirPath) || pathHasIgnoredSegment(dirPath)) return;

  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const subdirs = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      !shouldIgnoreEntry(entry.name) &&
      isRealContentDir(path.join(dirPath, entry.name)),
  );

  // 深度优先：先修正子目录索引
  for (const subdir of subdirs) {
    regenerateAllIndexes(path.join(dirPath, subdir.name), false);
  }

  const items = collectIndexItems(dirPath);
  if (items.length === 0 && !isRoot) return;
  writeIndexFile(dirPath, isRoot);
}

function syncOneFile(srcFilePath) {
  if (pathHasIgnoredSegment(srcFilePath) || !isMarkdownFileName(srcFilePath)) return;

  const relPath = path.relative(SRC_DIR, srcFilePath);
  const cleanRelPath = cleanOutputRelPath(relPath);
  const destPath = path.join(DEST_DIR, cleanRelPath);

  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const content = transformContent(readText(srcFilePath), cleanRelPath, relPath);
  fs.writeFileSync(destPath, content, "utf-8");
  console.log(`  📝 已同步: ${relPath}`);
}

function removeTarget(srcPath) {
  if (pathHasIgnoredSegment(srcPath)) return;

  const relPath = path.relative(SRC_DIR, srcPath);
  const cleanRelPath = cleanOutputRelPath(relPath);
  const destPath = path.join(DEST_DIR, cleanRelPath);
  if (!fs.existsSync(destPath)) return;

  const stat = fs.statSync(destPath);
  if (stat.isDirectory()) {
    fs.rmSync(destPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(destPath);
  }
  console.log(`  🗑️  已删除: ${relPath}`);
}

function syncSourceIndexesToDest() {
  const indexFiles = getAllMdFiles(SRC_DIR).filter((filePath) => isIndexFileName(filePath));
  indexFiles.forEach(syncOneFile);
}

function refreshIndexesAfterWatchEvent() {
  regenerateAllIndexes(SRC_DIR, true);
  syncSourceIndexesToDest();
  if (fs.existsSync(DEST_DIR)) regenerateAllIndexes(DEST_DIR, true);
}

function syncPublicImages() {
  console.log("🖼️ 开始同步图片到 VitePress 的 public 资源目录...");

  // 本地使用 mklink /J 软链接时跳过拷贝（软链接指向源目录，无需处理）
  // CI 环境或普通目录：删除旧目录后全量重建，确保新增图片也能同步
  try {
    if (fs.existsSync(PUBLIC_IMG_DIR)) {
      const stat = fs.lstatSync(PUBLIC_IMG_DIR);
      if (stat.isSymbolicLink()) {
        console.log("  ℹ️ 检测到软链接，跳过图片拷贝");
      } else {
        fs.rmSync(PUBLIC_IMG_DIR, { recursive: true, force: true });
        copyDir(SRC_IMG_DIR, PUBLIC_IMG_DIR);
        console.log("  ✅ 图片目录已重建");
      }
    } else {
      copyDir(SRC_IMG_DIR, PUBLIC_IMG_DIR);
      console.log("  ✅ 图片目录已创建");
    }
  } catch (e) {
    console.log("（处理图片时）可忽略提示：", e.message);
  }
}

function syncRelativeImgAssets(imageResolver) {
  console.log("🔗 处理 ./img/ 相对路径图片引用...");
  const syncedMdFiles = getAllMdFiles(DEST_DIR);
  for (const mdFile of syncedMdFiles) {
    const content = readText(mdFile);
    const imgRefs = content.match(/!\[.*?\]\(\.\/img\/(.*?)\)/g);
    if (!imgRefs) continue;
    const destDir = path.dirname(mdFile);
    for (const ref of imgRefs) {
      const pathMatch = ref.match(/!\[.*?\]\(\.\/img\/(.*?)\)/);
      if (!pathMatch) continue;
      const imgRelPath = pathMatch[1]; // e.g. "6Q2D8D5Tei33CxSQ/xxx.png"

      // 通过 ImageResolver 在 Draven_Note_Images 中查找
      let srcImg = null;
      if (imageResolver) {
        const imgUrl = imageResolver.resolve(imgRelPath);
        if (imgUrl) {
          // imgUrl 形如 /Draven_Note_Images/JavaWeb/Maven/6Q2D8D5Tei33CxSQ/xxx.png
          const relativePart = imgUrl.replace(/^\/Draven_Note_Images\//, "").replace(/%20/g, " ");
          srcImg = path.join(SRC_IMG_DIR, relativePart);
        }
      }

      if (!srcImg || !fs.existsSync(srcImg)) {
        // 兜底：保留旧逻辑文件不被静默丢失
        srcImg = path.join(SRC_IMG_DIR, "JavaWeb", "Maven", imgRelPath);
      }

      const destImg = path.join(destDir, "img", imgRelPath);
      if (fs.existsSync(srcImg) && !fs.existsSync(destImg)) {
        fs.mkdirSync(path.dirname(destImg), { recursive: true });
        fs.copyFileSync(srcImg, destImg);
      }
    }
  }
}

// 主执行函数
function run() {
  console.log("🔄 开始从 Obsidian 源仓库同步与转换笔记...");

  // -- 先修正源目录的索引文件。没有自动标记的旧 index 会在第一次迁移时规范化覆盖。 --
  console.log("📁 正在修正 Draven_Note 中的索引文件...");
  regenerateAllIndexes(SRC_DIR, true);

  // 构建图片索引和 Wiki 链接解析器
  const imageResolver = fs.existsSync(SRC_IMG_DIR) ? new ImageResolver(SRC_IMG_DIR) : null;
  const allSourceFiles = getAllMdFiles(SRC_DIR);
  const wikiResolver = new WikiLinkResolver(SRC_DIR, allSourceFiles);

  // -- 清洗 Markdown 文件逻辑 --
  if (fs.existsSync(DEST_DIR)) {
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
  }

  const files = allSourceFiles;
  files.forEach((file) => {
    const relPath = path.relative(SRC_DIR, file);
    const cleanRelPath = cleanOutputRelPath(relPath);
    const destPath = path.join(DEST_DIR, cleanRelPath);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const content = transformContent(readText(file), cleanRelPath, relPath, wikiResolver);
    fs.writeFileSync(destPath, content, "utf-8");
  });

  syncPublicImages();
  syncRelativeImgAssets(imageResolver);

  // -- 自动修正所有输出侧 index.md 文件 --
  console.log("📁 正在修正 docs/notes 中的索引文件...");
  regenerateAllIndexes(DEST_DIR, true);

  console.log("✅ 同步转换完成，笔记及图片已安全注入！");
}

function watch() {
  console.log("👀 正在监听 Draven_Note/ 的文件变更，修改后自动同步...");
  console.log("   按 Ctrl+C 停止监听\n");

  const watcher = chokidar.watch(SRC_DIR, {
    ignored: (watchPath) => pathHasIgnoredSegment(path.resolve(watchPath)),
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  watcher
    .on("add", (filePath) => {
      if (isMarkdownFileName(filePath)) {
        syncOneFile(filePath);
        refreshIndexesAfterWatchEvent();
      }
    })
    .on("change", (filePath) => {
      if (isMarkdownFileName(filePath)) {
        syncOneFile(filePath);
        refreshIndexesAfterWatchEvent();
      }
    })
    .on("unlink", (filePath) => {
      removeTarget(filePath);
      refreshIndexesAfterWatchEvent();
    })
    .on("addDir", (dirPath) => {
      if (pathHasIgnoredSegment(dirPath) || !fs.existsSync(dirPath)) return;
      const mdFiles = getAllMdFiles(dirPath);
      mdFiles.forEach(syncOneFile);
      refreshIndexesAfterWatchEvent();
    })
    .on("unlinkDir", (dirPath) => {
      removeTarget(dirPath);
      refreshIndexesAfterWatchEvent();
    });
}

// -- 入口：支持 --watch 参数 --
const isWatch = process.argv.includes("--watch");
if (isWatch) {
  run();
  watch();
} else {
  run();
}
