# API 参考文档

<cite>
**本文依据的主要源码**
- [sys/kernel/include](file://sys/kernel/include)
- [sys/ulibs/include/libkernel](file://sys/ulibs/include/libkernel)
- [sys/ulibs/include/libsyscall](file://sys/ulibs/include/libsyscall)
- [sys/ulibs/include/libsystem](file://sys/ulibs/include/libsystem)
- [sys/kernel/systemd/service/idl](file://sys/kernel/systemd/service/idl)
- [sys/kernel/systemd/ipcmgr/idl](file://sys/kernel/systemd/ipcmgr/idl)
- [os/framework](file://os/framework)
- [os/base](file://os/base)
</cite>

## 范围

TranquilOS 的 API 不是单一 libc 接口，而是由四层组成：

1. 内核内部 API：`sys/kernel/include`，面向内核模块、驱动和对象实现。
2. 内核用户态 ABI：`sys/ulibs/include/libkernel`，面向 capability、capcall、upcall 和基础类型。
3. 系统调用与系统服务封装：`libsyscall`、`libsystem` 和 SystemDaemon IDL wrapper。
4. OS framework API：`os/base`、`os/framework` 和 `os/apps` 中各服务的 client/public include。

阅读 API 时应先确认目标调用发生在哪一层。把内核内部结构直接暴露给应用会破坏微内核边界；把高层 framework API 用于早期启动程序也会引入不必要依赖。

## 内核内部 API

`sys/kernel/include` 包含内核模块间接口：

- `arch/generic` 与 `arch/arm64`：CPU、MMU、TLB、cache、异常、中断和上下文切换抽象。
- `capability`：内核侧能力对象声明。
- `mm`：页、内存节点、内存区域、地址空间、稀疏内存和页分配器。
- `ipc`、`upcall`、`event`、`futex`：通信与同步机制。
- `interrupt`、`timer`、`device`：硬件事件、定时器和设备树/设备注册。
- `scheduler`、`scontext`、`xcontext`：调度与执行上下文。

这些 API 面向内核实现，不应直接被普通用户态程序包含。

## libkernel ABI

`sys/ulibs/include/libkernel` 是用户态访问微内核对象的 ABI 边界：

- `capability.h`：capability 类型、引用编码、对象方法。
- `capcall.h`：capability 调用入口封装。
- `types.h`：内核 ABI 类型定义。
- `upcall.h`：用户态 upcall 相关定义。

修改这些头文件时，需要同步检查 `sys/kernel/capability`、`sys/kernel/syscall`、`sys/kernel/upcall` 和相关用户态服务。

## syscall 与 POSIX 风格接口

`sys/ulibs/include/libsyscall` 提供系统调用封装和部分 POSIX 风格接口：

- `syscall.h` / `syscall_nr.h`：系统调用入口与编号。
- `posix/unistd.h`、`fcntl.h`、`dirent.h`、`libposix.h`：面向应用和基础服务的兼容接口。

这些接口适合需要文件、目录、进程或基础 I/O 语义的用户态程序，但底层仍受 Capability 和服务端点约束。

## libsystem 与服务 API

`sys/ulibs/include/libsystem` 提供系统服务客户端封装，例如 IPC、systemd client、process loader、audio、bluetooth、wlan 等。SystemDaemon 的 IPC 和 name service 接口来自 `sys/kernel/systemd/*/idl`，由 `tools/idl_gen_action.py` 在构建中生成 wrapper。

OS framework 的服务 API 分布在：

- `os/base/*/include`
- `os/framework/*/include`
- `os/apps/*` 中的应用或 UI 组件公开头文件

## 变更规范

- 新增系统调用：更新编号、内核实现、用户态封装、测试或最小调用方。
- 新增 capability 方法：更新 `libkernel` ABI、内核分发、权限检查和文档。
- 新增服务 IPC：更新 IDL，确认生成 wrapper，补齐服务端注册和客户端调用。
- 新增 framework client：保持 include 路径、GN public config 和服务命名一致。
