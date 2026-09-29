---
title: 在新站写一篇文章
published: 2026-09-27
description: 新站的文章放在 src/content/posts，写好 Markdown 后会自动出现在首页、归档、分类和搜索中。
tags: [写作, Markdown, Firefly]
category: 指南
---

这个网站基于 Firefly，文章放在 `src/content/posts/` 中。每篇文章是一个 Markdown 文件，不需要维护单独的 JavaScript 文章列表。

复制一篇现有的 `.md` 文件，修改开头的 `title`、`published`、`description`、`category` 和 `tags`，然后在下方写正文。保存后运行 `npm run dev`，即可预览文章。

Markdown 支持标题、列表、引用、图片和代码块。发布时运行 `npm run build`，把 `dist/` 部署到服务器。

