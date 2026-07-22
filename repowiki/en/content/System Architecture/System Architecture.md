# System Architecture

<cite>
**Referenced Files in This Document**
- [README.md](file:///Users/neo/kernel/README.md)
- [BUILD.gn](file:///Users/neo/kernel/BUILD.gn)
- [sys/BUILD.gn](file:///Users/neo/kernel/sys/BUILD.gn)
- [os/BUILD.gn](file:///Users/neo/kernel/os/BUILD.gn)
- [sys/kernel/BUILD.gn](file:///Users/neo/kernel/sys/kernel/BUILD.gn)
- [sys/kernel/systemd/BUILD.gn](file:///Users/neo/kernel/sys/kernel/systemd/BUILD.gn)
</cite>

## Current Layering

The current TranquilOS codebase is organized around two top-level layers: `sys/` and `os/`. `sys/` is the trusted computing base and contains the bootloader, EL2 hypervisor, EL1 microkernel, SystemDaemon, early userspace services, and low-level userspace libraries. `os/` is the full user session layer and contains zygote, netmgr, btmgr, framework services, system UI, and user applications.

The runtime path is:

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

This is the central architectural rule: the kernel keeps scheduling, IPC, exceptions, interrupts, timers, futexes, upcall, console, object dispatch, and low-level drivers; process management, memory management, IPC namespaces, VM lifecycle, devices, filesystems, graphics, application lifecycle, and AI agent functionality are moved into EL0 services.

## Build Boundaries and Runtime Boundaries

The top-level `BUILD.gn` defines `group("OS")` with dependencies on `//sys:sys` and `//os:os`. Build outputs therefore map directly to runtime responsibilities:

| Build area | Main outputs | Runtime role |
| --- | --- | --- |
| `sys/boot` | `Boot` | Early boot, device tree, and image handoff. |
| `sys/virt` | `Hypervisor` | EL2 virtualization, stage-2 translation, VM/VCPU management. |
| `sys/kernel` | `Kernel` | EL1 microkernel core mechanisms. |
| `sys/kernel/systemd` | `SystemDaemon` | Privileged EL0 root service. |
| `sys/uapps` | `Init`, `Idle`, `Devmgr`, `Fsmgr` | Early ramdisk userspace. |
| `os/base` | `Zygote`, `Netmgr`, `Btmgr` | OS session bootstrap and base services. |
| `os/framework` | Window/App/Audio/Font/State/Time/Agent services | Framework service layer. |
| `os/apps` | User apps and system UI | User-facing application layer. |

## Image Boundaries

QEMU virt and CM4 use a multi-image boot medium:

- `boot.img`: fixed-offset boot container with bootloader, DTB, hypervisor, kernel, SystemDaemon, and ramdisk.
- `system.img`: ext2 system partition with zygote, framework services, system UI, and application ELFs.
- `user.img`: ext2 user partition with user-data templates.
- `tranquil-virt.img` / `tranquil-cm4.img`: raw disk images with FAT32 boot, ext2 system, and ext2 user partitions.

This lets the first boot phase avoid filesystem dependencies while the later phase loads larger services and apps through FsMgr and zygote.

## Interface Principles

Service boundaries are connected through capabilities, IPC endpoints, shared memory, and IDL-generated code. Services should not bypass SystemDaemon and namespace mechanisms by assuming global resources. Graphics, filesystem, network, application lifecycle, and AI agent services all run as independent EL0 components under the same IPC/SHM model.
