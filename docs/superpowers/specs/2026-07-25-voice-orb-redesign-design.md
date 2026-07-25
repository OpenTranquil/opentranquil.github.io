# AI Agent Panel → 语音球（Voice Orb）重设计

**Date:** 2026-07-25
**Status:** Design Approved
**Scope:** `/design/ui-design-spec.html` — AI Agent Panel 替换为语音球界面

---

## 1. Overview

将当前文本型的 AI Agent Panel（系统智能体）重新设计为以极简几何球体为中心的语音优先界面。风格：**极简几何球（C）**。球体是唯一的视觉焦点，辅以轻量的文本信息。

### 保留的功能

- 语音输入/对话（核心交互）
- 最近对话记录
- 问候语 + 时间天气

### 移除的功能

- "打开完整助手"按钮 — 球体即完整的交互入口
- 系统上下文卡片 — 简化信息层级
- 当前状态卡片
- 可执行动作卡片

---

## 2. 布局结构

全屏覆盖层 800×480。

```
┌────────────────────────────────────────────────┐
│  下午好 · 周五 · 晴 24°              × 关闭   │  ← header row
│                                                │
│                    ┌──────────┐                │
│    ┌──────────┐    │ 最近对话  │                │
│    │          │    │          │                │
│    │  语音球   │    │ "帮我看…" │                │
│    │  (几何)   │    │ "设置一…" │                │
│    │          │    │          │                │
│    └──────────┘    └──────────┘                │
│                                                │
│        [suggestion chip] [chip] [chip]         │  ← bottom row
└────────────────────────────────────────────────┘
```

**比例分配：**
- 左侧球体区域：约 55%，球体垂直水平居中于该区域
- 右侧对话列表：约 45%，可纵向滚动
- 球体直径：约 180–200px（视窗内体量感均衡）

**间距：**
- Header 左右各 20px padding
- 球体与对话列表间距：约 32px
- 底部 chips 距底边：约 20px

---

## 3. 球体设计（四个状态）

所有状态使用 project 的 CSS tokens（`--color-*`, `--duration-*`, `--ease-*`）。

### 3.1 待机（Idle）

- 纯几何圆，`--color-text-1` 细线描边（1.5px），无填充
- 圆心显示时间（HH:MM，font-weight 500），字体大小约 28px
- 球体无主动动画，仅有微量 `box-shadow` 光晕（`--color-accent` 5% opacity）
- 整体静默、安静的存在感

### 3.2 聆听（Listening）

触发：用户语音唤醒或点击球体

- 球体边框从 `--color-text-1` 过渡到 `--color-accent`
- 呼吸式脉冲：球体 scale 在 1.0 ↔ 1.08 之间以 1.5s 周期 smooth 往返
- 圆内出现细线波形指示器（3 条竖线，accent 色，高度 8–20px 交替变化）
- 时间文字淡出（opacity → 0），波形淡入

### 3.3 思考（Thinking）

触发：语音输入结束，AI 开始处理

- 球体边框持续旋转（360°/2s，linear infinite）
- 边框由实线变为虚线/点线片段（4 段弧线，各约 60°）
- 圆内显示微小的 accent 圆点（3–4px），以脉冲节奏明灭
- 整体传达"处理中"的信号，不安、不躁

### 3.4 说话（Speaking）

触发：AI 开始语音输出回复

- 球体取消旋转，边框恢复实线，保持 accent 色
- 随音频输出做不规则缩放波动（scale 1.0–1.06，使用音频振幅映射）
- 静态 fallback：使用正弦波模拟呼吸（0.8s 周期，比聆听更快）
- 圆内心跳式光点：中央 6px accent 圆点以 0.5s 周期脉冲

---

## 4. 辅助组件

### 4.1 Header Row

```
下午好 · 周五 · 晴 24°                          ×
```

- 左对齐：问候语 + 分隔符 + 星期 + 分隔符 + 天气 + 温度
- 字体：`--text-sm` (13px)，`--color-text-2`
- 问候部分 weight: `--weight-medium`
- 关闭按钮：右上角，`--text-lg`，`--color-text-2`，hover → `--color-text-1`

### 4.2 最近对话列表

- 标题 "最近对话"：`--text-xs` (11px)，weight 600，`--color-text-3`，letter-spacing 0.06em
- 条目：每条 `--text-sm` (13px)，左对齐
- 条目间距：12px
- 条目上限：最多显示 5 条，超出滚动
- 每条格式：对话文本 + 相对时间（如 "2 分钟前"），时间 `--text-xs` `--color-text-3`
- 条目之间有 1px `--color-border-1` 分隔线
- 空白状态：显示 "暂无对话记录" `--color-text-3`

### 4.3 Suggestion Chips

- 底部居中排列，间距 8px
- Pill 形状：`border-radius: 99px`，padding: 6px 14px
- 默认：`--color-border-1` 边框，`--color-text-2` 文字，`--text-xs`
- Hover：border → `--color-accent`
- 显示 3–4 个快捷建议（如 "今天有什么安排？" "系统状态" 等）

---

## 5. 动画规格

| 动画 | 属性 | 时长/周期 | Easing |
|------|------|-----------|--------|
| 球体状态切换 | opacity, border-color | `--duration-normal` (250ms) | `--ease-out` |
| 呼吸脉冲 (聆听) | transform: scale | 1.5s, alternate, infinite | `--ease-in-out` |
| 旋转 (思考) | transform: rotate | 2s, linear, infinite | linear |
| 缩放波动 (说话) | transform: scale | 0.5–0.8s, map to audio | `--ease-out` |
| Chips hover | color, border-color | `--duration-fast` (150ms) | `--ease-out` |

所有动画使用 CSS 动画/过渡实现，不依赖 JavaScript 动画库。说话状态的音频映射使用 CSS 自定义属性 + JS `AudioContext` 驱动。

---

## 6. CSS 变量引用

所有颜色、间距、动画使用 project 既有的 design tokens：

- `--color-bg` — 覆盖层背景
- `--color-surface-1` / `--color-surface-2` — 对话列表条目背景
- `--color-border-1` / `--color-border-2` — 描边和分隔线
- `--color-text-1` / `--color-text-2` / `--color-text-3` — 文字层级
- `--color-accent` — 球体激活态、chips hover
- `--text-xs` / `--text-sm` / `--text-base` / `--text-lg` — 文字大小
- `--space-*` — 间距
- `--duration-fast` / `--duration-normal` / `--duration-slow` — 过渡时长
- `--ease-out` / `--ease-in-out` — 缓动曲线

---

## 7. 主题适配

- **Dark:** overlay 背景 `--color-bg` (#11110F)，球体线条 `--color-text-1`，激活 `--color-accent` (#6F89F2)
- **Light:** overlay 背景 #F0F0F0（继承当前 Panel 亮版底色），球体线条 `--color-text-1`，激活 `--color-accent` (#2949B8)

对话列表条目在亮版使用白色底（`#fff`）与深版统一风格一致。

---

## 8. 实现要点

1. **Markup:** 在 `ui-design-spec.html` 中替换 line 1403–1532 的 AI Agent Panel section（保留 h3 标题 + pair 结构）
2. **球体:** 单个 `<div>` + CSS `border-radius: 50%` + `border` + `box-shadow`，不依赖 SVG
3. **状态切换:** 通过 CSS class 切换（`.orb-idle` / `.orb-listening` / `.orb-thinking` / `.orb-speaking`）
4. **波形指示器:** 3 个 `<span>` 在球体内部，CSS animation 各不同 delay
5. **对话列表:** 右侧 `<div>` 固定高度，`overflow-y: auto`
6. **响应用户交互:** 纯 CSS 实现状态演示（hover/click 模拟状态切换），无需 JS 交互逻辑
