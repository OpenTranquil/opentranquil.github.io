# Voice Orb AI Agent Panel — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the AI Agent Panel in `ui-design-spec.html` with a voice orb centered design.

**Architecture:** Single-file change to `design/ui-design-spec.html`. Add CSS classes for the orb + its 4 states, then replace the HTML section (lines 1403–1532) with the new dual-theme mockup. Follows existing `.pair` / `.d.s` / `.d.k` / `.d.l` / `.key` / `.sc` conventions exactly.

**Tech Stack:** Plain HTML + CSS, no JS. All values reference existing spec-file CSS custom properties (`--bg`, `--sf`, `--ln`, `--tx`, `--dm`, `--ac`, etc.).

## Global Constraints

- Use only the existing CSS custom properties defined in `.d.k` and `.d.l` blocks
- Follow existing mockup conventions: `.pair` two-column layout, `.d.s` tall device (800×480), labels, note paragraphs
- Keep the `<h3>` section title + `<div class="pair">` structure consistent with all other sections
- Dark theme on left, light theme on right (matching all other `.pair` blocks)
- No JavaScript; orb states shown as static visual variants
- All component styling uses inline styles (matching existing convention); CSS classes only for animations and state toggling

---

### Task 1: Add voice orb CSS

**Files:**
- Modify: `design/ui-design-spec.html` — append orb styles after existing `.sc` styles (before `</style>`)

**Produces:** CSS classes `.orb`, `.orb-c`, `.orb .wv`, `.orb .ring`, `.orb .dot`, plus state modifiers and `@keyframes`

- [ ] **Step 1: Add orb CSS block**

Insert the following after line 346 (`</style>` is at line 347 — insert BEFORE `</style>`):

```css
        /* ===== Voice Orb ===== */
        .orb-c {
            width: 180px; height: 180px;
            border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            flex: none; position: relative;
            transition: border-color .25s;
        }
        .orb-c .t {
            font-size: 28px; font-weight: 500;
            color: var(--tx);
            transition: opacity .25s;
        }
        /* waveform bars (listening) */
        .orb-c .wv {
            display: none; align-items: flex-end; gap: 4px; height: 24px;
        }
        .orb-c .wv i {
            display: block; width: 3px; border-radius: 2px; background: var(--ac);
        }
        .orb-c .wv i:nth-child(1) { height: 14px; animation: w1 .6s ease-in-out infinite alternate; animation-delay: 0s; }
        .orb-c .wv i:nth-child(2) { height: 14px; animation: w2 .6s ease-in-out infinite alternate; animation-delay: .15s; }
        .orb-c .wv i:nth-child(3) { height: 14px; animation: w3 .6s ease-in-out infinite alternate; animation-delay: .3s; }
        /* rotating ring (thinking) */
        .orb-c .ring {
            position: absolute; inset: -4px;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: var(--ac);
            display: none;
        }
        /* pulse dot (thinking/speaking) */
        .orb-c .dot {
            width: 7px; height: 7px;
            border-radius: 50%; background: var(--ac);
            display: none;
        }
        /* ---- state toggles ---- */
        .orb-c.lst { border-color: var(--ac); }
        .orb-c.lst .t { display: none; }
        .orb-c.lst .wv { display: flex; }
        .orb-c.lst { animation: orb-breathe 1.6s ease-in-out infinite alternate; }
        .orb-c.thk .t { display: none; }
        .orb-c.thk .ring { display: block; animation: orb-spin 2s linear infinite; }
        .orb-c.thk .dot { display: block; opacity: .35; animation: orb-blink .8s ease-in-out infinite; }
        .orb-c.spk { border-color: var(--ac); }
        .orb-c.spk .t { display: none; }
        .orb-c.spk .dot { display: block; animation: orb-blink .5s ease-in-out infinite; }
        /* ---- keyframes ---- */
        @keyframes orb-breathe { 0%,100%{ transform:scale(1); } 50%{ transform:scale(1.07); } }
        @keyframes orb-spin { to{ transform:rotate(360deg); } }
        @keyframes orb-blink { 0%,100%{ opacity:.2; transform:scale(1); } 50%{ opacity:1; transform:scale(1.35); } }
        @keyframes w1 { 0%,100%{ height:6px; } 50%{ height:18px; } }
        @keyframes w2 { 0%,100%{ height:18px; } 50%{ height:6px; } }
        @keyframes w3 { 0%,100%{ height:10px; } 50%{ height:22px; } }
```

- [ ] **Step 2: Commit CSS addition**

```bash
git add design/ui-design-spec.html && git commit -m "feat: add voice orb CSS classes and animations"
```

---

### Task 2: Replace AI Agent Panel HTML with voice orb design

**Files:**
- Modify: `design/ui-design-spec.html` — replace lines 1403–1532 (current AI Agent Panel section)

**Interfaces:**
- Consumes: CSS classes from Task 1 (`.orb-c`, `.lst`, `.thk`, `.spk`, `.wv`, `.ring`, `.dot`)
- Produces: Complete voice orb section with dark/light pair + 4-state showcase

- [ ] **Step 1: Replace the section HTML**

Delete lines 1403–1532 (from `<h3>AI Agent Panel` through its `</p>` note line 1532) and insert:

```html
    <h3>Voice Orb · 语音球（系统智能体 · 全屏覆盖 800×480）</h3>
    <div class="pair">
        <div>
            <div class="lbl">DARK · 待机</div>
            <div class="d s k" style="flex-direction:column">
                <!-- header -->
                <div style="padding:18px 20px 0;display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <div style="font-size:13px;font-weight:500;color:var(--tx)">下午好 · 周五 · 晴 24°</div>
                    </div>
                    <span style="color:var(--dm);font-size:18px;cursor:default">×</span>
                </div>
                <!-- main: orb left + history right -->
                <div style="flex:1;display:flex;padding:0 16px;min-height:0">
                    <!-- orb zone -->
                    <div style="flex:1;display:flex;align-items:center;justify-content:center">
                        <div class="orb-c" style="border:1.5px solid var(--tx);box-shadow:0 0 32px rgba(77,122,255,.05)">
                            <span class="t">14:32</span>
                            <div class="wv"><i></i><i></i><i></i></div>
                            <div class="ring"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                    <!-- history -->
                    <div style="width:42%;display:flex;flex-direction:column;padding-left:8px">
                        <div style="font-size:9px;font-weight:600;color:var(--dm2);letter-spacing:.06em;padding:16px 0 8px">最近对话</div>
                        <div class="sc" style="flex:1;display:flex;flex-direction:column;gap:2px;overflow-y:auto;padding-bottom:8px">
                            <div class="key" style="padding:8px 10px;font-size:11px;text-align:left;justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:2px">
                                <span style="color:var(--tx)">帮我看一下系统内存使用情况</span>
                                <span style="font-size:9px;color:var(--dm2)">2 分钟前</span>
                            </div>
                            <div class="key" style="padding:8px 10px;font-size:11px;text-align:left;justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:2px">
                                <span style="color:var(--tx)">设置一个明天早上 7 点的闹钟</span>
                                <span style="font-size:9px;color:var(--dm2)">12 分钟前</span>
                            </div>
                            <div class="key" style="padding:8px 10px;font-size:11px;text-align:left;justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:2px">
                                <span style="color:var(--tx)">今天天气怎么样</span>
                                <span style="font-size:9px;color:var(--dm2)">1 小时前</span>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- suggestion chips -->
                <div style="padding:4px 20px 18px;display:flex;gap:6px;justify-content:center">
                    <span style="font-size:10px;color:var(--ac);padding:4px 12px;border:1px solid var(--ac);border-radius:99px">今天有什么安排？</span>
                    <span style="font-size:10px;color:var(--dm);padding:4px 12px;border:1px solid var(--ln);border-radius:99px">系统状态</span>
                    <span style="font-size:10px;color:var(--dm);padding:4px 12px;border:1px solid var(--ln);border-radius:99px">清理存储</span>
                    <span style="font-size:10px;color:var(--dm);padding:4px 12px;border:1px solid var(--ln);border-radius:99px">设置闹钟</span>
                </div>
            </div>
        </div>
        <div>
            <div class="lbl">LIGHT · 待机</div>
            <div class="d s l" style="background:#F0F0F0;flex-direction:column">
                <div style="padding:18px 20px 0;display:flex;justify-content:space-between;align-items:flex-start">
                    <div>
                        <div style="font-size:13px;font-weight:500;color:var(--tx)">下午好 · 周五 · 晴 24°</div>
                    </div>
                    <span style="color:var(--dm);font-size:18px;cursor:default">×</span>
                </div>
                <div style="flex:1;display:flex;padding:0 16px;min-height:0">
                    <div style="flex:1;display:flex;align-items:center;justify-content:center">
                        <div class="orb-c" style="border:1.5px solid var(--tx);box-shadow:0 0 32px rgba(46,91,255,.04)">
                            <span class="t">14:32</span>
                            <div class="wv"><i></i><i></i><i></i></div>
                            <div class="ring"></div>
                            <div class="dot"></div>
                        </div>
                    </div>
                    <div style="width:42%;display:flex;flex-direction:column;padding-left:8px">
                        <div style="font-size:9px;font-weight:600;color:var(--dm2);letter-spacing:.06em;padding:16px 0 8px">最近对话</div>
                        <div class="sc" style="flex:1;display:flex;flex-direction:column;gap:2px;overflow-y:auto;padding-bottom:8px">
                            <div class="key" style="background:#fff;padding:8px 10px;font-size:11px;text-align:left;justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:2px">
                                <span style="color:var(--tx)">帮我看一下系统内存使用情况</span>
                                <span style="font-size:9px;color:var(--dm2)">2 分钟前</span>
                            </div>
                            <div class="key" style="background:#fff;padding:8px 10px;font-size:11px;text-align:left;justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:2px">
                                <span style="color:var(--tx)">设置一个明天早上 7 点的闹钟</span>
                                <span style="font-size:9px;color:var(--dm2)">12 分钟前</span>
                            </div>
                            <div class="key" style="background:#fff;padding:8px 10px;font-size:11px;text-align:left;justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:2px">
                                <span style="color:var(--tx)">今天天气怎么样</span>
                                <span style="font-size:9px;color:var(--dm2)">1 小时前</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style="padding:4px 20px 18px;display:flex;gap:6px;justify-content:center">
                    <span style="font-size:10px;color:var(--ac);padding:4px 12px;border:1px solid var(--ac);border-radius:99px">今天有什么安排？</span>
                    <span style="font-size:10px;color:var(--dm);padding:4px 12px;border:1px solid var(--ln);border-radius:99px">系统状态</span>
                    <span style="font-size:10px;color:var(--dm);padding:4px 12px;border:1px solid var(--ln);border-radius:99px">清理存储</span>
                    <span style="font-size:10px;color:var(--dm);padding:4px 12px;border:1px solid var(--ln);border-radius:99px">设置闹钟</span>
                </div>
            </div>
        </div>
    </div>
    <p class="note">全屏覆盖。顶栏轻量问候 + × 关闭。左区极简几何球体（180px 直径，1.5px 细线描边，圆心时间 display），右区 "最近对话" 列表（key 卡片，对话文本 + 相对时间）。底部居中 suggestion chips（pill，选中 accent 边框）。暗版 overlay-bg，亮版 #F0F0F0 底。</p>

    <!-- 4 states showcase: idle / listening / thinking / speaking -->
    <h3>Voice Orb · 四态展示（仅球体 / dark only）</h3>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin:12px 0 24px;max-width:1320px">
        <!-- idle -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
            <div class="lbl">待机 · idle</div>
            <div class="d k" style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center">
                <div class="orb-c" style="border:1.5px solid var(--tx);box-shadow:0 0 32px rgba(77,122,255,.05)">
                    <span class="t">14:32</span>
                    <div class="wv"><i></i><i></i><i></i></div>
                    <div class="ring"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
        <!-- listening -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
            <div class="lbl">聆听 · listening</div>
            <div class="d k" style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center">
                <div class="orb-c lst" style="border:1.5px solid var(--ac);box-shadow:0 0 40px rgba(77,122,255,.12)">
                    <span class="t">14:32</span>
                    <div class="wv"><i></i><i></i><i></i></div>
                    <div class="ring"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
        <!-- thinking -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
            <div class="lbl">思考 · thinking</div>
            <div class="d k" style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center">
                <div class="orb-c thk" style="border:1.5px solid var(--tx)">
                    <span class="t">14:32</span>
                    <div class="wv"><i></i><i></i><i></i></div>
                    <div class="ring"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
        <!-- speaking -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
            <div class="lbl">说话 · speaking</div>
            <div class="d k" style="aspect-ratio:1/1;display:flex;align-items:center;justify-content:center">
                <div class="orb-c spk" style="border:1.5px solid var(--ac);box-shadow:0 0 36px rgba(77,122,255,.10)">
                    <span class="t">14:32</span>
                    <div class="wv"><i></i><i></i><i></i></div>
                    <div class="ring"></div>
                    <div class="dot"></div>
                </div>
            </div>
        </div>
    </div>
    <p class="note">四个状态通过 CSS class 切换：<code>.orb-c</code>（默认 idle）→ <code>.lst</code> 聆听 → <code>.thk</code> 思考 → <code>.spk</code> 说话。静待显示时间，聆听显示波形 bars + 呼吸缩放，思考显示旋转环 + 脉冲点，说话显示 pulse dot + 边框 accent。</p>
```

- [ ] **Step 2: Verify the file is valid HTML**

Open `design/ui-design-spec.html` in a browser and confirm:
- The voice orb section renders without layout breakage
- Dark/light pair shows correctly side by side
- The 4-state showcase renders below in a 4-column grid
- All orb states (idle, listening, thinking, speaking) animate correctly
- Conversation list scrolls independently

Run: `open design/ui-design-spec.html`

- [ ] **Step 3: Commit**

```bash
git add design/ui-design-spec.html && git commit -m "feat: replace AI Agent Panel with voice orb design

- Dual-theme pair (dark/light) with full layout: orb + history + chips
- 4-state showcase grid: idle, listening, thinking, speaking
- CSS animations: breathe, spin, blink, waveform bars
- Follows existing mockup conventions (.pair, .d.s, .key, .sc)

Co-Authored-By: Claude <noreply@anthropic.com>"
```
