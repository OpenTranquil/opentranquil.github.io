# Driver-Daemon Website Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the TranquilOS website (zh + en mirrors) to describe the kernel's new standalone driver-daemon framework (独立进程驱动) instead of the old in-kernel driver model.

**Architecture:** Static HTML content edits only — no CSS/JS changes. Chinese pages carry Chinese copy; `en/` pages carry English mirrors. Every edit string below is exact `old_string → new_string` content for the Edit tool; commit per task with explicit file paths (never `git add -A`).

**Tech Stack:** Plain HTML + inline SVG. No build step. Facts sourced from the kernel repo `/Users/neo/kernel` (spec: `docs/superpowers/specs/2026-08-13-driver-daemon-website-update-design.md`).

## Global Constraints

- Only these 8 files may be modified: `architecture.html`, `en/architecture.html`, `features.html`, `en/features.html`, `docs/index.html`, `en/docs/index.html`, `index.html`, `en/index.html`. No CSS, no JS, no other pages.
- Do NOT commit the pre-existing uncommitted change `design/ui-design-spec.html` or the untracked `docs/superpowers/plans/2026-07-25-voice-orb-redesign.md`. Every commit lists explicit paths.
- Fact values (verbatim from spec): per-class IPC service IDs display 0x41, block 0x42, net 0x43, snd 0x44, input 0x45, bt 0x46; `driver_mgr` IDL service 0x30; registry `driver_daemon_mgr` spinlock-protected, max 32 entries; lazy pool-cref resolution retry 128 × 50 ms; spawn paths: init.rc `exec` (ramdisk, linear-map triplets) for the boot-critical block driver, zygote `drivers.json` (vendor partition) for the rest; DTB map prepended automatically; vendor.img 32MB ext2 P2 with `bin/` (.drv ELFs) + `etc/drivers.json`; memory attrs device / uncached / normal; libdriver lifecycle `drv_init → drv_get_mmio → drv_register → publish class service → drv_main_loop`.
- Commit message style: `feat(web): ...` / `docs(web): ...` with the `Co-Authored-By: Claude <noreply@anthropic.com>` trailer.
- Verification per task: after editing, (1) grep for the new content markers listed in the task, (2) run the tag-balance check below for the edited file(s). If either fails, fix before committing.

Tag-balance check (run from `/Users/neo/website`):

```bash
python3 - <<'PY'
import sys
for f in sys.argv[1:]:
    s = open(f, encoding='utf-8').read()
    bad = []
    for tag in ('div','section','span','p','table','pre','svg','g','article','ul','li','tr','td','th','line'):
        # match exact tag boundaries: <tag> or <tag attr — avoids <pre> matching p, <line matching li, <thead> matching th
        o = 0
        i = s.find('<'+tag)
        while i != -1:
            if s.startswith('<'+tag+'>', i) or s.startswith('<'+tag+' ', i):
                o += 1
            i = s.find('<'+tag, i+1)
        c = s.count('</'+tag+'>')
        if o != c:
            bad.append(f'{tag}: open={o} close={c}')
    print(f, 'OK' if not bad else 'MISMATCH ' + ', '.join(bad))
PY
```

Expected: `OK` for every file.

---

### Task 1: architecture.html (zh) — relabel kernel drivers, boot flow, vendor.img

**Files:**
- Modify: `architecture.html`

**Interfaces:**
- Produces: no new anchors; prepares the page for Task 2's new section.

- [ ] **Step 1: Relabel the EL1 `drivers` component in the main SVG**

old_string:
```
        <rect class="comp" x="1002" y="157" width="66" height="30"></rect><text class="comp-t" x="1035" y="176" text-anchor="middle">drivers</text>
```
new_string:
```
        <rect class="comp" x="984" y="157" width="84" height="30"></rect><text class="comp-t" x="1026" y="176" text-anchor="middle">base drivers</text>
```

- [ ] **Step 2: Add vendor.img to the image-layout code block (boot section)**

old_string:
```
<pre><code>boot.img (64MB)
  offset 0      Bootloader    8MB
  offset 2048   DTB           8MB
  offset 4096   Hypervisor   16MB
  offset 8192   Kernel       16MB
  offset 12288  SystemDaemon  8MB
  offset 14336  Ramdisk cpio  8MB

system.img (128MB, ext2)
  bin/  framework services
  apps/ user applications
  etc/  fonts · icons · init config</code></pre>
```
new_string:
```
<pre><code>boot.img (64MB)
  offset 0      Bootloader    8MB
  offset 2048   DTB           8MB
  offset 4096   Hypervisor   16MB
  offset 8192   Kernel       16MB
  offset 12288  SystemDaemon  8MB
  offset 14336  Ramdisk cpio  8MB

vendor.img (32MB, ext2, P2)
  bin/  driver daemons (.drv)
  etc/  drivers.json

system.img (128MB, ext2)
  bin/  framework services
  apps/ user applications
  etc/  fonts · icons · init config</code></pre>
```

- [ ] **Step 3: Update boot pipe 01 (init)**

old_string:
```
      <div><span class="n">01</span><b>init</b><p>首个用户态进程。解析设备树找到 ramdisk，拉起 devmgr 与 fsmgr，执行 <span class="mono">/root/etc/init.rc</span>。</p></div>
```
new_string:
```
      <div><span class="n">01</span><b>init</b><p>首个用户态进程。解析设备树找到 ramdisk，拉起 devmgr 与 fsmgr，执行 <span class="mono">/root/etc/init.rc</span>——其中 <span class="mono">exec</span> 行以显式线性映射拉起启动关键的 block 驱动 daemon。</p></div>
```

- [ ] **Step 4: Update boot pipe 02 (zygote)**

old_string:
```
      <div><span class="n">02</span><b>zygote</b><p>读取 <span class="mono">init.json</span>，把服务 ELF 从 ext2 载入 SHM，经 <span class="mono">start_process_from_shm()</span> 启动框架服务。</p></div>
```
new_string:
```
      <div><span class="n">02</span><b>zygote</b><p>读取 <span class="mono">init.json</span>，把服务 ELF 从 ext2 载入 SHM，经 <span class="mono">start_process_from_shm()</span> 启动框架服务；同时读取 vendor 分区的 <span class="mono">drivers.json</span>，拉起其余驱动 daemons。</p></div>
```

- [ ] **Step 5: Verify**

```bash
grep -c "base drivers" architecture.html       # → 1
grep -c "vendor.img (32MB, ext2, P2)" architecture.html  # → 1
grep -c "block 驱动 daemon" architecture.html  # → 1
grep -c "drivers.json</span>，拉起其余驱动 daemons" architecture.html  # → 1
```
Then run the tag-balance check for `architecture.html`. Expected: all greps return `1`, balance `OK`.

- [ ] **Step 6: Commit**

```bash
git add architecture.html
git commit -m "feat(web): architecture — base drivers label, driver-daemon boot flow, vendor.img

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: architecture.html (zh) — new 「独立进程驱动」 section

**Files:**
- Modify: `architecture.html`

**Interfaces:**
- Consumes: Task 1's boot-section edits (the new section references init.rc exec / drivers.json).
- Produces: new section between the 启动 section and the IDL section.

- [ ] **Step 1: Insert the new section** — anchor on the end of the boot section + start of the IDL section:

old_string:
```
    </div>
  </section>

  <section class="sec">
    <div class="sec-head">
      <h2>同一服务骨架，IDL 生成接口。</h2>
```
new_string:
```
    </div>
  </section>

  <section class="sec">
    <div class="sec-head">
      <h2>硬件驱动，独立进程运行。</h2>
      <p>驱动以 EL0 daemon 进程运行，devmgr 维护注册表并按类转发 IPC；只有启动关键驱动留在内核。</p>
    </div>
    <div class="svg-scroll">
    <svg class="arch-svg" viewBox="0 0 800 320" role="img" aria-label="独立进程驱动架构：六个驱动 daemon 进程经 driver_mgr 协议注册到 devmgr 注册表，devmgr 按类转发 IPC；block.drv 由 init.rc exec 拉起，其余由 zygote drivers.json 拉起">
      <defs>
        <marker id="arrw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z"></path>
        </marker>
      </defs>

      <!-- devmgr registry -->
      <rect class="layer" x="40" y="40" width="210" height="160"></rect>
      <text class="name" x="64" y="72">devmgr</text>
      <text class="desc" x="64" y="98">driver_daemon_mgr</text>
      <text class="desc" x="64" y="114">spinlock 注册表 · 32 项</text>
      <text class="desc" x="64" y="134">按类转发 · 懒解析 pool cref</text>
      <text class="desc" x="64" y="154">进程内外设管理器 fallback</text>

      <!-- driver daemons -->
      <rect class="comp" x="470" y="40" width="150" height="32"></rect><text class="comp-t" x="545" y="60" text-anchor="middle">display.drv · 0x41</text>
      <rect class="comp" x="640" y="40" width="150" height="32"></rect><text class="comp-t" x="715" y="60" text-anchor="middle">block.drv · 0x42</text>
      <rect class="comp" x="470" y="88" width="150" height="32"></rect><text class="comp-t" x="545" y="108" text-anchor="middle">net.drv · 0x43</text>
      <rect class="comp" x="640" y="88" width="150" height="32"></rect><text class="comp-t" x="715" y="108" text-anchor="middle">snd.drv · 0x44</text>
      <rect class="comp" x="470" y="136" width="150" height="32"></rect><text class="comp-t" x="545" y="156" text-anchor="middle">input.drv · 0x45</text>
      <rect class="comp" x="640" y="136" width="150" height="32"></rect><text class="comp-t" x="715" y="156" text-anchor="middle">bt.drv · 0x46</text>

      <!-- register / forward arrows -->
      <line class="flow" x1="470" y1="56" x2="252" y2="56" marker-start="url(#arrw)"></line>
      <text class="desc" x="360" y="48" text-anchor="middle">register (driver_mgr 0x30)</text>
      <line class="flow" x1="250" y1="140" x2="468" y2="140"></line>
      <text class="desc" x="360" y="160" text-anchor="middle">forward per-class IPC</text>

      <!-- spawn paths -->
      <rect class="layer" x="40" y="230" width="330" height="64"></rect>
      <text class="name" x="64" y="258">init.rc exec</text>
      <text class="desc" x="64" y="278">ramdisk · 显式 linear-map 三元组 → block.drv</text>
      <rect class="layer" x="430" y="230" width="330" height="64"></rect>
      <text class="name" x="454" y="258">zygote · drivers.json</text>
      <text class="desc" x="454" y="278">vendor 分区 · maps + affinity → 其余 daemons</text>
      <line class="flow" x1="200" y1="230" x2="715" y2="170"></line>
      <text class="desc" x="380" y="210" text-anchor="end">block.drv</text>
      <line class="flow" x1="580" y1="230" x2="545" y2="170"></line>
      <text class="desc" x="640" y="208">其余 daemons</text>
    </svg>
    </div>
    <div class="grid c3">
      <article class="card">
        <span class="tag">REGISTER &amp; FORWARD</span>
        <h3>注册一次，按类转发</h3>
        <p>驱动 daemon 经 <code>driver_mgr</code> IDL（服务 0x30）调用 <code>register_driver()</code>，提交 compatible、name、class 与服务 ID。devmgr 用 spinlock 保护注册表（<code>driver_daemon_mgr</code>，最多 32 项）；首次转发懒解析 endpoint pool cref（重试 128 × 50ms），之后 <code>OSIpcEndPointPoolCall5()</code> 直连。进程内外设管理器保留为 fallback。</p>
      </article>
      <article class="card">
        <span class="tag">TWO SPAWN PATHS</span>
        <h3>两条拉起路径</h3>
        <p>启动关键的 block 驱动由 init.rc <code>exec</code> 以显式 <span class="mono">⟨start⟩ ⟨size⟩ ⟨attr⟩</span> 三元组从 ramdisk 拉起；其余 daemon 由 zygote 读取 vendor 分区的 <code>drivers.json</code> 拉起——每个条目带 maps（device / uncached / normal）与 CPU affinity，DTB map 自动前置。</p>
      </article>
      <article class="card">
        <span class="tag">MEMORY ISOLATION</span>
        <h3>只映射自己需要的区域</h3>
        <p>每个 daemon 进程只获得自己需要的 MMIO / DMA linear maps——驱动崩溃不会拖垮内核，也拿不到其他设备的内存。libdriver 生命周期：<code>drv_init → drv_get_mmio → drv_register → 发布类服务 → drv_main_loop</code>。</p>
      </article>
    </div>
    <div class="split">
      <div>
<pre><code># init.rc — 启动关键 block 驱动（ramdisk）
exec /vendor/block.drv.elf \
  0xFE340000 0x1000 device \
  0xFE200000 0x1000 device \
  0xFE00B000 0x1000 device</code></pre>
      </div>
      <div>
<pre><code>// drivers.json — 其余驱动 daemon（vendor 分区）
{
  "services": [{
    "name": "virtio-net.drv",
    "path": "/vendor/bin/virtio-net.drv.elf",
    "maps": [
      { "start": "0x0A000000", "size": "0x4000",
        "attr": "device" },
      { "start": "0x52000000", "size": "0x100000",
        "attr": "uncached" }
    ],
    "affinity": "0xF"
  }]
}</code></pre>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head">
      <h2>同一服务骨架，IDL 生成接口。</h2>
```

- [ ] **Step 2: Verify**

```bash
grep -c "硬件驱动，独立进程运行" architecture.html      # → 1
grep -c "display.drv · 0x41" architecture.html           # → 1
grep -c "register (driver_mgr 0x30)" architecture.html   # → 1
grep -c "REGISTER &amp; FORWARD" architecture.html          # → 1
grep -c "exec /vendor/block.drv.elf" architecture.html   # → 1
```
Run the tag-balance check for `architecture.html`. Expected: all greps `1`, balance `OK`.

- [ ] **Step 3: Commit**

```bash
git add architecture.html
git commit -m "feat(web): architecture — new driver-daemon section with SVG

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: en/architecture.html — mirror Tasks 1+2 in English

**Files:**
- Modify: `en/architecture.html`

**Interfaces:**
- Consumes: identical structure to `architecture.html`; all copy translated to English.

- [ ] **Step 1: Relabel the EL1 `drivers` component** (identical markup in the en file)

old_string:
```
        <rect class="comp" x="1002" y="157" width="66" height="30"></rect><text class="comp-t" x="1035" y="176" text-anchor="middle">drivers</text>
```
new_string:
```
        <rect class="comp" x="984" y="157" width="84" height="30"></rect><text class="comp-t" x="1026" y="176" text-anchor="middle">base drivers</text>
```

- [ ] **Step 2: Add vendor.img to the image-layout code block** (identical markup in the en file)

old_string:
```
<pre><code>boot.img (64MB)
  offset 0      Bootloader    8MB
  offset 2048   DTB           8MB
  offset 4096   Hypervisor   16MB
  offset 8192   Kernel       16MB
  offset 12288  SystemDaemon  8MB
  offset 14336  Ramdisk cpio  8MB

system.img (128MB, ext2)
  bin/  framework services
  apps/ user applications
  etc/  fonts · icons · init config</code></pre>
```
new_string:
```
<pre><code>boot.img (64MB)
  offset 0      Bootloader    8MB
  offset 2048   DTB           8MB
  offset 4096   Hypervisor   16MB
  offset 8192   Kernel       16MB
  offset 12288  SystemDaemon  8MB
  offset 14336  Ramdisk cpio  8MB

vendor.img (32MB, ext2, P2)
  bin/  driver daemons (.drv)
  etc/  drivers.json

system.img (128MB, ext2)
  bin/  framework services
  apps/ user applications
  etc/  fonts · icons · init config</code></pre>
```

- [ ] **Step 3: Update boot pipe 01 (init)**

old_string:
```
      <div><span class="n">01</span><b>init</b><p>First userspace process. Finds the ramdisk via the device tree, starts devmgr and fsmgr, then runs <span class="mono">/root/etc/init.rc</span>.</p></div>
```
new_string:
```
      <div><span class="n">01</span><b>init</b><p>First userspace process. Finds the ramdisk via the device tree, starts devmgr and fsmgr, then runs <span class="mono">/root/etc/init.rc</span> — its <span class="mono">exec</span> lines spawn the boot-critical block driver daemon with explicit linear maps.</p></div>
```

- [ ] **Step 4: Update boot pipe 02 (zygote)**

old_string:
```
      <div><span class="n">02</span><b>zygote</b><p>Reads <span class="mono">init.json</span>, loads service ELFs from ext2 into SHM and starts framework services via <span class="mono">start_process_from_shm()</span>.</p></div>
```
new_string:
```
      <div><span class="n">02</span><b>zygote</b><p>Reads <span class="mono">init.json</span>, loads service ELFs from ext2 into SHM and starts framework services via <span class="mono">start_process_from_shm()</span>; it also reads the vendor partition's <span class="mono">drivers.json</span> to spawn the remaining driver daemons.</p></div>
```

- [ ] **Step 5: Insert the new "Driver daemons" section** — same anchor position (end of boot section, before the IDL section):

old_string:
```
    </div>
  </section>

  <section class="sec">
    <div class="sec-head">
      <h2>One service skeleton. IDL-generated interfaces.</h2>
```
new_string:
```
    </div>
  </section>

  <section class="sec">
    <div class="sec-head">
      <h2>Hardware drivers as independent processes.</h2>
      <p>Drivers run as EL0 daemon processes; devmgr keeps a registry and forwards IPC per class. Only boot-critical drivers stay in the kernel.</p>
    </div>
    <div class="svg-scroll">
    <svg class="arch-svg" viewBox="0 0 800 320" role="img" aria-label="Driver-daemon architecture: six driver daemon processes register with devmgr's registry over the driver_mgr protocol and receive per-class IPC forwards; block.drv is spawned by init.rc exec, the rest by zygote drivers.json">
      <defs>
        <marker id="arrw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z"></path>
        </marker>
      </defs>

      <!-- devmgr registry -->
      <rect class="layer" x="40" y="40" width="210" height="160"></rect>
      <text class="name" x="64" y="72">devmgr</text>
      <text class="desc" x="64" y="98">driver_daemon_mgr</text>
      <text class="desc" x="64" y="114">spinlock registry · 32 entries</text>
      <text class="desc" x="64" y="134">per-class forward · lazy pool cref</text>
      <text class="desc" x="64" y="154">in-process peripheral mgr fallback</text>

      <!-- driver daemons -->
      <rect class="comp" x="470" y="40" width="150" height="32"></rect><text class="comp-t" x="545" y="60" text-anchor="middle">display.drv · 0x41</text>
      <rect class="comp" x="640" y="40" width="150" height="32"></rect><text class="comp-t" x="715" y="60" text-anchor="middle">block.drv · 0x42</text>
      <rect class="comp" x="470" y="88" width="150" height="32"></rect><text class="comp-t" x="545" y="108" text-anchor="middle">net.drv · 0x43</text>
      <rect class="comp" x="640" y="88" width="150" height="32"></rect><text class="comp-t" x="715" y="108" text-anchor="middle">snd.drv · 0x44</text>
      <rect class="comp" x="470" y="136" width="150" height="32"></rect><text class="comp-t" x="545" y="156" text-anchor="middle">input.drv · 0x45</text>
      <rect class="comp" x="640" y="136" width="150" height="32"></rect><text class="comp-t" x="715" y="156" text-anchor="middle">bt.drv · 0x46</text>

      <!-- register / forward arrows -->
      <line class="flow" x1="470" y1="56" x2="252" y2="56" marker-start="url(#arrw)"></line>
      <text class="desc" x="360" y="48" text-anchor="middle">register (driver_mgr 0x30)</text>
      <line class="flow" x1="250" y1="140" x2="468" y2="140"></line>
      <text class="desc" x="360" y="160" text-anchor="middle">forward per-class IPC</text>

      <!-- spawn paths -->
      <rect class="layer" x="40" y="230" width="330" height="64"></rect>
      <text class="name" x="64" y="258">init.rc exec</text>
      <text class="desc" x="64" y="278">ramdisk · explicit linear-map triplets → block.drv</text>
      <rect class="layer" x="430" y="230" width="330" height="64"></rect>
      <text class="name" x="454" y="258">zygote · drivers.json</text>
      <text class="desc" x="454" y="278">vendor partition · maps + affinity → other daemons</text>
      <line class="flow" x1="200" y1="230" x2="715" y2="170"></line>
      <text class="desc" x="380" y="210" text-anchor="end">block.drv</text>
      <line class="flow" x1="580" y1="230" x2="545" y2="170"></line>
      <text class="desc" x="640" y="208">other daemons</text>
    </svg>
    </div>
    <div class="grid c3">
      <article class="card">
        <span class="tag">REGISTER &amp; FORWARD</span>
        <h3>Register once, forward per class</h3>
        <p>A driver daemon registers over the <code>driver_mgr</code> IDL (service 0x30) with <code>register_driver()</code>, submitting compatible, name, class and service ID. devmgr keeps a spinlock-protected registry (<code>driver_daemon_mgr</code>, up to 32 entries); the first forward lazily resolves the endpoint-pool cref (128 × 50 ms retries), then <code>OSIpcEndPointPoolCall5()</code> connects directly. The in-process peripheral managers remain as a fallback.</p>
      </article>
      <article class="card">
        <span class="tag">TWO SPAWN PATHS</span>
        <h3>Two spawn paths</h3>
        <p>The boot-critical block driver is exec'd from the ramdisk by init.rc with explicit <span class="mono">⟨start⟩ ⟨size⟩ ⟨attr⟩</span> linear-map triplets. The remaining daemons are spawned by zygote from the vendor partition's <code>drivers.json</code> — each entry carries maps (device / uncached / normal) and a CPU affinity, with the DTB map prepended automatically.</p>
      </article>
      <article class="card">
        <span class="tag">MEMORY ISOLATION</span>
        <h3>Only the regions you need</h3>
        <p>Each daemon process receives only the MMIO / DMA linear maps it needs — a driver crash cannot take down the kernel or reach another device's memory. The libdriver lifecycle: <code>drv_init → drv_get_mmio → drv_register → publish class service → drv_main_loop</code>.</p>
      </article>
    </div>
    <div class="split">
      <div>
<pre><code># init.rc — boot-critical block driver (ramdisk)
exec /vendor/block.drv.elf \
  0xFE340000 0x1000 device \
  0xFE200000 0x1000 device \
  0xFE00B000 0x1000 device</code></pre>
      </div>
      <div>
<pre><code>// drivers.json — remaining driver daemons (vendor)
{
  "services": [{
    "name": "virtio-net.drv",
    "path": "/vendor/bin/virtio-net.drv.elf",
    "maps": [
      { "start": "0x0A000000", "size": "0x4000",
        "attr": "device" },
      { "start": "0x52000000", "size": "0x100000",
        "attr": "uncached" }
    ],
    "affinity": "0xF"
  }]
}</code></pre>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="sec-head">
      <h2>One service skeleton. IDL-generated interfaces.</h2>
```

- [ ] **Step 6: Verify**

```bash
grep -c "Hardware drivers as independent processes" en/architecture.html  # → 1
grep -c "display.drv · 0x41" en/architecture.html                          # → 1
grep -c "driver daemons" en/architecture.html                              # ≥ 3
grep -c "vendor.img (32MB, ext2, P2)" en/architecture.html                 # → 1
```
Run the tag-balance check for `en/architecture.html`. Expected: greps as listed, balance `OK`.

- [ ] **Step 7: Commit**

```bash
git add en/architecture.html
git commit -m "feat(web): en architecture — driver-daemon section and boot flow

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: features.html (zh) — driver section rework + devmgr card

**Files:**
- Modify: `features.html`

**Interfaces:**
- Produces: driver-daemon badges reused in the en mirror (Task 5).

- [ ] **Step 1: Update the devmgr card**

old_string:
```
      <div class="card"><span class="tag">devmgr</span><h3>设备管理</h3><p>设备驱动框架与外设管理。</p></div>
```
new_string:
```
      <div class="card"><span class="tag">devmgr</span><h3>设备管理</h3><p>驱动 daemon 注册表、按类 IPC 转发与外设管理。</p></div>
```

- [ ] **Step 2: Replace the driver section**

old_string:
```
  <section class="sec">
    <div class="sec-head">
      <h2>内核驱动与图形栈。</h2>
    </div>
    <div class="split">
      <div class="card">
        <h3 class="mb-3">内核内置驱动</h3>
        <div class="badges">
          <span class="badge">UART PL011</span><span class="badge">GICv2 / v3</span><span class="badge">ARM Timer</span>
          <span class="badge">RTC PL031</span><span class="badge">PMU</span><span class="badge">Cache CCS</span>
          <span class="badge">DMA PL330</span><span class="badge">Mali GPU</span><span class="badge">Watchdog</span>
          <span class="badge">PSCI</span><span class="badge">VirtIO console</span><span class="badge">VirtIO block</span>
          <span class="badge">VirtIO net</span><span class="badge">VirtIO input</span><span class="badge">spin-table</span>
        </div>
      </div>
      <div class="card">
        <h3 class="mb-3">图形与三方库</h3>
        <ul class="ck">
          <li><b>LVGL</b> UI 组件库</li>
          <li><b>FreeType</b> 字体渲染</li>
          <li><b>PortableGL</b> 软件 GL</li>
          <li><b>lwIP · mbedTLS · musl · cJSON · minimp3 · toybox</b></li>
          <li>三方源码不直接修改，平台适配层集中在 <code>os/libs/</code> 与 <code>sys/ulibs/</code></li>
        </ul>
      </div>
    </div>
  </section>
```
new_string:
```
  <section class="sec">
    <div class="sec-head">
      <h2>内核基础驱动 · 独立进程驱动 · 图形栈。</h2>
    </div>
    <div class="split">
      <div class="card">
        <h3 class="mb-3">内核基础驱动</h3>
        <div class="badges">
          <span class="badge">UART PL011</span><span class="badge">GICv2 / v3</span><span class="badge">ARM Timer</span>
          <span class="badge">RTC PL031</span><span class="badge">PMU</span><span class="badge">Cache CCS</span>
          <span class="badge">DMA PL330</span><span class="badge">Mali GPU</span><span class="badge">Watchdog</span>
          <span class="badge">PSCI</span><span class="badge">VirtIO console</span><span class="badge">spin-table</span>
        </div>
      </div>
      <div class="card">
        <h3 class="mb-3">独立进程驱动 daemons</h3>
        <div class="badges">
          <span class="badge">display.drv 0x41</span><span class="badge">block.drv 0x42</span><span class="badge">net.drv 0x43</span>
          <span class="badge">snd.drv 0x44</span><span class="badge">input.drv 0x45</span><span class="badge">bt.drv 0x46</span>
        </div>
        <ul class="ck">
          <li>驱动以独立 EL0 进程运行，devmgr 注册表按类转发 IPC</li>
          <li>QemuVirt：fw_cfg、virtio-gpu / blk / net / snd / input</li>
          <li>CM4：emmc2、rpi、rpi-fb、rpi-touch、rpi-wlan、rpi-bt</li>
        </ul>
      </div>
    </div>
    <div class="card">
      <h3 class="mb-3">图形与三方库</h3>
      <ul class="ck">
        <li><b>LVGL</b> UI 组件库</li>
        <li><b>FreeType</b> 字体渲染</li>
        <li><b>PortableGL</b> 软件 GL</li>
        <li><b>lwIP · mbedTLS · musl · cJSON · minimp3 · toybox</b></li>
        <li>三方源码不直接修改，平台适配层集中在 <code>os/libs/</code> 与 <code>sys/ulibs/</code></li>
      </ul>
    </div>
  </section>
```

- [ ] **Step 3: Verify**

```bash
grep -c "驱动 daemon 注册表、按类 IPC 转发" features.html  # → 1
grep -c "display.drv 0x41" features.html                  # → 1
grep -c "VirtIO block" features.html                      # → 0  (removed from in-kernel list)
grep -c "内核基础驱动 · 独立进程驱动 · 图形栈" features.html  # → 1
```
Run the tag-balance check for `features.html`. Expected: greps as listed, balance `OK`.

- [ ] **Step 4: Commit**

```bash
git add features.html
git commit -m "feat(web): features — driver-daemon section, devmgr registry card

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: en/features.html — mirror Task 4 in English

**Files:**
- Modify: `en/features.html`

**Interfaces:**
- Consumes: same structure as Task 4, English copy.

- [ ] **Step 1: Update the devmgr card**

old_string:
```
      <div class="card"><span class="tag">devmgr</span><h3>Device management</h3><p>Device driver framework and peripheral management.</p></div>
```
new_string:
```
      <div class="card"><span class="tag">devmgr</span><h3>Device management</h3><p>Driver-daemon registry, per-class IPC forwarding and peripheral management.</p></div>
```

- [ ] **Step 2: Replace the driver section**

old_string:
```
  <section class="sec">
    <div class="sec-head">
      <h2>In-kernel drivers and the graphics stack.</h2>
    </div>
    <div class="split">
      <div class="card">
        <h3 class="mb-3">Built-in kernel drivers</h3>
        <div class="badges">
          <span class="badge">UART PL011</span><span class="badge">GICv2 / v3</span><span class="badge">ARM Timer</span>
          <span class="badge">RTC PL031</span><span class="badge">PMU</span><span class="badge">Cache CCS</span>
          <span class="badge">DMA PL330</span><span class="badge">Mali GPU</span><span class="badge">Watchdog</span>
          <span class="badge">PSCI</span><span class="badge">VirtIO console</span><span class="badge">VirtIO block</span>
          <span class="badge">VirtIO net</span><span class="badge">VirtIO input</span><span class="badge">spin-table</span>
        </div>
      </div>
      <div class="card">
        <h3 class="mb-3">Graphics &amp; third-party libraries</h3>
        <ul class="ck">
          <li><b>LVGL</b> UI component library</li>
          <li><b>FreeType</b> font rendering</li>
          <li><b>PortableGL</b> software GL</li>
          <li><b>lwIP · mbedTLS · musl · cJSON · minimp3 · toybox</b></li>
          <li>Upstream sources are never modified directly — adaptation layers live in <code>os/libs/</code> and <code>sys/ulibs/</code></li>
        </ul>
      </div>
    </div>
  </section>
```
new_string:
```
  <section class="sec">
    <div class="sec-head">
      <h2>Built-in kernel drivers · driver daemons · graphics stack.</h2>
    </div>
    <div class="split">
      <div class="card">
        <h3 class="mb-3">Built-in kernel drivers</h3>
        <div class="badges">
          <span class="badge">UART PL011</span><span class="badge">GICv2 / v3</span><span class="badge">ARM Timer</span>
          <span class="badge">RTC PL031</span><span class="badge">PMU</span><span class="badge">Cache CCS</span>
          <span class="badge">DMA PL330</span><span class="badge">Mali GPU</span><span class="badge">Watchdog</span>
          <span class="badge">PSCI</span><span class="badge">VirtIO console</span><span class="badge">spin-table</span>
        </div>
      </div>
      <div class="card">
        <h3 class="mb-3">Driver daemons (independent processes)</h3>
        <div class="badges">
          <span class="badge">display.drv 0x41</span><span class="badge">block.drv 0x42</span><span class="badge">net.drv 0x43</span>
          <span class="badge">snd.drv 0x44</span><span class="badge">input.drv 0x45</span><span class="badge">bt.drv 0x46</span>
        </div>
        <ul class="ck">
          <li>Drivers run as independent EL0 processes; devmgr's registry forwards IPC per class</li>
          <li>QemuVirt: fw_cfg, virtio-gpu / blk / net / snd / input</li>
          <li>CM4: emmc2, rpi, rpi-fb, rpi-touch, rpi-wlan, rpi-bt</li>
        </ul>
      </div>
    </div>
    <div class="card">
      <h3 class="mb-3">Graphics &amp; third-party libraries</h3>
      <ul class="ck">
        <li><b>LVGL</b> UI component library</li>
        <li><b>FreeType</b> font rendering</li>
        <li><b>PortableGL</b> software GL</li>
        <li><b>lwIP · mbedTLS · musl · cJSON · minimp3 · toybox</b></li>
        <li>Upstream sources are never modified directly — adaptation layers live in <code>os/libs/</code> and <code>sys/ulibs/</code></li>
      </ul>
    </div>
  </section>
```

- [ ] **Step 3: Verify**

```bash
grep -c "Driver-daemon registry, per-class IPC forwarding" en/features.html  # → 1
grep -c "display.drv 0x41" en/features.html                                  # → 1
grep -c "VirtIO block" en/features.html                                      # → 0
grep -c "driver daemons · graphics stack" en/features.html                   # → 1
```
Run the tag-balance check for `en/features.html`. Expected: greps as listed, balance `OK`.

- [ ] **Step 4: Commit**

```bash
git add en/features.html
git commit -m "feat(web): en features — driver-daemon section, devmgr registry card

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: docs/index.html (zh) — overview, layout, boot chain, service list, images

**Files:**
- Modify: `docs/index.html`

**Interfaces:**
- Produces: no new sections; all edits are replacements of existing prose/code blocks.

- [ ] **Step 1: Update the overview lede**

old_string:
```
      <p class="lede">TranquilOS 是面向 AArch64 的 object-capability 微内核操作系统。系统以 capability 作为统一授权模型，将进程管理、内存管理、IPC 命名空间、设备抽象、文件系统、网络协议栈、窗口合成与应用生命周期拆分为边界清晰的用户态服务；EL1 微内核专注于调度、IPC、异常、中断、定时器、futex、基础驱动与 capability 对象分发。</p>
```
new_string:
```
      <p class="lede">TranquilOS 是面向 AArch64 的 object-capability 微内核操作系统。系统以 capability 作为统一授权模型，将进程管理、内存管理、IPC 命名空间、设备抽象、文件系统、网络协议栈、窗口合成与应用生命周期拆分为边界清晰的用户态服务——硬件驱动同样以独立进程（driver daemons）运行，由 devmgr 注册表按类转发；EL1 微内核专注于调度、IPC、异常、中断、定时器、futex、基础驱动与 capability 对象分发。</p>
```

- [ ] **Step 2: Update the repository layout code block**

old_string:
```
  uapps/         启动与核心服务：base/ init、idle；core/ devmgr、fsmgr
```
new_string:
```
  uapps/         启动与核心服务：base/ init、idle；core/ devmgr、fsmgr、drivers/（driver_mgr IDL）
```
old_string:
```
platform/        平台配置：QemuVirt / Pi3b / Pi4b / CM4（DTB、链接脚本、构建运行脚本）
```
new_string:
```
platform/        平台配置：QemuVirt / Pi3b / Pi4b / CM4（DTB、链接脚本、脚本；vendor/ 驱动 daemon 与 drivers.json）
```
old_string:
```
images/          ramdisk（cpio）与 system 镜像模板
```
new_string:
```
images/          ramdisk（cpio）、vendor 与 system 镜像模板
```

- [ ] **Step 3: Update the boot-chain paragraph**

old_string:
```
      <p>用户态启动顺序：<b>init</b>（首个用户态进程）解析设备树找到 ramdisk，拉起 devmgr 与 fsmgr，执行 <code>/root/etc/init.rc</code>；<b>zygote</b> 读取 <code>init.json</code>，把服务 ELF 从 ext2 载入 SHM 后调 <code>start_process_from_shm()</code> 启动框架服务；<b>appmgr</b> 按 <code>applist.json</code> 管理应用注册表并按需拉起应用。</p>
```
new_string:
```
      <p>用户态启动顺序：<b>init</b>（首个用户态进程）解析设备树找到 ramdisk，拉起 devmgr 与 fsmgr，执行 <code>/root/etc/init.rc</code>——其中 <code>exec</code> 行以显式 linear-map 三元组拉起启动关键的 block 驱动 daemon；<b>zygote</b> 读取 <code>init.json</code>，把服务 ELF 从 ext2 载入 SHM 后调 <code>start_process_from_shm()</code> 启动框架服务，并读取 vendor 分区的 <code>drivers.json</code> 拉起其余驱动 daemons；<b>appmgr</b> 按 <code>applist.json</code> 管理应用注册表并按需拉起应用。</p>
```

- [ ] **Step 4: Update the devmgr row in the service directory**

old_string:
```
          <tr><td>devmgr</td><td>设备驱动框架与外设管理</td></tr>
```
new_string:
```
          <tr><td>devmgr</td><td>驱动 daemon 注册表与按类 IPC 转发；外设管理</td></tr>
```

- [ ] **Step 5: Add vendor.img to the platforms image-layout code block**

old_string:
```
      <pre><code>boot.img (64MB)
  offset 0      Bootloader    8MB     system.img (128MB, ext2)
  offset 2048   DTB           8MB       bin/   framework services
  offset 4096   Hypervisor   16MB       apps/  user applications
  offset 8192   Kernel       16MB       etc/   fonts · icons · init config
  offset 12288  SystemDaemon  8MB
  offset 14336  Ramdisk cpio  8MB</code></pre>
```
new_string:
```
      <pre><code>boot.img (64MB)
  offset 0      Bootloader    8MB
  offset 2048   DTB           8MB
  offset 4096   Hypervisor   16MB
  offset 8192   Kernel       16MB
  offset 12288  SystemDaemon  8MB
  offset 14336  Ramdisk cpio  8MB

vendor.img (32MB, ext2, P2)
  bin/  driver daemons (.drv)
  etc/  drivers.json

system.img (128MB, ext2)
  bin/  framework services
  apps/ user applications
  etc/  fonts · icons · init config</code></pre>
```

- [ ] **Step 6: Verify**

```bash
grep -c "driver daemons）运行，由 devmgr 注册表按类转发" docs/index.html  # → 1
grep -c "drivers/（driver_mgr IDL）" docs/index.html                     # → 1
grep -c "读取 vendor 分区的 <code>drivers.json</code> 拉起其余驱动" docs/index.html  # → 1
grep -c "驱动 daemon 注册表与按类 IPC 转发" docs/index.html               # → 1
grep -c "vendor.img (32MB, ext2, P2)" docs/index.html                    # → 1
```
Run the tag-balance check for `docs/index.html`. Expected: all greps `1`, balance `OK`.

- [ ] **Step 7: Commit**

```bash
git add docs/index.html
git commit -m "docs(web): docs zh — driver daemons in overview, layout, boot chain

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: en/docs/index.html — mirror Task 6 in English

**Files:**
- Modify: `en/docs/index.html`

**Interfaces:**
- Consumes: same structure as Task 6, English copy.

- [ ] **Step 1: Update the overview lede**

old_string:
```
      <p class="lede">TranquilOS is an object-capability microkernel operating system for AArch64. Capabilities are the single authorization model: process management, memory management, the IPC namespace, device abstraction, filesystems, the network stack, window composition and application lifecycle are decomposed into clearly bounded userspace services, while the EL1 microkernel focuses on scheduling, IPC, exceptions, interrupts, timers, futexes, base drivers and capability object dispatch.</p>
```
new_string:
```
      <p class="lede">TranquilOS is an object-capability microkernel operating system for AArch64. Capabilities are the single authorization model: process management, memory management, the IPC namespace, device abstraction, filesystems, the network stack, window composition and application lifecycle are decomposed into clearly bounded userspace services — hardware drivers run as independent processes (driver daemons) too, forwarded per class through devmgr's registry; the EL1 microkernel focuses on scheduling, IPC, exceptions, interrupts, timers, futexes, base drivers and capability object dispatch.</p>
```

- [ ] **Step 2: Update the repository layout code block**

old_string:
```
  uapps/         bootstrap & core services: base/ init, idle; core/ devmgr, fsmgr
```
new_string:
```
  uapps/         bootstrap & core services: base/ init, idle; core/ devmgr, fsmgr, drivers/ (driver_mgr IDL)
```
old_string:
```
platform/        platform configs: QemuVirt / Pi3b / Pi4b / CM4 (DTBs, linker scripts, build/run scripts)
```
new_string:
```
platform/        platform configs: QemuVirt / Pi3b / Pi4b / CM4 (DTBs, linker scripts, scripts; vendor/ driver daemons & drivers.json)
```
old_string:
```
images/          ramdisk (cpio) and system image templates
```
new_string:
```
images/          ramdisk (cpio), vendor and system image templates
```

- [ ] **Step 3: Update the boot-chain paragraph**

old_string:
```
      <p>Userspace bring-up order: <b>init</b> (the first userspace process) finds the ramdisk via the device tree, starts devmgr and fsmgr, then runs <code>/root/etc/init.rc</code>; <b>zygote</b> reads <code>init.json</code>, loads service ELFs from ext2 into SHM and calls <code>start_process_from_shm()</code> to start framework services; <b>appmgr</b> manages the app registry from <code>applist.json</code> and launches apps on demand.</p>
```
new_string:
```
      <p>Userspace bring-up order: <b>init</b> (the first userspace process) finds the ramdisk via the device tree, starts devmgr and fsmgr, then runs <code>/root/etc/init.rc</code> — whose <code>exec</code> lines spawn the boot-critical block driver daemon with explicit linear-map triplets; <b>zygote</b> reads <code>init.json</code>, loads service ELFs from ext2 into SHM and calls <code>start_process_from_shm()</code> to start framework services, and reads the vendor partition's <code>drivers.json</code> to spawn the remaining driver daemons; <b>appmgr</b> manages the app registry from <code>applist.json</code> and launches apps on demand.</p>
```

- [ ] **Step 4: Update the devmgr row in the service directory**

old_string:
```
          <tr><td>devmgr</td><td>Device driver framework &amp; peripheral management</td></tr>
```
new_string:
```
          <tr><td>devmgr</td><td>Driver-daemon registry &amp; per-class IPC forwarding; peripheral management</td></tr>
```

- [ ] **Step 5: Add vendor.img to the platforms image-layout code block** (identical markup in the en file)

old_string:
```
      <pre><code>boot.img (64MB)
  offset 0      Bootloader    8MB     system.img (128MB, ext2)
  offset 2048   DTB           8MB       bin/   framework services
  offset 4096   Hypervisor   16MB       apps/  user applications
  offset 8192   Kernel       16MB       etc/   fonts · icons · init config
  offset 12288  SystemDaemon  8MB
  offset 14336  Ramdisk cpio  8MB</code></pre>
```
new_string:
```
      <pre><code>boot.img (64MB)
  offset 0      Bootloader    8MB
  offset 2048   DTB           8MB
  offset 4096   Hypervisor   16MB
  offset 8192   Kernel       16MB
  offset 12288  SystemDaemon  8MB
  offset 14336  Ramdisk cpio  8MB

vendor.img (32MB, ext2, P2)
  bin/  driver daemons (.drv)
  etc/  drivers.json

system.img (128MB, ext2)
  bin/  framework services
  apps/ user applications
  etc/  fonts · icons · init config</code></pre>
```

- [ ] **Step 6: Verify**

```bash
grep -c "hardware drivers run as independent processes" en/docs/index.html  # → 1
grep -c "drivers/ (driver_mgr IDL)" en/docs/index.html                      # → 1
grep -c "reads the vendor partition's <code>drivers.json</code>" en/docs/index.html  # → 1
grep -c "Driver-daemon registry &amp; per-class IPC forwarding" en/docs/index.html  # → 1
grep -c "vendor.img (32MB, ext2, P2)" en/docs/index.html                    # → 1
```
Run the tag-balance check for `en/docs/index.html`. Expected: all greps `1`, balance `OK`.

- [ ] **Step 7: Commit**

```bash
git add en/docs/index.html
git commit -m "docs(web): en docs — driver daemons in overview, layout, boot chain

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: index.html (zh) — driver-daemon chips in the homepage plate

**Files:**
- Modify: `index.html`

**Interfaces:**
- Produces: SVG coordinates also used verbatim by the en mirror (Task 9).

- [ ] **Step 1: Widen the viewBox**

old_string:
```
      <svg viewBox="0 0 560 580" aria-hidden="true">
```
new_string:
```
      <svg viewBox="0 0 560 602" aria-hidden="true">
```

- [ ] **Step 2: Update the plate-grid**

old_string:
```
        <g class="plate-grid">
          <line x1="16" y1="28" x2="544" y2="28"/><line x1="62" y1="20" x2="62" y2="560"/>
          <line x1="16" y1="118" x2="544" y2="118"/><line x1="16" y1="230" x2="544" y2="230"/>
          <line x1="16" y1="342" x2="544" y2="342"/><line x1="16" y1="452" x2="544" y2="452"/>
          <line x1="16" y1="558" x2="544" y2="558"/>
        </g>
```
new_string:
```
        <g class="plate-grid">
          <line x1="16" y1="28" x2="544" y2="28"/><line x1="62" y1="20" x2="62" y2="582"/>
          <line x1="16" y1="118" x2="544" y2="118"/><line x1="16" y1="252" x2="544" y2="252"/>
          <line x1="16" y1="364" x2="544" y2="364"/><line x1="16" y1="474" x2="544" y2="474"/>
          <line x1="16" y1="580" x2="544" y2="580"/>
        </g>
```

- [ ] **Step 3: Shift the EL1/EL2/EL3 rail labels down by 22**

old_string:
```
        <text class="plate-el" x="17" y="286">EL1</text>
        <text class="plate-el" x="17" y="397">EL2</text>
        <text class="plate-el" x="17" y="508">EL3</text>
```
new_string:
```
        <text class="plate-el" x="17" y="308">EL1</text>
        <text class="plate-el" x="17" y="419">EL2</text>
        <text class="plate-el" x="17" y="530">EL3</text>
```

- [ ] **Step 4: Grow the USERSPACE SERVICES band and add the driver-daemon chip row**

old_string:
```
        <rect class="plate-band" x="88" y="138" width="430" height="74"/>
        <text class="plate-name" x="108" y="168">USERSPACE SERVICES</text>
        <g class="plate-services">
          <rect x="108" y="180" width="70" height="20"/><rect x="186" y="180" width="54" height="20"/>
          <rect x="248" y="180" width="54" height="20"/><rect x="310" y="180" width="82" height="20"/>
          <rect x="400" y="180" width="92" height="20"/>
          <text x="143" y="193" text-anchor="middle">SYSTEMD</text><text x="213" y="193" text-anchor="middle">FSD</text>
          <text x="275" y="193" text-anchor="middle">NETD</text><text x="351" y="193" text-anchor="middle">DEVMGR</text>
          <text x="446" y="193" text-anchor="middle">WINDOW</text>
        </g>
```
new_string:
```
        <rect class="plate-band" x="88" y="138" width="430" height="96"/>
        <text class="plate-name" x="108" y="168">USERSPACE SERVICES</text>
        <g class="plate-services">
          <rect x="108" y="180" width="70" height="20"/><rect x="186" y="180" width="54" height="20"/>
          <rect x="248" y="180" width="54" height="20"/><rect x="310" y="180" width="82" height="20"/>
          <rect x="400" y="180" width="92" height="20"/>
          <text x="143" y="193" text-anchor="middle">SYSTEMD</text><text x="213" y="193" text-anchor="middle">FSD</text>
          <text x="275" y="193" text-anchor="middle">NETD</text><text x="351" y="193" text-anchor="middle">DEVMGR</text>
          <text x="446" y="193" text-anchor="middle">WINDOW</text>
          <rect x="108" y="206" width="44" height="16"/><rect x="158" y="206" width="44" height="16"/>
          <rect x="208" y="206" width="44" height="16"/><rect x="258" y="206" width="44" height="16"/>
          <rect x="308" y="206" width="44" height="16"/><rect x="358" y="206" width="44" height="16"/>
          <text x="130" y="217" text-anchor="middle">DSP</text><text x="180" y="217" text-anchor="middle">BLK</text>
          <text x="230" y="217" text-anchor="middle">NET</text><text x="280" y="217" text-anchor="middle">SND</text>
          <text x="330" y="217" text-anchor="middle">INP</text><text x="380" y="217" text-anchor="middle">BT</text>
          <text class="plate-meta" x="409" y="217">DRV ×6</text>
        </g>
```

- [ ] **Step 5: Shift the lower bands and flow path down by 22**

old_string:
```
        <rect class="plate-band plate-kernel" x="88" y="250" width="430" height="74"/>
        <text class="plate-name" x="108" y="280">MICROKERNEL</text>
        <text class="plate-meta" x="108" y="305">CAPABILITY</text><text class="plate-meta" x="220" y="305">IPC</text>
        <text class="plate-meta" x="278" y="305">SCHEDULER</text><text class="plate-meta" x="414" y="305">IRQ / TIME</text>

        <rect class="plate-band" x="88" y="362" width="430" height="72"/>
        <text class="plate-name" x="108" y="396">HYPERVISOR</text>
        <text class="plate-meta" x="500" y="396" text-anchor="end">STAGE–2 · vGIC · vTIMER</text>

        <rect class="plate-band" x="88" y="474" width="430" height="62"/>
        <text class="plate-name" x="108" y="506">BOOTLOADER</text>
        <text class="plate-meta" x="500" y="506" text-anchor="end">PLATFORM INIT · IMAGE LOAD</text>

        <path class="plate-flow" marker-end="url(#plate-arrow)" d="M102 505H74V398H102V287H74V175H102V74H102"/>
        <circle class="plate-node" cx="102" cy="505" r="4"/><circle class="plate-node" cx="102" cy="398" r="4"/>
        <circle class="plate-node" cx="102" cy="287" r="4"/><circle class="plate-node" cx="102" cy="175" r="4"/>
        <circle class="plate-node" cx="102" cy="74" r="4"/>
```
new_string:
```
        <rect class="plate-band plate-kernel" x="88" y="272" width="430" height="74"/>
        <text class="plate-name" x="108" y="302">MICROKERNEL</text>
        <text class="plate-meta" x="108" y="327">CAPABILITY</text><text class="plate-meta" x="220" y="327">IPC</text>
        <text class="plate-meta" x="278" y="327">SCHEDULER</text><text class="plate-meta" x="414" y="327">IRQ / TIME</text>

        <rect class="plate-band" x="88" y="384" width="430" height="72"/>
        <text class="plate-name" x="108" y="418">HYPERVISOR</text>
        <text class="plate-meta" x="500" y="418" text-anchor="end">STAGE–2 · vGIC · vTIMER</text>

        <rect class="plate-band" x="88" y="496" width="430" height="62"/>
        <text class="plate-name" x="108" y="528">BOOTLOADER</text>
        <text class="plate-meta" x="500" y="528" text-anchor="end">PLATFORM INIT · IMAGE LOAD</text>

        <path class="plate-flow" marker-end="url(#plate-arrow)" d="M102 527H74V420H102V309H74V197H102V74H102"/>
        <circle class="plate-node" cx="102" cy="527" r="4"/><circle class="plate-node" cx="102" cy="420" r="4"/>
        <circle class="plate-node" cx="102" cy="309" r="4"/><circle class="plate-node" cx="102" cy="197" r="4"/>
        <circle class="plate-node" cx="102" cy="74" r="4"/>
```

- [ ] **Step 6: Update the plate aria-label**

old_string:
```
    <div class="system-plate" role="img" aria-label="TranquilOS 系统剖面：底层 EL3 引导、EL2 虚拟化、EL1 微内核、上层 EL0 系统服务与应用">
```
new_string:
```
    <div class="system-plate" role="img" aria-label="TranquilOS 系统剖面：底层 EL3 引导、EL2 虚拟化、EL1 微内核、上层 EL0 系统服务（含驱动 daemon）与应用">
```

- [ ] **Step 7: Verify**

```bash
grep -c "DRV ×6" index.html                       # → 1
grep -c ">DSP<" index.html                        # → 1
grep -c 'viewBox="0 0 560 602"' index.html        # → 1
grep -c "y=\"252\"" index.html                    # → 1  (grid line shifted)
grep -c "M102 527H74V420H102V309H74V197" index.html  # → 1  (flow path shifted)
```
Run the tag-balance check for `index.html`. Expected: greps as listed, balance `OK`.

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "feat(web): homepage plate — driver-daemon chip row

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 9: en/index.html — mirror Task 8

**Files:**
- Modify: `en/index.html`

**Interfaces:**
- Consumes: the SVG markup is identical between the two files; Steps 1–5 apply verbatim.

- [ ] **Step 1: Widen the viewBox** (the SVG markup is byte-identical in the en file)

old_string:
```
      <svg viewBox="0 0 560 580" aria-hidden="true">
```
new_string:
```
      <svg viewBox="0 0 560 602" aria-hidden="true">
```

- [ ] **Step 2: Update the plate-grid**

old_string:
```
        <g class="plate-grid">
          <line x1="16" y1="28" x2="544" y2="28"/><line x1="62" y1="20" x2="62" y2="560"/>
          <line x1="16" y1="118" x2="544" y2="118"/><line x1="16" y1="230" x2="544" y2="230"/>
          <line x1="16" y1="342" x2="544" y2="342"/><line x1="16" y1="452" x2="544" y2="452"/>
          <line x1="16" y1="558" x2="544" y2="558"/>
        </g>
```
new_string:
```
        <g class="plate-grid">
          <line x1="16" y1="28" x2="544" y2="28"/><line x1="62" y1="20" x2="62" y2="582"/>
          <line x1="16" y1="118" x2="544" y2="118"/><line x1="16" y1="252" x2="544" y2="252"/>
          <line x1="16" y1="364" x2="544" y2="364"/><line x1="16" y1="474" x2="544" y2="474"/>
          <line x1="16" y1="580" x2="544" y2="580"/>
        </g>
```

- [ ] **Step 3: Shift the EL1/EL2/EL3 rail labels down by 22**

old_string:
```
        <text class="plate-el" x="17" y="286">EL1</text>
        <text class="plate-el" x="17" y="397">EL2</text>
        <text class="plate-el" x="17" y="508">EL3</text>
```
new_string:
```
        <text class="plate-el" x="17" y="308">EL1</text>
        <text class="plate-el" x="17" y="419">EL2</text>
        <text class="plate-el" x="17" y="530">EL3</text>
```

- [ ] **Step 4: Grow the USERSPACE SERVICES band and add the driver-daemon chip row**

old_string:
```
        <rect class="plate-band" x="88" y="138" width="430" height="74"/>
        <text class="plate-name" x="108" y="168">USERSPACE SERVICES</text>
        <g class="plate-services">
          <rect x="108" y="180" width="70" height="20"/><rect x="186" y="180" width="54" height="20"/>
          <rect x="248" y="180" width="54" height="20"/><rect x="310" y="180" width="82" height="20"/>
          <rect x="400" y="180" width="92" height="20"/>
          <text x="143" y="193" text-anchor="middle">SYSTEMD</text><text x="213" y="193" text-anchor="middle">FSD</text>
          <text x="275" y="193" text-anchor="middle">NETD</text><text x="351" y="193" text-anchor="middle">DEVMGR</text>
          <text x="446" y="193" text-anchor="middle">WINDOW</text>
        </g>
```
new_string:
```
        <rect class="plate-band" x="88" y="138" width="430" height="96"/>
        <text class="plate-name" x="108" y="168">USERSPACE SERVICES</text>
        <g class="plate-services">
          <rect x="108" y="180" width="70" height="20"/><rect x="186" y="180" width="54" height="20"/>
          <rect x="248" y="180" width="54" height="20"/><rect x="310" y="180" width="82" height="20"/>
          <rect x="400" y="180" width="92" height="20"/>
          <text x="143" y="193" text-anchor="middle">SYSTEMD</text><text x="213" y="193" text-anchor="middle">FSD</text>
          <text x="275" y="193" text-anchor="middle">NETD</text><text x="351" y="193" text-anchor="middle">DEVMGR</text>
          <text x="446" y="193" text-anchor="middle">WINDOW</text>
          <rect x="108" y="206" width="44" height="16"/><rect x="158" y="206" width="44" height="16"/>
          <rect x="208" y="206" width="44" height="16"/><rect x="258" y="206" width="44" height="16"/>
          <rect x="308" y="206" width="44" height="16"/><rect x="358" y="206" width="44" height="16"/>
          <text x="130" y="217" text-anchor="middle">DSP</text><text x="180" y="217" text-anchor="middle">BLK</text>
          <text x="230" y="217" text-anchor="middle">NET</text><text x="280" y="217" text-anchor="middle">SND</text>
          <text x="330" y="217" text-anchor="middle">INP</text><text x="380" y="217" text-anchor="middle">BT</text>
          <text class="plate-meta" x="409" y="217">DRV ×6</text>
        </g>
```

- [ ] **Step 5: Shift the lower bands and flow path down by 22**

old_string:
```
        <rect class="plate-band plate-kernel" x="88" y="250" width="430" height="74"/>
        <text class="plate-name" x="108" y="280">MICROKERNEL</text>
        <text class="plate-meta" x="108" y="305">CAPABILITY</text><text class="plate-meta" x="220" y="305">IPC</text>
        <text class="plate-meta" x="278" y="305">SCHEDULER</text><text class="plate-meta" x="414" y="305">IRQ / TIME</text>

        <rect class="plate-band" x="88" y="362" width="430" height="72"/>
        <text class="plate-name" x="108" y="396">HYPERVISOR</text>
        <text class="plate-meta" x="500" y="396" text-anchor="end">STAGE–2 · vGIC · vTIMER</text>

        <rect class="plate-band" x="88" y="474" width="430" height="62"/>
        <text class="plate-name" x="108" y="506">BOOTLOADER</text>
        <text class="plate-meta" x="500" y="506" text-anchor="end">PLATFORM INIT · IMAGE LOAD</text>

        <path class="plate-flow" marker-end="url(#plate-arrow)" d="M102 505H74V398H102V287H74V175H102V74H102"/>
        <circle class="plate-node" cx="102" cy="505" r="4"/><circle class="plate-node" cx="102" cy="398" r="4"/>
        <circle class="plate-node" cx="102" cy="287" r="4"/><circle class="plate-node" cx="102" cy="175" r="4"/>
        <circle class="plate-node" cx="102" cy="74" r="4"/>
```
new_string:
```
        <rect class="plate-band plate-kernel" x="88" y="272" width="430" height="74"/>
        <text class="plate-name" x="108" y="302">MICROKERNEL</text>
        <text class="plate-meta" x="108" y="327">CAPABILITY</text><text class="plate-meta" x="220" y="327">IPC</text>
        <text class="plate-meta" x="278" y="327">SCHEDULER</text><text class="plate-meta" x="414" y="327">IRQ / TIME</text>

        <rect class="plate-band" x="88" y="384" width="430" height="72"/>
        <text class="plate-name" x="108" y="418">HYPERVISOR</text>
        <text class="plate-meta" x="500" y="418" text-anchor="end">STAGE–2 · vGIC · vTIMER</text>

        <rect class="plate-band" x="88" y="496" width="430" height="62"/>
        <text class="plate-name" x="108" y="528">BOOTLOADER</text>
        <text class="plate-meta" x="500" y="528" text-anchor="end">PLATFORM INIT · IMAGE LOAD</text>

        <path class="plate-flow" marker-end="url(#plate-arrow)" d="M102 527H74V420H102V309H74V197H102V74H102"/>
        <circle class="plate-node" cx="102" cy="527" r="4"/><circle class="plate-node" cx="102" cy="420" r="4"/>
        <circle class="plate-node" cx="102" cy="309" r="4"/><circle class="plate-node" cx="102" cy="197" r="4"/>
        <circle class="plate-node" cx="102" cy="74" r="4"/>
```

- [ ] **Step 6: Update the plate aria-label**

old_string:
```
    <div class="system-plate" role="img" aria-label="TranquilOS system section: lower EL3 boot, EL2 virtualization, EL1 microkernel, and upper EL0 services and applications">
```
new_string:
```
    <div class="system-plate" role="img" aria-label="TranquilOS system section: lower EL3 boot, EL2 virtualization, EL1 microkernel, and upper EL0 services (including driver daemons) and applications">
```

- [ ] **Step 7: Verify**

Same greps as Task 8 Step 7, against `en/index.html` (all `1`), plus tag-balance check.

- [ ] **Step 8: Commit**

```bash
git add en/index.html
git commit -m "feat(web): en homepage plate — driver-daemon chip row

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 10: Verification sweep — serve, cross-check facts, confirm diff scope

**Files:**
- None (verification only; commit only if a fix was required)

- [ ] **Step 1: Serve the site and confirm all 8 pages return 200**

```bash
cd /Users/neo/website && python3 -m http.server 8973 &
sleep 1
for p in index.html architecture.html features.html docs/index.html en/index.html en/architecture.html en/features.html en/docs/index.html; do
  printf "%s -> " "$p"; curl -s -o /dev/null -w "%{http_code}\n" "http://localhost:8973/$p"
done
```
Expected: 8 × `200`. Kill the server afterwards (`kill %1`).

- [ ] **Step 2: Fact cross-check against the kernel repo**

```bash
cd /Users/neo/website
grep -l "display.drv" architecture.html en/architecture.html features.html en/features.html | wc -l   # → 4
grep -l "drivers.json" architecture.html en/architecture.html docs/index.html en/docs/index.html | wc -l  # → 4
grep -l "vendor.img" architecture.html en/architecture.html docs/index.html en/docs/index.html | wc -l  # → 4
grep -rn "0x46" architecture.html features.html | wc -l    # ≥ 2 (bt class id present)
grep -c "VirtIO block" features.html en/features.html       # → 0 0 (no longer in-kernel)
```
Expected: outputs as annotated.

- [ ] **Step 3: Confirm the diff touches only the 8 intended files**

```bash
git status --short
git diff --stat HEAD~8..HEAD   # adjust N so the range covers Tasks 1–9
```
Expected: only the 8 HTML files listed in Global Constraints (+ earlier spec commit if in range). `design/ui-design-spec.html` must still be `M`-modified-but-uncommitted and `docs/superpowers/plans/2026-07-25-voice-orb-redesign.md` still untracked — untouched by this work.

- [ ] **Step 4: Human visual check**

```bash
cd /Users/neo/website && python3 -m http.server 8973 &
open http://localhost:8973/architecture.html http://localhost:8973/en/architecture.html http://localhost:8973/index.html
```
Inspect: the new driver-daemon SVG (boxes, arrows, no text overflow), the homepage plate (chip row inside the band, lower bands aligned), boot pipes and code blocks. Fix any visual issue in the responsible task's file, then commit the fix with explicit paths.

- [ ] **Step 5: Commit any visual fixes**

```bash
git add <fixed files>
git commit -m "fix(web): <what was fixed>

Co-Authored-By: Claude <noreply@anthropic.com>"
```
If no fixes were needed, skip this step and state so in the completion report.
