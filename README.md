# TranquilOS Website

Official website for [TranquilOS](https://github.com/nerossoft/TranquilOS) — an object-capability microkernel operating system for AArch64.

Live at [oskern.com](https://oskern.com) (GitHub Pages + CNAME).

## Stack

Pure static HTML/CSS/JS. No build step, no dependencies, no frameworks.

## Structure

```
/                        中文页面（首页、架构与实现、截图、构建与下载）
/en/                     English mirror（同构镜像）
/docs/                   文档中心（单页式：侧边导航 + 搜索 + scrollspy）
/en/docs/                English docs mirror
style.css  script.js     双语共享的设计系统与交互
docs/docs.css  docs.js   文档中心专用
branding/                品牌资产
repowiki/                仓库百科（独立内容，未接入站点）
```

## Conventions

- **Bilingual by mirroring**: Chinese pages live at the root, English under `/en/`. The language button links to the mirrored page — no JS string swapping. Content changes must be applied to both trees.
- **Theme**: dark-only since the 2025 redesign (OpenAI/Moonshot-inspired). `theme.css` still exports light-theme token values, but `theme-init.js` always forces `data-theme="dark"` and the toggle was removed.
- **Content source of truth**: feature/status claims mirror the kernel repo's `README.md`, `CLAUDE.md` and `docs/*.md`. Update the site when those change.

## Local preview

```bash
python3 -m http.server 8000
# open http://localhost:8000
```
