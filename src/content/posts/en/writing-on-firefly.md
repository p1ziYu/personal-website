---
title: Writing a Post on the New Site
published: 2026-09-27
description: Posts live in src/content/posts. Drop in a Markdown file and it effortlessly shows up on the homepage, archives, categories, and search.
tags: [Writing, Markdown, Firefly]
category: Guides
lang: en
image: "api"
---

This site is built on Firefly, and articles live right under `src/content/posts/`. Each post is simply a Markdown file—no messy manual JavaScript index arrays to maintain.

Just clone an existing `.md` file, update the frontmatter fields (`title`, `published`, `description`, `category`, and `tags`), and start typing away below. Hit save and spin up `pnpm dev` to preview your post in real time.

Markdown has you covered with headings, lists, blockquotes, images, and code blocks. When you're ready to ship, run `pnpm build` and deploy the generated `dist/` bundle to your server.
