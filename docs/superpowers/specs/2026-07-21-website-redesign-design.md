# TranquilOS 官网重做设计

日期：2026-07-21
状态：已与用户对齐（方案 A / 信息架构 / 暗色工程风改良；其余细节用户授权自行决定）

## 背景

- 内容来源：`~/kernel/` —— TranquilOS，面向 aarch64 的 capability-based 微内核操作系统（EL2 Type-1 hypervisor、EL1 微内核、EL0 SystemDaemon、framework services、14+ 应用，GN/Ninja 构建，QemuVirt/Pi3B/Pi4B/CM4 四平台）。
- 现状：`~/website/`（oskern.com，GitHub Pages + CNAME）有一版未完成的改版（概览/架构/构建/下载/文档五页），工作区有未提交改动，旧页面（about/agent/insight/microkernel/products）已在 git 中删除未提交。
- 本次目标：推倒重做，全新设计。

## 已确认决策

| 决策点 | 结论 |
|---|---|
| 工作性质 | 推翻现有页面，全新设计；内容仍来自 ~/kernel |
| 语言 | 中英双语 |
| 页面结构 | 多页完整站点：首页/架构/特性/构建/下载/路线图/文档 |
| 技术方案 | 纯静态 HTML/CSS/JS，零构建、零依赖，GitHub Pages 直接部署 |
| 视觉方向 | 暗色工程风改良（保留品牌连续性） |
| 文档板块 | 重做现有 docs/ 单页文档中心，内容手工维护 |
| 双语实现 | 方案 A：双目录镜像，中文在 `/`，英文在 `/en/`，共享 style.css/script.js/branding |

## 信息架构

```
/                        中文首页
/architecture.html       架构
/features.html           特性
/build.html              构建指南
/download.html           下载
/roadmap.html            路线图
/docs/                   文档中心（单页式：左侧导航 + 内容区 + 搜索过滤）
/en/                     English mirror（同构 6 页 + /en/docs/）
```

- 导航：`[logo] 架构 特性 构建 路线图 下载 文档 | 中文/EN ☾ GitHub`，logo 回首页。
- 语言切换为镜像页直链（`/features.html` ↔ `/en/features.html`），无 JS 替换。
- 旧文件处置：`index/arch/project/download.html`、`docs/`、`script.js`、`style.css` 全部重写；`branding/`、`downloads/`、`CNAME`、`repowiki/` 保留；旧页面删除顺势提交；仓库 README.md 重写为新站点说明；`.DS_Store` 移出跟踪并加入 .gitignore。

## 视觉系统

### 色彩（CSS 变量，暗色默认 + 浅色切换）

```
暗色: --bg #0A0A0B  --sf #121214  --sf2 #1A1A1E  --ln #232328
      --tx #F2F2EE  --mut #8E8E96  --ac #5B8CFF   --ok #4ADE80
浅色: --bg #FAFAF8  --sf #F0F0EC  --ln #DCDCD4   --tx #141412  --ac #2E5BFF
```

- `--ok` 绿仅用于"已实现"状态（特性勾、boot log、终端输出）。
- 层次靠 1px hairline 与色阶，不用阴影堆叠。

### 字体

- 中文 Alibaba PuHuiTi / PingFang SC；等宽 SF Mono / JetBrains Mono 用于 eyebrow、徽章、代码、版本号。
- 字号阶梯：首页 display 56/44 → 页 hero 40 → 节标题 28 → 卡片 16 → 正文 14–15；中文行高 1.7。

### 签名元素

1. 终端窗口（三点标题栏 code block）——首页 hero、构建页。
2. 内联 SVG 分层架构图（EL2→EL1→EL0 启动链）——架构页核心图，线框风，hover 高亮单层。
3. Capability 徽章（mono 描边小 chip：`VSpace` `CNode` `Endpoint`…）。
4. 状态勾（✓ `--ok` 绿 = 已实现，○ 灰 = 未实现）——特性页、路线图通用。

### 组件

导航栏、按钮（primary/ghost）、卡片、表格、代码块、徽章、步骤流水线、指标条、页脚。容器 1180px，节距 96px。移动端单列 + 纯 CSS 汉堡菜单。动效仅 hover 与轻微滚动 fade-in（尊重 `prefers-reduced-motion`）。

## 内容规划（来源 → 页面）

- **首页**：定位一句话 + 终端 boot log 视觉 + 双 CTA；指标条；三卡片（capability 授权 / 用户态服务 / 端到端实现）；六步启动链 pipeline；四核心机制（capability、migrating-thread IPC、split-context scheduler、IDL）；子系统覆盖矩阵；快速开始终端块。来源：kernel README + CLAUDE.md。
- **架构**：SVG 分层图；capability 系统（CNode/cref/rights mask）；IPC 模型（migrating-thread / endpoint / pool / elastic / upcall / name service / SHM 约定）；调度（scontext/xcontext、per-CPU、CFS 模块）；内存（MMU/VSpace/buddy）；启动（initcall LV0–7 表、boot.img 布局、init→zygote→appmgr）；服务 dispatch 模式代码示例。来源：`docs/microkernel_design.md`、`docs/basic_theory.md`、CLAUDE.md。
- **特性**：按 README Features 分组陈列（Microkernel / Hypervisor / Core Services / System Services / User Apps），全部 ✓ 状态勾；驱动、文件系统、网络、图形栈。来源：README Features。
- **构建**：前置条件（toolchain、brew e2fsprogs）；quick start；四平台差异表（QemuVirt/Pi3B/Pi4B/CM4）；手动 gn/ninja；构建管线四步；boot.img/system.img 布局；工具链选项。来源：CLAUDE.md、run 脚本。
- **下载**：`downloads/tranquil-virt.img`（QEMU）、`downloads/tranquil-cm4.img`（CM4 真机）；各自运行/刷写说明；版本与大小信息手工维护。
- **路线图**：三泳道（已完成 / 进行中 / 探索中），不承诺具体日期；素材：README checkbox、TODO.md、stub 项（trustee、fastcall）。
- **文档中心**：左侧分类导航（入门 / 架构 / 构建与平台 / 内核机制 / 系统服务 / 工具链），右侧内容，搜索过滤；内容取自 kernel docs 精华，手工维护；双语镜像。

## 文件布局

```
index.html  architecture.html  features.html  build.html  download.html  roadmap.html
style.css  script.js           ← 双语共享
docs/index.html  docs/docs.css  docs/docs.js   ← 文档中心（重写）
en/  ← 同构镜像（含 en/docs/）
branding/  downloads/  repowiki/  CNAME       ← 保留不动
```

- `/en/` 内页面用 `../style.css` 相对路径引用共享资源，保证 file:// 直开也可预览。
- script.js 职责：主题切换（localStorage 持久化）、移动端菜单、文档搜索过滤、滚动 reveal。无框架。

## 验证

1. `python3 -m http.server` 本地起服务，全部 14+ 页面 curl 200。
2. 脚本校验所有内部 href/src 目标存在（双语两棵树互链正确）。
3. 人工过一遍：暗/浅主题、移动端宽度、无 JS 时可读性（内容不依赖 JS 渲染）。
4. 提交：`docs(superpowers)` 设计文档先行提交，站点重做作为独立 commit。

## 不做（YAGNI）

- 博客/新闻/社区页、多语言 hreflang SEO 标签之外的 SEO 工程、构建流水线、框架迁移。
- repowiki 不接入官网（用户决策）。
