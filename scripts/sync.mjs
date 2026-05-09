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

  // 1. 转换内部图片引用的路径 (放到双链转换前面，防止被误伤)
  // 处理 Obsidian 特有的 Wiki 图片格式: ![[Draven_Note_Images/图片名.png]] 或者 ![[图片名.png]]
  content = content.replace(/!\[\[(.*?)\]\]/g, (match, imgPath) => {
    // 尝试提取 Draven_Note_Images 之后的完整目录结构
    const matchDir = imgPath.match(/Draven_Note_Images\/(.*)/);
    if (matchDir && matchDir[1]) {
      return `<img src="/Draven_Note_Images/${matchDir[1].trim()}" alt="img" />`;
    }
    // 如果没有，退回到仅保留文件名
    const fileName = path.basename(imgPath);
    return `<img src="/Draven_Note_Images/${fileName.trim()}" alt="img" />`;
  });

  // 处理由于拖拽引起的传统 Markdown 形式图片，包含所有可能的上级目录如 ![](.../Draven_Note_Images/图片.png)
  content = content.replace(
    /!\[.*?\]\(.*?(Draven_Note_Images\/.*?)\)/g,
    (match, imgPath) => {
      // 同样处理 url 编码
      return `<img src="/${imgPath.trim()}" alt="img" />`;
    },
  );

  // 1.1 处理 ./img/ 相对路径图片引用（如 Maven 笔记中的 ./img/6Q2D8D5Tei33CxSQ/xxx.png）
  // 这些图片实际存放在 Draven_Note_Images/JavaWeb/Maven/ 对应目录中
  // 需要转换为 VitePress 可访问的绝对路径 /Draven_Note_Images/JavaWeb/Maven/xxx.png
  content = content.replace(
    /!\[(.*?)\]\(\.\/?img\/(.*?)\/(.*?)\)/g,
    (match, alt, subfolder, filename) => {
      return `<img src="/Draven_Note_Images/JavaWeb/Maven/${subfolder}/${filename}" alt="img" />`;
    },
  );

  // 兜底处理：其他无效相对路径图片 (如 ./img/xxx.png 无子目录)
  content = content.replace(
    /!\[(.*?)\]\(\.\/?img\/(.*?)\)/g,
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

  // -- 自动为缺少 index.md 的文件夹生成索引 --
  console.log("📁 检查并生成缺失的文件夹索引...");
  generateMissingIndexes(DEST_DIR);

  console.log("✅ 同步转换完成，笔记及图片已安全注入！");
}

// 递归扫描目录，为缺少 index.md 的文件夹自动生成
function generateMissingIndexes(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const subdirs = entries.filter((e) => e.isDirectory());
  const mdFiles = entries
    .filter(
      (e) =>
        e.isFile() &&
        e.name.endsWith(".md") &&
        e.name.toLowerCase() !== "index.md",
    )
    .map((e) => e.name);

  // 递归处理子目录
  for (const subdir of subdirs) {
    generateMissingIndexes(path.join(dir, subdir.name));
  }

  // 如果没有 index.md 且有 .md 文件，自动生成
  const hasIndex = entries.some(
    (e) => e.isFile() && e.name.toLowerCase() === "index.md",
  );
  if (!hasIndex && mdFiles.length > 0) {
    const dirName = path.basename(dir);
    const relToNotes = path.relative(DEST_DIR, dir);

    // 按文件名排序
    mdFiles.sort((a, b) => {
      const orderA = getFileOrder(a);
      const orderB = getFileOrder(b);
      if (orderA !== orderB) return orderA - orderB;
      return a.localeCompare(b);
    });

    const links = mdFiles
      .map((f) => {
        const name = f.replace(/\.md$/i, "");
        // 去掉文件名中的空格，生成可用的链接路径
        const linkPath = f.replace(/\s+/g, "");
        return `- [${name}](${linkPath})`;
      })
      .join("\n");

    let indexContent = `# ${dirName}\n\n${links}`;
    indexContent = transformContent(
      indexContent,
      path.join(relToNotes, "index.md"),
    );

    fs.writeFileSync(path.join(dir, "index.md"), indexContent, "utf-8");
    console.log(`  📄 已生成: ${relToNotes}/index.md`);
  }
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
