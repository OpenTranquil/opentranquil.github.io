# User Applications and Services

<cite>
**Primary source files**
- [sys/kernel/systemd/BUILD.gn](file://sys/kernel/systemd/BUILD.gn)
- [sys/uapps/BUILD.gn](file://sys/uapps/BUILD.gn)
- [os/BUILD.gn](file://os/BUILD.gn)
- [sys/uapps/core/devmgr](file://sys/uapps/core/devmgr)
- [sys/uapps/core/fsmgr](file://sys/uapps/core/fsmgr)
- [os/base](file://os/base)
- [os/framework](file://os/framework)
- [os/apps](file://os/apps)
</cite>

## Role

Most TranquilOS system behavior is built in user space. The EL1 kernel provides mechanisms such as capabilities, IPC, address spaces, scheduling, and interrupts. EL0 services such as `SystemDaemon`, `Init`, `Devmgr`, `Fsmgr`, `Zygote`, and the OS framework implement process, device, file-system, window, application, input, audio, font, state, and time policies.

The current OS version macros in [os/BUILD.gn](file://os/BUILD.gn) define version `1.8.43`.

## Startup Hierarchy

```text
Kernel
  -> SystemDaemon
     -> Init
     -> Devmgr
     -> Fsmgr
     -> Idle
     -> Zygote
        -> framework services
        -> SystemUI
        -> applications
```

`SystemDaemon` lives under `sys/kernel/systemd`, but it is the first EL0 system process. It includes memory management, process management, virtual memory management, IPC management, name service, ramdisk loading, and capability helper modules. Its IPC and name-service wrappers are generated from IDL files during the GN build.

## Base User Programs

[sys/uapps/BUILD.gn](file://sys/uapps/BUILD.gn) currently builds four base targets:

| Target | Path | Responsibility |
| --- | --- | --- |
| `Idle` | `sys/uapps/base/idle` | idle process and scheduling fallback |
| `Init` | `sys/uapps/base/init` | early user-space initialization |
| `Devmgr` | `sys/uapps/core/devmgr` | device management and device service exposure |
| `Fsmgr` | `sys/uapps/core/fsmgr` | file-system management, sessions, fd table, VFS, rootfs, sysfs, and procfs foundations |

These targets are placed into the ramdisk or system image by platform scripts, depending on boot requirements.

## OS Base and Framework Services

`os/BUILD.gn` builds the complete user-space environment on top of the base UAPPS:

- `os/base/zygote`: process/application spawning base.
- `os/base/netmgr`: network management.
- `os/base/btmgr`: Bluetooth management.
- `os/framework/appmgr`: application lifecycle and bundle management.
- `os/framework/windowmgr`: windows, composition, and display organization.
- `os/framework/audiomgr`: audio service.
- `os/framework/fontmgr`: font service.
- `os/framework/mmimgr`: multimodal input management.
- `os/framework/statemgr`: system state service.
- `os/framework/timemgr`: time service.
- `os/framework/agentmgr`: agent management.

System UI and application targets include BootAnimation, Status, Nav, Lock, Launcher, Cursor, Overlay, and AI, Calendar, Calculator, Clock, Files, Memo, Monitor, Music, Nes, Settings, and Whiteboard.

## Service Communication

Services communicate through IPC, capabilities, and generated IDL wrappers. `SystemDaemon` provides initial resources and name service; other services discover endpoints through the name service and establish explicit call relationships. This reduces global shared state and allows authority to be passed by endpoint and capability.

## Maintenance Notes

- New system services should declare dependencies in `os/BUILD.gn` or `sys/uapps/BUILD.gn`.
- Early-boot services belong in the ramdisk or boot-image scripts; normal applications belong in the system image.
- IDL changes should be checked against the generated wrappers produced by `tools/idl_gen_action.py`.
- New cross-service authority transfer should review CNode rights, endpoint ownership, and failure recovery.
