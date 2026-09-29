# 痞子宇的个人空间

基于 [Firefly](https://github.com/CuteLeaf/Firefly) 6.16.8 的 Astro 个人博客。首页采用全屏插画首屏，下面是文章列表与侧栏。

## 本地运行

需要 Node.js 22.23+ 和 pnpm。

```powershell
pnpm install
pnpm dev
```

打开终端显示的本地地址。生产构建：

```powershell
pnpm check
pnpm type-check
pnpm build
```

构建结果在 `dist/`，把该目录的内容部署到静态服务器即可。Oracle 主机的 Caddy 示例见 `deploy/Caddyfile`。旧版 `/old/` 已从构建结果移除；部署到已有目录时需同步清理服务器上残留的 `old/` 文件。Caddy 配置也会对 `/old/` 返回 410。

如果 Windows 上的 pnpm 因符号链接权限报 `EPERM`，可使用本项目验证过的安装方式：

```powershell
npm install --ignore-scripts --legacy-peer-deps
npm run dev
```

## 换成你的内容

| 内容 | 文件 |
| --- | --- |
| 站名、域名、主题色、页面开关 | `src/config/siteConfig.ts` |
| 首屏标题、壁纸与效果 | `src/config/backgroundWallpaper.ts` |
| 昵称、头像、社交链接 | `src/config/profileConfig.ts` |
| 导航 | `src/config/navBarConfig.ts` |
| 侧栏 | `src/config/sidebarConfig.ts` |
| 关于页 | `src/content/spec/about.md` |
| 文章 | `src/content/posts/*.md` |
| 项目 | `src/content/projects/*.md` |
| 友链 | `src/config/friendsConfig.ts` |
| 留言服务 | `src/config/commentConfig.ts` |
| 追番账号 | `src/config/siteConfig.ts` |
| 音乐歌单 | `src/config/musicConfig.ts` |

站名和昵称已设为「痞子宇的个人空间」与「痞子宇」，首页文案与个人签名均为「你所热爱的，就是你的生活。」正式上线前还需确认 `site_url`、头像和关于页。要添加文章，复制 `src/content/posts/start-here.md`，修改 frontmatter 和正文即可。

导航包含文章（归档、分类、标签）、项目、友链、留言和关于（追番、音乐、支持本站、RSS）。友链列表暂时留空。侧栏有车票二维码、分类、标签和站点统计；调色盘可切换主题色与文章布局。追番、音乐和在线留言当前只保留入口，待提供账号、歌单和评论服务后接入。支持本站页面暂不收款。

## 素材与来源

主题代码来自 Firefly，许可见 `LICENSE`。首页海岸插画为本项目生成，生成说明见 `src/assets/images/NightVoyage/ASSET.md`。未使用朋友网站的图片或代码。
