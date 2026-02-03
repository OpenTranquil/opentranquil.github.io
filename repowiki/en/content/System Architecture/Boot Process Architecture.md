# Boot Process Architecture

<cite>
**Referenced Files in This Document**
- [boot.S](file://boot/arch/arm64/boot.S)
- [boot.c](file://boot/boot.c)
- [bootmm.c](file://boot/mm/bootmm.c)
- [mm_translation.c](file://boot/mm/mm_translation.c)
- [device_tree.c](file://kernel/device/device_tree.c)
- [power_manager.c](file://boot/power_manager.c)
- [cpu.c](file://kernel/arch/arm64/cpu.c)
- [hypervisor.c](file://virt/hypervisor.c)
- [systemd.c](file://kernel/systemd/systemd.c)
- [bcm2711-rpi-cm4.dts](file://platform/CM4/dts/bcm2711-rpi-cm4.dts)
</cite>

## Table of Contents
1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Core Components](#core-components)
4. [Architecture Overview](#architecture-overview)
5. [Detailed Component Analysis](#detailed-component-analysis)
6. [Dependency Analysis](#dependency-analysis)
7. [Performance Considerations](#performance-considerations)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Conclusion](#conclusion)

## Introduction
This document describes the boot process architecture across three privilege levels (EL3/EL2/EL1) and the handoff to user-space systemd. It explains the multi-stage boot sequence, device tree parsing, CPU initialization, memory management, and the dual-boot capability supporting both direct kernel boot and hypervisor-assisted boot. It also documents platform-specific boot considerations and boot-time security measures.

## Project Structure
The boot process spans several layers:
- Boot stage (EL3/EL2/EL1) code under boot/ and virt/
- Kernel-side boot entry and early initialization under kernel/arch/arm64/boot/
- Device tree parsing and early device initialization under kernel/device/
- Memory subsystem initialization under boot/mm/
- Power management for CPU bring-up under boot/power_manager.c
- Platform device tree sources under platform/*/dts/

```mermaid
graph TB
EL3["EL3 Boot<br/>boot/arch/arm64/boot.S"] --> EL2["EL2 Boot<br/>virt/hypervisor.c"]
EL2 --> EL1["EL1 Boot<br/>boot/boot.c"]
EL1 --> Kernel["Kernel Entry<br/>kernel/arch/arm64/boot/boot.S"]
EL1 --> Systemd["Systemd Init<br/>kernel/systemd/systemd.c"]
EL1 --> DTB["Device Tree Parsing<br/>kernel/device/device_tree.c"]
EL1 --> MM["Early Memory Init<br/>boot/mm/bootmm.c"]
EL1 --> TLB["MMU Config & Identity Map<br/>boot/mm/mm_translation.c"]
EL1 --> PM["CPU Bring-up via PSCI<br/>boot/power_manager.c"]
```

**Diagram sources**
- [boot.S](file://boot/arch/arm64/boot.S#L1-L115)
- [boot.c](file://boot/boot.c#L1-L176)
- [hypervisor.c](file://virt/hypervisor.c#L1-L149)
- [device_tree.c](file://kernel/device/device_tree.c#L1-L95)
- [bootmm.c](file://boot/mm/bootmm.c#L1-L29)
- [mm_translation.c](file://boot/mm/mm_translation.c#L1-L225)
- [power_manager.c](file://boot/power_manager.c#L1-L27)
- [systemd.c](file://kernel/systemd/systemd.c#L1-L247)

**Section sources**
- [boot.S](file://boot/arch/arm64/boot.S#L1-L115)
- [boot.c](file://boot/boot.c#L1-L176)
- [hypervisor.c](file://virt/hypervisor.c#L1-L149)
- [device_tree.c](file://kernel/device/device_tree.c#L1-L95)
- [bootmm.c](file://boot/mm/bootmm.c#L1-L29)
- [mm_translation.c](file://boot/mm/mm_translation.c#L1-L225)
- [power_manager.c](file://boot/power_manager.c#L1-L27)
- [systemd.c](file://kernel/systemd/systemd.c#L1-L247)

## Core Components
- EL3 boot entry initializes stacks per CPU, clears BSS, and branches to EL2 or EL1 depending on the primary CPU.
- EL2 boot entry parses the device tree, initializes early devices, sets up interrupts, and either hands off to a hypervisor image or returns to EL1.
- EL1 boot entry initializes console, device tree, early devices, boot memory allocator, and powers on secondary CPUs via PSCI; then remaps memory and jumps to the kernel.
- Kernel entry initializes stacks, clears BSS, and dispatches to kernel_start_primary/secondary.
- Hypervisor initializes interrupt controller, early devices, boot memory, creates VM/VCPU, and runs the VM.
- Systemd initializes memory managers, IPC, process manager, loads core services from the ramdisk, and runs them.

**Section sources**
- [boot.S](file://boot/arch/arm64/boot.S#L1-L115)
- [boot.c](file://boot/boot.c#L1-L176)
- [hypervisor.c](file://virt/hypervisor.c#L1-L149)
- [systemd.c](file://kernel/systemd/systemd.c#L1-L247)

## Architecture Overview
The boot architecture supports two primary paths:
- Direct kernel boot: EL3 -> EL1 -> kernel -> systemd
- Hypervisor-assisted boot: EL3 -> EL2 -> hypervisor -> VM/VCPU -> kernel -> systemd

```mermaid
sequenceDiagram
participant EL3 as "EL3 Boot<br/>boot/arch/arm64/boot.S"
participant EL2 as "EL2 Boot<br/>virt/hypervisor.c"
participant EL1 as "EL1 Boot<br/>boot/boot.c"
participant Kernel as "Kernel Entry<br/>kernel/arch/arm64/boot/boot.S"
participant Systemd as "Systemd<br/>kernel/systemd/systemd.c"
EL3->>EL2 : "Primary CPU : branch to EL2"
EL3->>EL1 : "Secondary CPU : branch to EL1"
EL2->>EL1 : "If hypervisor not present, return to EL1"
EL1->>Kernel : "Remap memory and jump to kernel"
Kernel-->>Systemd : "Handoff to user-space systemd"
```

**Diagram sources**
- [boot.S](file://boot/arch/arm64/boot.S#L24-L76)
- [boot.c](file://boot/boot.c#L114-L136)
- [hypervisor.c](file://virt/hypervisor.c#L101-L145)
- [systemd.c](file://kernel/systemd/systemd.c#L217-L246)

## Detailed Component Analysis

### EL3 Boot Stage
- Determines current EL from CurrentEL and routes to _start_el3/_start_el2/_start_el1.
- Allocates per-CPU stack, clears BSS, and branches to EL2 or EL1.
- On primary CPU, prepares device tree and prints splash; on secondary, loops.

```mermaid
flowchart TD
StartEL3(["Entry"]) --> ReadEL["Read CurrentEL"]
ReadEL --> Branch{"EL = 3?"}
Branch --> |Yes| StackEL3["Setup EL3 stack"]
StackEL3 --> ClearBSS["Clear BSS"]
ClearBSS --> PrimSec{"Primary CPU?"}
PrimSec --> |Yes| EL2Branch["Branch to EL2"]
PrimSec --> |No| EL1Branch["Branch to EL1"]
EL2Branch --> EndEL3(["Exit"])
EL1Branch --> EndEL3
```

**Diagram sources**
- [boot.S](file://boot/arch/arm64/boot.S#L10-L49)

**Section sources**
- [boot.S](file://boot/arch/arm64/boot.S#L1-L115)

### EL2 Boot Stage (Hypervisor-Assisted Path)
- Initializes device tree, early devices, disables interrupts, prints splash, sets up IRQ manager, boot memory, and key devices.
- Initializes MM sparse banks, physical CPU context, and exception handlers.
- Registers hypervisor HVC handler and enables interrupts.
- Creates VM/VCPU and runs VM; if no hypervisor node is found, returns to EL1.

```mermaid
sequenceDiagram
participant EL2 as "EL2 Boot<br/>virt/hypervisor.c"
participant DTB as "Device Tree<br/>kernel/device/device_tree.c"
participant IRQ as "IRQ Manager"
participant MM as "Boot Memory<br/>boot/mm/bootmm.c"
participant VM as "VM/VCPU"
EL2->>DTB : "device_tree_init(dtb)"
EL2->>EL2 : "init_early_devices()"
EL2->>IRQ : "irq_mgr_init()"
EL2->>MM : "bootmm_init()"
EL2->>EL2 : "mm_sparse_init_membank()"
EL2->>EL2 : "pcpu_init_current()"
EL2->>EL2 : "init_key_devices()"
EL2->>EL2 : "el2_exceptions_init()"
EL2->>EL2 : "hypcall_register()"
EL2->>EL2 : "arch_enable_irq()"
EL2->>VM : "virtual_cpu_create()"
EL2->>VM : "virtual_machine_create()"
EL2->>EL2 : "Run VM loop"
```

**Diagram sources**
- [hypervisor.c](file://virt/hypervisor.c#L101-L145)
- [device_tree.c](file://kernel/device/device_tree.c#L10-L23)
- [bootmm.c](file://boot/mm/bootmm.c#L26-L29)

**Section sources**
- [hypervisor.c](file://virt/hypervisor.c#L1-L149)
- [device_tree.c](file://kernel/device/device_tree.c#L1-L95)
- [bootmm.c](file://boot/mm/bootmm.c#L1-L29)

### EL1 Boot Stage (Direct Kernel Path)
- Initializes console, device tree, disables interrupts, initializes early and key devices, prints splash.
- Initializes boot memory allocator, iterates CPU nodes, powers on secondary CPUs via PSCI, and remaps memory.
- Remaps memory, resolves kernel address from device tree, and jumps to kernel.

```mermaid
sequenceDiagram
participant EL1 as "EL1 Boot<br/>boot/boot.c"
participant DTB as "Device Tree<br/>kernel/device/device_tree.c"
participant PM as "Power Manager<br/>boot/power_manager.c"
participant MM as "MMU Config<br/>boot/mm/mm_translation.c"
participant KRN as "Kernel Entry"
EL1->>EL1 : "console_device_reset()"
EL1->>DTB : "device_tree_init(dtb)"
EL1->>EL1 : "init_early_devices()"
EL1->>EL1 : "init_key_devices()"
EL1->>EL1 : "print_bootloader_splash()"
EL1->>EL1 : "bootmm_init()"
EL1->>PM : "device_tree_iter_node_by_type('cpu', cpu_node_iter)"
EL1->>PM : "power_manager_cpu_on(target, entry, context)"
EL1->>MM : "mm_translation_init()"
EL1->>EL1 : "kernel_remap()"
EL1->>KRN : "jump to kernel"
```

**Diagram sources**
- [boot.c](file://boot/boot.c#L82-L107)
- [device_tree.c](file://kernel/device/device_tree.c#L10-L23)
- [power_manager.c](file://boot/power_manager.c#L12-L21)
- [mm_translation.c](file://boot/mm/mm_translation.c#L99-L162)

**Section sources**
- [boot.c](file://boot/boot.c#L1-L176)
- [power_manager.c](file://boot/power_manager.c#L1-L27)
- [mm_translation.c](file://boot/mm/mm_translation.c#L1-L225)

### Memory Initialization and Early Boot Memory Management
- Boot memory allocator is initialized from linker-defined symbols and used to allocate page tables during early boot.
- MMU is configured with appropriate MAIR attributes, TCR settings, and identity mapping for the initial stage.
- Page allocator is set globally for subsequent allocations.

```mermaid
flowchart TD
Init(["bootmm_init"]) --> SetAlloc["Set page allocator"]
SetAlloc --> Alloc["Allocate L0/L1 page tables"]
Alloc --> Map["Identity map blocks"]
Map --> Enable["Enable MMU"]
```

**Diagram sources**
- [bootmm.c](file://boot/mm/bootmm.c#L26-L29)
- [mm_translation.c](file://boot/mm/mm_translation.c#L99-L162)

**Section sources**
- [bootmm.c](file://boot/mm/bootmm.c#L1-L29)
- [mm_translation.c](file://boot/mm/mm_translation.c#L1-L225)

### Device Tree Parsing and CPU Initialization
- Device tree is parsed and validated; compatible nodes are queried to locate kernel/hypervisor/systemd regions.
- CPU nodes are iterated; if enable-method is "psci", secondary CPUs are powered on via power manager.
- Privilege level detection and CPU ID retrieval are exposed via HAL.

```mermaid
flowchart TD
DTInit["device_tree_init(dtb)"] --> FindKernel["Find 'tranquil,kernel' node"]
FindKernel --> GetAddr["device_get_node_address()"]
DTInit --> IterateCPUs["Iterate 'cpu' nodes"]
IterateCPUs --> CheckPSCI{"enable-method == 'psci'?"}
CheckPSCI --> |Yes| PSCIOn["power_manager_cpu_on()"]
CheckPSCI --> |No| Skip["Skip"]
```

**Diagram sources**
- [device_tree.c](file://kernel/device/device_tree.c#L10-L95)
- [boot.c](file://boot/boot.c#L68-L80)
- [power_manager.c](file://boot/power_manager.c#L12-L21)
- [cpu.c](file://kernel/arch/arm64/cpu.c#L9-L20)

**Section sources**
- [device_tree.c](file://kernel/device/device_tree.c#L1-L95)
- [boot.c](file://boot/boot.c#L68-L102)
- [power_manager.c](file://boot/power_manager.c#L1-L27)
- [cpu.c](file://kernel/arch/arm64/cpu.c#L1-L44)

### Dual-Boot Capability: Direct Kernel vs Hypervisor-Assisted
- If a hypervisor-compatible node exists in the device tree, EL2 branches to the hypervisor entry point; otherwise, it returns to EL1.
- The hypervisor initializes VM/VCPU and runs the VM, which eventually boots the kernel and systemd.

```mermaid
flowchart TD
EL2Start["EL2 Start"] --> ParseDTB["Parse Device Tree"]
ParseDTB --> FindHV{"Compatible 'tranquil,hypervisor'?"}
FindHV --> |Yes| JumpHV["Jump to Hypervisor"]
FindHV --> |No| ReturnEL1["Return to EL1"]
JumpHV --> RunVM["Create VM/VCPU and run"]
```

**Diagram sources**
- [boot.c](file://boot/boot.c#L114-L136)
- [hypervisor.c](file://virt/hypervisor.c#L137-L144)

**Section sources**
- [boot.c](file://boot/boot.c#L114-L136)
- [hypervisor.c](file://virt/hypervisor.c#L101-L145)

### Handoff to User-Space Systemd
- After kernel entry, the system transitions to user-space systemd.
- Systemd initializes memory managers, IPC, process manager, and loads core services from the ramdisk.
- Services are mapped into virtual memory, threads are created according to deployment modes, and services are started.

```mermaid
sequenceDiagram
participant Kernel as "Kernel Entry"
participant Systemd as "systemd.c"
participant MemMgr as "Memory Manager"
participant ProcMgr as "Process Manager"
participant IPCMgr as "IPC Manager"
Kernel-->>Systemd : "Call systemd main"
Systemd->>MemMgr : "memmgr_init()"
Systemd->>ProcMgr : "procmgr_init()"
Systemd->>IPCMgr : "ipcmgr_init()"
Systemd->>Systemd : "ramdisk_init()"
Systemd->>Systemd : "core_services_start()"
Systemd->>Systemd : "loop with OSSelfYield()"
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L217-L246)

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L1-L247)

### Platform-Specific Boot Considerations
- Platform device tree defines memory layout and regions for boot, kernel, systemd, and ramdisk.
- Example: CM4 DTS reserves regions for tranquil,boot, tranquil,kernel, tranquil,systemd, and tranquil,ramdisk.

```mermaid
graph TB
DTS["Platform DTS<br/>platform/CM4/dts/bcm2711-rpi-cm4.dts"] --> Regions["Reserved Regions"]
Regions --> Boot["boot@80000"]
Regions --> Kernel["kernel@2080000"]
Regions --> Systemd["systemd@3080000"]
Regions --> Ramdisk["ramdisk@3880000"]
```

**Diagram sources**
- [bcm2711-rpi-cm4.dts](file://platform/CM4/dts/bcm2711-rpi-cm4.dts#L11-L34)

**Section sources**
- [bcm2711-rpi-cm4.dts](file://platform/CM4/dts/bcm2711-rpi-cm4.dts#L1-L80)

## Dependency Analysis
- EL3 boot depends on architecture-specific register definitions and branching to EL2/EL1.
- EL1 boot depends on device tree parsing, power management, and memory translation modules.
- Hypervisor boot depends on device tree, IRQ manager, boot memory, and VM/VCPU creation.
- Systemd depends on memory managers, process manager, IPC manager, and ramdisk.

```mermaid
graph TB
EL3["EL3 Boot"] --> EL2["EL2 Boot"]
EL2 --> EL1["EL1 Boot"]
EL1 --> Kernel["Kernel Entry"]
Kernel --> Systemd["Systemd"]
EL1 --> DTB["Device Tree"]
EL1 --> PM["Power Manager"]
EL1 --> MM["MMU Config"]
EL2 --> VM["VM/VCPU"]
Systemd --> MemMgr["Memory Manager"]
Systemd --> ProcMgr["Process Manager"]
Systemd --> IPCMgr["IPC Manager"]
```

**Diagram sources**
- [boot.S](file://boot/arch/arm64/boot.S#L1-L115)
- [boot.c](file://boot/boot.c#L1-L176)
- [hypervisor.c](file://virt/hypervisor.c#L1-L149)
- [systemd.c](file://kernel/systemd/systemd.c#L1-L247)

**Section sources**
- [boot.S](file://boot/arch/arm64/boot.S#L1-L115)
- [boot.c](file://boot/boot.c#L1-L176)
- [hypervisor.c](file://virt/hypervisor.c#L1-L149)
- [systemd.c](file://kernel/systemd/systemd.c#L1-L247)

## Performance Considerations
- Minimizing BSS clearing overhead by using efficient str/xzr loops.
- Using identity mapping for early stages reduces translation overhead.
- PSCI-based CPU bring-up avoids busy-waiting and leverages platform power orchestration.
- Sparse memory initialization reduces footprint during early boot.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- If the kernel node is missing in the device tree, the boot process logs an error and halts.
- If the hypervisor node is missing, EL2 returns to EL1; verify platform DTS region layout.
- If MMU configuration fails or unsupported granule is detected, the boot process panics.
- If PSCI CPU on fails, check power manager registration and platform enable-method.

**Section sources**
- [boot.c](file://boot/boot.c#L34-L45)
- [boot.c](file://boot/boot.c#L124-L128)
- [mm_translation.c](file://boot/mm/mm_translation.c#L124-L126)
- [power_manager.c](file://boot/power_manager.c#L12-L21)

## Conclusion
The boot process is structured around a clear multi-stage pipeline from EL3 to EL1, with optional EL2 hypervisor involvement. Device tree drives discovery of boot components, while PSCI and early memory management enable robust CPU bring-up and memory setup. The system cleanly hands off to user-space systemd for service orchestration, with platform-specific DTS ensuring proper memory layout.