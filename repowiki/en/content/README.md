# TranquilOS Documentation

This is the English documentation set for TranquilOS, an end-to-end AArch64 microkernel operating system. The current repository is organized around:

- `sys/boot`, `sys/virt`, and `sys/kernel` for boot, optional EL2 virtualization, and the EL1 microkernel;
- `sys/kernel/systemd` and `sys/uapps` for the first EL0 system process and base user-space services;
- `os/base`, `os/framework`, and `os/apps` for the full user-space OS environment;
- `platform/QemuVirt`, `platform/CM4`, `platform/Pi3b`, and `platform/Pi4b` for platform-specific device trees, linker scripts, image builders, and run/flash scripts.

Use **Getting Started** for the shortest build path, **Build System and Configuration** for the GN/Ninja graph, **System Architecture** for the runtime model, and **Platform Support** for QEMU and Raspberry Pi image flows.

Some detailed leaf pages may still describe older source paths. The top-level architecture, build, platform, kernel, capability, service, library, API, and deployment pages have been refreshed against the current `/Users/neo/kernel` tree.
