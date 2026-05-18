// tina/config.ts
import { defineConfig } from "tinacms";
var config_default = defineConfig({
  clientId: process.env.TINA_CLIENT_ID,
  token: process.env.TINA_TOKEN,
  branch: "main",
  build: {
    outputFolder: "admin",
    publicFolder: "docs/public"
  },
  media: {
    tina: {
      mediaRoot: "uploads",
      publicFolder: "docs/public"
    }
  },
  schema: {
    collections: [
      {
        name: "thoughts",
        label: "\u601D\u8003\u4E0E\u603B\u7ED3",
        path: "docs/thoughts",
        match: {
          exclude: "index.md"
        },
        fields: [
          {
            name: "title",
            label: "\u6807\u9898",
            type: "string",
            required: true
          },
          {
            name: "order",
            label: "\u6392\u5E8F\u6743\u91CD",
            type: "number"
          },
          {
            name: "tags",
            label: "\u6807\u7B7E",
            type: "string",
            list: true
          },
          {
            name: "body",
            label: "\u6B63\u6587",
            type: "rich-text",
            isBody: true
          }
        ]
      },
      {
        name: "projects",
        label: "\u9879\u76EE\u5B9E\u6218",
        path: "docs/projects",
        match: {
          exclude: "index.md"
        },
        fields: [
          {
            name: "title",
            label: "\u9879\u76EE\u540D\u79F0",
            type: "string",
            required: true
          },
          {
            name: "description",
            label: "\u9879\u76EE\u7B80\u4ECB",
            type: "string",
            ui: {
              component: "textarea"
            }
          },
          {
            name: "techStack",
            label: "\u6280\u672F\u6808",
            type: "string",
            list: true
          },
          {
            name: "status",
            label: "\u72B6\u6001",
            type: "string",
            options: ["\u5B66\u4E60\u4E2D", "\u8FDB\u884C\u4E2D", "\u5DF2\u5B8C\u6210", "\u5DF2\u5F52\u6863"]
          },
          {
            type: "string",
            name: "category",
            label: "\u9879\u76EE\u7C7B\u578B",
            options: [
              { label: "\u624B\u6413 / \u534F\u4F5C\u9879\u76EE", value: "manual" },
              { label: "AI Vibe Coding", value: "ai-vibe" }
            ],
            required: true
          },
          {
            type: "string",
            name: "github",
            label: "GitHub \u4ED3\u5E93 (owner/repo)"
          },
          {
            name: "order",
            label: "\u6392\u5E8F\u6743\u91CD",
            type: "number"
          },
          {
            name: "body",
            label: "\u6B63\u6587",
            type: "rich-text",
            isBody: true
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
