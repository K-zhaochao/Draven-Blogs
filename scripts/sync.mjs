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

// 递归遍历所有 Markdown 文件
function getAllMdFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    // 忽略 .开头的隐藏文件夹（如 .obsidian, .git）
    if (file.startsWith(".")) continue;

    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllMdFiles(filePath, fileList);
    } else if (filePath.endsWith(".md")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// 核心转换正则
function transformContent(content, relPath) {
  // -- 自动注入 Frontmatter 元数据，用于控制 VuePress 侧边栏标题与排序 --
  if (relPath) {
    const fileName = path.basename(relPath);
    let dirName = path.basename(path.dirname(relPath));
    const isIndex = fileName.toLowerCase() === "index.md";
    let targetName = isIndex ? dirName : fileName.replace(/\.md$/i, "");

    // 对于根 index.md（relPath === "index.md"），从 H1 标题提取名称
    if (relPath === "index.md") {
      const h1Match = content.match(/^#\s+(.+)/m);
      if (h1Match) {
        targetName = h1Match[1].trim();
      }
    }

    // 混合模式排序：检查源文件是否已有手动设置的 order
    let order = null;
    const existingOrderMatch = content.match(/^order:\s*(\d+)/m);
    if (existingOrderMatch) {
      // 源文件已有手动 order，保留它
      order = parseInt(existingOrderMatch[1], 10);
    } else {
      // 自动解析排序
      order = 999;
      // 解析前缀数字排序，例如 "15.xxx"
      const numMatch = targetName.match(/^(\d+)\./);
      if (numMatch) {
        order = parseInt(numMatch[1], 10);
      }
      // 解析附录排序，例如 "附录1：细节"
      else if (targetName.match(/^(?:附录|附件)(\d+)/)) {
        order = 1000 + parseInt(targetName.match(/^(?:附录|附件)(\d+)/)[1], 10);
      } else if (targetName.match(/^(?:附录|附件)/)) {
        order = 1000;
      }
    }

    // 如果源文件已有 frontmatter，先移除已有的 order 和 title 行，再注入新的
    if (content.startsWith("---")) {
      const secondDashIndex = content.indexOf("---", 3);
      if (secondDashIndex !== -1) {
        let frontmatter = content.substring(3, secondDashIndex);
        const after = content.substring(secondDashIndex);
        // 移除已有的 order 和 title 行
        frontmatter = frontmatter.replace(/^order:\s*\d+\s*\n?/gm, "");
        frontmatter = frontmatter.replace(/^title:\s*.*\n?/gm, "");
        frontmatter = frontmatter.trimStart();
        content = `---\norder: ${order}\ntitle: "${targetName}"\n${frontmatter}\n${after}`;
      }
    } else {
      content = `---\norder: ${order}\ntitle: "${targetName}"\n---\n\n${content}`;
    }
  }

  // 辅助函数：将路径中的空格编码为 %20，保留中文字符
  function encodeImagePath(p) {
    return p.replace(/\s+/g, '%20');
  }

  // 1. 转换内部图片引用的路径 (放到双链转换前面，防止被误伤)
  // 处理 Obsidian 特有的 Wiki 图片格式: ![[Draven_Note_Images/图片名.png]] 或者 ![[图片名.png]]
  content = content.replace(/!\[\[(.*?)\]\]/g, (match, imgPath) => {
    // 尝试提取 Draven_Note_Images 之后的完整目录结构
    const matchDir = imgPath.match(/Draven_Note_Images\/(.*)/);
    if (matchDir && matchDir[1]) {
      return `![img](/Draven_Note_Images/${encodeImagePath(matchDir[1].trim())})`;
    }
    // 如果没有，退回到仅保留文件名
    const fileName = path.basename(imgPath);
    return `![img](/Draven_Note_Images/${encodeImagePath(fileName.trim())})`;
  });

  // 处理由于拖拽引起的传统 Markdown 形式图片，包含所有可能的上级目录如 ![](.../Draven_Note_Images/图片.png)
  content = content.replace(
    /!\[.*?\]\(.*?(Draven_Note_Images\/.*?)\)/g,
    (match, imgPath) => {
      return `![img](/${encodeImagePath(imgPath.trim())})`;
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

  // 2. 转换 Obsidian 双链: [[文件名]] -> [文件名](./文件名.md)
  // 2. 转换 Obsidian 双链: [[文件名]] -> [文件名](./文件名.md)（链接路径去掉空格）
  content = content.replace(/\[\[(.*?)\]\]/g, (match, name) => {
    const cleanLink = name.replace(/\s+/g, "");
    return `[${name}](./${cleanLink}.md)`;
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

// 核心复制目录方法：
function copyDir(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 主执行函数
function run() {
  console.log("🔄 开始从 Obsidian 源仓库同步与转换笔记...");

  // -- 先修正源目录的索引文件 --
  console.log("📁 正在修正 Draven_Note 中的索引文件...");
  regenerateAllIndexes(SRC_DIR, true);

  // -- 洗 Markdown 文件逻辑 ---
  if (fs.existsSync(DEST_DIR))
    fs.rmSync(DEST_DIR, { recursive: true, force: true });
  const files = getAllMdFiles(SRC_DIR);
  files.forEach((file) => {
    const relPath = path.relative(SRC_DIR, file);
    // 去掉路径中所有文件名和文件夹名中的空格，确保 URL 可用
    const cleanRelPath = relPath.replace(/\s+/g, "");
    const destPath = path.join(DEST_DIR, cleanRelPath);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    let content = fs.readFileSync(file, "utf-8");
    // 去除 UTF-8 BOM，防止污染 frontmatter 和 H1 标题解析
    content = content.replace(/^\uFEFF/, "");
    content = transformContent(content, cleanRelPath);

    fs.writeFileSync(destPath, content, "utf-8");
  });

  // -- 拷贝图片资源到 Public ---
  // GitHub Action 是 Ubuntu 环境，且没 push 软链接
  console.log("🖼️ 开始同步图片到 VitePress 的 public 资源目录...");
  const PUBLIC_IMG_DIR = path.join(
    ROOT_DIR,
    "docs",
    "public",
    "Draven_Note_Images",
  );
  const SRC_IMG_DIR = path.join(ROOT_DIR, "Draven_Note", "Draven_Note_Images");

  // 防止本地由于软链接执行报错，如果由于任何原因已有源则忽略覆盖/或者删除软链接重建。
  // Action 上一定是空目录，放心拷贝即可：
  try {
    if (!fs.existsSync(PUBLIC_IMG_DIR)) {
      copyDir(SRC_IMG_DIR, PUBLIC_IMG_DIR);
    }
  } catch (e) {
    console.log("（处理图片时）可忽略提示：", e.message);
  }

  // -- 处理 ./img/ 相对路径图片：将源 Draven_Note_Images 中的图片复制到目标笔记的 img/ 目录下 --
  console.log("🔗 处理 ./img/ 相对路径图片引用...");
  const syncedMdFiles = getAllMdFiles(DEST_DIR);
  for (const mdFile of syncedMdFiles) {
    const content = fs.readFileSync(mdFile, "utf-8");
    const imgRefs = content.match(/!\[.*?\]\(\.\/img\/(.*?)\)/g);
    if (!imgRefs) continue;
    const destDir = path.dirname(mdFile);
    for (const ref of imgRefs) {
      const pathMatch = ref.match(/!\[.*?\]\(\.\/img\/(.*?)\)/);
      if (!pathMatch) continue;
      const imgRelPath = pathMatch[1]; // e.g. "6Q2D8D5Tei33CxSQ/xxx.png"
      const srcImg = path.join(SRC_IMG_DIR, "JavaWeb", "Maven", imgRelPath);
      const destImg = path.join(destDir, "img", imgRelPath);
      if (fs.existsSync(srcImg) && !fs.existsSync(destImg)) {
        fs.mkdirSync(path.dirname(destImg), { recursive: true });
        fs.copyFileSync(srcImg, destImg);
      }
    }
  }

  // -- 自动修正所有 index.md 文件 --
  console.log("📁 正在修正 docs/notes 中的索引文件...");
  regenerateAllIndexes(DEST_DIR, true);

  console.log("✅ 同步转换完成，笔记及图片已安全注入！");
}



// 提取文件排序权重（复用 transformContent 中的逻辑）
function getFileOrder(fileName) {
  const name = fileName.replace(/\.md$/i, "");
  const numMatch = name.match(/^(\d+)\./);
  if (numMatch) return parseInt(numMatch[1], 10);
  const appendixMatch = name.match(/^(?:附录|附件)(\d+)/);
  if (appendixMatch) return 1000 + parseInt(appendixMatch[1], 10);
  if (name.match(/^(?:附录|附件)/)) return 1000;
  return 999;
}

// === 索引文件自动修正 ===

function getOrderFromFrontmatter(content) {
  const match = content.match(/^order:\s*(\d+)/m);
  return match ? parseInt(match[1], 10) : null;
}

function getTitleFromFrontmatter(content) {
  const match = content.match(/^title:\s*"?([^"\n]+)"?/m);
  return match ? match[1].trim() : null;
}

function getItemInfo(fullPath, entry) {
  if (entry.isDirectory()) {
    const indexPath = path.join(fullPath, "index.md");
    let order = getFileOrder(entry.name);
    let title = entry.name;
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      const fmOrder = getOrderFromFrontmatter(content);
      if (fmOrder !== null) order = fmOrder;
      const fmTitle = getTitleFromFrontmatter(content);
      if (fmTitle) title = fmTitle;
    }
    return { type: "dir", name: entry.name, title, order };
  } else {
    const content = fs.readFileSync(fullPath, "utf-8");
    let order = getFileOrder(entry.name);
    let title = entry.name.replace(/\.md$/i, "");
    const fmOrder = getOrderFromFrontmatter(content);
    if (fmOrder !== null) order = fmOrder;
    const fmTitle = getTitleFromFrontmatter(content);
    if (fmTitle) title = fmTitle;
    return { type: "file", name: entry.name, title, order };
  }
}

// 判断目录是否为"真正的内容目录"（包含 .md 文件或有意义的子目录）
function isRealContentDir(dir) {
  if (!fs.existsSync(dir)) return false;
  const ents = fs.readdirSync(dir, { withFileTypes: true });
  const hasMd = ents.some(
    (e) =>
      e.isFile() &&
      e.name.endsWith(".md") &&
      e.name.toLowerCase() !== "index.md",
  );
  if (hasMd) return true;
  const hasRealSubdir = ents.some(
    (e) =>
      e.isDirectory() &&
      !e.name.startsWith(".") &&
      isRealContentDir(path.join(dir, e.name)),
  );
  return hasRealSubdir;
}

function generateListForDir(dirPath, basePath, depth = 0) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const items = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name.toLowerCase() === "index.md") continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      // 只收录真正包含内容的子目录
      if (!isRealContentDir(fullPath)) continue;
      const info = getItemInfo(fullPath, entry);
      items.push(info);
    } else if (entry.name.endsWith(".md")) {
      const info = getItemInfo(fullPath, entry);
      items.push(info);
    }
  }
  items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const lines = [];
  const indent = "  ".repeat(depth);
  for (const item of items) {
    const relPath = path
      .relative(basePath, path.join(dirPath, item.name))
      .replace(/\\/g, "/");
    if (item.type === "dir") {
      lines.push(`${indent}- [${item.title}](${relPath}/index.md)`);
      const subLines = generateListForDir(
        path.join(dirPath, item.name),
        basePath,
        depth + 1,
      );
      lines.push(...subLines);
    } else {
      lines.push(`${indent}- [${item.title}](${relPath})`);
    }
  }
  return lines;
}

function regenerateAllIndexes(dirPath, isRoot = true) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  const subdirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith("."),
  );
  // 深度优先：先修正子目录索引
  for (const subdir of subdirs) {
    regenerateAllIndexes(path.join(dirPath, subdir.name), false);
  }

  // 收集当前目录的条目
  const items = [];
  for (const entry of entries) {
    if (entry.name.startsWith(".")) continue;
    if (entry.name.toLowerCase() === "index.md") continue;
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      // 只收录真正包含内容的子目录
      if (isRealContentDir(fullPath)) {
        const info = getItemInfo(fullPath, entry);
        items.push(info);
      }
    } else if (entry.name.endsWith(".md")) {
      const info = getItemInfo(fullPath, entry);
      items.push(info);
    }
  }

  // 如果没有任何条目，不生成 index.md
  if (items.length === 0 && !isRoot) return;

  items.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const dirName = path.basename(dirPath);
  let content = "";
  if (isRoot) {
    content += '---\ntitle: "闲云野鹤笔记"\n---\n\n';
    content += "# 闲云野鹤笔记\n\n";
    content += "> 学习笔记。\n\n";
    for (const item of items) {
      if (item.type === "dir") {
        content += `## [${item.title}](${item.name}/index.md)\n`;
        const subLines = generateListForDir(
          path.join(dirPath, item.name),
          dirPath,
          0,
        );
        content += subLines.join("\n") + "\n\n";
      } else {
        content += `- [${item.title}](${item.name})\n`;
      }
    }
  } else {
    const indexPath = path.join(dirPath, "index.md");
    let order = getFileOrder(dirName);
    if (fs.existsSync(indexPath)) {
      const existing = fs.readFileSync(indexPath, "utf-8");
      const fmOrder = getOrderFromFrontmatter(existing);
      if (fmOrder !== null) order = fmOrder;
    }
    content += `---\norder: ${order}\ntitle: "${dirName}"\n---\n\n`;
    content += `# ${dirName}\n\n`;
    const lines = generateListForDir(dirPath, dirPath, 0);
    content += lines.join("\n") + "\n";
  }
  const indexPath = path.join(dirPath, "index.md");
  fs.writeFileSync(indexPath, content, "utf-8");
  const relPath = path.relative(path.dirname(dirPath), indexPath);
  console.log(`  📄 已更新索引: ${relPath}`);
}

// -- 增量同步单个文件 --
function syncOneFile(srcFilePath) {
  const relPath = path.relative(SRC_DIR, srcFilePath);
  const destPath = path.join(DEST_DIR, relPath);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  let content = fs.readFileSync(srcFilePath, "utf-8");
  content = content.replace(/^\uFEFF/, "");
  content = transformContent(content, relPath);
  fs.writeFileSync(destPath, content, "utf-8");
  console.log(`  📝 已同步: ${relPath}`);
}

// -- 删除目标侧对应的文件/目录 --
function removeTarget(srcPath) {
  const relPath = path.relative(SRC_DIR, srcPath);
  const destPath = path.join(DEST_DIR, relPath);
  if (fs.existsSync(destPath)) {
    const stat = fs.statSync(destPath);
    if (stat.isDirectory()) {
      fs.rmSync(destPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(destPath);
    }
    console.log(`  🗑️  已删除: ${relPath}`);
  }
}

// -- 文件监听模式 --
function watch() {
  console.log("👀 正在监听 Draven_Note/ 的文件变更，修改后自动同步...");
  console.log("   按 Ctrl+C 停止监听\n");

  const watcher = chokidar.watch(SRC_DIR, {
    ignored: /(^|[\/\\])\../, // 忽略 .开头的隐藏文件夹
    persistent: true,
    ignoreInitial: true, // 启动时不触发事件，避免与全量同步冲突
    awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
  });

  watcher
    .on("add", (filePath) => {
      if (filePath.endsWith(".md")) {
        syncOneFile(filePath);
      }
    })
    .on("change", (filePath) => {
      if (filePath.endsWith(".md")) {
        syncOneFile(filePath);
      }
    })
    .on("unlink", (filePath) => {
      removeTarget(filePath);
    })
    .on("addDir", (dirPath) => {
      // 新建文件夹时，同步其中所有 .md 文件
      if (fs.existsSync(dirPath)) {
        const mdFiles = getAllMdFiles(dirPath);
        mdFiles.forEach(syncOneFile);
      }
    })
    .on("unlinkDir", (dirPath) => {
      removeTarget(dirPath);
    });
}

// -- 入口：支持 --watch 参数 --
const isWatch = process.argv.includes("--watch");
if (isWatch) {
  run(); // 先全量同步一次
  watch(); // 再启动监听
} else {
  run();
}
