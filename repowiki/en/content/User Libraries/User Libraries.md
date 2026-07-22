# User Libraries

<cite>
**Primary source files**
- [sys/ulibs/BUILD.gn](file://sys/ulibs/BUILD.gn)
- [sys/ulibs/include](file://sys/ulibs/include)
- [sys/ulibs/libsyscall](file://sys/ulibs/libsyscall)
- [sys/ulibs/libsystem](file://sys/ulibs/libsystem)
- [os/libs](file://os/libs)
- [os/thrid_party](file://os/thrid_party)
</cite>

## Role

TranquilOS has two user-library layers. `sys/ulibs` serves system startup, kernel ABI access, and base user programs. `os/libs` serves the full OS environment: graphics, networking, media, and application-level dependencies. The first layer is close to the microkernel ABI; the second is close to the application framework.

## sys/ulibs

`sys/ulibs` is built with `-nostdlib`, `-nostdinc`, and `--no-standard-libraries`, so early user space does not depend on the host standard library. It provides:

| Library | Responsibility |
| --- | --- |
| `libc` | minimal C runtime, string routines, formatted output, entry/exit support |
| `libcrt` | user-space startup and runtime helpers |
| `libalgorithm` | dynamic arrays, FIFO, red-black trees, min-heaps, and other basic containers |
| `libfdt` | Flattened Device Tree parsing |
| `libsync` | atomics, mutexes, and spinlocks |
| `libsyscall` | syscalls and POSIX-style wrappers |
| `libsystem` | wrappers for systemd, IPC, process loading, audio, Bluetooth, WLAN, and related system interfaces |

`sys/ulibs/include/libkernel` is the core user-space ABI layer for kernel objects. It contains capability, capcall, type, and upcall definitions. Kernel capability or syscall changes must be checked against this directory.

## Runtime Groups

[sys/ulibs/BUILD.gn](file://sys/ulibs/BUILD.gn) defines common runtime groups:

- `uapp_runtime`: base `libc_exit` and `uapp_init`.
- `uapp_runtime_with_syscall`: base runtime plus syscall support.
- `uapp_runtime_with_posix`: currently also syscall-based, intended for POSIX-style interfaces.

Base UAPPS and `SystemDaemon` select these groups as needed so early user space remains small and explicit.

## os/libs and Third-Party Code

`os/libs` provides higher-level OS dependencies:

- `libfreetype`: font rendering support.
- `libhttp`: HTTP client and networking helpers.
- `libjson`: JSON parsing wrappers.
- `liblvgl`: LVGL GUI adaptation.
- `liblwip`: lwIP networking adaptation.
- `libmbedtls`: TLS and cryptography support.
- `libminimp3`: MP3 decoding support.
- `libpng`: PNG image support.

Third-party source lives under `os/thrid_party`, including cJSON, freetype, lodepng, lvgl, lwip, mbedtls, minimp3, and musl. The directory name is spelled `thrid_party` in the current repository, so documentation and scripts should use that exact path.

## Maintenance Notes

- ABI header changes must be validated with the kernel, systemd, and base services.
- `sys/ulibs` should avoid large dependencies because it is part of the early boot surface.
- GUI, networking, and media dependencies should live in `os/libs` when possible.
- New libraries should include GN targets, public includes, dependency wiring, and at least one minimal consumer.
