# User Libraries

<cite>
**Referenced Files in This Document**
- [ulibs/include/libc/string.h](file://ulibs/include/libc/string.h)
- [ulibs/include/libc/stdio.h](file://ulibs/include/libc/stdio.h)
- [ulibs/include/libc/stdlib.h](file://ulibs/include/libc/stdlib.h)
- [ulibs/include/libc/math.h](file://ulibs/include/libc/math.h)
- [ulibs/include/libc/stddef.h](file://ulibs/include/libc/stddef.h)
- [ulibs/include/libc/stdint.h](file://ulibs/include/libc/stdint.h)
- [ulibs/include/libc/stdarg.h](file://ulibs/include/libc/stdarg.h)
- [ulibs/include/libalgorithm/darray.h](file://ulibs/include/libalgorithm/darray.h)
- [ulibs/include/libalgorithm/fifo.h](file://ulibs/include/libalgorithm/fifo.h)
- [ulibs/include/libalgorithm/minheap.h](file://ulibs/include/libalgorithm/minheap.h)
- [ulibs/include/libalgorithm/rbtree.h](file://ulibs/include/libalgorithm/rbtree.h)
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h)
- [ulibs/include/libgraphics/font_8x8.h](file://ulibs/include/libgraphics/font_8x8.h)
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h)
- [ulibs/include/libsystem/fs_client.h](file://ulibs/include/libsystem/fs_client.h)
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h)
- [ulibs/include/libsystem/net_client.h](file://ulibs/include/libsystem/net_client.h)
- [ulibs/include/libkernel/types.h](file://ulibs/include/libkernel/types.h)
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h)
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
10. [Appendices](#appendices)

## Introduction
This document describes the user-space library ecosystem of TranquilOS. It covers the standard C library subset, algorithm libraries, graphics primitives, and system client libraries. It also explains how these libraries integrate with the kernel via capabilities and IPC, and outlines design principles, API consistency, performance considerations, and extension guidelines.

## Project Structure
The user libraries are organized by domain:
- Standard C library subset: minimal headers for string, formatted I/O, memory allocation, math helpers, integer types, and variadic arguments.
- Algorithm libraries: dynamic arrays, FIFO queues, min-heaps, and red-black trees.
- Graphics libraries: 2D drawing primitives, surfaces, fonts, and glyph metadata.
- System client libraries: clients for device manager, filesystem, networking, and systemd services.
- Kernel interface: capability and type definitions used by clients and internal modules.

```mermaid
graph TB
subgraph "Standard C Library"
L1["libc headers<br/>string.h, stdio.h, stdlib.h,<br/>math.h, stddef.h, stdint.h, stdarg.h"]
end
subgraph "Algorithms"
L2["darray.h"]
L3["fifo.h"]
L4["minheap.h"]
L5["rbtree.h"]
end
subgraph "Graphics"
G1["graphics_2d.h"]
G2["font_8x8.h"]
end
subgraph "System Clients"
S1["devmgr_client.h"]
S2["fs_client.h"]
S3["net_client.h"]
S4["systemd_client.h"]
end
subgraph "Kernel Interface"
K1["capability.h"]
K2["types.h"]
end
L1 --> S1
L1 --> S2
L1 --> S3
L1 --> S4
S4 --> K1
S4 --> K2
G1 --> S1
L2 --> L1
L3 --> L1
L4 --> L1
L5 --> L1
```

**Diagram sources**
- [ulibs/include/libc/string.h](file://ulibs/include/libc/string.h#L1-L13)
- [ulibs/include/libc/stdio.h](file://ulibs/include/libc/stdio.h#L1-L17)
- [ulibs/include/libc/stdlib.h](file://ulibs/include/libc/stdlib.h#L1-L12)
- [ulibs/include/libc/math.h](file://ulibs/include/libc/math.h#L1-L16)
- [ulibs/include/libc/stddef.h](file://ulibs/include/libc/stddef.h#L1-L50)
- [ulibs/include/libc/stdint.h](file://ulibs/include/libc/stdint.h#L1-L21)
- [ulibs/include/libc/stdarg.h](file://ulibs/include/libc/stdarg.h#L1-L9)
- [ulibs/include/libalgorithm/darray.h](file://ulibs/include/libalgorithm/darray.h#L1-L64)
- [ulibs/include/libalgorithm/fifo.h](file://ulibs/include/libalgorithm/fifo.h#L1-L27)
- [ulibs/include/libalgorithm/minheap.h](file://ulibs/include/libalgorithm/minheap.h#L1-L37)
- [ulibs/include/libalgorithm/rbtree.h](file://ulibs/include/libalgorithm/rbtree.h#L1-L45)
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libgraphics/font_8x8.h](file://ulibs/include/libgraphics/font_8x8.h#L1-L9)
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)
- [ulibs/include/libsystem/fs_client.h](file://ulibs/include/libsystem/fs_client.h#L1-L47)
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)
- [ulibs/include/libsystem/net_client.h](file://ulibs/include/libsystem/net_client.h#L1-L31)
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)
- [ulibs/include/libkernel/types.h](file://ulibs/include/libkernel/types.h#L1-L76)

**Section sources**
- [ulibs/include/libc/string.h](file://ulibs/include/libc/string.h#L1-L13)
- [ulibs/include/libc/stdio.h](file://ulibs/include/libc/stdio.h#L1-L17)
- [ulibs/include/libc/stdlib.h](file://ulibs/include/libc/stdlib.h#L1-L12)
- [ulibs/include/libc/math.h](file://ulibs/include/libc/math.h#L1-L16)
- [ulibs/include/libc/stddef.h](file://ulibs/include/libc/stddef.h#L1-L50)
- [ulibs/include/libc/stdint.h](file://ulibs/include/libc/stdint.h#L1-L21)
- [ulibs/include/libc/stdarg.h](file://ulibs/include/libc/stdarg.h#L1-L9)
- [ulibs/include/libalgorithm/darray.h](file://ulibs/include/libalgorithm/darray.h#L1-L64)
- [ulibs/include/libalgorithm/fifo.h](file://ulibs/include/libalgorithm/fifo.h#L1-L27)
- [ulibs/include/libalgorithm/minheap.h](file://ulibs/include/libalgorithm/minheap.h#L1-L37)
- [ulibs/include/libalgorithm/rbtree.h](file://ulibs/include/libalgorithm/rbtree.h#L1-L45)
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libgraphics/font_8x8.h](file://ulibs/include/libgraphics/font_8x8.h#L1-L9)
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)
- [ulibs/include/libsystem/fs_client.h](file://ulibs/include/libsystem/fs_client.h#L1-L47)
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)
- [ulibs/include/libsystem/net_client.h](file://ulibs/include/libsystem/net_client.h#L1-L31)
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)
- [ulibs/include/libkernel/types.h](file://ulibs/include/libkernel/types.h#L1-L76)

## Core Components
- Standard C library subset: Provides essential types, constants, and lightweight string/formatted I/O/malloc/exit APIs suitable for user-space applications.
- Algorithm libraries: Generic containers and data structures with function-pointer operation tables to support flexible implementations.
- Graphics library: 2D primitives, surfaces, and font glyphs with a draw-ops abstraction enabling backend pluggability.
- System client libraries: IPC-based clients for device manager, filesystem, networking, and systemd, exposing typed functions and constants.
- Kernel interface: Capability and type enums define kernel object types, capability references, and mapping result codes used by clients.

Key design principles:
- API consistency: All clients expose a similar pattern: a handle struct with an ops table of function pointers and a singleton accessor.
- Minimal kernel footprint: Clients encapsulate IPC and capability usage behind simple function calls.
- Extensibility: Draw-ops and algorithm operation tables allow swapping implementations without changing application code.

**Section sources**
- [ulibs/include/libc/string.h](file://ulibs/include/libc/string.h#L1-L13)
- [ulibs/include/libc/stdio.h](file://ulibs/include/libc/stdio.h#L1-L17)
- [ulibs/include/libc/stdlib.h](file://ulibs/include/libc/stdlib.h#L1-L12)
- [ulibs/include/libc/math.h](file://ulibs/include/libc/math.h#L1-L16)
- [ulibs/include/libc/stddef.h](file://ulibs/include/libc/stddef.h#L1-L50)
- [ulibs/include/libc/stdint.h](file://ulibs/include/libc/stdint.h#L1-L21)
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)
- [ulibs/include/libsystem/fs_client.h](file://ulibs/include/libsystem/fs_client.h#L1-L47)
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)
- [ulibs/include/libsystem/net_client.h](file://ulibs/include/libsystem/net_client.h#L1-L31)
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)
- [ulibs/include/libkernel/types.h](file://ulibs/include/libkernel/types.h#L1-L76)

## Architecture Overview
The user-space libraries communicate with the kernel through capability-based IPC. Clients maintain a capability reference and dispatch method calls via function pointers. Graphics rendering targets a surface abstraction, allowing different backends. Algorithms and libc provide foundational building blocks.

```mermaid
graph TB
App["Application"]
LibC["libc (stdio, string, stdlib, math, stddef, stdint, stdarg)"]
Algo["libalgorithm (darray, fifo, minheap, rbtree)"]
Gfx["libgraphics (graphics_2d, font_8x8)"]
Sys["libsystem (devmgr_client, fs_client, net_client, systemd_client)"]
Kern["libkernel (capability, types)"]
App --> LibC
App --> Algo
App --> Gfx
App --> Sys
Sys --> Kern
Gfx --> Sys
```

**Diagram sources**
- [ulibs/include/libc/stdio.h](file://ulibs/include/libc/stdio.h#L1-L17)
- [ulibs/include/libc/string.h](file://ulibs/include/libc/string.h#L1-L13)
- [ulibs/include/libc/stdlib.h](file://ulibs/include/libc/stdlib.h#L1-L12)
- [ulibs/include/libc/math.h](file://ulibs/include/libc/math.h#L1-L16)
- [ulibs/include/libc/stddef.h](file://ulibs/include/libc/stddef.h#L1-L50)
- [ulibs/include/libc/stdint.h](file://ulibs/include/libc/stdint.h#L1-L21)
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libgraphics/font_8x8.h](file://ulibs/include/libgraphics/font_8x8.h#L1-L9)
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)
- [ulibs/include/libsystem/fs_client.h](file://ulibs/include/libsystem/fs_client.h#L1-L47)
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)
- [ulibs/include/libsystem/net_client.h](file://ulibs/include/libsystem/net_client.h#L1-L31)
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)
- [ulibs/include/libkernel/types.h](file://ulibs/include/libkernel/types.h#L1-L76)

## Detailed Component Analysis

### Standard C Library Subset
- Types and constants: Defines integer types, endianness helpers, time base macros, memory sizes, PAGE_SIZE, and NULL/E_OK/E_ERR.
- String utilities: Length, compare, memcpy, memset, and strncmp.
- Formatted I/O: Base conversions, printf family, and string conversion helpers.
- Memory allocation: malloc/free and exit.
- Math helpers: GCD utility.

Usage patterns:
- Always check return codes for allocation and conversion functions.
- Use endianness helpers when serializing data for IPC or storage.
- Prefer libc’s printf/vprintf for deterministic output formatting.

Integration notes:
- These headers are foundational and consumed by all other user libraries and applications.

**Section sources**
- [ulibs/include/libc/stddef.h](file://ulibs/include/libc/stddef.h#L1-L50)
- [ulibs/include/libc/stdint.h](file://ulibs/include/libc/stdint.h#L1-L21)
- [ulibs/include/libc/string.h](file://ulibs/include/libc/string.h#L1-L13)
- [ulibs/include/libc/stdio.h](file://ulibs/include/libc/stdio.h#L1-L17)
- [ulibs/include/libc/stdlib.h](file://ulibs/include/libc/stdlib.h#L1-L12)
- [ulibs/include/libc/math.h](file://ulibs/include/libc/math.h#L1-L16)

### Algorithm Libraries
- Directory array (darray): Hierarchical indexing with configurable levels and operation callbacks for insert/delete/get/free-slot/extend.
- FIFO: Linked-list backed queue with in/out/remove and empty checks.
- Min-heap: Binary heap with comparator and dump support.
- Red-Black tree: Balanced BST with insert/delete/get-min and dump.

Design principles:
- Operation tables decouple algorithms from implementation specifics.
- Comparator-based ordering for heaps and trees.
- Error codes standardized per container.

Common usage patterns:
- Initialize containers with init functions and pass a comparator where applicable.
- Use operation tables to swap implementations without changing application code.
- Manage memory carefully; ensure free-lists and slots are handled consistently.

```mermaid
classDiagram
class DArray {
+uint64_t max_level
+uint64_t used[]
+uint64_t slot[]
+uint64_t free_list[]
+uint32_t entry_size
+uint64_t* ptr_to_block
+ops : directory_array_ops
+printf : print_fn
}
class DArrayOps {
+free_slots()
+extend(block_addr)
+insert(data, size)
+del(slot_idx)
+get(slot_idx)
}
DArray --> DArrayOps : "has"
class MinHeap {
+min_heap_node_s* root
+min_heap_node_s* last
+comparator(node, node)
+uint32_t size
+ops : min_heap_ops
}
class RBTree {
+rb_node_s* root
+comparator(node, node)
+uint32_t size
+ops : rb_tree_ops
}
```

**Diagram sources**
- [ulibs/include/libalgorithm/darray.h](file://ulibs/include/libalgorithm/darray.h#L1-L64)
- [ulibs/include/libalgorithm/minheap.h](file://ulibs/include/libalgorithm/minheap.h#L1-L37)
- [ulibs/include/libalgorithm/rbtree.h](file://ulibs/include/libalgorithm/rbtree.h#L1-L45)

**Section sources**
- [ulibs/include/libalgorithm/darray.h](file://ulibs/include/libalgorithm/darray.h#L1-L64)
- [ulibs/include/libalgorithm/fifo.h](file://ulibs/include/libalgorithm/fifo.h#L1-L27)
- [ulibs/include/libalgorithm/minheap.h](file://ulibs/include/libalgorithm/minheap.h#L1-L37)
- [ulibs/include/libalgorithm/rbtree.h](file://ulibs/include/libalgorithm/rbtree.h#L1-L45)

### Graphics Library
- Primitives: Points, lines, rectangles, circles, and text glyphs.
- Surface: Width, height, and backing buffer abstraction.
- Draw operations: Function-pointer table for drawing primitives and text.
- Font: 8x8 bitmap font exposed as a constant.

Usage patterns:
- Initialize a graphics context and set a surface.
- Choose a font and draw text or shapes using the draw-ops table.
- Respect surface bounds and color channel ordering.

```mermaid
classDiagram
class Vec2i {
+int x
+int y
}
class ColorRGBA {
+uint8_t r,g,b,a
+uint32_t val
}
class Point2D {
+pos : Vec2i
}
class Line2D {
+pos1 : Vec2i
+pos2 : Vec2i
}
class Rect2D {
+pos : Vec2i
+size : Vec2i
}
class BorderRadius {
+uint32_t top_left
+uint32_t top_right
+uint32_t bottom_left
+uint32_t bottom_right
}
class Glyph {
+uint32_t codepoint
+uint8_t width,height
+int8_t xoffset,yoffset,xadvance
+bitmap : uint8_t*
}
class Font {
+name : char*
+uint8_t size
+uint32_t num_glyphs
+glyphs : Glyph*
}
class DrawOps {
+draw_line(line, color)
+draw_point(point, color)
+draw_rect(rect, radius, color)
+fill_rect(rect, radius, color)
+draw_circle(center, radius, color)
+fill_circle(center, radius, color)
+draw_pixmap()
+draw_text(text, pos, font, size, color)
}
class Surface {
+void* surface
+uint32_t width
+uint32_t height
}
class Graphics2D {
+surface : Surface
+draw_op : DrawOps
+set_surface(width, height, surface)
}
Graphics2D --> Surface
Graphics2D --> DrawOps
Font --> Glyph
Graphics2D --> Font
```

**Diagram sources**
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libgraphics/font_8x8.h](file://ulibs/include/libgraphics/font_8x8.h#L1-L9)

**Section sources**
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libgraphics/font_8x8.h](file://ulibs/include/libgraphics/font_8x8.h#L1-L9)

### System Client Libraries
Clients encapsulate IPC calls to kernel/system services. Each client exposes:
- An enum of service functions with stringification helpers.
- An ops table of function pointers for service calls.
- A handle struct containing a capability reference and the ops table.
- A singleton accessor to obtain the initialized client.

Representative clients:
- Device manager: get framebuffer, submit framebuffer, submit surface via shared memory, get CPIO address.
- Filesystem: open, read, write, close.
- Networking: send packet, receive packet, get MAC address.
- Systemd: allocate/free shared memory, get memory stats, register upcall, page fault, exit self.

```mermaid
sequenceDiagram
participant App as "Application"
participant Dev as "devmgr_client"
participant Kern as "Kernel Service"
App->>Dev : submit_shm_surface(shm_id)
Dev->>Kern : IPC(CAP_IpcEndPoint_CALL, FUNC_SUBMIT_SURFACE_BY_SHM, shm_id)
Kern-->>Dev : status
Dev-->>App : status
```

**Diagram sources**
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)

```mermaid
sequenceDiagram
participant App as "Application"
participant FS as "fs_client"
participant Kern as "Kernel Service"
App->>FS : open(shm_id)
FS->>Kern : IPC(FUNC_OPEN, shm_id)
Kern-->>FS : fd
FS-->>App : fd
```

**Diagram sources**
- [ulibs/include/libsystem/fs_client.h](file://ulibs/include/libsystem/fs_client.h#L1-L47)

```mermaid
sequenceDiagram
participant App as "Application"
participant Net as "net_client"
participant Kern as "Kernel Service"
App->>Net : send(buf, len)
Net->>Kern : IPC(FUNC_SEND_PACKET, buf, len)
Kern-->>Net : status
Net-->>App : status
```

**Diagram sources**
- [ulibs/include/libsystem/net_client.h](file://ulibs/include/libsystem/net_client.h#L1-L31)

```mermaid
sequenceDiagram
participant App as "Application"
participant Sys as "systemd_client"
participant Kern as "Kernel Service"
App->>Sys : alloc_shm(size)
Sys->>Kern : IPC(FUNC_ALLOC_SHM, size)
Kern-->>Sys : shm_id
Sys-->>App : shm_id
```

**Diagram sources**
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)

**Section sources**
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)
- [ulibs/include/libsystem/fs_client.h](file://ulibs/include/libsystem/fs_client.h#L1-L47)
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)
- [ulibs/include/libsystem/net_client.h](file://ulibs/include/libsystem/net_client.h#L1-L31)

### Kernel Interface
- Capability references: Union encoding for cnode_id and slot index.
- Kernel object types: Enumerates XContext, SContext, VSpace, CNode, Console, SysCtrl, Self, IpcEndPoint, UpcallEndPoint.
- Mapping result codes: Comprehensive status codes for virtual memory mapping operations.

Usage patterns:
- Clients construct capability references and use them to call kernel methods via IPC endpoints.
- Mapping results should be checked and handled gracefully.

**Section sources**
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)
- [ulibs/include/libkernel/types.h](file://ulibs/include/libkernel/types.h#L1-L76)

## Dependency Analysis
- libc is a foundation for all other libraries.
- Algorithm libraries depend on libc types and constants.
- Graphics library depends on libc and font metadata.
- System clients depend on kernel capability and type definitions.
- Clients are independent of each other but share the kernel IPC model.

```mermaid
graph LR
STD["libc"] --> ALG["libalgorithm"]
STD --> GFX["libgraphics"]
STD --> SYS["libsystem"]
SYS --> KER["libkernel"]
GFX --> SYS
```

**Diagram sources**
- [ulibs/include/libc/stddef.h](file://ulibs/include/libc/stddef.h#L1-L50)
- [ulibs/include/libalgorithm/darray.h](file://ulibs/include/libalgorithm/darray.h#L1-L64)
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)

**Section sources**
- [ulibs/include/libc/stddef.h](file://ulibs/include/libc/stddef.h#L1-L50)
- [ulibs/include/libalgorithm/darray.h](file://ulibs/include/libalgorithm/darray.h#L1-L64)
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)

## Performance Considerations
- Minimize IPC calls: Batch operations where possible; reuse shared memory buffers.
- Choose appropriate containers: Heaps for priority scheduling, balanced trees for ordered maps, FIFO for queues.
- Graphics: Prefer filling rects and drawing primitives in batches; avoid excessive state changes.
- Memory: Use libc malloc/free consistently; avoid fragmentation by aligning allocations to cache line boundaries where appropriate.
- Time conversions: Use provided macros to convert between seconds, milliseconds, microseconds, and nanoseconds efficiently.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
- Allocation failures: Check return values from malloc; ensure alignment and size correctness.
- IPC errors: Verify capability references and function enumerations; confirm service availability.
- Graphics artifacts: Ensure surface dimensions and pixel formats match expectations; validate color channel order.
- Mapping failures: Inspect mapping result codes and handle invalid entries or already-mapped regions.

**Section sources**
- [ulibs/include/libc/stdlib.h](file://ulibs/include/libc/stdlib.h#L1-L12)
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)
- [ulibs/include/libgraphics/graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [ulibs/include/libkernel/types.h](file://ulibs/include/libkernel/types.h#L1-L76)

## Conclusion
TranquilOS user libraries provide a cohesive, capability-driven ecosystem. The standard C subset offers essential building blocks, while algorithm and graphics libraries enable efficient data handling and rendering. System clients abstract kernel interactions, ensuring consistent APIs across services. Following the documented patterns ensures portability, performance, and maintainability.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### API Consistency Guidelines
- Keep handle structs uniform: include a capability reference and an ops table.
- Expose a singleton accessor per client.
- Use enums for service functions with stringification helpers.
- Return status codes from IPC calls; document failure modes.

**Section sources**
- [ulibs/include/libsystem/devmgr_client.h](file://ulibs/include/libsystem/devmgr_client.h#L1-L43)
- [ulibs/include/libsystem/fs_client.h](file://ulibs/include/libsystem/fs_client.h#L1-L47)
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)
- [ulibs/include/libsystem/net_client.h](file://ulibs/include/libsystem/net_client.h#L1-L31)

### Extension Guidelines
- Define a new header under ulibs/include with a handle struct, ops table, and accessor.
- Add a corresponding implementation under ulibs/<libname> with initialization and IPC dispatch.
- Introduce service function enums and stringifiers for traceability.
- Provide examples of initialization, usage, and error handling in tests or sample apps.

**Section sources**
- [ulibs/include/libsystem/systemd_client.h](file://ulibs/include/libsystem/systemd_client.h#L1-L84)
- [ulibs/include/libkernel/capability.h](file://ulibs/include/libkernel/capability.h#L1-L141)