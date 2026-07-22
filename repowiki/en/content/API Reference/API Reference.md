# API Reference

<cite>
**Primary source files**
- [sys/kernel/include](file://sys/kernel/include)
- [sys/ulibs/include/libkernel](file://sys/ulibs/include/libkernel)
- [sys/ulibs/include/libsyscall](file://sys/ulibs/include/libsyscall)
- [sys/ulibs/include/libsystem](file://sys/ulibs/include/libsystem)
- [sys/kernel/systemd/service/idl](file://sys/kernel/systemd/service/idl)
- [sys/kernel/systemd/ipcmgr/idl](file://sys/kernel/systemd/ipcmgr/idl)
- [os/framework](file://os/framework)
- [os/base](file://os/base)
</cite>

## Scope

TranquilOS APIs are layered rather than represented by a single libc surface:

1. Kernel-internal APIs in `sys/kernel/include`.
2. Kernel/user ABI in `sys/ulibs/include/libkernel`.
3. Syscall and system-service wrappers in `libsyscall`, `libsystem`, and generated SystemDaemon IDL wrappers.
4. OS framework APIs in `os/base`, `os/framework`, and application/service public headers.

Always identify which layer a call belongs to. Exposing kernel-internal structures to applications breaks the microkernel boundary; using high-level framework APIs in early boot programs brings unnecessary dependencies.

## Kernel-Internal APIs

`sys/kernel/include` contains interfaces used by kernel modules:

- `arch/generic` and `arch/arm64`: CPU, MMU, TLB, cache, exception, interrupt, and context-switch abstractions.
- `capability`: kernel-side capability object declarations.
- `mm`: pages, memory nodes, zones, address spaces, sparse memory, and allocators.
- `ipc`, `upcall`, `event`, `futex`: communication and synchronization primitives.
- `interrupt`, `timer`, `device`: hardware events, timers, device tree, and device registration.
- `scheduler`, `scontext`, `xcontext`: scheduling and execution contexts.

These APIs are for kernel implementation and should not be included directly by normal user programs.

## libkernel ABI

`sys/ulibs/include/libkernel` is the user-space ABI boundary for microkernel objects:

- `capability.h`: capability types, reference encoding, and object methods.
- `capcall.h`: capability invocation wrappers.
- `types.h`: kernel ABI types.
- `upcall.h`: user-space upcall definitions.

Changes here should be checked against `sys/kernel/capability`, `sys/kernel/syscall`, `sys/kernel/upcall`, and all affected user-space services.

## Syscall and POSIX-Style APIs

`sys/ulibs/include/libsyscall` provides syscall wrappers and a subset of POSIX-style interfaces:

- `syscall.h` / `syscall_nr.h`: syscall entry and numbering.
- `posix/unistd.h`, `fcntl.h`, `dirent.h`, `libposix.h`: compatibility interfaces for user programs and base services.

These APIs are suitable for file, directory, process, and basic I/O semantics, but the underlying authority is still governed by capabilities and service endpoints.

## libsystem and Service APIs

`sys/ulibs/include/libsystem` provides clients for system services such as IPC, systemd, process loading, audio, Bluetooth, and WLAN. SystemDaemon IPC and name-service interfaces are defined under `sys/kernel/systemd/*/idl` and generated during the build by `tools/idl_gen_action.py`.

Framework service APIs live under:

- `os/base/*/include`
- `os/framework/*/include`
- public headers in `os/apps/*` where an application or UI component exposes an interface

## Change Rules

- New syscall: update numbering, kernel implementation, user wrapper, and a test or minimal caller.
- New capability method: update `libkernel` ABI, kernel dispatch, rights checks, and documentation.
- New service IPC: update IDL, verify generated wrappers, and wire server registration plus client calls.
- New framework client: keep include paths, GN public configs, and service naming consistent.
