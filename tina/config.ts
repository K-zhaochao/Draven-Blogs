import { defineConfig } from "tinacms";

export default defineConfig({
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  branch: "main",

  build: {
    outputFolder: "admin",
    publicFolder: "docs/public",
  },

  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "docs/public",
    },
  },

  schema: {
    collections: [
      {
        name: "thoughts",
        label: "我的博客",
        path: "docs/thoughts",
        match: {
          exclude: "index.md",
        },
        fields: [
          {
            name: "title",
            label: "标题",
            type: "string",
            required: true,
          },
          {
            name: "order",
            label: "排序权重",
            type: "number",
          },
          {
            name: "tags",
            label: "标签",
            type: "string",
            list: true,
          },
          {
            name: "body",
            label: "正文",
            type: "rich-text",
            isBody: true,
          },
        ],
      },
      {
        name: "projects",
        label: "项目实战",
        path: "docs/projects",
        match: {
          exclude: "index.md",
        },
        fields: [
          {
            name: "title",
            label: "项目名称",
            type: "string",
            required: true,
          },
          {
            name: "description",
            label: "项目简介",
            type: "string",
            ui: {
              component: "textarea",
            },
          },
          {
            name: "techStack",
            label: "技术栈",
            type: "string",
            list: true,
          },
          {
            name: "status",
            label: "状态",
            type: "string",
            options: ["学习中", "进行中", "已完成", "已归档"],
          },
          {
            type: "string",
            name: "category",
            label: "项目类型",
            options: [
              { label: "手搓/协助项目", value: "manual" },
              { label: "AI Vibe Coding 项目", value: "ai-vibe" },
              { label: "其他项目", value: "other" },
              { label: "Demo", value: "demo" },
            ],
            required: true,
          },
          {
            type: "string",
            name: "github",
            label: "GitHub 仓库 (owner/repo)",
          },
          {
            type: "string",
            name: "websiteUrl",
            label: "线上网站链接",
          },
          {
            name: "order",
            label: "排序权重",
            type: "number",
          },
          {
            name: "body",
            label: "正文",
            type: "rich-text",
            isBody: true,
          },
        ],
      },
    ],
  },
});
