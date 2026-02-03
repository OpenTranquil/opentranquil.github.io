# Idle Process

<cite>
**Referenced Files in This Document**
- [idle.h](file://kernel/include/idle/idle.h)
- [main.c](file://uapps/idle/main.c)
- [start.S](file://uapps/idle/start.S)
- [systemd.c](file://kernel/systemd/systemd.c)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c)
- [sched_framework.h](file://kernel/include/scheduler/sched_framework.h)
- [scontext.h](file://kernel/include/scontext/scontext.h)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c)
- [kernel.c](file://kernel/kernel.c)
- [sysproc.c](file://kernel/sysproc.c)
- [power_manager.h](file://kernel/include/power_manager.h)
- [psci.c](file://kernel/drivers/arm-psci/psci.c)
- [boot_power_manager.c](file://boot/power_manager.c)
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
This document explains the Idle Process in TranquilOS, focusing on its role as a per-CPU maintenance task, its integration with the kernel’s scheduler and power management subsystems, and how it participates in system sleep and idle behaviors. It covers the user-space idle application, its deployment via the system daemon, the kernel-side scheduler framework, and the power management interface used for CPU idle and suspend operations.

## Project Structure
The Idle Process spans both user-space and kernel-space components:
- User-space idle application: a minimal loop that logs periodic progress.
- Kernel-side systemd service registry and per-CPU deployment.
- Scheduler framework and local scheduler operations.
- Power management interface and PSCI driver registration.

```mermaid
graph TB
subgraph "User Space"
UApp["Idle Application<br/>main.c + start.S"]
end
subgraph "Kernel Space"
Sysd["System Daemon<br/>systemd.c"]
Sched["Scheduler Manager<br/>sched_mgr.c"]
SFW["Scheduler Framework<br/>sched_framework.h"]
SCtx["Schedule Context<br/>scontext.h"]
CapSC["Capability: SContext<br/>cap_scontext.c"]
KMain["Kernel Loop<br/>kernel.c"]
SysProc["System Process<br/>sysproc.c"]
PM["Power Manager API<br/>power_manager.h"]
PSCI["PSCI Driver<br/>psci.c"]
end
UApp --> Sysd
Sysd --> Sched
Sched --> SFW
Sched --> SCtx
CapSC --> Sched
KMain --> Sched
SysProc --> KMain
PM --> PSCI
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L50-L74)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L1-L167)
- [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L1-L20)
- [scontext.h](file://kernel/include/scontext/scontext.h#L1-L49)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c#L300-L341)
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [sysproc.c](file://kernel/sysproc.c#L72-L83)
- [power_manager.h](file://kernel/include/power_manager.h#L2-L73)
- [psci.c](file://kernel/drivers/arm-psci/psci.c#L154-L222)

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L50-L74)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L1-L167)
- [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L1-L20)
- [scontext.h](file://kernel/include/scontext/scontext.h#L1-L49)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c#L300-L341)
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [sysproc.c](file://kernel/sysproc.c#L72-L83)
- [power_manager.h](file://kernel/include/power_manager.h#L2-L73)
- [psci.c](file://kernel/drivers/arm-psci/psci.c#L154-L222)

## Core Components
- Idle Application (user-space): A minimal program that loops and logs periodically. It is deployed per CPU by the system daemon.
- System Daemon: Declares the idle service as a per-CPU service and creates threads accordingly.
- Scheduler: Manages ready-to-run contexts; the idle application becomes a ready context after creation and scheduling.
- Power Management: Provides the power manager interface and PSCI driver for CPU idle/suspend operations.

Key implementation references:
- Idle application entry and loop: [main.c](file://uapps/idle/main.c#L6-L16), [start.S](file://uapps/idle/start.S#L1-L19)
- Idle service declaration and per-CPU deployment: [systemd.c](file://kernel/systemd/systemd.c#L50-L74), [systemd.c](file://kernel/systemd/systemd.c#L186-L198)
- Scheduler framework and local scheduler operations: [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L1-L167), [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L1-L20)
- Schedule context lifecycle and state transitions: [scontext.h](file://kernel/include/scontext/scontext.h#L12-L43)
- Capability-based scheduling on/off: [cap_scontext.c](file://kernel/capability/cap_scontext.c#L300-L341)
- Kernel scheduling loop: [kernel.c](file://kernel/kernel.c#L112-L122)
- System process initialization and startup: [sysproc.c](file://kernel/sysproc.c#L63-L83)
- Power manager API and PSCI driver: [power_manager.h](file://kernel/include/power_manager.h#L2-L73), [psci.c](file://kernel/drivers/arm-psci/psci.c#L154-L222)

**Section sources**
- [main.c](file://uapps/idle/main.c#L6-L16)
- [start.S](file://uapps/idle/start.S#L1-L19)
- [systemd.c](file://kernel/systemd/systemd.c#L50-L74)
- [systemd.c](file://kernel/systemd/systemd.c#L186-L198)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L1-L167)
- [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L1-L20)
- [scontext.h](file://kernel/include/scontext/scontext.h#L12-L43)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c#L300-L341)
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [sysproc.c](file://kernel/sysproc.c#L63-L83)
- [power_manager.h](file://kernel/include/power_manager.h#L2-L73)
- [psci.c](file://kernel/drivers/arm-psci/psci.c#L154-L222)

## Architecture Overview
The Idle Process is a per-CPU user-space process managed by the system daemon. After ELF loading and virtual memory setup, threads are created and scheduled onto specific CPUs. The kernel’s scheduler loop selects the next context; when no higher-priority work exists, the idle context runs. Power management integrates through the power manager interface and PSCI driver, enabling CPU idle and suspend operations.

```mermaid
sequenceDiagram
participant SD as "System Daemon<br/>systemd.c"
participant PMgr as "Process Manager<br/>process.c"
participant T as "Thread<br/>thread_s"
participant Sched as "Local Scheduler<br/>sched_mgr.c"
participant KLoop as "Kernel Scheduling Loop<br/>kernel.c"
participant Idle as "Idle Thread<br/>main.c"
SD->>PMgr : Create process "idle"
PMgr->>T : Create per-CPU thread(s)
T-->>Sched : Add to scheduler (READY)
KLoop->>Sched : schedule()
Sched-->>KLoop : Next context (idle)
KLoop->>Idle : Switch to idle context
Idle-->>KLoop : Loop and log periodically
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L186-L198)
- [process.c](file://kernel/systemd/procmgr/process.c#L150-L174)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L74-L87)
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [main.c](file://uapps/idle/main.c#L6-L16)

## Detailed Component Analysis

### Idle Application (User-Space)
- Purpose: Minimal per-CPU maintenance task that logs progress in a tight loop.
- Startup: Entry routine clears BSS and branches to main; main logs and loops.
- Behavior: Runs continuously while no higher-priority work is available; logs occur at a fixed cadence.

Implementation references:
- Entry and BSS zeroing: [start.S](file://uapps/idle/start.S#L1-L19)
- Main loop and logging: [main.c](file://uapps/idle/main.c#L6-L16)

**Section sources**
- [start.S](file://uapps/idle/start.S#L1-L19)
- [main.c](file://uapps/idle/main.c#L6-L16)

### System Daemon and Per-CPU Deployment
- Declares the idle service as a per-CPU service.
- Creates one thread per CPU with appropriate CPU affinity.
- Threads are added to the scheduler and become READY contexts.

Implementation references:
- Idle service definition: [systemd.c](file://kernel/systemd/systemd.c#L50-L74)
- Per-CPU thread creation and affinity: [systemd.c](file://kernel/systemd/systemd.c#L186-L198)

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L50-L74)
- [systemd.c](file://kernel/systemd/systemd.c#L186-L198)

### Scheduler Integration and Low-Priority Scheduling
- The idle thread is represented as a schedule context with READY state.
- The scheduler framework exposes add/remove/is_empty/next operations.
- The local scheduler aggregates frameworks and selects the next context; when empty, the kernel loop continues without switching.

```mermaid
flowchart TD
Start(["Scheduler Next"]) --> CheckFW["Iterate frameworks<br/>check is_empty()"]
CheckFW --> HasWork{"Any non-empty framework?"}
HasWork --> |Yes| Pick["Call next_scontext()"]
HasWork --> |No| None["Return NULL"]
Pick --> Done(["Return next context"])
None --> Done
```

**Diagram sources**
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L51-L72)
- [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L6-L18)

Implementation references:
- Local scheduler operations: [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L1-L167)
- Scheduler framework interface: [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L1-L20)
- Schedule context state model: [scontext.h](file://kernel/include/scontext/scontext.h#L12-L20)

**Section sources**
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L51-L72)
- [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L6-L18)
- [scontext.h](file://kernel/include/scontext/scontext.h#L12-L20)

### Kernel Scheduling Loop and Idle Execution
- The kernel initializes per-CPU local schedulers and enters a loop that requests the next context.
- If no context is available, the loop continues; otherwise, it switches to the selected context.
- The idle thread executes when no other work is ready.

```mermaid
sequenceDiagram
participant K as "Kernel Loop<br/>kernel.c"
participant LS as "Local Scheduler<br/>sched_mgr.c"
participant Ctx as "Next Context"
loop Every Tick
K->>LS : schedule()
alt Context available
LS-->>K : schedule_context_s*
K->>Ctx : switch_user_scontext()
else No context
LS-->>K : NULL
K-->>K : continue
end
end
```

**Diagram sources**
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L74-L87)

Implementation references:
- Kernel scheduling loop: [kernel.c](file://kernel/kernel.c#L112-L122)
- System process startup and initial switch: [sysproc.c](file://kernel/sysproc.c#L72-L83)

**Section sources**
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [sysproc.c](file://kernel/sysproc.c#L72-L83)

### Power Management Integration and CPU Idle States
- The power manager interface defines operations for CPU suspend/off/on and system-level actions.
- The PSCI driver probes device tree properties and registers supported operations with the power manager.
- The power manager provides a registration mechanism and a dispatch function for CPU-on requests.

```mermaid
classDiagram
class power_manager_ops {
+get_version()
+cpu_suspend()
+cpu_off()
+cpu_on()
+affinity_info()
+migrate()
+migrate_info_type()
+migrate_info_up_cpu()
+system_off()
+system_reset()
+system_reset2()
+mem_protect()
+mem_protect_check_range()
+features()
+cpu_freeze()
+cpu_default_suspend()
+node_hw_state()
+system_suspend()
+set_suspend_mode()
+stat_residency()
+stat_count()
}
class power_manager_s {
+list
+ops : power_manager_ops
}
class psci_driver {
+probe()
+init()
+register_with_pm()
}
power_manager_s <.. psci_driver : "registered via"
```

**Diagram sources**
- [power_manager.h](file://kernel/include/power_manager.h#L38-L65)
- [psci.c](file://kernel/drivers/arm-psci/psci.c#L154-L222)

Implementation references:
- Power manager API: [power_manager.h](file://kernel/include/power_manager.h#L2-L73)
- PSCI driver registration: [psci.c](file://kernel/drivers/arm-psci/psci.c#L180-L222)
- Boot-time power manager usage: [boot_power_manager.c](file://boot/power_manager.c#L1-L27)

Note: The idle process itself does not directly invoke power management functions in the analyzed code. Instead, it remains a READY context in the scheduler until the kernel loop selects it during idle periods. Power management operations are exposed via the power manager interface and PSCI driver for system-level CPU idle/suspend.

**Section sources**
- [power_manager.h](file://kernel/include/power_manager.h#L2-L73)
- [psci.c](file://kernel/drivers/arm-psci/psci.c#L154-L222)
- [boot_power_manager.c](file://boot/power_manager.c#L1-L27)

## Dependency Analysis
- The system daemon depends on the process manager to create and map binaries, then schedules threads.
- The scheduler depends on the scheduler framework to manage READY contexts.
- The kernel scheduling loop depends on the local scheduler to select the next context.
- Power management is decoupled via the power manager interface; the PSCI driver registers operations independently.

```mermaid
graph LR
Sysd["systemd.c"] --> ProcMgr["process.c"]
ProcMgr --> SchedMgr["sched_mgr.c"]
SchedMgr --> SFW["sched_framework.h"]
KLoop["kernel.c"] --> SchedMgr
KLoop --> SCtx["scontext.h"]
PM["power_manager.h"] --> PSCI["psci.c"]
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L186-L198)
- [process.c](file://kernel/systemd/procmgr/process.c#L150-L174)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L1-L167)
- [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L1-L20)
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [scontext.h](file://kernel/include/scontext/scontext.h#L12-L43)
- [power_manager.h](file://kernel/include/power_manager.h#L2-L73)
- [psci.c](file://kernel/drivers/arm-psci/psci.c#L154-L222)

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L186-L198)
- [process.c](file://kernel/systemd/procmgr/process.c#L150-L174)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L1-L167)
- [sched_framework.h](file://kernel/include/scheduler/sched_framework.h#L1-L20)
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [scontext.h](file://kernel/include/scontext/scontext.h#L12-L43)
- [power_manager.h](file://kernel/include/power_manager.h#L2-L73)
- [psci.c](file://kernel/drivers/arm-psci/psci.c#L154-L222)

## Performance Considerations
- The idle application performs a busy-wait loop with periodic logging. While simple, this keeps the CPU active and prevents deeper idle states. For power-sensitive scenarios, consider:
  - Using sleep or yield primitives to cooperatively hand back control when no work is pending.
  - Integrating with the kernel’s tickless timers or sleep infrastructure to reduce wakeups.
- The scheduler’s selection of idle indicates no higher-priority work; ensuring accurate READY queues avoids unnecessary context switches.
- Power management operations (CPU off/suspend) are handled by the power manager/PSCI; the idle process itself should remain lightweight to minimize overhead.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Idle process not starting:
  - Verify the idle service is declared and per-CPU threads are created: [systemd.c](file://kernel/systemd/systemd.c#L50-L74), [systemd.c](file://kernel/systemd/systemd.c#L186-L198).
  - Confirm the process manager mapped the binary and created threads: [process.c](file://kernel/systemd/procmgr/process.c#L150-L174).
- Idle not running when expected:
  - Check scheduler registration and local scheduler initialization: [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L90-L129).
  - Ensure the kernel scheduling loop is active: [kernel.c](file://kernel/kernel.c#L112-L122).
- Power management integration issues:
  - Confirm the PSCI driver is loaded and registers operations: [psci.c](file://kernel/drivers/arm-psci/psci.c#L180-L222).
  - Validate power manager registration and dispatch: [boot_power_manager.c](file://boot/power_manager.c#L1-L27), [power_manager.h](file://kernel/include/power_manager.h#L2-L73).

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L50-L74)
- [systemd.c](file://kernel/systemd/systemd.c#L186-L198)
- [process.c](file://kernel/systemd/procmgr/process.c#L150-L174)
- [sched_mgr.c](file://kernel/schedule/sched_mgr.c#L90-L129)
- [kernel.c](file://kernel/kernel.c#L112-L122)
- [psci.c](file://kernel/drivers/arm-psci/psci.c#L180-L222)
- [boot_power_manager.c](file://boot/power_manager.c#L1-L27)
- [power_manager.h](file://kernel/include/power_manager.h#L2-L73)

## Conclusion
The Idle Process in TranquilOS is a per-CPU user-space task that becomes the lowest-priority runnable context when no other work is available. It is deployed by the system daemon, scheduled by the kernel’s scheduler framework, and executed within the kernel’s scheduling loop. While the idle process itself does not directly invoke power management, the kernel exposes a power manager interface and PSCI driver for CPU idle and suspend operations. Understanding the idle behavior—its startup sequence, scheduler integration, and relationship to power management—enables effective system monitoring and power optimization.