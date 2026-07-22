# Getting Started Guide

<cite>
**Primary source files**
- [README.md](file:///Users/neo/kernel/README.md)
- [env_setup.sh](file:///Users/neo/kernel/env_setup.sh)
- [BUILD.gn](file:///Users/neo/kernel/BUILD.gn)
- [sys/BUILD.gn](file:///Users/neo/kernel/sys/BUILD.gn)
- [os/BUILD.gn](file:///Users/neo/kernel/os/BUILD.gn)
- [run_qemu_virt.sh](file:///Users/neo/kernel/run_qemu_virt.sh)
- [platform/QemuVirt/scripts/build.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/build.sh)
- [platform/QemuVirt/scripts/make_all_img.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/make_all_img.sh)
- [platform/QemuVirt/scripts/run.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/run.sh)
</cite>

## Recommended Path

The fastest way to validate the current system is QEMU Virt:

```bash
cd /Users/neo/kernel
source env_setup.sh
./run_qemu_virt.sh
```

This path builds the full GN target graph, creates boot/system/user images, combines `out/tranquil-virt.img`, and starts `qemu-system-aarch64`.

## What Gets Built

The root [BUILD.gn](file:///Users/neo/kernel/BUILD.gn) defines `group("OS")`, which depends on:

- `//sys:sys`: Boot, Hypervisor, Kernel, and SystemDaemon build path.
- `//os:os`: base user programs, framework services, SystemUI, and applications.

The current `sys` group builds:

- `//sys/boot:Boot`
- `//sys/virt:Hypervisor`
- `//sys/kernel:Kernel`

The current `os` group includes `//sys/uapps:UAPPS`, Zygote, Netmgr, Btmgr, Appmgr, Windowmgr, Audiomgr, Fontmgr, ImeMgr, Mmimgr, Statemgr, TimeMgr, Agentmgr, SystemUI components, and bundled applications.

## Image Generation

`run_qemu_virt.sh` calls these scripts in order:

1. `platform/QemuVirt/scripts/build.sh`
2. `platform/QemuVirt/scripts/make_boot_img.sh`
3. `platform/QemuVirt/scripts/make_system_img.sh`
4. `platform/QemuVirt/scripts/make_user_img.sh`
5. `platform/QemuVirt/scripts/make_all_img.sh`
6. `platform/QemuVirt/scripts/run.sh`

The resulting raw image contains boot, system, and user partitions. The boot image contains `Boot`, `virt.dtb`, `Hypervisor`, `Kernel`, `SystemDaemon`, and the early ramdisk.

## Other Platforms

Additional entry points:

```bash
./run_qemu_pi3b.sh
./run_qemu_pi4b.sh
./run_board_cm4.sh
```

CM4 flashing generates `out/tranquil-cm4.img`, uses `rpiboot`, detects the exposed removable disk with `diskutil`, and writes the image with `dd`. Always verify the selected disk before flashing.

## Next Reading

- **Build System and Configuration** explains the GN graph and version macros.
- **System Architecture** explains the boot-to-user-space runtime model.
- **Kernel Core Components** explains EL1 kernel responsibilities.
- **User Applications and Services** explains SystemDaemon, UAPPS, framework services, and applications.
