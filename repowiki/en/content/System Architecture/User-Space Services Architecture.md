# User-Space Services Architecture

<cite>
**Referenced Files in This Document**
- [systemd.c](file://kernel/systemd/systemd.c)
- [service.c](file://kernel/systemd/service.c)
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c)
- [process.c](file://kernel/systemd/procmgr/process.c)
- [thread.c](file://kernel/systemd/procmgr/thread.c)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c)
- [systemd.h](file://kernel/systemd/include/systemd.h)
- [service.h](file://kernel/systemd/include/service.h)
- [elf.h](file://ulibs/include/libelf/elf.h)
- [devmgr main.c](file://uapps/devmgr/main.c)
- [fsmgr main.c](file://uapps/fsmgr/main.c)
- [shell main.c](file://uapps/shell/main.c)
- [netmgr main.c](file://uapps/netmgr/main.c)
- [idle main.c](file://uapps/idle/main.c)
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
This document describes the user-space services architecture centered around the systemd process, which acts as the central orchestrator for all user-space services. It explains how core operating system functionality is delegated to user-space processes, including memory management, process/thread management, device drivers, and file systems. The document also covers service registration and discovery via a name service, inter-service communication patterns using IPC endpoints, ELF loading and initialization, service lifecycle management, and resource allocation strategies. Benefits such as fault isolation, maintainability, and modular extensibility are highlighted, along with practical examples of service implementations and their integration with the kernel.

## Project Structure
The user-space services architecture is organized into:
- Kernel-side systemd orchestrator and managers:
  - Memory manager for physical and virtual memory allocation
  - Process manager for process and thread lifecycle
  - IPC manager for capability-based IPC and service discovery
  - Systemd core that loads and initializes services
- User-space services:
  - Device manager, file system manager, network manager, shell, and idle services
- ELF loader library for parsing and mapping executable segments

```mermaid
graph TB
subgraph "Kernel Side"
SYS["systemd.c"]
MEM["memmgr.c"]
PCM["procmgr.c"]
PROC["process.c"]
THR["thread.c"]
IPC["ipcmgr.c"]
end
subgraph "User Space"
DEV["devmgr/main.c"]
FSM["fsmgr/main.c"]
SHELL["shell/main.c"]
NET["netmgr/main.c"]
IDLE["idle/main.c"]
end
ELF["libelf/elf.h"]
SYS --> MEM
SYS --> PCM
SYS --> IPC
PCM --> PROC
PROC --> THR
SYS --> ELF
SYS --> DEV
SYS --> FSM
SYS --> SHELL
SYS --> NET
SYS --> IDLE
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L217-L246)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L274-L299)
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L127-L143)
- [process.c](file://kernel/systemd/procmgr/process.c#L419-L442)
- [thread.c](file://kernel/systemd/procmgr/thread.c#L15-L25)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L311-L319)
- [elf.h](file://ulibs/include/libelf/elf.h#L83-L123)
- [devmgr main.c](file://uapps/devmgr/main.c#L6-L17)
- [fsmgr main.c](file://uapps/fsmgr/main.c#L17-L37)
- [shell main.c](file://uapps/shell/main.c#L34-L71)
- [netmgr main.c](file://uapps/netmgr/main.c#L7-L18)
- [idle main.c](file://uapps/idle/main.c#L6-L15)

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L1-L246)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L1-L300)
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L1-L143)
- [process.c](file://kernel/systemd/procmgr/process.c#L1-L442)
- [thread.c](file://kernel/systemd/procmgr/thread.c#L1-L25)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L1-L319)
- [elf.h](file://ulibs/include/libelf/elf.h#L1-L149)
- [devmgr main.c](file://uapps/devmgr/main.c#L1-L18)
- [fsmgr main.c](file://uapps/fsmgr/main.c#L1-L38)
- [shell main.c](file://uapps/shell/main.c#L1-L72)
- [netmgr main.c](file://uapps/netmgr/main.c#L1-L20)
- [idle main.c](file://uapps/idle/main.c#L1-L17)

## Core Components
- systemd orchestrator
  - Initializes memory, process, IPC managers, and registers the systemd service endpoint
  - Defines core services and their deployment modes
  - Loads and boots ELF binaries into user-space processes
- Memory manager
  - Boot-to-main memory allocation using boot and buddy allocators
  - Shared memory allocation for services
  - Provides total/free memory statistics
- Process manager
  - Manages process lifecycle, PID assignment, and counting
- Process and thread
  - Creates address spaces, capability nodes, stacks, and execution contexts
  - Maps virtual memory, schedules threads, and handles termination
- IPC manager and name service
  - Creates capability-based IPC endpoints for services
  - Registers and resolves service endpoints via a name service
- ELF loader
  - Parses ELF headers and program headers
  - Extracts loadable segments and maps them into process virtual memory

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L15-L74)
- [systemd.c](file://kernel/systemd/systemd.c#L217-L246)
- [service.c](file://kernel/systemd/service.c#L160-L230)
- [memmgr.c](file://kernel/systemd/memgr/memmgr.c#L274-L299)
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L127-L143)
- [process.c](file://kernel/systemd/procmgr/process.c#L419-L442)
- [thread.c](file://kernel/systemd/procmgr/thread.c#L15-L25)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L22-L87)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L237-L287)
- [elf.h](file://ulibs/include/libelf/elf.h#L83-L123)

## Architecture Overview
The systemd process is the first user-space entity started by the kernel. It initializes managers, sets up a name service for service discovery, and launches core services. Each service is loaded as an ELF binary, mapped into its own virtual address space, and granted capabilities for IPC and upcalls. Services communicate via capability-based IPC endpoints and can request memory or register upcall handlers through the systemd service endpoint.

```mermaid
sequenceDiagram
participant Kernel as "Kernel"
participant Systemd as "systemd.c"
participant MemMgr as "memmgr.c"
participant ProcMgr as "procmgr.c"
participant IPCMgr as "ipcmgr.c"
participant ELF as "libelf/elf.h"
participant Service as "User Service"
Kernel->>Systemd : Boot
Systemd->>MemMgr : memmgr_init()
Systemd->>ProcMgr : procmgr_init()
Systemd->>IPCMgr : ipcmgr_init()
Systemd->>Systemd : systemd_service_init()
Systemd->>Systemd : core_services_start()
loop For each core service
Systemd->>ProcMgr : create_process(name)
Systemd->>MemMgr : alloc physical memory
Systemd->>ELF : parse ELF from CPIO
Systemd->>ProcMgr : create vspace/cnode/endpoints
Systemd->>ProcMgr : mapping(load segments)
Systemd->>ProcMgr : create thread(s)
ProcMgr-->>Systemd : run()
end
Service->>IPCMgr : register/get service endpoint
Service->>Systemd : alloc/get/free shm, page fault, exit
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L217-L246)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L274-L299)
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L127-L143)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L311-L319)
- [elf.h](file://ulibs/include/libelf/elf.h#L83-L123)

## Detailed Component Analysis

### Systemd Orchestrator
- Responsibilities
  - Initialize memory, process, and IPC managers
  - Register systemd service endpoint for service requests
  - Define core services, their ELF paths, and linear mappings
  - Load ELF binaries from CPIO, allocate physical memory, map segments, and start threads
- ELF loading mechanism
  - Reads service binary from CPIO
  - Parses ELF headers and iterates loadable program headers
  - Allocates aligned physical memory and copies segments
  - Maps virtual addresses to physical memory in the new process
- Service lifecycle
  - Creates process, cnode, vspace, and endpoints
  - Registers name service endpoint for the process
  - Creates console and threads (single or per-CPU)
  - Starts threads and yields control

```mermaid
flowchart TD
Start(["Start systemd"]) --> InitMgrs["Init memory/process/IPC managers"]
InitMgrs --> NameSvc["Create name service endpoint"]
NameSvc --> LoopServices{"For each core service"}
LoopServices --> CreateProc["Create process<br/>cnode/vspace/endpoints"]
CreateProc --> ReadELF["Read ELF from CPIO"]
ReadELF --> ParseELF["Parse ELF headers"]
ParseELF --> MapSegs["Alloc phys mem + copy + map segments"]
MapSegs --> LinearMaps["Map linear ranges"]
LinearMaps --> CreateThreads["Create threads (single/per-CPU)"]
CreateThreads --> RunThreads["Run threads"]
RunThreads --> LoopServices
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L15-L74)
- [systemd.c](file://kernel/systemd/systemd.c#L76-L205)
- [systemd.c](file://kernel/systemd/systemd.c#L217-L246)
- [elf.h](file://ulibs/include/libelf/elf.h#L83-L123)

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L15-L74)
- [systemd.c](file://kernel/systemd/systemd.c#L76-L205)
- [systemd.c](file://kernel/systemd/systemd.c#L217-L246)
- [elf.h](file://ulibs/include/libelf/elf.h#L83-L123)

### Memory Manager
- Boot-to-main transition using boot and buddy allocators
- Zone-based allocation for main memory
- Shared memory support for services
- Memory statistics queries

```mermaid
classDiagram
class MemoryManager {
+mem_alloc(size)
+mem_alloc_align(size, align)
+mem_free(ptr)
+alloc_shm(size)
+get_shm(addr)
+free_shm(addr)
+get_mem_total()
+get_mem_free()
}
class Zones {
+zones[MAIN]
}
MemoryManager --> Zones : "manages"
```

**Diagram sources**
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L274-L299)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L161-L185)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L251-L272)

**Section sources**
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L1-L300)

### Process and Thread Management
- Process lifecycle
  - Create cnode, vspace, and IPC endpoints
  - Map virtual memory, set up stacks and execution contexts
  - Schedule threads and handle termination
- Thread lifecycle
  - Allocate stacks and execution contexts
  - Attach to process and schedule

```mermaid
classDiagram
class ProcessManager {
+create_process(name)
+get_process_by_id(pid)
+get_process_count()
+get_thread_count()
+exit_process(process, status)
}
class Process {
+create_cnode()
+create_vspace()
+create_name_service_endpoint()
+mapping(vaddr, paddr, size)
+un_mapping(vaddr, size)
+create_thread(name)
+add_thread(thread)
+run()
+terminate(reason)
}
class Thread {
+run()
}
ProcessManager --> Process : "creates/manages"
Process --> Thread : "owns"
```

**Diagram sources**
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L127-L143)
- [process.c](file://kernel/systemd/procmgr/process.c#L419-L442)
- [thread.c](file://kernel/systemd/procmgr/thread.c#L15-L25)

**Section sources**
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L1-L143)
- [process.c](file://kernel/systemd/procmgr/process.c#L1-L442)
- [thread.c](file://kernel/systemd/procmgr/thread.c#L1-L25)

### IPC Manager and Service Discovery
- Capability-based IPC endpoints
  - Create endpoints for normal services and system services
  - Set up execution and scheduling contexts with capability references
- Name service
  - Registers service endpoints under service IDs
  - Resolves endpoints for callers via capability forwarding

```mermaid
sequenceDiagram
participant Service as "User Service"
participant NameSvc as "Name Service Endpoint"
participant IPCMgr as "ipcmgr.c"
participant ProcMgr as "procmgr.c"
Service->>NameSvc : REGISTER_SERVICE(id, entry)
NameSvc->>IPCMgr : create_ipc_endpoint_for_service(id, entry)
IPCMgr->>ProcMgr : get_process_by_id(caller_pid)
ProcMgr-->>IPCMgr : process
IPCMgr-->>NameSvc : endpoint reference
NameSvc-->>Service : endpoint cref
Service->>NameSvc : GET_SERVICE(id)
NameSvc->>IPCMgr : find_endpoint_by_service_id(id)
IPCMgr-->>NameSvc : endpoint
NameSvc->>Service : capability to endpoint
```

**Diagram sources**
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L22-L87)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L156-L195)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L197-L235)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L237-L287)

**Section sources**
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L1-L319)

### Systemd Service Endpoint
- Methods exposed to services
  - Shared memory allocation, retrieval, and freeing
  - Memory statistics queries
  - Upcall registration
  - Page fault handling
  - Self-exit
- Registration and dispatch

```mermaid
sequenceDiagram
participant Service as "User Service"
participant SystemdSvc as "systemd_service_entry"
participant MemMgr as "memmgr.c"
participant ProcMgr as "procmgr.c"
Service->>SystemdSvc : ALLOC_SHM(size)
SystemdSvc->>MemMgr : alloc_shm(size)
MemMgr-->>SystemdSvc : shm addr
SystemdSvc-->>Service : shm addr
Service->>SystemdSvc : PAGE_FAULT(addr)
SystemdSvc->>MemMgr : mem_alloc_align(PAGE_SIZE)
SystemdSvc->>ProcMgr : get_process_by_id(caller_pid)
ProcMgr-->>SystemdSvc : process
SystemdSvc-->>Service : success/failure
```

**Diagram sources**
- [service.c](file://kernel/systemd/service.c#L160-L230)
- [service.c](file://kernel/systemd/service.c#L10-L97)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L161-L185)
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L9-L34)

**Section sources**
- [service.c](file://kernel/systemd/service.c#L1-L236)

### ELF Loading Mechanism
- Parsing
  - Validates ELF magic, class, data encoding, version, machine, and type
  - Iterates program headers to extract loadable segments
- Mapping
  - Allocates aligned physical memory
  - Copies segment data
  - Maps virtual addresses to physical memory in the new process

```mermaid
flowchart TD
A["Read ELF from CPIO"] --> B["Validate ELF header"]
B --> C["Iterate program headers"]
C --> D{"Type == LOAD?"}
D -- Yes --> E["Alloc aligned physical memory"]
E --> F["Copy segment data"]
F --> G["Map vaddr -> paddr in process"]
D -- No --> C
G --> H["Complete"]
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L113-L153)
- [elf.h](file://ulibs/include/libelf/elf.h#L83-L123)

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L105-L153)
- [elf.h](file://ulibs/include/libelf/elf.h#L83-L123)

### Example Service Implementations
- Device manager
  - Initializes display and device subsystems, registers service endpoint
- File system manager
  - Initializes VFS components, registers service endpoint, registers upcall handler for page faults
- Shell
  - Uses clients to access device, filesystem, and systemd services; draws UI and reads files
- Network manager
  - Initializes networking service endpoint
- Idle
  - Minimal loop for CPU idle

```mermaid
graph LR
DEV["devmgr/main.c"] --> SVC["service.h"]
FSM["fsmgr/main.c"] --> SVC
SHELL["shell/main.c"] --> SVC
NET["netmgr/main.c"] --> SVC
IDLE["idle/main.c"] --> SVC
```

**Diagram sources**
- [devmgr main.c](file://uapps/devmgr/main.c#L6-L17)
- [fsmgr main.c](file://uapps/fsmgr/main.c#L17-L37)
- [shell main.c](file://uapps/shell/main.c#L34-L71)
- [netmgr main.c](file://uapps/netmgr/main.c#L7-L18)
- [idle main.c](file://uapps/idle/main.c#L6-L15)

**Section sources**
- [devmgr main.c](file://uapps/devmgr/main.c#L1-L18)
- [fsmgr main.c](file://uapps/fsmgr/main.c#L1-L38)
- [shell main.c](file://uapps/shell/main.c#L1-L72)
- [netmgr main.c](file://uapps/netmgr/main.c#L1-L20)
- [idle main.c](file://uapps/idle/main.c#L1-L17)

## Dependency Analysis
- Systemd depends on memory, process, IPC managers, and ELF loader
- Process creation depends on memory allocation and capability APIs
- IPC endpoints depend on process cnode and vspace references
- Services depend on the name service for endpoint discovery and on systemd for resource management

```mermaid
graph TB
Systemd["systemd.c"] --> MemMgr["memmgr.c"]
Systemd --> ProcMgr["procmgr.c"]
Systemd --> IPCMgr["ipcmgr.c"]
Systemd --> ELF["libelf/elf.h"]
ProcMgr --> Process["process.c"]
Process --> Thread["thread.c"]
IPCMgr --> Process
Services["User Services"] --> IPCMgr
Services --> Systemd
```

**Diagram sources**
- [systemd.c](file://kernel/systemd/systemd.c#L1-L246)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L1-L300)
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L1-L143)
- [process.c](file://kernel/systemd/procmgr/process.c#L1-L442)
- [thread.c](file://kernel/systemd/procmgr/thread.c#L1-L25)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L1-L319)
- [elf.h](file://ulibs/include/libelf/elf.h#L1-L149)

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L1-L246)
- [procmgr.c](file://kernel/systemd/procmgr/procmgr.c#L1-L143)
- [process.c](file://kernel/systemd/procmgr/process.c#L1-L442)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L1-L319)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L1-L300)
- [elf.h](file://ulibs/include/libelf/elf.h#L1-L149)

## Performance Considerations
- Memory allocation
  - Boot-to-main transition minimizes early allocations; buddy allocator supports large contiguous allocations efficiently
- Virtual memory mapping
  - Segment-by-segment mapping ensures minimal overhead; page table extension occurs on demand
- IPC
  - Capability-based IPC avoids kernel involvement for routine message passing; name service caching could reduce repeated lookups
- Threading
  - Per-CPU deployment for idle service reduces contention; single-threaded services minimize synchronization overhead

## Troubleshooting Guide
- Service fails to start
  - Verify ELF parsing success and loadable segments mapped
  - Check process creation of cnode, vspace, and endpoints
- IPC resolution failures
  - Confirm name service registration and endpoint availability
  - Validate capability references and process cnode/vspace setup
- Memory issues
  - Inspect shared memory allocation and mapping; confirm free memory statistics
- Page faults
  - Ensure page fault handler is registered and processes can map requested pages

**Section sources**
- [systemd.c](file://kernel/systemd/systemd.c#L105-L153)
- [process.c](file://kernel/systemd/procmgr/process.c#L84-L121)
- [ipcmgr.c](file://kernel/systemd/ipcmgr/ipcmgr.c#L237-L287)
- [service.c](file://kernel/systemd/service.c#L109-L141)
- [memmgr.c](file://kernel/systemd/memmgr/memmgr.c#L161-L185)

## Conclusion
The user-space services architecture delegates core OS functionality to modular, capability-protected services orchestrated by systemd. Memory and process management are handled by dedicated managers, while IPC enables clean service discovery and communication. The ELF loader and service lifecycle management provide robust initialization and resource allocation. This design achieves fault isolation, simplifies maintenance, and supports modular extensibility, enabling easy addition of new services such as device drivers, file systems, and network components.