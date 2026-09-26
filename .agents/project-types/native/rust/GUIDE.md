# Rust Guidelines

- Use current stable Rust 2024 edition.
- Enforce strict clippy lints (`#![deny(clippy::all)]`).
- Avoid `unsafe` blocks unless interfacing with FFI; document exact safety invariants.
- Use `thiserror` for library domain errors and `anyhow` for top-level application binary error handling.
