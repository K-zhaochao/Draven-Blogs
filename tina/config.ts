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
        label: "思考与总结",
        path: "docs/thoughts",
        match: {
          exclude: "index",
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
          exclude: "index",
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
      {
        name: "javaDocs",
        label: "Java 文档",
        path: "docs/java",
        match: {
          exclude: "index",
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
    ],
  },
});
