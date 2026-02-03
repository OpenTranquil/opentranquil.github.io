# Graphics and Display Libraries

<cite>
**Referenced Files in This Document**
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h)
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c)
- [display_mgr.h](file://uapps/devmgr/include/peripherals/display/display_mgr.h)
- [display_mgr.c](file://uapps/devmgr/peripherals/display/display_mgr.c)
- [display_device.h](file://uapps/devmgr/include/peripherals/display/device/display_device.h)
- [framebuffer.h](file://uapps/devmgr/include/peripherals/display/framebuffer.h)
- [bcm2711_fb.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.h)
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c)
- [bcm2711_mailbox.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_mailbox.h)
- [fw_cfg.c](file://uapps/devmgr/drivers/virt/fw_cfg.c)
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
This document describes the graphics and display libraries in TranquilOS with a focus on 2D primitives, drawing operations, and font rendering. It explains the graphics API, coordinate systems, color formats, and performance characteristics. It also covers buffer management, integration with device drivers, and the relationship with framebuffer devices and the display manager. Finally, it outlines optimization techniques for embedded displays and memory-efficient rendering.

## Project Structure
The graphics subsystem spans userland libraries and device manager components:
- Graphics library: 2D primitives, surfaces, and text rendering
- Font assets: bitmap-based glyphs for rendering text
- Display manager: registration and lifecycle of display devices
- Framebuffer abstraction: width, height, stride, and base address
- Device drivers: Raspberry Pi and virtual machine framebuffer allocation and configuration

```mermaid
graph TB
subgraph "Graphics Library"
G2D["graphics_2d.c/.h"]
FNT["font_8x8.c"]
end
subgraph "Device Manager"
DMH["display_mgr.h/.c"]
DDH["display_device.h"]
FBH["framebuffer.h"]
end
subgraph "Drivers"
RPIFB["bcm2711_fb.c/.h"]
MBH["bcm2711_mailbox.h"]
VIRT["fw_cfg.c"]
end
G2D --> FNT
DMH --> DDH
DDH --> FBH
DDH --> RPIFB
RPIFB --> MBH
DDH --> VIRT
```

**Diagram sources**
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L1-L404)
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c#L1-L204)
- [display_mgr.h](file://uapps/devmgr/include/peripherals/display/display_mgr.h#L1-L20)
- [display_mgr.c](file://uapps/devmgr/peripherals/display/display_mgr.c#L1-L31)
- [display_device.h](file://uapps/devmgr/include/peripherals/display/device/display_device.h#L1-L16)
- [framebuffer.h](file://uapps/devmgr/include/peripherals/display/framebuffer.h#L1-L16)
- [bcm2711_fb.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.h#L1-L21)
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c#L95-L144)
- [bcm2711_mailbox.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_mailbox.h#L66-L124)
- [fw_cfg.c](file://uapps/devmgr/drivers/virt/fw_cfg.c#L90-L124)

**Section sources**
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L1-L404)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c#L1-L204)
- [display_mgr.h](file://uapps/devmgr/include/peripherals/display/display_mgr.h#L1-L20)
- [display_mgr.c](file://uapps/devmgr/peripherals/display/display_mgr.c#L1-L31)
- [display_device.h](file://uapps/devmgr/include/peripherals/display/device/display_device.h#L1-L16)
- [framebuffer.h](file://uapps/devmgr/include/peripherals/display/framebuffer.h#L1-L16)
- [bcm2711_fb.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.h#L1-L21)
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c#L95-L144)
- [bcm2711_mailbox.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_mailbox.h#L66-L124)
- [fw_cfg.c](file://uapps/devmgr/drivers/virt/fw_cfg.c#L90-L124)

## Core Components
- Graphics 2D API: Provides drawing operations (lines, rectangles, circles, points), text rendering, and surface management.
- Color format: RGBA with 8 bits per channel packed into a 32-bit value.
- Coordinate system: Origin at top-left; X increases right; Y increases down.
- Surface: A contiguous buffer with width and height; pixels are 32-bit RGBA.
- Fonts: Bitmap glyphs with metrics (width, height, xoffset, yoffset, xadvance) and a fixed size.

Key APIs and types:
- Drawing operations: draw_line, draw_point, draw_rect, fill_rect, draw_circle, fill_circle, draw_text, draw_pixmap
- Surface management: set_surface
- Geometry helpers: ivec2, line2d, rect2d, border_radius
- Color helpers: color(r, g, b, a)
- Font glyph and font structures

**Section sources**
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L7-L138)
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L117-L404)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c#L82-L204)

## Architecture Overview
The graphics pipeline integrates userland drawing with device-managed framebuffers:
- Application initializes a graphics context and sets a surface backed by a framebuffer.
- Drawing operations write directly to the framebuffer’s pixel buffer.
- The display manager registers display devices and exposes framebuffer allocation and assignment.
- Drivers allocate and configure framebuffers (e.g., mailbox property calls on Raspberry Pi; firmware config on virtual machines).

```mermaid
sequenceDiagram
participant App as "Application"
participant G2D as "graphics_2d"
participant Surf as "Surface"
participant DevMgr as "Display Manager"
participant Dev as "Display Device"
participant FB as "Framebuffer"
App->>G2D : "graphics_2d_init()"
App->>G2D : "set_surface(width,height,surface)"
G2D->>Surf : "store pointer and dims"
App->>DevMgr : "display_mgr_init()"
App->>DevMgr : "register_device(display_device)"
DevMgr->>Dev : "alloc_framebuffer()"
Dev->>FB : "allocate buffer"
DevMgr->>Dev : "set_framebuffer(framebuffer)"
App->>G2D : "draw operations (line/rect/text)"
G2D->>Surf : "write pixels"
```

**Diagram sources**
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L388-L404)
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L121-L138)
- [display_mgr.c](file://uapps/devmgr/peripherals/display/display_mgr.c#L6-L31)
- [display_device.h](file://uapps/devmgr/include/peripherals/display/device/display_device.h#L8-L14)
- [framebuffer.h](file://uapps/devmgr/include/peripherals/display/framebuffer.h#L8-L14)
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c#L95-L144)
- [fw_cfg.c](file://uapps/devmgr/drivers/virt/fw_cfg.c#L90-L124)

## Detailed Component Analysis

### Graphics 2D API
The 2D graphics API defines geometry types, color packing, drawing operations, and surface management. It supports:
- Primitives: point, line, rectangle (with rounded corners), circle (outline and filled)
- Text rendering: UTF-8 decoding, glyph lookup, bitmap rasterization with scaling
- Surface: width, height, and pointer to pixel buffer

Coordinate system and pixel layout:
- Origin at top-left corner
- Pixel format is 32-bit RGBA stored in native endianness
- Surfaces are treated as tightly packed rows

Drawing operations:
- Line drawing uses an integer DDA/Bresenham-style loop
- Rectangle outline draws four edges; filled rectangle scans pixels inside bounds
- Rounded corners are drawn via quarter-circle arcs
- Circle outline uses midpoint circle algorithm
- Text rendering iterates glyphs and scales bitmaps to a requested size

```mermaid
classDiagram
class Vec2i {
+int x
+int y
}
class ColorRGBA {
+uint32_t val
+color.r : 8
+color.g : 8
+color.b : 8
+color.a : 8
}
class Point2D {
+Vec2i pos
}
class Line2D {
+Vec2i pos1
+Vec2i pos2
}
class Rect2D {
+Vec2i pos
+Vec2i size
}
class BorderRadius {
+uint32_t top_left
+uint32_t top_right
+uint32_t bottom_left
+uint32_t bottom_right
}
class Glyph {
+uint32_t codepoint
+uint8_t width
+uint8_t height
+int8_t xoffset
+int8_t yoffset
+int8_t xadvance
+bitmap : uint8_t*
}
class Font {
+char* name
+uint8_t size
+uint32_t num_glyphs
+Glyph* glyphs
}
class Surface {
+void* surface
+uint32_t width
+uint32_t height
}
class DrawOps {
+draw_line(line,color)
+draw_point(point,color)
+draw_rect(rect,radius,color)
+fill_rect(rect,radius,color)
+draw_circle(center,radius,color)
+fill_circle(center,radius,color)
+draw_pixmap()
+draw_text(text,pos,font,size,color)
}
class Graphics2D {
+Surface surface
+DrawOps draw_op
+set_surface(width,height,surface) Surface*
}
Graphics2D --> Surface : "owns"
Graphics2D --> DrawOps : "exposes"
DrawOps --> ColorRGBA : "uses"
DrawOps --> Point2D : "uses"
DrawOps --> Line2D : "uses"
DrawOps --> Rect2D : "uses"
DrawOps --> BorderRadius : "uses"
DrawOps --> Font : "uses"
Font --> Glyph : "contains"
```

**Diagram sources**
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L7-L138)

**Section sources**
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L7-L138)
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L117-L404)

### Font Rendering Pipeline
Font rendering converts text into drawn pixels:
- Decode UTF-8 codepoints
- Find glyph by codepoint in font
- For each set bit in glyph bitmap, plot scaled blocks of pixels
- Advance cursor by glyph xadvance scaled by size

```mermaid
flowchart TD
Start(["Start draw_text"]) --> CheckArgs["Validate graphics, text, font"]
CheckArgs --> SizeCheck{"size == 0?"}
SizeCheck --> |Yes| SetSize["Set size = 1"]
SizeCheck --> |No| InitCursor["Initialize cursor_x, cursor_y"]
SetSize --> InitCursor
InitCursor --> Loop["While character not null"]
Loop --> Decode["Decode UTF-8 codepoint"]
Decode --> Lookup["Find glyph(codepoint)"]
Lookup --> Found{"Glyph found?"}
Found --> |Yes| Raster["Rasterize glyph at (cursor_x,cursor_y) with scale=size"]
Found --> |No| Fallback["Try '?' glyph"]
Fallback --> FFound{"Fallback found?"}
FFound --> |Yes| Raster
FFound --> |No| Skip["Advance by font.size * size"]
Raster --> Advance["cursor_x += xadvance * size"]
Skip --> Advance
Advance --> Loop
Loop --> End(["End"])
```

**Diagram sources**
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L335-L368)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c#L75-L114)

**Section sources**
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L51-L114)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c#L82-L204)

### Display Manager and Framebuffer Abstraction
The display manager provides a registry for display devices and operations:
- Registration of a display device
- Allocation of a framebuffer from the device
- Assignment of a framebuffer to the device

Framebuffers expose width, height, stride (in bytes), and base address. Device drivers implement allocation and configuration.

```mermaid
classDiagram
class DisplayMgr {
+display_device* device
+ops.register_device(device) display_device*
}
class DisplayDevice {
+alloc_framebuffer() framebuffer*
+set_framebuffer(fb) void
+char* name
}
class Framebuffer {
+uint32_t width
+uint32_t height
+uint32_t stride
+uint64_t address
}
DisplayMgr --> DisplayDevice : "registers"
DisplayDevice --> Framebuffer : "allocates"
```

**Diagram sources**
- [display_mgr.h](file://uapps/devmgr/include/peripherals/display/display_mgr.h#L11-L18)
- [display_mgr.c](file://uapps/devmgr/peripherals/display/display_mgr.c#L6-L31)
- [display_device.h](file://uapps/devmgr/include/peripherals/display/device/display_device.h#L8-L14)
- [framebuffer.h](file://uapps/devmgr/include/peripherals/display/framebuffer.h#L8-L14)

**Section sources**
- [display_mgr.h](file://uapps/devmgr/include/peripherals/display/display_mgr.h#L1-L20)
- [display_mgr.c](file://uapps/devmgr/peripherals/display/display_mgr.c#L1-L31)
- [display_device.h](file://uapps/devmgr/include/peripherals/display/device/display_device.h#L1-L16)
- [framebuffer.h](file://uapps/devmgr/include/peripherals/display/framebuffer.h#L1-L16)

### Raspberry Pi Framebuffer Driver
The Raspberry Pi driver uses mailbox property calls to allocate and configure a framebuffer:
- Sets pixel depth, pixel order, and virtual dimensions
- Allocates a framebuffer buffer and computes a second buffer address
- Reports width, height, and pitch

```mermaid
sequenceDiagram
participant Dev as "Display Device"
participant FB as "bcm2711_framebuffer"
participant MB as "Mailbox Property Calls"
Dev->>MB : "Set depth 32"
Dev->>MB : "Set pixel order RGB"
Dev->>MB : "Allocate framebuffer"
MB-->>Dev : "Return pitch, buffer address"
Dev->>FB : "Fill width/height/pitch/order"
Dev-->>Dev : "Compute buffer[1] = base + pitch*height"
```

**Diagram sources**
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c#L95-L144)
- [bcm2711_mailbox.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_mailbox.h#L84-L124)
- [bcm2711_fb.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.h#L7-L21)

**Section sources**
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c#L95-L144)
- [bcm2711_mailbox.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_mailbox.h#L84-L124)
- [bcm2711_fb.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.h#L1-L21)

### Virtual Machine Framebuffer Driver
On virtual platforms, framebuffers are exposed via firmware configuration:
- Allocate two buffers with width*height*4 bytes
- Fill stride as 4*width bytes
- Register framebuffer metadata and set firmware config

```mermaid
flowchart TD
A["fw_cfg_ramfb_alloc"] --> B["Compute index and address"]
B --> C["Fill cfg: width,height,stride,fourcc,address"]
C --> D["Fill framebuffer struct: width,height,stride,address"]
D --> E["Init list node"]
E --> F["Return framebuffer"]
```

**Diagram sources**
- [fw_cfg.c](file://uapps/devmgr/drivers/virt/fw_cfg.c#L90-L124)

**Section sources**
- [fw_cfg.c](file://uapps/devmgr/drivers/virt/fw_cfg.c#L90-L124)

## Dependency Analysis
- Graphics library depends on geometry and color types, and font glyph arrays.
- Display manager depends on display device interfaces and framebuffer structures.
- Device drivers depend on mailbox property calls (Raspberry Pi) or firmware configuration (virtual).

```mermaid
graph LR
GH["graphics_2d.h"] --> GC["graphics_2d.c"]
FH["font_8x8.c"] --> GC
GC --> DMH["display_mgr.h"]
GC --> DDH["display_device.h"]
DDH --> FBH["framebuffer.h"]
DDH --> RPIFB["bcm2711_fb.c"]
RPIFB --> MBH["bcm2711_mailbox.h"]
DDH --> VIRT["fw_cfg.c"]
```

**Diagram sources**
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L1-L404)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c#L1-L204)
- [display_mgr.h](file://uapps/devmgr/include/peripherals/display/display_mgr.h#L1-L20)
- [display_device.h](file://uapps/devmgr/include/peripherals/display/device/display_device.h#L1-L16)
- [framebuffer.h](file://uapps/devmgr/include/peripherals/display/framebuffer.h#L1-L16)
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c#L95-L144)
- [bcm2711_mailbox.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_mailbox.h#L66-L124)
- [fw_cfg.c](file://uapps/devmgr/drivers/virt/fw_cfg.c#L90-L124)

**Section sources**
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L1-L138)
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L1-L404)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c#L1-L204)
- [display_mgr.h](file://uapps/devmgr/include/peripherals/display/display_mgr.h#L1-L20)
- [display_device.h](file://uapps/devmgr/include/peripherals/display/device/display_device.h#L1-L16)
- [framebuffer.h](file://uapps/devmgr/include/peripherals/display/framebuffer.h#L1-L16)
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c#L95-L144)
- [bcm2711_mailbox.h](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_mailbox.h#L66-L124)
- [fw_cfg.c](file://uapps/devmgr/drivers/virt/fw_cfg.c#L90-L124)

## Performance Considerations
- Pixel writes: Direct array indexing per pixel; consider scanline batching for large fills.
- Filled rectangles: Nested loops; prefer early-exit checks and tight bounds.
- Antialiasing/clearing: Use memset for full-screen clears when possible.
- Scaling: Draw glyph blocks; reduce scaling factor or cache scaled bitmaps for repeated text.
- Stride alignment: Ensure stride matches width*4 for optimal CPU cache behavior.
- DMA/tearing: On real hardware, consider double-buffering and vsync to avoid tearing.
- Embedded constraints: Prefer fixed-point arithmetic sparingly; keep hot loops branch-predictable.

[No sources needed since this section provides general guidance]

## Troubleshooting Guide
Common issues and remedies:
- Null graphics context: Ensure initialization and surface setting succeeded before drawing.
- Out-of-bounds writes: Validate coordinates against surface width/height.
- Incorrect color order: Confirm pixel ordering matches device expectations (e.g., RGB vs BGR).
- Missing glyphs: Provide a fallback glyph ('?') or expand the font atlas.
- Driver allocation failures: Verify mailbox property calls succeed and buffer addresses are valid.

**Section sources**
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L4-L14)
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L371-L386)
- [bcm2711_fb.c](file://uapps/devmgr/drivers/rpi/rpi-fb/bcm2711_fb.c#L125-L135)

## Conclusion
TranquilOS provides a compact 2D graphics library with primitives, text rendering, and surface management, integrated with a display manager and device drivers. The design emphasizes simplicity and portability across platforms, while enabling efficient rendering on embedded displays through careful buffer management and driver coordination.

[No sources needed since this section summarizes without analyzing specific files]

## Appendices

### API Reference Summary
- Initialization: Initialize graphics context and set a surface backed by a framebuffer.
- Drawing:
  - Line: draw_line
  - Point: draw_point
  - Rectangle: draw_rect, fill_rect
  - Circle: draw_circle, fill_circle
  - Text: draw_text
  - Pixmap: draw_pixmap (placeholder)
- Surface: set_surface(width, height, buffer)
- Geometry helpers: ivec2, line2d, rect2d, border_radius
- Color helpers: color(r, g, b, a)
- Font: glyph metrics and bitmap arrays

**Section sources**
- [graphics_2d.h](file://ulibs/include/libgraphics/graphics_2d.h#L100-L138)
- [graphics_2d.c](file://ulibs/libgraphics/graphics_2d.c#L117-L404)
- [font_8x8.c](file://ulibs/libgraphics/font_8x8.c#L82-L204)