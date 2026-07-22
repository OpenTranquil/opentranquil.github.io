# Virtualization Support (EL2 Hypervisor)

<cite>
**Primary source files**
- [sys/virt/BUILD.gn](file://sys/virt/BUILD.gn)
- [sys/virt/hypervisor.c](file://sys/virt/hypervisor.c)
- [sys/virt/vm.c](file://sys/virt/vm.c)
- [sys/virt/vcpu.c](file://sys/virt/vcpu.c)
- [sys/virt/hypcall/hypcall.c](file://sys/virt/hypcall/hypcall.c)
- [sys/virt/mm/vmem.c](file://sys/virt/mm/vmem.c)
- [sys/virt/mm/pgtable_stage2.c](file://sys/virt/mm/pgtable_stage2.c)
- [sys/kernel/drivers/hvdriver/hypervisor.c](file://sys/kernel/drivers/hvdriver/hypervisor.c)
</cite>

## Role

TranquilOS includes an optional AArch64 EL2 Hypervisor target. [sys/virt/BUILD.gn](file://sys/virt/BUILD.gn) builds it as `Hypervisor`, and platform boot-image scripts place it alongside `Boot`, `Kernel`, and `SystemDaemon`. The virtualization layer does not replace the microkernel; it provides VM, VCPU, Stage-2 mapping, EL2 exception, interrupt, and hypcall mechanisms at a higher exception level.

## Component Layout

| Module | Responsibility |
| --- | --- |
| `hypervisor.c` | main EL2 control logic |
| `vm.c` | virtual-machine object management |
| `vcpu.c` | virtual CPU state and switching |
| `hypcall/hypcall.c` | hypercall/hypcall channel between EL1 and EL2 |
| `mm/vmem.c` | hypervisor virtual memory |
| `mm/pgtable_stage2.c` | Stage-2 page-table support |
| `exceptions_el2.c` | EL2 exception handling |
| `interrupt/irq_mgr.c` | EL2 interrupt management |
| `drivers/arm-gic/gicv2.c` | GICv2 support used by the hypervisor |
| `drivers/arm-uart/pl011.c` | EL2 console output |

The Hypervisor target reuses `sys/ulibs` implementations of `libc`, `printf`, and `libfdt`, and also reuses selected AArch64 CPU and device-tree code from the kernel tree.

## Relationship with the Kernel

`sys/kernel/drivers/hvdriver/hypervisor.c` is the kernel-side bridge to the hypervisor. The kernel still runs in EL1 and owns microkernel objects, user-space services, and scheduling. The hypervisor runs in EL2 and handles virtualization-specific control paths. Platform boot images contain both `Hypervisor` and `Kernel`; the active path depends on platform boot code and runtime configuration.

## Image and Runtime Notes

The QEMU Virt boot-image script places Hypervisor at a fixed offset:

- `Boot`: beginning of the boot image.
- `virt.dtb`: device tree.
- `Hypervisor`: EL2 target.
- `Kernel`: EL1 microkernel.
- `SystemDaemon`: EL0 root service.
- ramdisk: base programs such as `Devmgr`, `Fsmgr`, `Idle`, and `Init`.

The current `platform/QemuVirt/scripts/run.sh` uses `-machine virt,gic-version=2,virtualization=off,accel=hvf` by default. That path is primarily for validating the microkernel and user-space stack. EL2 validation requires reviewing QEMU flags, platform boot flow, and hypervisor initialization logs together.

## Maintenance Notes

- Changes to EL2 page tables, exceptions, or VCPU logic should be checked against `include/mm/pgtable_stage2.h`, `include/vcpu.h`, and `include/vm.h`.
- hypcall ABI changes must update the kernel-side `hvdriver` and all callers.
- Virtualization code crosses exception levels, so serial logs and QEMU reproduction are essential.
- OS service policy should remain outside EL2; the hypervisor should only contain mechanisms that require the higher exception level or hardware virtualization semantics.
