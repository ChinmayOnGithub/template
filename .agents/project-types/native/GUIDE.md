# Native Systems Project Standards

## 1. Overview
Applies to system utilities, high-performance engines, desktop runtimes, and embedded tools.

## 2. Core Architectural Constraints
- Memory Safety: Ensure deterministic memory management. Prevent buffer overflows, use-after-free, and dangling pointers.
- Error Handling: Use explicit return types (`Result`, `std::expected`) rather than uncaught exceptions or panics.
- Resource RAII: Manage file handles, sockets, and memory allocations via deterministic destructors and RAII wrappers.

## 3. Sub-Platform References
- See `cpp/GUIDE.md` for modern C++20/C++23 standards and CMake rules.
- See `rust/GUIDE.md` for Cargo workspaces, clippy rules, and borrow checker idioms.
