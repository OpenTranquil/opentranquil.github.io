# Capability-Based Security System

<cite>
**Primary source files**
- [sys/kernel/capability/capability.c](file://sys/kernel/capability/capability.c)
- [sys/kernel/capability/cnode.c](file://sys/kernel/capability/cnode.c)
- [sys/kernel/include/capability/capability.h](file://sys/kernel/include/capability/capability.h)
- [sys/kernel/include/capability/cnode.h](file://sys/kernel/include/capability/cnode.h)
- [sys/ulibs/include/libkernel/capability.h](file://sys/ulibs/include/libkernel/capability.h)
- [sys/ulibs/include/libkernel/capcall.h](file://sys/ulibs/include/libkernel/capcall.h)
</cite>

## Role

Capabilities are the primary protection boundary in TranquilOS. User space does not receive raw kernel-object pointers. It receives capability references stored in CNodes, and the kernel resolves those references, checks the object type and rights, and dispatches the requested method.

The current system includes capabilities for CNode, VSpace, Timer, Futex, IRQ, Event Pool, XContext, SContext, Sysctrl, Self, Console, IPC Endpoint, IPC Endpoint Pool, and Upcall Endpoint. Together they support process construction, address-space control, service calls, event delivery, interrupt delegation, and exception upcalls.

## Structure

```text
User services / applications
  -> sys/ulibs/include/libkernel/capcall.h
  -> syscall / capcall
  -> sys/kernel/capability/capability.c
  -> object implementations
     - cap_cnode.c
     - cap_vspace.c
     - cap_xcontext.c / cap_scontext.c
     - cap_ipc_endpoint.c / cap_ipc_endpoint_pool.c
     - cap_upcall_endpoint.c
     - cap_irq.c / cap_timer.c / cap_futex.c
```

`sys/ulibs/include/libkernel/capability.h` is the main user-space ABI header for capability types, reference encoding, and method semantics. Kernel-side declarations live under `sys/kernel/include/capability`, with implementations under `sys/kernel/capability`.

## CNodes

A CNode is the container for capability slots. A root CNode is created for the root service or process context, and further capabilities can be derived, installed, or extended from there. CNodes provide:

- stable capability references through slot indexes;
- object creation, preparation, extension, copy, and destruction operations;
- the namespace through which rights are propagated.

In TranquilOS, CNodes are the entry point for composing user-space resources. After `SystemDaemon` starts, services and applications receive initial capabilities and use them to construct address spaces, execution contexts, IPC endpoints, and service connections.

## Object Capabilities

| Capability | Main responsibility |
| --- | --- |
| `CNode` | Capability storage, creation, and namespace extension |
| `VSpace` | User address-space mappings and memory-region control |
| `XContext` | Execution context: user registers, entry point, and address-space binding |
| `SContext` | Scheduling context used by scheduler queues and context switches |
| `IPC Endpoint` | Synchronous service calls, replies, and service interfaces |
| `IPC Endpoint Pool` | Endpoint grouping and server-side connection organization |
| `Upcall Endpoint` | Exception, notification, and asynchronous callback delivery |
| `IRQ` | Delegation of hardware interrupts to user-space handlers |
| `Timer` | User-visible timers, timeouts, and wakeups |
| `Futex` / `Event Pool` | User-space synchronization and event aggregation |
| `Sysctrl` / `Self` / `Console` | System control, self-context access, and console access |

## Call Flow

A capability invocation normally follows this path:

1. A user-space library packages the object reference, method number, and arguments.
2. A syscall enters EL1.
3. `capability.c` resolves the reference to a CNode slot.
4. The kernel validates object type, method, rights, and object state.
5. The request is dispatched to the selected `cap_*` implementation.
6. The implementation updates kernel state and returns a result or a new capability reference.

This model lets services pass “what the receiver may do” instead of exposing global identity or raw handles. Least privilege, authority reduction, and service isolation all depend on this layer.

## Maintenance Notes

- ABI changes must update both `sys/ulibs/include/libkernel` and `sys/kernel/include/capability`.
- New capability objects need explicit lifecycle rules, rights, methods, failure semantics, and copyability decisions.
- Capability transfer should account for target CNode ownership and slot capacity.
- IPC, Upcall, IRQ, and Timer capabilities cross scheduling and interrupt paths, so changes should be validated with a full boot test.
