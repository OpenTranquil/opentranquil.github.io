# Platform Support

<cite>
**Primary source files**
- [platform/QemuVirt](file://platform/QemuVirt)
- [platform/CM4](file://platform/CM4)
- [platform/Pi3b](file://platform/Pi3b)
- [platform/Pi4b](file://platform/Pi4b)
- [run_qemu_virt.sh](file://run_qemu_virt.sh)
- [run_qemu_pi3b.sh](file://run_qemu_pi3b.sh)
- [run_qemu_pi4b.sh](file://run_qemu_pi4b.sh)
- [run_board_cm4.sh](file://run_board_cm4.sh)
</cite>

## Role

Platform support is composed from the GN `platform` argument, linker scripts, DTB/DTS files, image-building scripts, and run/flash scripts. Kernel, Hypervisor, SystemDaemon, and user programs share the same source tree, while each platform supplies its own address layout, device tree, firmware files, and image format.

## Supported Platforms

| Platform | Main use | Key scripts |
| --- | --- | --- |
| `QemuVirt` | local AArch64 virtual-machine development and regression testing | `platform/QemuVirt/scripts/build.sh`, `make_all_img.sh`, `run.sh` |
| `CM4` | Raspberry Pi Compute Module 4 hardware image and flashing | `platform/CM4/scripts/make_all_img.sh`, `flash.sh` |
| `Pi3b` | Raspberry Pi 3B QEMU/board adaptation | `platform/Pi3b/scripts/*` |
| `Pi4b` | Raspberry Pi 4B QEMU/board adaptation | `platform/Pi4b/scripts/*` |

## Build Argument

Platform build scripts typically run:

```bash
gn gen out --args="platform=\"QemuVirt\""
ninja -C out
```

The `platform` argument selects:

- `platform/$platform/linker/*.lds` for Boot, Hypervisor, Kernel, and SystemDaemon link addresses;
- `platform/$platform/dtb/*.dtb` for runtime device trees;
- `platform/$platform/scripts/*.sh` for boot/system/user/all image generation and runtime behavior;
- platform-specific build definitions.

## Image Layout

QEMU Virt and CM4 both produce raw images, but their contents differ:

- `QemuVirt` produces `out/tranquil-virt.img` with boot, system, and user partitions.
- `CM4` produces `out/tranquil-cm4.img`; its boot partition contains Raspberry Pi firmware, `boot.img`, and `bcm2711-rpi-cm4.dtb`, followed by system and user partitions.

The QEMU Virt `make_boot_img.sh` writes `Boot`, `virt.dtb`, `Hypervisor`, `Kernel`, `SystemDaemon`, and the ramdisk at fixed offsets. The CM4 `make_all_img.sh` additionally copies Raspberry Pi firmware and creates an image suitable for eMMC or USB mass-storage flashing.

## Run and Flash Paths

- `./run_qemu_virt.sh`: builds the QEMU Virt image and starts `qemu-system-aarch64`.
- `./run_qemu_pi3b.sh` and `./run_qemu_pi4b.sh`: run the Pi3b/Pi4b platform flows.
- `./run_board_cm4.sh`: calls the CM4 flash script, uses `rpiboot` to expose mass storage, then writes `tranquil-cm4.img` with `dd`.

The CM4 flash script detects a newly attached external removable disk and writes to `/dev/rdiskN`. The target disk must be verified before flashing.

## Maintenance Notes

- A new platform needs at minimum linker scripts, DTS/DTB files, `scripts/build.sh`, and image scripts.
- Address-layout changes must update linker scripts, device tree, and image offsets together.
- QEMU arguments should match the selected GIC version, CPU, memory, virtio devices, and display backend.
- Image-script changes should be reflected in the website download page and the repowiki image download/flashing page.
