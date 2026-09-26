# System Architecture

This document outlines the architectural principles and structural topology of this system.

---

## 1. Universal Architecture Principles

These principles apply to all project categories (web, CLI, extensions, mobile, backend, native):

1. **Separation of Concerns**:
   Divide responsibilities cleanly into distinct layers or modules. Never mix presentation rendering, business logic, validation, and data persistence in a single file or component.
2. **Explicit Boundaries**:
   Define strict interfaces, types, schemas, or protocols between system boundaries. Internal implementation changes must not leak across public boundaries.
3. **Dependency Direction**:
   Dependencies must point inward toward the core domain logic. Domain rules must never depend on user interfaces or low-level transport mechanisms.
4. **Single Source of Truth**:
   Every piece of state, preference, or domain entity must have a clear, authoritative owner. No duplicate sources of truth or uncoordinated shadow states.
5. **Deterministic Error Handling**:
   Errors must be classified and handled at appropriate boundaries. Never swallow exceptions or allow unhandled crashes.
6. **Observable Behavior**:
   Important operations, state mutations, and failures must be auditable through structured logs or telemetry without leaking sensitive credentials.

---

## 2. Project-Type Architecture Topologies

Select and customize the topology that matches this project:

### A. Web / SaaS Application Topology
```text
[ Client Viewport / UI ]
        |
        v (Validation schemas, auth session)
[ Controller / Server Action / Route Handler ]
        |
        v (Domain business logic, state machines)
[ Domain Services ]
        |
        v (Parameterized queries, transactions)
[ Database / Storage Engine ]
```

### B. Browser Extension Topology
```text
[ Content Scripts (DOM Ingestion) ]  <--->  [ Extension Popup / UI ]
                     \                 /
                      \ (Message Port) /
                       v              v
            [ Ephemeral Background Service Worker ]
                       |
                       v
            [ Storage: chrome.storage.local / Remote API ]
```

### C. Developer Tool / CLI Topology
```text
[ CLI Input / Arguments Parsing (Commands) ]
        |
        v
[ Application Layer (Command Handlers & Workflows) ]
        |
        v
[ Core Domain Logic & Engine ]
        |
        v
[ System I/O / File System / Process Spawning ]
```

### D. Standalone Backend / API Service
```text
[ API Gateway / HTTP Server (Fastify / Express / Spring) ]
        | (Request validation, auth middleware)
        v
[ Controllers / Handlers ]
        | (Pure domain operations)
        v
[ Domain Use Cases / Services ]
        | (Data abstraction / Repository interfaces)
        v
[ Repositories / External Adapters ]
```

### E. Native Systems / C++ / Rust Topology
```text
[ Platform Entry Point / Driver ]
        |
        v
[ Core Engine / Processing Pipeline ]  (RAII, Memory Bounds, Result/Expected)
        |
        v
[ Platform Hardware / OS Abstractions (POSIX / Win32 / Syscalls) ]
```

---

## 3. Current Project Architecture

*(To be filled during project initialization for this specific repository)*

- **Selected Topology**:
- **Core Modules**:
- **Data Flow**:
- **State Ownership**:
- **External Dependencies & Boundaries**:
