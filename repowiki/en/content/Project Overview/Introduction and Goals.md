# Introduction and Goals

<cite>
**Referenced Files in This Document**
- [README.md](file:///Users/neo/kernel/README.md)
- [BUILD.gn](file:///Users/neo/kernel/BUILD.gn)
- [sys/BUILD.gn](file:///Users/neo/kernel/sys/BUILD.gn)
- [os/BUILD.gn](file:///Users/neo/kernel/os/BUILD.gn)
- [run_qemu_virt.sh](file:///Users/neo/kernel/run_qemu_virt.sh)
- [platform/QemuVirt/scripts/run.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/run.sh)
</cite>

## Positioning

TranquilOS is a capability-based microkernel operating system for AArch64. The current codebase is split into two main layers: `sys/` provides the trusted computing base, boot chain, EL2 hypervisor, EL1 microkernel, SystemDaemon, early userspace services, and low-level libraries; `os/` provides the user session, zygote, framework services, graphics stack, application management, audio, fonts, state, time, AI agent support, and user applications.

The top-level `group("OS")` depends on both `//sys:sys` and `//os:os`. TranquilOS is therefore not a single kernel binary. It is a complete system image assembled from bootloader, hypervisor, kernel, SystemDaemon, ramdisk, system image, user image, and many EL0 services.

## Runtime Layers

The implemented runtime shape is:

```text
Bootloader (EL1)
  -> Hypervisor (EL2, optional)
     -> Microkernel (EL1)
        -> SystemDaemon (privileged EL0)
           -> init
              -> zygote
                 -> framework services
                    -> user applications
```

SystemDaemon moves high-level resource management out of the kernel. It owns process management, memory management, IPC namespace management, and VM lifecycle control. `init`, `idle`, `devmgr`, and `fsmgr` from `sys/uapps` are packaged into the boot ramdisk; services from `os/base` and `os/framework` are then loaded from `system.img` to form the graphical OS session.

## Code Layout

| Directory | Responsibility |
| --- | --- |
| `sys/boot` | Bootloader and early boot. |
| `sys/virt` | EL2 Type-1 hypervisor, VM/VCPU/PCPU, stage-2 translation, and hypcall. |
| `sys/kernel` | EL1 microkernel: capability, IPC, MMU, scheduling, IRQ, timer, futex, upcall, modules, tracing, console, and low-level drivers. |
| `sys/kernel/systemd` | Privileged EL0 SystemDaemon with `procmgr`, `memmgr`, `ipcmgr`, and `virtmgr`. |
| `sys/uapps` | Early userspace services: `idle`, `init`, `devmgr`, and `fsmgr`. |
| `sys/ulibs` | Low-level userspace libraries: libc, CRT, syscall wrappers, systemd client, libfdt, synchronization, and algorithms. |
| `os/base` | zygote, netmgr, btmgr, and related OS base components. |
| `os/framework` | windowmgr, mmimgr, appmgr, audiomgr, fontmgr, statemgr, timemgr, agentmgr, and other framework services. |
| `os/apps` | AI, calendar, calculator, clock, files, memo, monitor, music, NES, settings, whiteboard, and system UI components. |
| `platform` | Device trees, linker scripts, firmware, build scripts, and run scripts for QemuVirt, Pi3b, Pi4b, and CM4. |
| `images` | Template contents for ramdisk, system image, and user image. |

## Current Capability Coverage

The implementation covers:

- AArch64 exception model, MMU, SMP, per-CPU scheduler, and preemptive scheduling.
- Capability-based access control for CNode, VSpace, Endpoint, Timer, Futex, IRQ, and related kernel objects.
- Migrating-thread synchronous IPC, elastic IPC endpoint pools, fastcall, and upcall.
- EL2 hypervisor with stage-2 page tables, VM/VCPU/PCPU management, vGIC, vTimer, vPMU, and hypcall.
- SystemDaemon as the privileged EL0 root service for process, memory, IPC namespace, and VM lifecycle management.
- Userspace services including devmgr, fsmgr, netmgr, windowmgr, mmimgr, appmgr, audiomgr, fontmgr, statemgr, timemgr, agentmgr, and imemgr.
- Third-party components under `os/thrid_party`, including LVGL, FreeType, PortableGL, lwIP, mbedTLS, and musl.

## Build and Boot Targets

The primary development target is QEMU virt. `run_qemu_virt.sh` builds the project, creates `boot.img`, `system.img`, and `user.img`, assembles `tranquil-virt.img`, and starts QEMU. The QEMU configuration uses 4-core SMP, 2 GB RAM, HVF acceleration, GICv2, ramfb, VirtIO input/network/block/sound, and a serial console.

The codebase also keeps Pi3b, Pi4b, and CM4 paths. Pi3b/Pi4b are used for QEMU platform validation. CM4 uses `platform/CM4/scripts/flash.sh` to build the SD/eMMC image and write it to real hardware through `rpiboot`.
