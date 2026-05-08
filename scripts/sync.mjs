import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

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
function transformContent(content) {
  // 1. 转换 Obsidian 双链: [[文件名]] -> [文件名](./文件名.md)
  content = content.replace(/\[\[(.*?)\]\]/g, "[$1](./$1.md)");

  // 2. 转换 Obsidian Callout: > [!info] 标题 -> ::: info 标题 \n :::
  // (简易版本，针对单行或简单多行)
  content = content.replace(
    /^> \[!(\w+)\](.*?)\n([\s\S]*?)(?=\n[^>]|$)/gm,
    (match, type, title, body) => {
      // 去掉 blockquote 的 "> " 前缀
      const cleanBody = body.replace(/^> ?/gm, "");
      return `::: ${type.toLowerCase()} ${title.trim()}\n${cleanBody}\n:::\n`;
    },
  );

  // 3. 转换内部图片引用的路径
  // 处理 Obsidian 特有的 Wiki 图片格式: ![[Draven_Note_Images/图片名.png]] 或者 ![[图片名.png]]
  content = content.replace(/!\[\[(.*?)\]\]/g, (match, imgPath) => {
    const fileName = path.basename(imgPath);
    return `![img](/Draven_Note_Images/${fileName})`;
  });

  // 处理由于拖拽引起的传统 Markdown 形式图片，包含所有可能的上级目录如 ![](.../Draven_Note_Images/图片.png)
  content = content.replace(
    /!\[.*?\]\(.*?(Draven_Note_Images\/.*?)\)/g,
    "![img](/$1)",
  );

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
    const destPath = path.join(DEST_DIR, relPath);

    fs.mkdirSync(path.dirname(destPath), { recursive: true });

    let content = fs.readFileSync(file, "utf-8");
    content = transformContent(content);

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

  console.log("✅ 同步转换完成，笔记及图片已安全注入！");
}

run();
