# Build System and Configuration

<cite>
**Referenced Files in This Document**
- [BUILD.gn](file:///Users/neo/kernel/BUILD.gn)
- [sys/BUILD.gn](file:///Users/neo/kernel/sys/BUILD.gn)
- [os/BUILD.gn](file:///Users/neo/kernel/os/BUILD.gn)
- [build/BUILDCONFIG.gn](file:///Users/neo/kernel/build/BUILDCONFIG.gn)
- [build/common.gni](file:///Users/neo/kernel/build/common.gni)
- [platform/QemuVirt/scripts/build.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/build.sh)
- [platform/QemuVirt/scripts/make_boot_img.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/make_boot_img.sh)
- [platform/QemuVirt/scripts/make_system_img.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/make_system_img.sh)
- [platform/QemuVirt/scripts/make_user_img.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/make_user_img.sh)
- [platform/QemuVirt/scripts/make_all_img.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/make_all_img.sh)
</cite>

## Build Graph

TranquilOS uses GN to generate Ninja build files. The top-level `BUILD.gn` has one primary entry:

```gn
group("OS") {
  deps = [
    "//sys:sys",
    "//os:os",
  ]
}
```

`//sys:sys` builds the trusted computing base: bootloader, hypervisor, and kernel. `//os:os` builds the OS session layer: early userspace services, zygote, framework services, system UI, and user applications.

## `sys` Targets

`sys/BUILD.gn` defines low-level system configuration and `group("sys")`. The group currently depends on:

- `//sys/boot:Boot`
- `//sys/virt:Hypervisor`
- `//sys/kernel:Kernel`

SystemDaemon lives under `sys/kernel/systemd`. It is generated as a privileged EL0 artifact as part of the kernel-side build path, then converted to `out/systemd.img` by `make_boot_img.sh` and written into `boot.img`.

`sys/BUILD.gn` defines:

- `kernel_compile_flags`: EL1 kernel flags, using `-mcpu=cortex-a72+nofp`, strict alignment, and frame pointers.
- `virt_compile_flags`: EL2 hypervisor flags.
- `trustee_compile_flags`: reserved for the trusted execution stub.
- `systemd_compile_flags`: privileged EL0 SystemDaemon flags.
- `kernel_version_defines`: currently `1.6.1`.

## `os` Targets

`os/BUILD.gn` defines `group("os")`, which includes the userspace OS session:

- `//sys/uapps:UAPPS`
- `//os/base/zygote:Zygote`
- `//os/base/netmgr:Netmgr`
- `//os/base/btmgr:Btmgr`
- `//os/framework/windowmgr:Windowmgr`
- `//os/framework/mmimgr:Mmimgr`
- `//os/framework/appmgr:Appmgr`
- `//os/framework/audiomgr:Audiomgr`
- `//os/framework/fontmgr:Fontmgr`
- `//os/framework/statemgr:Statemgr`
- `//os/framework/timemgr:TimeMgr`
- `//os/framework/agentmgr:Agentmgr`
- AI, calendar, calculator, clock, files, memo, monitor, music, NES, settings, whiteboard, and system UI components under `//os/apps`.

`os_version_defines` currently declares OS version `1.8.43`. Regular userspace and GUI userspace use `userspace_compile_flags` and `userspace_gui_compile_flags`; GUI builds define `LV_CONF_INCLUDE_SIMPLE`.

## Platform Argument

The platform is passed through GN args. For QEMU virt:

```bash
gn gen out --args='platform="QemuVirt"'
ninja -C out
```

The platform argument selects linker scripts, device trees, platform configuration, and run scripts. Current platform directories are:

- `platform/QemuVirt`
- `platform/Pi3b`
- `platform/Pi4b`
- `platform/CM4`

## Image Pipeline

The QEMU virt image pipeline is platform-script driven:

```text
build.sh
  -> gn gen out --args="platform=\"QemuVirt\""
  -> ninja -C out

make_boot_img.sh
  -> objcopy Boot/Hypervisor/Kernel/SystemDaemon
  -> copy devmgr/fsmgr/idle/init into images/ramdisk
  -> pack ramdisk.cpio
  -> write fixed-offset boot.img

make_system_img.sh
  -> strip zygote, framework services, system UI, and app ELFs
  -> stage images/system
  -> create ext2 system.img

make_user_img.sh
  -> stage images/user
  -> create ext2 user.img

make_all_img.sh
  -> create raw disk image
  -> write MBR
  -> create FAT32 boot partition
  -> write ext2 system partition
  -> write ext2 user partition
```

## `boot.img` Layout

`make_boot_img.sh` creates a 64 MB `out/boot.img` using 4096-byte block offsets:

| seek | content | size |
| --- | --- | --- |
| `0` | `loader.img` | 8 MB |
| `2048` | `virt.dtb` | 8 MB |
| `4096` | `hypervisor.img` | 16 MB |
| `8192` | `kernel.img` | 16 MB |
| `12288` | `systemd.img` | 8 MB |
| `14336` | `ramdisk.cpio` | 8 MB |

The ramdisk currently contains `devmgr.elf`, `fsmgr.elf`, `idle.elf`, and `init.elf`. These services are needed before `system.img` is available.

## `system.img` and `user.img`

`system.img` is a 128 MB ext2 filesystem labeled `SYSTEM`. The script stages `images/system`, then copies stripped zygote, framework services, system UI, and application ELFs.

`user.img` is a 64 MB ext2 filesystem labeled `USER`. The script stages `images/user`, which currently contains AI configuration, NES ROMs, music, photos, and other user data templates.

## Raw Disk Image

`make_all_img.sh` assembles `out/tranquil-virt.img` from boot, system, and user images:

| Partition | Type | Content |
| --- | --- | --- |
| P1 | FAT32 | `boot.img` |
| P2 | ext2 | `system.img` |
| P3 | ext2 | `user.img` |

The CM4 `make_all_img.sh` uses the same three-partition model, but also copies platform firmware and `bcm2711-rpi-cm4.dtb` into the FAT32 boot partition.
