# Changelog

## 2026-05-28

### feat(projects): 项目实战展示增强 — 数据契约、分组目录与 UI 完整闭环

**Task ID**: `projects-display-enhancements` · **Branch**: `feat/projects-display-enhancements`

#### 数据契约与 CMS

- 新增 `websiteUrl` frontmatter 字段，支持项目配置线上网站链接
- `category` 枚举扩展为 `manual` / `ai-vibe` / `other` / `demo` 四分类
- `projects.data.ts` 新增 `githubUrl`、`websiteUrl`、`demoProjects` 字段与稳定排序逻辑

#### Sidebar 分组

- `/projects/` 左侧目录按 `category` 固定分组：手搓/协助项目 → AI Vibe Coding 项目 → 其他项目 → Demo
- 空分组默认隐藏

#### UI

- `ProjectModal` 支持双链接按钮（访问网站 + GitHub），窄屏下允许换行堆叠
- 移动端 Modal bottom sheet 适配（`dvh` 动态视口 / `safe-area` / 溢出控制）
- Modal 打开时滚动条补偿，保存并恢复原值，避免页面闪烁
- `formatDate` 增加 `isNaN` 守卫，避免无效日期渲染 `NaN-NaN-NaN`
- `readmeCache` 使用可选链，防止 `readme-cache.json` 缺失时抛出 `TypeError`
- README 内容区溢出控制（img / table / pre / a 均有规则）

#### 构建

- `npx vitepress build docs` 通过（110.06s），无新增 warning 或 error

#### 提交记录

| Commit | 说明 |
|--------|------|
| `98f7d10` | feat(projects): add project data contract fields |
| `d65756e` | feat(projects): sidebar category grouping |
| `d394e28` | feat(projects): UI finalization — dual link buttons, mobile bottom sheet, scrollbar compensation |
