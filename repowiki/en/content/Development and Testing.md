# Development and Testing

<cite>
**Primary source files**
- [run_qemu_virt.sh](file://run_qemu_virt.sh)
- [platform/QemuVirt/scripts/build.sh](file://platform/QemuVirt/scripts/build.sh)
- [platform/QemuVirt/scripts/run.sh](file://platform/QemuVirt/scripts/run.sh)
- [tools/idl_gen.py](file://tools/idl_gen.py)
- [tools/idl_gen_action.py](file://tools/idl_gen_action.py)
- [tools/tests/test_idl_gen.py](file://tools/tests/test_idl_gen.py)
</cite>

## Environment

The project uses GN/Ninja for builds, an AArch64 ELF toolchain for bare-metal and user-space ELF outputs, and QEMU for local virtual-platform execution. On macOS, image scripts also depend on `e2fsprogs`; the current scripts expect `mke2fs` under `/opt/homebrew/opt/e2fsprogs/sbin/mke2fs`.

Recommended tools:

- `gn`, `ninja`
- AArch64 ELF toolchain and `objcopy`
- `qemu-system-aarch64`
- `e2fsprogs`
- Python 3 for IDL generation and tests

## Common Build Flow

The recommended QEMU Virt entry point is:

```bash
./run_qemu_virt.sh
```

It runs:

1. `platform/QemuVirt/scripts/build.sh`
2. `make_boot_img.sh`
3. `make_system_img.sh`
4. `make_user_img.sh`
5. `make_all_img.sh`
6. `run.sh`

For build-only work:

```bash
gn gen out --args="platform=\"QemuVirt\""
ninja -C out
```

## QEMU Debug Options

`platform/QemuVirt/scripts/run.sh` starts `qemu-system-aarch64` with the `virt` machine, GICv2, HVF acceleration, 4 cores, 2 GB memory, virtio block, ramfb, and configurable serial/monitor/display backends.

Supported environment variables:

- `QEMU_DISPLAY_BACKEND`
- `QEMU_SERIAL_BACKEND`
- `QEMU_MONITOR_BACKEND`

These allow switching between GUI execution, serial logging, monitor debugging, and headless modes.

## IDL Tooling

`tools/idl_gen.py` and `tools/idl_gen_action.py` generate IPC wrappers. `SystemDaemon` uses GN actions to generate wrappers for systemd IPC and name service IPC.

The test entry point is:

```bash
python3 tools/tests/test_idl_gen.py
```

Run this test before a full system build when changing IDL syntax or generator behavior.

## Debugging Checklist

- Early boot failures: inspect serial output, PL011 console setup, and boot-image offsets.
- Kernel exceptions: inspect `sys/kernel/exception`, `arch/arm64/exception.c`, coredump, and backtrace output.
- IPC or service failures: inspect generated IDL wrappers, name service registration, and endpoint capability transfer.
- Image failures: inspect `out/boot.img`, `out/system.img`, `out/user.img`, and the final raw image partition layout.
- CM4 flashing failures: first confirm `rpiboot`, then confirm the newly detected external disk before writing.

## Suggested Validation Order

1. `gn gen` and `ninja -C out` pass.
2. QEMU Virt reaches SystemDaemon and base services.
3. Framework services and SystemUI start from the system image.
4. Platform or driver changes are validated on the relevant Pi/CM4 target.
