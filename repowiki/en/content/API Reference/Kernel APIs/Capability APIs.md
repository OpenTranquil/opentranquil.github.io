# Capability APIs

<cite>
**Referenced Files in This Document**
- [capability.h](file://kernel/include/capability/capability.h)
- [capability.c](file://kernel/capability/capability.c)
- [cnode.h](file://kernel/include/capability/cnode.h)
- [cnode.c](file://kernel/capability/cnode.c)
- [cap_cnode.c](file://kernel/capability/cap_cnode.c)
- [capability.h](file://ulibs/include/libkernel/capability.h)
- [cap_xcontext.c](file://kernel/capability/cap_xcontext.c)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c)
- [cap_vspace.c](file://kernel/capability/cap_vspace.c)
- [cap_ipc_endpoint.c](file://kernel/capability/cap_ipc_endpoint.c)
- [cap_upcall_endpoint.c](file://kernel/capability/cap_upcall_endpoint.c)
- [cap_ipc_endpoint.h](file://kernel/include/capability/cap_ipc_endpoint.h)
- [cap_upcall_endpoint.h](file://kernel/include/capability/cap_upcall_endpoint.h)
- [cap_console.h](file://kernel/include/capability/cap_console.h)
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
This document describes the capability-based security system of the TranquilOS kernel. It focuses on capability header structure, capability creation and destruction mechanisms, CNode management APIs, capability dispatch, rights management, permission checks, validation processes, and practical examples of capability-based IPC and capability passing between processes. It also covers capability object types, capability inheritance via capability references, and security boundary enforcement.

## Project Structure
The capability subsystem spans kernel headers, capability dispatchers, and capability-specific implementations. The userland library defines capability object types and method enumerations used by applications to invoke kernel capabilities.

```mermaid
graph TB
subgraph "Kernel Headers"
KH1["capability.h"]
KH2["cnode.h"]
KH3["cap_ipc_endpoint.h"]
KH4["cap_upcall_endpoint.h"]
KH5["cap_console.h"]
end
subgraph "Kernel Implementation"
KI1["capability.c"]
KI2["cnode.c"]
KI3["cap_cnode.c"]
KI4["cap_xcontext.c"]
KI5["cap_scontext.c"]
KI6["cap_vspace.c"]
KI7["cap_ipc_endpoint.c"]
KI8["cap_upcall_endpoint.c"]
end
subgraph "User Library"
UL1["libkernel/capability.h"]
end
UL1 --> KH1
UL1 --> KH2
UL1 --> KH3
UL1 --> KH4
UL1 --> KH5
KH1 --> KI1
KH2 --> KI2
KH2 --> KI3
KH1 --> KI4
KH1 --> KI5
KH1 --> KI6
KH1 --> KI7
KH1 --> KI8
```

**Diagram sources**
- [capability.h](file://kernel/include/capability/capability.h#L1-L26)
- [capability.c](file://kernel/capability/capability.c#L1-L58)
- [cnode.h](file://kernel/include/capability/cnode.h#L1-L29)
- [cnode.c](file://kernel/capability/cnode.c#L1-L95)
- [cap_cnode.c](file://kernel/capability/cap_cnode.c#L1-L184)
- [capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)
- [cap_xcontext.c](file://kernel/capability/cap_xcontext.c#L1-L68)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c#L1-L462)
- [cap_vspace.c](file://kernel/capability/cap_vspace.c#L1-L243)
- [cap_ipc_endpoint.c](file://kernel/capability/cap_ipc_endpoint.c#L1-L145)
- [cap_upcall_endpoint.c](file://kernel/capability/cap_upcall_endpoint.c#L1-L110)
- [cap_ipc_endpoint.h](file://kernel/include/capability/cap_ipc_endpoint.h#L1-L12)
- [cap_upcall_endpoint.h](file://kernel/include/capability/cap_upcall_endpoint.h#L1-L12)
- [cap_console.h](file://kernel/include/capability/cap_console.h#L1-L12)

**Section sources**
- [capability.h](file://kernel/include/capability/capability.h#L1-L26)
- [capability.c](file://kernel/capability/capability.c#L1-L58)
- [cnode.h](file://kernel/include/capability/cnode.h#L1-L29)
- [cnode.c](file://kernel/capability/cnode.c#L1-L95)
- [capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)

## Core Components
- Capability header and structure
  - The capability header encodes object type, rights bitmap, and reserved bits. The capability object embeds the header plus a physical address pointing to the kernel object instance.
  - Rights constants are defined for convenience.

- Capability dispatch mechanism
  - The dispatcher decodes the capability call number to extract capability type and method, then routes to the appropriate capability’s dispatch routine. Permission checks are currently marked as TODO.

- CNode (capability node)
  - A capability container backed by a dynamic array of slots. It supports initialization, extension, creating typed capabilities, and retrieving capabilities by index.

- Capability object types and methods
  - The user library enumerates kernel object types and capability methods for each object type (e.g., CNode, XContext, SContext, VSpace, IPC endpoint, upcall endpoint, Console).

**Section sources**
- [capability.h](file://kernel/include/capability/capability.h#L9-L21)
- [capability.c](file://kernel/capability/capability.c#L14-L58)
- [cnode.h](file://kernel/include/capability/cnode.h#L11-L14)
- [cnode.c](file://kernel/capability/cnode.c#L9-L95)
- [capability.h](file://ulibs/include/libkernel/capability.h#L6-L18)
- [capability.h](file://ulibs/include/libkernel/capability.h#L52-L139)

## Architecture Overview
The capability system organizes kernel resources into typed capabilities stored in CNodes. Processes own a root CNode and can create child CNodes and typed capabilities. Capabilities carry rights and point to kernel objects. Dispatch routes capability calls to specialized handlers.

```mermaid
sequenceDiagram
participant U as "User App"
participant UL as "libkernel/capability.h"
participant KDISP as "capability.c : cap_call_dispatch"
participant KCN as "cap_cnode.c"
participant KV as "cap_vspace.c"
participant KSC as "cap_scontext.c"
participant KXC as "cap_xcontext.c"
participant KIPC as "cap_ipc_endpoint.c"
participant KUC as "cap_upcall_endpoint.c"
U->>UL : "Invoke capability call with capability reference and method"
UL-->>KDISP : "Encoded capability call number"
KDISP->>KDISP : "Decode cap type and method"
alt "CNode"
KDISP->>KCN : "cap_CNode_dispatch(method)"
else "VSpace"
KDISP->>KV : "cap_VSpace_dispatch(method)"
else "SContext"
KDISP->>KSC : "cap_SContext_dispatch(method)"
else "XContext"
KDISP->>KXC : "cap_XContext_dispatch(method)"
else "IPC endpoint"
KDISP->>KIPC : "cap_IpcEndPoint_dispatch(method)"
else "Upcall endpoint"
KDISP->>KUC : "cap_UpcallEndPoint_dispatch(method)"
end
KDISP-->>U : "Return value via cap_call_return"
```

**Diagram sources**
- [capability.c](file://kernel/capability/capability.c#L14-L58)
- [cap_cnode.c](file://kernel/capability/cap_cnode.c#L163-L184)
- [cap_vspace.c](file://kernel/capability/cap_vspace.c#L213-L243)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c#L420-L462)
- [cap_xcontext.c](file://kernel/capability/cap_xcontext.c#L53-L68)
- [cap_ipc_endpoint.c](file://kernel/capability/cap_ipc_endpoint.c#L124-L145)
- [cap_upcall_endpoint.c](file://kernel/capability/cap_upcall_endpoint.c#L92-L110)

## Detailed Component Analysis

### Capability Header and Dispatch
- Capability header layout
  - Fields: type (8 bits), rights (32 bits), reserved (24 bits). Packed to minimize footprint.
- Dispatch logic
  - Extracts capability type and method from the capability call number.
  - Routes to the corresponding capability handler.
  - Returns values via a dedicated return helper.

```mermaid
flowchart TD
Start(["Dispatch Entry"]) --> Decode["Decode cap type and method"]
Decode --> Route{"Type switch"}
Route --> |CNode| CNode["cap_CNode_dispatch"]
Route --> |VSpace| VSpace["cap_VSpace_dispatch"]
Route --> |SContext| SContext["cap_SContext_dispatch"]
Route --> |XContext| XContext["cap_XContext_dispatch"]
Route --> |IPC| IPC["cap_IpcEndPoint_dispatch"]
Route --> |Upcall| Upcall["cap_UpcallEndPoint_dispatch"]
CNode --> Ret["cap_call_return"]
VSpace --> Ret
SContext --> Ret
XContext --> Ret
IPC --> Ret
Upcall --> Ret
Ret --> End(["Exit"])
```

**Diagram sources**
- [capability.c](file://kernel/capability/capability.c#L14-L58)

**Section sources**
- [capability.h](file://kernel/include/capability/capability.h#L9-L21)
- [capability.c](file://kernel/capability/capability.c#L14-L58)

### CNode Management APIs
- Initialization and extension
  - Initialize a CNode with an ID and backing storage.
  - Extend capacity by allocating and attaching pages.
- Creating typed capabilities
  - Allocate a capability slot, fill header (type, rights, physical address), and return a capability reference.
- Retrieving capabilities
  - Resolve a capability reference to a capability pointer within a CNode.
- Resolving target CNodes
  - Given a CNode reference, locate the target CNode capability and dereference its physical address.

```mermaid
flowchart TD
A["cnode_new_cap(node,type,rights,paddr)"] --> B["Ensure block allocated"]
B --> C{"Free slots available?"}
C --> |No| D["Allocate page and extend"]
D --> C
C --> |Yes| E["Insert capability into slot"]
E --> F["Return capability_ref"]
```

**Diagram sources**
- [cnode.c](file://kernel/capability/cnode.c#L23-L59)

**Section sources**
- [cnode.h](file://kernel/include/capability/cnode.h#L11-L26)
- [cnode.c](file://kernel/capability/cnode.c#L9-L95)

### Capability Creation and Destruction Functions
- CNode
  - Create: allocate and initialize a new CNode.
  - NewCapability: create a typed capability in a target CNode with given rights and physical address.
  - Prepare: initialize a target CNode with a provided page.
  - Extend: attach additional pages to a target CNode.
  - Destroy: placeholder for cleanup.
- XContext
  - Create: allocate and initialize an executable context.
  - Init: bind entry, stack pointer, and capability references to initialize the context.
  - Destroy: placeholder for cleanup.
- SContext
  - Create: allocate and initialize a scheduling context.
  - SetCNode/SetCNodeCurrent: bind a CNode to the scheduling context.
  - SetXContext/SetVSpace/SetVSpaceCurrent: bind executable and virtual address space contexts.
  - SetUpcall: bind an upcall endpoint.
  - Schedule/ScheduleOn: add to scheduler with optional affinity.
  - SetName/SetPid: configure metadata.
  - Destroy: placeholder for cleanup.
- VSpace
  - Create: allocate and initialize a virtual address space.
  - Prepare: prepare a page table for the address space.
  - TryMapPage/TryMapRange: map physical pages into the address space.
  - UnMapPage/UnMapRange: unmap pages from the address space.
  - Extend: extend the address space with a new page table page.
  - Destroy: placeholder for cleanup.
- IPC Endpoint
  - Create: allocate and initialize an IPC endpoint.
  - Init: bind an SContext and XContext to the endpoint.
  - Call: forward a capability call to the endpoint.
  - Reply: return a result to the caller.
  - Destroy: placeholder for cleanup.
- Upcall Endpoint
  - Create: allocate and initialize an upcall endpoint.
  - Init: bind an SContext and XContext to the endpoint.
  - Reply: return a result to the upcaller.
  - Destroy: placeholder for cleanup.

```mermaid
classDiagram
class CapabilityHeader {
+uint8 type
+uint32 rights
+uint32 reserved
}
class Capability {
+CapabilityHeader header
+uint64 physical_addr
}
class CNode {
+uint64 id
+DirectoryArray cap_slots
+init(id, addr)
+extend(page)
+new_cap(type, rights, paddr) CapabilityRef
+get_cap(slot) Capability*
+get(sctx, cnode_ref) CNode*
}
class CapabilityRef {
+uint32 slot_idx
+uint32 cnode_id
+uint64 val
}
Capability --> CapabilityHeader : "contains"
CNode --> Capability : "stores"
CapabilityRef --> CNode : "references"
```

**Diagram sources**
- [capability.h](file://kernel/include/capability/capability.h#L11-L21)
- [cnode.h](file://kernel/include/capability/cnode.h#L11-L14)
- [cnode.c](file://kernel/capability/cnode.c#L23-L64)

**Section sources**
- [cap_cnode.c](file://kernel/capability/cap_cnode.c#L13-L184)
- [cap_xcontext.c](file://kernel/capability/cap_xcontext.c#L9-L68)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c#L12-L462)
- [cap_vspace.c](file://kernel/capability/cap_vspace.c#L8-L243)
- [cap_ipc_endpoint.c](file://kernel/capability/cap_ipc_endpoint.c#L9-L145)
- [cap_upcall_endpoint.c](file://kernel/capability/cap_upcall_endpoint.c#L12-L110)

### Capability Rights Management and Validation
- Rights model
  - Each capability carries a rights bitmap. Rights constants are defined per capability type in kernel headers.
- Validation and permission checks
  - Capability dispatch currently contains a TODO for permission checks. Handlers validate capability types and dereference physical addresses before operating on kernel objects.

```mermaid
flowchart TD
Start(["Capability Call"]) --> CheckRights["Check caller's rights against capability rights"]
CheckRights --> TypeCheck["Validate capability type"]
TypeCheck --> AddrCheck["Resolve physical address and validate non-null"]
AddrCheck --> Operate["Perform operation"]
Operate --> Return["cap_call_return(value)"]
```

**Diagram sources**
- [capability.c](file://kernel/capability/capability.c#L20-L21)
- [cap_ipc_endpoint.h](file://kernel/include/capability/cap_ipc_endpoint.h#L7-L8)
- [cap_upcall_endpoint.h](file://kernel/include/capability/cap_upcall_endpoint.h#L7-L8)
- [cap_console.h](file://kernel/include/capability/cap_console.h#L7-L8)

**Section sources**
- [capability.c](file://kernel/capability/capability.c#L20-L21)
- [cap_ipc_endpoint.h](file://kernel/include/capability/cap_ipc_endpoint.h#L7-L8)
- [cap_upcall_endpoint.h](file://kernel/include/capability/cap_upcall_endpoint.h#L7-L8)
- [cap_console.h](file://kernel/include/capability/cap_console.h#L7-L8)

### Capability Passing Between Processes
- Capability references
  - A capability reference encodes the target CNode ID and slot index. The special constant indicates the current CNode.
- Passing semantics
  - To pass a capability to another process, create a typed capability in the sender’s CNode and share the capability reference. The receiver resolves the reference to access the capability.

```mermaid
sequenceDiagram
participant Sender as "Sender Process"
participant S_CNode as "Sender CNode"
participant Kernel as "Kernel"
participant Receiver as "Receiver Process"
participant R_CNode as "Receiver CNode"
Sender->>S_CNode : "Create typed capability (type, rights, paddr)"
S_CNode-->>Sender : "capability_ref"
Sender->>Kernel : "Share capability_ref with Receiver"
Receiver->>R_CNode : "Resolve capability_ref"
R_CNode-->>Receiver : "capability pointer"
```

**Diagram sources**
- [capability.h](file://ulibs/include/libkernel/capability.h#L4-L50)
- [cnode.c](file://kernel/capability/cnode.c#L66-L90)

**Section sources**
- [capability.h](file://ulibs/include/libkernel/capability.h#L4-L50)
- [cnode.c](file://kernel/capability/cnode.c#L66-L90)

### Capability-Based IPC Examples
- Endpoint setup
  - Create an IPC endpoint capability and initialize it with an SContext and XContext.
- Invocation
  - Call the endpoint with a capability reference and method; the kernel forwards the call to the endpoint handler.
- Reply
  - Return a result via the endpoint’s reply mechanism.

```mermaid
sequenceDiagram
participant P1 as "Process 1"
participant EP1 as "IPC Endpoint (P1)"
participant K as "Kernel"
participant P2 as "Process 2"
participant EP2 as "IPC Endpoint (P2)"
P1->>EP1 : "Init(endpoint, sctx, xctx)"
P2->>EP2 : "Init(endpoint, sctx, xctx)"
P1->>K : "Call(endpoint_ref, method)"
K->>EP2 : "Forward call"
EP2-->>K : "Operation result"
K-->>P1 : "Reply(result)"
```

**Diagram sources**
- [cap_ipc_endpoint.c](file://kernel/capability/cap_ipc_endpoint.c#L16-L104)

**Section sources**
- [cap_ipc_endpoint.c](file://kernel/capability/cap_ipc_endpoint.c#L16-L104)

### Capability Inheritance and Security Boundaries
- Inheritance via CNodes
  - Child CNodes inherit capabilities from parent CNodes. Capability references encode the originating CNode ID, enabling secure delegation.
- Security boundaries
  - Handlers validate capability types and dereference physical addresses. Permission checks are TODO and should enforce rights before operations.

```mermaid
graph TB
Root["Root CNode"] --> Child1["Child CNode A"]
Root --> Child2["Child CNode B"]
Child1 --> CapA["Typed Capability A"]
Child2 --> CapB["Typed Capability B"]
CapA --> ObjA["Kernel Object A"]
CapB --> ObjB["Kernel Object B"]
```

**Diagram sources**
- [cnode.c](file://kernel/capability/cnode.c#L66-L90)
- [capability.c](file://kernel/capability/capability.c#L20-L21)

**Section sources**
- [cnode.c](file://kernel/capability/cnode.c#L66-L90)
- [capability.c](file://kernel/capability/capability.c#L20-L21)

## Dependency Analysis
The capability subsystem exhibits clear layering:
- User library defines object types and method enums.
- Kernel headers define capability structures and rights.
- Kernel implementations implement dispatch and capability-specific logic.
- Capability references bridge userland and kernel.

```mermaid
graph LR
UL["libkernel/capability.h"] --> KH["kernel/include/capability/*.h"]
KH --> KC["kernel/capability/*.c"]
KC --> KO["Kernel Objects (VSpace, SContext, XContext, IPC, Upcall, CNode)"]
```

**Diagram sources**
- [capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)
- [capability.h](file://kernel/include/capability/capability.h#L1-L26)
- [capability.c](file://kernel/capability/capability.c#L1-L58)
- [cnode.c](file://kernel/capability/cnode.c#L1-L95)

**Section sources**
- [capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)
- [capability.h](file://kernel/include/capability/capability.h#L1-L26)
- [capability.c](file://kernel/capability/capability.c#L1-L58)
- [cnode.c](file://kernel/capability/cnode.c#L1-L95)

## Performance Considerations
- Slot allocation and extension
  - Extending CNodes allocates pages; batching allocations and reusing pages can reduce overhead.
- Capability lookup
  - Capability references are compact; resolving references is O(1) per slot.
- Dispatch overhead
  - Dispatch is a simple switch; keep method counts minimal to maintain branch predictability.

## Troubleshooting Guide
- Unknown capability type
  - The dispatcher logs an error when encountering an unsupported capability type.
- Null capability or CNode
  - Handlers panic when capabilities or CNodes are null; ensure proper initialization and capability creation before use.
- Free slots exhausted
  - Creating capabilities fails if no free slots; extend the CNode before retrying.
- Permission checks TODO
  - Right now, permission checks are not enforced; implement rights verification in the dispatcher and handlers to prevent unauthorized operations.

**Section sources**
- [capability.c](file://kernel/capability/capability.c#L50-L53)
- [cnode.c](file://kernel/capability/cnode.c#L16-L21)
- [cap_scontext.c](file://kernel/capability/cap_scontext.c#L31-L41)
- [cap_vspace.c](file://kernel/capability/cap_vspace.c#L33-L40)
- [cap_ipc_endpoint.c](file://kernel/capability/cap_ipc_endpoint.c#L36-L43)
- [cap_upcall_endpoint.c](file://kernel/capability/cap_upcall_endpoint.c#L40-L47)

## Conclusion
TranquilOS implements a capability-based security model centered on typed capabilities stored in CNodes. The kernel provides robust dispatching, CNode management, and capability-specific operations for virtual memory, scheduling, execution contexts, IPC, and upcalls. Rights management and permission checks are under development and should be integrated to enforce fine-grained access control. Capability references enable secure inter-process capability passing, forming the basis for strong security boundaries.