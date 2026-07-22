# Getting Started

<cite>
**Referenced Files in This Document**
- [README.md](file:///Users/neo/kernel/README.md)
- [env_setup.sh](file:///Users/neo/kernel/env_setup.sh)
- [BUILD.gn](file:///Users/neo/kernel/BUILD.gn)
- [sys/BUILD.gn](file:///Users/neo/kernel/sys/BUILD.gn)
- [os/BUILD.gn](file:///Users/neo/kernel/os/BUILD.gn)
- [run_qemu_virt.sh](file:///Users/neo/kernel/run_qemu_virt.sh)
- [run_qemu_pi3b.sh](file:///Users/neo/kernel/run_qemu_pi3b.sh)
- [run_qemu_pi4b.sh](file:///Users/neo/kernel/run_qemu_pi4b.sh)
- [run_board_cm4.sh](file:///Users/neo/kernel/run_board_cm4.sh)
- [platform/QemuVirt/scripts/make_all_img.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/make_all_img.sh)
- [platform/QemuVirt/scripts/run.sh](file:///Users/neo/kernel/platform/QemuVirt/scripts/run.sh)
</cite>

## Environment Setup

TranquilOS uses GN/Ninja and an AArch64 cross toolchain. The default path uses `toolchains/aarch64-elf-12.2.0-Darwin-arm64`, which targets macOS ARM64 hosts. Other toolchain configurations are controlled by `build/toolchain/BUILD.gn` and GN args.

```bash
cd /Users/neo/kernel
source env_setup.sh
```

`env_setup.sh` prepares repository paths, GN/Ninja, and cross-compiler paths for the platform scripts. Before the first full image build, confirm that QEMU and Homebrew e2fsprogs are available, because system and user images are generated as ext2 filesystems with `mke2fs`.

## One-Command QEMU virt Run

The primary development entry point is:

```bash
source env_setup.sh
./run_qemu_virt.sh
```

The script runs:

1. `platform/QemuVirt/scripts/build.sh`
2. `platform/QemuVirt/scripts/make_boot_img.sh`
3. `platform/QemuVirt/scripts/make_system_img.sh`
4. `platform/QemuVirt/scripts/make_user_img.sh`
5. `platform/QemuVirt/scripts/make_all_img.sh`
6. `platform/QemuVirt/scripts/run.sh`

This path compiles all ELF artifacts, creates `boot.img`, `system.img`, and `user.img`, assembles the three-partition `out/tranquil-virt.img`, and starts QEMU.

## QEMU virt Runtime Parameters

The current QEMU virt script uses:

- machine: `virt,gic-version=2,virtualization=off,accel=hvf`
- CPU: `host`
- SMP: 4 cores
- RAM: 2 GB
- kernel: `./out/boot.img`
- DTB: `platform/QemuVirt/dtb/virt.dtb`
- block device: `./out/tranquil-virt.img`
- display: ramfb with `cocoa` by default
- input/network/sound: VirtIO tablet, keyboard, net, block, and sound

Display, serial, and monitor backends can be overridden:

```bash
QEMU_DISPLAY_BACKEND=gtk ./run_qemu_virt.sh
QEMU_SERIAL_BACKEND=stdio ./run_qemu_virt.sh
QEMU_MONITOR_BACKEND=stdio ./run_qemu_virt.sh
```

## Other Platforms

```bash
./run_qemu_pi3b.sh
./run_qemu_pi4b.sh
./run_board_cm4.sh
```

Pi3b and Pi4b call their platform-specific build, image, and run scripts. The CM4 entry point currently calls `platform/CM4/scripts/flash.sh`; that script builds the image, starts `rpiboot`, detects the CM4 mass-storage device, and writes `out/tranquil-cm4.img`.

## Manual Build

To compile ELF artifacts only:

```bash
source env_setup.sh
gn gen out --args='platform="QemuVirt"'
ninja -C out
```

To create bootable images, run the platform image scripts as well:

```bash
./platform/QemuVirt/scripts/make_boot_img.sh
./platform/QemuVirt/scripts/make_system_img.sh
./platform/QemuVirt/scripts/make_user_img.sh
./platform/QemuVirt/scripts/make_all_img.sh
```

## Outputs

| Output | Source | Description |
| --- | --- | --- |
| `out/Boot` | `sys/boot` | Bootloader ELF. |
| `out/Hypervisor` | `sys/virt` | EL2 hypervisor ELF. |
| `out/Kernel` | `sys/kernel` | EL1 microkernel ELF. |
| `out/SystemDaemon` | `sys/kernel/systemd` | Privileged EL0 root service. |
| `out/boot.img` | `make_boot_img.sh` | Fixed-offset boot container with loader, DTB, hypervisor, kernel, SystemDaemon, and ramdisk. |
| `out/system.img` | `make_system_img.sh` | 128 MB ext2 system partition containing zygote, framework services, system UI, and application ELFs. |
| `out/user.img` | `make_user_img.sh` | 64 MB ext2 user partition containing sample music, games, photos, and AI configuration files. |
| `out/tranquil-virt.img` | `make_all_img.sh` | QEMU virt raw disk image with FAT32 boot, ext2 system, and ext2 user partitions. |

## Troubleshooting

- Missing `mke2fs`: install Homebrew `e2fsprogs`; scripts read `/opt/homebrew/opt/e2fsprogs/sbin/mke2fs` by default.
- No graphics in QEMU: confirm `-device ramfb` is active and check `QEMU_DISPLAY_BACKEND`.
- Service changes not visible: regenerate `system.img`; modified framework service ELFs are not visible until the system partition is rebuilt.
- CM4 flashing risk: confirm the target disk before writing. `flash.sh` filters external USB removable devices, but the printed device name should still be checked.
