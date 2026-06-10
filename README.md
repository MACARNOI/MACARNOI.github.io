# MACARNOI 博客

一个纯前端的静态博客系统，使用 Markdown 编写文章，托管于 GitHub Pages，通过 GitHub Actions 自动部署。

## 🚀 快速开始

### 1. Clone 本项目

```bash
git clone https://github.com/MACARNOI/MACARNOI.git
cd MACARNOI
```

### 2. 安装依赖（仅用于本地生成文章索引）

```bash
npm install gray-matter
```

### 3. 编写文章

在 `posts/` 目录下按分类创建子文件夹，然后在其中创建 `.md` 文件。文章使用 **Front Matter** 格式：

```markdown
---
title: 文章标题
date: 2026-06-10
subtitle: 文章副标题
cover: ./assets/images/blog/blog.png
---

这里是文章正文，支持 Markdown 语法...
```

> **注意**：`cover` 字段可选，不填则使用默认封面。

### 4. 生成文章索引

写完文章后，运行以下命令自动扫描 `posts/` 目录并生成索引：

```bash
node generate-index.js
```

### 5. 推送到 GitHub

```bash
git add .
git commit -m "发布新文章"
git push
```

推送后，GitHub Actions 会自动部署到 GitHub Pages。

---

## 📁 项目结构

```
├── .github/workflows/deploy.yml  # GitHub Actions 自动部署配置
├── index.html                    # 入口页面
├── generate-index.js             # 文章索引生成脚本
├── posts/                        # 📝 文章存放目录
│   ├── index.json                # 自动生成的文章索引
│   └── 分类名/
│       └── 2026-xx-xx.md         # 文章文件
├── pages/                        # 📄 独立页面（Markdown）
│   └── about.md                  # 关于页面
├── config/                       # ⚙️ 配置文件
│   ├── sidebar.json              # 侧边栏配置（头像、站点名、社交链接）
│   ├── categories.json           # 分类配置
│   ├── friends.json              # 友链配置
│   └── home.json                 # 首页配置（每页文章数）
├── assets/                       # 🖼️ 静态资源
│   └── images/
├── css/                          # 样式文件
└── js/                           # JavaScript 逻辑
    ├── app.js                    # 应用入口
    ├── render/                   # 页面渲染模块
    └── events/                   # 事件处理模块
```

---

## ⚙️ 配置说明

### 侧边栏配置 — `config/sidebar.json`

```json
{
  "avatar": {
    "img": "./assets/images/avatar/soyo.png",
    "emoji": "😶‍🌫️"
  },
  "site": {
    "name": "MACARNOI",
    "description": "博客描述"
  },
  "social": [
    {
      "name": "GitHub",
      "url": "https://github.com/MACARNOI",
      "svg": "<svg>...</svg>"
    }
  ]
}
```

- `avatar.img` — 头像图片路径
- `avatar.emoji` — 头像旁的表情符号
- `site.name` — 博客名称
- `site.description` — 博客简介
- `social` — 社交链接列表，`svg` 字段填入 SVG 图标代码

### 分类配置 — `config/categories.json`

```json
{
  "分类名称": {
    "description": "分类描述",
    "cover": "./assets/images/blog/blog.png"
  }
}
```

> 分类名称需要与 `posts/` 下的文件夹名称一致。

### 友链配置 — `config/friends.json`

```json
[
  {
    "title": "站点名称",
    "url": "https://example.com",
    "description": "站点描述",
    "icon": "./assets/friends/icon.png"
  }
]
```

### 首页配置 — `config/home.json`

```json
{
  "postsPerPage": 3
}
```

---

## 🛠️ 技术栈

- **纯原生 HTML/CSS/JS**，无框架依赖
- [marked.js](https://github.com/markedjs/marked) — Markdown 渲染（CDN 引入）
- **GitHub Pages** — 静态托管
- **GitHub Actions** — 自动构建与部署

---

## 🌐 部署

### 自动部署（推荐）

推送代码到 `main` 分支后，GitHub Actions 会自动：

1. 检出代码
2. 安装依赖并生成文章索引
3. 将索引提交回仓库
4. 部署到 GitHub Pages

触发条件：`posts/**`、`assets/config/**`、`.github/workflows/deploy.yml` 变更时自动触发，也可在 Actions 页面手动触发。

### 首次部署设置

1. 进入仓库 Settings → Pages
2. Source 选择 **GitHub Actions**
3. 推送代码即可触发首次部署

---

## 📝 写作约定

| 规则     | 说明 |
|----------|------|
| 文件名   | 建议使用 `YYYY-MM-DD-slug.md` 格式 |
| 分类     | 在 `posts/` 下按分类建文件夹，文件夹名需与 `categories.json` 中的 key 一致 |
| 封面图   | 默认 `./assets/images/blog/blog.png`，自定义请放在 `assets/` 下 |
| 排序     | 按 Front Matter 中的 `date` 字段倒序排列 |

---

## 📄 许可

本项目由 **MACARNOI** 亲自构建。博客主题借鉴 [Stack](https://github.com/CaiJimmy/hugo-theme-stack)（由 Jimmy 设计）。
