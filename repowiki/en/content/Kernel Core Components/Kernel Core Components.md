# Kernel Core Components

<cite>
**Primary source files**
- [sys/kernel/BUILD.gn](file://sys/kernel/BUILD.gn)
- [sys/kernel/kernel.c](file://sys/kernel/kernel.c)
- [sys/kernel/mm/mm.c](file://sys/kernel/mm/mm.c)
- [sys/kernel/mm/address_space.c](file://sys/kernel/mm/address_space.c)
- [sys/kernel/schedule/sched_mgr.c](file://sys/kernel/schedule/sched_mgr.c)
- [sys/kernel/interrupt/irq_mgr.c](file://sys/kernel/interrupt/irq_mgr.c)
- [sys/kernel/ipc/ipc.c](file://sys/kernel/ipc/ipc.c)
- [sys/kernel/upcall/upcall.c](file://sys/kernel/upcall/upcall.c)
- [sys/kernel/syscall/syscall.c](file://sys/kernel/syscall/syscall.c)
- [sys/kernel/capability/capability.c](file://sys/kernel/capability/capability.c)
</cite>

## Role

The TranquilOS `Kernel` is the AArch64 EL1 microkernel. It deliberately keeps policy-heavy services out of kernel space: file systems, device management, networking, application management, and GUI services run in EL0. The kernel retains the mechanisms required to build those services safely: address spaces, scheduling contexts, interrupts, IPC, upcalls, capabilities, timers, system calls, and a minimal device-control layer.

The build target is defined in [sys/kernel/BUILD.gn](file://sys/kernel/BUILD.gn). It produces the `Kernel` executable, depends on `systemd:SystemDaemon`, uses platform-specific linker scripts from `platform/$platform/linker/kernel.lds`, and inherits the current kernel version macros from [sys/BUILD.gn](file://sys/BUILD.gn), currently `1.6.1`.

## Source Layout

The current codebase uses the `sys/kernel/` layout rather than the older `kernel/` and `boot/` paths found in early wiki pages.

| Directory | Responsibility |
| --- | --- |
| `arch/arm64` | EL1 entry, exception vectors, context switching, MMU, TLB, cache, atomic operations, and backtrace support |
| `mm` | boot memory, page metadata, sparse memory, address spaces, and page-table mapping |
| `capability` | CNode, VSpace, XContext, SContext, Timer, IRQ, IPC Endpoint, Upcall Endpoint, and related object methods |
| `ipc` / `upcall` | synchronous IPC, elastic IPC, endpoint pools, and user-space callback delivery |
| `schedule` / `context` | per-CPU scheduling, scheduling contexts, execution contexts, and user-mode switches |
| `interrupt` / `timer` | IRQ management, user-visible IRQ objects, tick timer, RTC, timer manager, and timer containers |
| `device` / `drivers` | device-tree parsing, device registration, PL011, GICv2/v3, Generic Timer, PL031, PSCI, PMU, Mali, DMA, and related drivers |
| `syscall` | fastcall, compatibility calls, and main syscall dispatch |
| `systemd` | the first EL0 system process and the root of the user-space service graph |

## Boot Chain

Platform scripts place `Boot`, `Hypervisor`, `Kernel`, `SystemDaemon`, and the ramdisk into the boot image. The runtime path is:

```text
Bootloader / Boot (EL1)
  -> Hypervisor (EL2, optional target)
     -> Kernel (EL1)
        -> SystemDaemon (EL0)
           -> Init / Devmgr / Fsmgr / Idle
           -> Zygote
           -> OS framework services
           -> applications and SystemUI
```

During kernel initialization, the system brings up AArch64 primitives, the device tree, early memory, devices, IRQs, timers, scheduling, root capability objects, and the `SystemDaemon` execution context. Scheduling then transfers control to user space.

## Major Subsystems

### Memory and Address Spaces

`sys/kernel/mm` implements boot allocation, page-structure tables, sparse memory, address spaces, and virtual mapping. The kernel creates the minimal page-table environment and exposes controlled mapping operations through VSpace capabilities.

### Scheduling and Contexts

`schedule/sched_mgr.c` manages per-CPU schedulers, while `context/scontext.c` and `context/xcontext.c` model scheduling and execution contexts. The build still includes the FIFO scheduler framework, but the manager is structured so additional scheduling policies can be registered later.

### IPC, Upcalls, and System Calls

IPC endpoints, endpoint pools, elastic IPC, and upcall endpoints form the user-space communication model. Synchronous service calls, asynchronous notifications, and exception delivery all pass through these primitives. Capability calls are dispatched by `capability/capability.c` to the selected object implementation.

### Interrupts, Timers, and Devices

The IRQ manager turns hardware interrupts into kernel-managed objects and can delegate them through IRQ capabilities. The timer manager combines the Generic Timer, RTC, and timer containers to support scheduler ticks, timeouts, and user-visible timer capabilities.

### Capability Boundary

Kernel objects are accessed by capability references stored in CNodes rather than by exposing raw pointers to EL0. Object type, method number, and rights determine the operation that can be performed.

## User-Space Boundary

The central design rule is that the kernel provides mechanisms while user space implements policy. `SystemDaemon` starts the first service layer, then `Init`, `Devmgr`, `Fsmgr`, and the `os/base` and `os/framework` services build device, file-system, process, window, audio, input, application, font, state, and time management.

Read `sys/kernel` together with `sys/uapps` and `sys/ulibs`: the kernel defines object semantics, user libraries wrap the ABI, and system services orchestrate resources.

## Maintenance Notes

- Kernel-object changes should be checked against `sys/ulibs/include/libkernel`.
- Boot or image-layout changes must be matched with `platform/*/scripts/make_boot_img.sh` and linker scripts.
- New user-visible kernel objects need capability type definitions, method dispatch, rights checks, user headers, and a minimal call example.
- Changes in scheduling, IPC, or interrupt paths should be validated with a full QEMU Virt boot through `run_qemu_virt.sh`.
