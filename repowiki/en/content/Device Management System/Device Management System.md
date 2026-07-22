# Device Management System

<cite>
**Primary source files**
- [sys/kernel/device/device.c](file://sys/kernel/device/device.c)
- [sys/kernel/device/device_tree.c](file://sys/kernel/device/device_tree.c)
- [sys/kernel/include/device/device.h](file://sys/kernel/include/device/device.h)
- [sys/kernel/include/device/device_tree.h](file://sys/kernel/include/device/device_tree.h)
- [sys/kernel/drivers](file://sys/kernel/drivers)
- [sys/uapps/core/devmgr](file://sys/uapps/core/devmgr)
- [platform/QemuVirt/dts/virt.dts](file://platform/QemuVirt/dts/virt.dts)
- [platform/CM4/dts/bcm2711-rpi-cm4.dts](file://platform/CM4/dts/bcm2711-rpi-cm4.dts)
</cite>

## Role

TranquilOS splits device handling into two layers. The kernel keeps early device-tree parsing, essential interrupt/timer/console drivers, and minimal hardware abstractions. User-space `Devmgr` performs device management, enumeration, and service exposure. This follows the microkernel boundary: the kernel keeps the hardware mechanisms required for boot and scheduling, while policy and service interfaces stay in EL0.

## Kernel Device Layer

`sys/kernel/device` provides device registration and device-tree access. Drivers normally match DTB nodes by compatible strings, read register addresses, IRQ lines, and platform properties, then register with the appropriate kernel subsystem.

Key pieces:

- `device_tree.c`: DTB initialization, node traversal, compatible lookup, property reads, and address parsing.
- `device.c`: device descriptor registration and probe dispatch.
- `initcall.h`: staged driver initialization.
- `interrupt/irq_mgr.c` and `timer/timer_mgr.c`: integration of device interrupts and hardware timers into the kernel runtime.

## Built-In Drivers

The current [sys/kernel/BUILD.gn](file://sys/kernel/BUILD.gn) build includes these driver groups:

| Area | Drivers |
| --- | --- |
| Serial and console | `arm-uart/pl011.c`, `kmsg/kmsg_console.c` |
| Interrupt controllers | `arm-gic/gicv2.c`, `arm-gic/gicv3.c` |
| Timer and RTC | `arm-timer/generic_timer.c`, `arm-rtc/pl031.c` |
| Power and boot | `arm-psci/psci.c`, `spin-table/spin_table.c`, `arm-watchdog/sp805.c` |
| Performance and cache | `arm-pmu/pmuv3.c`, `arm-pmu/spe.c`, `arm-cache/pl310.c` |
| Graphics and DMA | `arm-mali/*`, `arm-dma/pl080.c` |
| Virtualization bridge | `hvdriver/hypervisor.c` |

This is not a monolithic Linux-style driver stack. These drivers mainly support boot, console output, timing, interrupts, platform control, and resource delegation to user-space services.

## User-Space Devmgr

`sys/uapps/core/devmgr` is the base user-space device manager. It works with kernel device capabilities, the file-system service, and framework services to turn low-level hardware into user-visible resources.

Typical responsibilities:

- receive and maintain device enumeration data;
- establish user-space access paths for devices;
- cooperate with `Fsmgr` to expose devices as files or service endpoints;
- provide the device base for display, input, audio, networking, and other framework services.

## Device Tree and Platforms

Platform resources are described under `platform/*/dts` and `platform/*/dtb`. The main platform families are:

- `QemuVirt`: local virtualized development, with `platform/QemuVirt/dtb/virt.dtb`;
- `CM4`: Raspberry Pi Compute Module 4, with `platform/CM4/dtb/bcm2711-rpi-cm4.dtb`;
- `Pi3b` / `Pi4b`: Raspberry Pi 3B and 4B, each with platform-specific DTBs, linker scripts, and run scripts.

Driver work should begin with the DTB compatible string, `reg`, `interrupts`, and platform linker scripts. Those define the hardware address map, exception-level expectations, MMU mapping, and image layout constraints.

## Maintenance Notes

- New kernel drivers should document probe behavior, DTB compatible strings, init stage, and interrupt registration.
- Policy code that can run in user space should remain in `Devmgr` or higher-level services.
- DTS changes require regenerating or validating the matching DTB and rebuilding the platform image.
- Changes to GIC, timer, console, or PSCI paths should be validated on QEMU Virt first, then on the relevant Raspberry Pi platform when hardware behavior is involved.
