# 网站同步「独立进程驱动」设计

日期：2026-08-13
状态：已确认

## 背景

内核仓库（`/Users/neo/kernel`）最新提交（`9a680167`）完成了驱动框架重构：硬件驱动以**独立 EL0 driver-daemon 进程**（`.drv` ELF）运行，devmgr 维护注册表并按类转发 IPC。网站（`/Users/neo/website`）当前描述的是旧模型（VirtIO block/net/input 列为内核内置驱动、无 vendor 分区、无 daemon 架构说明），需要同步。

本 spec 描述网站内容更新，不改内核代码。

## 事实来源（内核现状，网站内容以此为准）

- 驱动 daemon 按类分 IPC 服务 ID：display 0x41、block 0x42、net 0x43、snd 0x44、input 0x45、bt 0x46（内部枚举 DRV_CLASS_* 0–5）
- devmgr 注册表：`driver_daemon_mgr`，spinlock 保护，最多 32 项；懒解析 endpoint pool cref（name service，重试 128×50ms）后按类转发；进程内外设管理器保留为 fallback
- 注册协议：`driver_mgr` IDL（服务 0x30）`register_driver(compatible[64], name[32], class, service_id)`
- 驱动生命周期（libdriver）：`drv_init → drv_get_mmio → drv_register → 发布类服务 → drv_main_loop`
- 两条拉起路径：
  1. 启动关键 block 驱动：init.rc `exec /vendor/block.drv.elf <start> <size> <attr>…`（显式 linear-map 三元组，ramdisk 提供）
  2. 其余 daemon：zygote 读取 `/root/vendor/etc/drivers.json`（name / path / maps[{start,size,attr: normal|uncached|device}] / affinity），自动前置 DTB map
- 内存隔离：每个 daemon 只映射自己需要的 MMIO/DMA linear maps
- 新增 vendor.img（32MB, ext2, P2）：`bin/` .drv ELF + `etc/drivers.json`
- 各平台 vendor 驱动：
  - QemuVirt：fw_cfg、virtio-blk、virtio-gpu、virtio-input、virtio-net、virtio-snd
  - CM4：emmc2、rpi、rpi-bt、rpi-fb、rpi-touch、rpi-wlan
- 内核保留的基础驱动（启动关键）：UART PL011、GICv2/v3、ARM Timer、RTC PL031、PMU、Cache CCS、DMA PL330、Mali GPU、Watchdog、PSCI、VirtIO console、spin-table

## 范围

以下页面，中文原版 + `en/` 英文镜像同步更新：

1. `architecture.html` / `en/architecture.html`
2. `features.html` / `en/features.html`
3. `docs/index.html` / `en/docs/index.html`
4. `index.html` / `en/index.html`

不改动：`build.html`、`roadmap.html`、`download.html`、`screenshots.html`、`design/`、CSS/JS。`design/ui-design-spec.html` 的未提交改动与本任务无关，提交时不得混入。

## 页面改动

### 1. architecture.html

**主 SVG 图（最小改动）**：EL1 内核框内 `drivers` 组件改名 `base drivers`（中文页显示 `base drivers`，维持图中英文惯例）。不向主图添加 6 个 daemon，细节由新章节承载。

**新增章节「独立进程驱动」**，位于「启动」章节之后：

- 章节头：`硬件驱动，独立进程运行。` + lede：驱动以 EL0 daemon 进程运行，devmgr 维护注册表并按类转发 IPC；只有启动关键驱动留在内核。
- 新增小 SVG 图（沿用现有 `arch-svg` / `comp` / `flow` / `layer` / `name` / `desc` 样式类）：
  - 左侧 devmgr 框：注册表 `driver_daemon_mgr`、spinlock 标注
  - 右侧 2×3 共 6 个 daemon 框：display.drv 0x41 / block.drv 0x42 / net.drv 0x43 / snd.drv 0x44 / input.drv 0x45 / bt.drv 0x46
  - 箭头：daemon → devmgr 为 register（driver_mgr 0x30）；devmgr → daemon 为 per-class IPC forward
  - 图下方两条拉起路径标注：① init.rc exec（ramdisk，linear-map 三元组）→ block.drv；② zygote drivers.json（vendor）→ 其余 daemons
- 三张卡片（沿用 `.card` / `.tag` 样式）：
  1. **注册与转发** — `driver_mgr` IDL `register_driver` 四字段；spinlock 注册表（最多 32 项）；首次转发懒解析 endpoint pool cref（重试 128×50ms）；进程内外设管理器 fallback
  2. **两条拉起路径** — init.rc `exec` 三元组 vs zygote `drivers.json`（maps + affinity，自动前置 DTB map）
  3. **内存隔离** — 每个 daemon 只映射自己的 MMIO/DMA 区域（device / uncached / normal）；libdriver 生命周期五个步骤
- 代码示例块：CM4 `init.rc` exec 行 + QemuVirt `drivers.json` 片段（截取 1–2 个 daemon）

**「启动」章节更新**：

- pipe ①init：补 init.rc `exec` 拉起 block 驱动 daemon（显式线性映射）
- pipe ②zygote：补读取 `drivers.json`、从 vendor 分区拉起驱动 daemons
- 镜像布局代码块：新增 vendor.img（32MB, ext2, P2）：`bin/` .drv ELF、`etc/drivers.json`

### 2. features.html

- devmgr 卡片：`设备驱动框架与外设管理` → `驱动 daemon 注册表、按类 IPC 转发与外设管理`
- 「内核驱动与图形栈」章节标题改为「内核基础驱动 · 独立进程驱动 · 图形栈」，内容为三张卡：
  1. **内核基础驱动**：从原列表移除 VirtIO block / net / input（已出进程），保留 UART PL011、GICv2/v3、ARM Timer、RTC PL031、PMU、Cache CCS、DMA PL330、Mali GPU、Watchdog、PSCI、VirtIO console、spin-table
  2. **新增 独立进程驱动 daemons**：6 个 daemon 及类 ID（display 0x41 … bt 0x46）；附平台 vendor 驱动清单（QemuVirt / CM4，按上节事实来源）
  3. **图形与三方库**：不变

### 3. docs/index.html

- 概述 lede：EL1 微内核专注「基础驱动」；硬件驱动以独立进程运行、devmgr 按类转发
- 项目目录结构代码块：`uapps/core/` 增加 `drivers/`（driver_mgr IDL，devmgr 与 driver daemons 共用）；`platform/*/` 增加 `vendor/`（drivers.json + .drv daemons）
- 启动顺序段落：zygote 补「读取 `drivers.json` 拉起驱动 daemons」
- devmgr 表格行：`设备驱动框架与外设管理` → `驱动 daemon 注册表与按类 IPC 转发`

### 4. index.html

- USERSPACE SERVICES 带：新增第二行 6 个 driver daemon 芯片（DSP·BLK·NET·SND·IN·BT，沿用 `plate-services` 样式）
- 布局调整：带高 +22px；下方 MICROKERNEL / HYPERVISOR / BOOTLOADER 带、分隔线、`plate-el` 标签、`plate-flow` path 与 `plate-node` 圆点的 y 坐标整体 +22

### 5. en/ 英文镜像

上述全部改动以英文呈现。术语对照：

- 独立进程驱动 → Driver daemons（independent processes）
- 注册表 → driver registry
- 按类转发 → per-class IPC forwarding
- 拉起路径 → spawn paths
- 内存隔离 → memory isolation
- 内核基础驱动 → Built-in kernel drivers（boot-critical）

## 非目标

- 不写内核代码、不改内核文档
- 不重排页面整体布局与视觉风格
- 不新增导航项 / 新页面
- 不改动 CSS / JS

## 验证

- 浏览器打开四个中文页面 + 四个英文页面，确认渲染正常（SVG 无越界、表格对齐）
- 事实核对：类 ID、服务 ID、文件路径与内核仓库一致
- `git diff` 确认只改本 spec 涉及的 8 个 HTML 文件（+ 本 spec 文件）
