# Capability 系统

<cite>
**本文依据的主要源码**
- [sys/kernel/capability/capability.c](file://sys/kernel/capability/capability.c)
- [sys/kernel/capability/cnode.c](file://sys/kernel/capability/cnode.c)
- [sys/kernel/include/capability/capability.h](file://sys/kernel/include/capability/capability.h)
- [sys/kernel/include/capability/cnode.h](file://sys/kernel/include/capability/cnode.h)
- [sys/ulibs/include/libkernel/capability.h](file://sys/ulibs/include/libkernel/capability.h)
- [sys/ulibs/include/libkernel/capcall.h](file://sys/ulibs/include/libkernel/capcall.h)
</cite>

## 定位

Capability 是 TranquilOS 微内核的核心安全边界。用户态不直接持有内核对象地址，而是通过 CNode 中的 capability reference 发起受控调用。每个引用都对应一个对象类型、一组权限和一个对象实例，内核根据类型与方法号进行分发。

当前实现覆盖 CNode、VSpace、Timer、Futex、IRQ、Event Pool、XContext、SContext、Sysctrl、Self、Console、IPC Endpoint、IPC Endpoint Pool 和 Upcall Endpoint 等对象能力。这些对象共同支撑进程构造、地址空间管理、服务调用、事件通知、中断授权和异常回传。

## 结构

```text
用户态服务 / 应用
  -> sys/ulibs/include/libkernel/capcall.h
  -> syscall / capcall
  -> sys/kernel/capability/capability.c
  -> 具体对象实现
     - cap_cnode.c
     - cap_vspace.c
     - cap_xcontext.c / cap_scontext.c
     - cap_ipc_endpoint.c / cap_ipc_endpoint_pool.c
     - cap_upcall_endpoint.c
     - cap_irq.c / cap_timer.c / cap_futex.c
```

`sys/ulibs/include/libkernel/capability.h` 是用户态 ABI 的关键头文件，定义了 capability 类型、引用编码和方法语义。内核侧头文件位于 `sys/kernel/include/capability`，实现位于 `sys/kernel/capability`。

## CNode

CNode 是能力槽位容器。根 CNode 通常随系统根服务或进程上下文创建，之后可以继续扩展或派生能力。CNode 的职责包括：

- 保存 capability slot，并以 `capability_ref` 形式提供稳定引用。
- 创建、复制、准备、扩展或销毁能力槽位。
- 作为权限传播和对象引用的基本命名空间。

在 TranquilOS 中，CNode 不只是一个表结构，它也是系统资源组合的入口：`SystemDaemon` 初始化后，后续服务与应用通过 CNode 接收初始能力，再创建自己的地址空间、执行上下文、IPC 端点和服务连接。

## 对象能力

| 能力对象 | 主要作用 |
| --- | --- |
| `CNode` | 能力容器、能力创建与命名空间扩展 |
| `VSpace` | 用户地址空间、页映射和内存区域控制 |
| `XContext` | 执行上下文，描述用户态寄存器、入口和地址空间关系 |
| `SContext` | 调度上下文，参与调度队列和上下文切换 |
| `IPC Endpoint` | 同步 IPC 调用、回复和服务接口承载 |
| `IPC Endpoint Pool` | 批量端点管理和服务端连接组织 |
| `Upcall Endpoint` | 异常、通知和异步回调投递 |
| `IRQ` | 将硬件中断授权给用户态处理逻辑 |
| `Timer` | 用户态定时器、超时和唤醒 |
| `Futex` / `Event Pool` | 用户态同步与事件聚合基础设施 |
| `Sysctrl` / `Self` / `Console` | 系统控制、自身上下文访问和控制台能力 |

## 调用流程

一次 capability 调用通常经过以下步骤：

1. 用户态库封装对象引用、方法号和参数。
2. 系统调用入口进入 EL1。
3. `capability.c` 解析引用，定位 CNode slot。
4. 内核检查对象类型、方法、权限和对象状态。
5. 分发到具体 `cap_*` 实现。
6. 对象实现更新内核状态，并把结果或新 capability reference 返回用户态。

这种模型使系统服务可以传递“可做什么”的能力，而不是传递全局身份或裸资源句柄。权限收敛、最小授权和服务隔离都建立在这一机制上。

## 开发注意事项

- ABI 变更必须同步修改 `sys/ulibs/include/libkernel` 与内核侧 `sys/kernel/include/capability`。
- 新增对象时，应明确对象生命周期、权限位、可调用方法、失败语义和是否可复制。
- 能力传递必须考虑目标 CNode 的所有权和槽位容量，避免把高权限对象泄漏给非预期服务。
- IPC、Upcall、IRQ、Timer 这类能力往往跨越调度和中断路径，修改后需要进行端到端启动验证。
