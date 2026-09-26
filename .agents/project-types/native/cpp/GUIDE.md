# C++ Guidelines

- Use C++20 or C++23 standard.
- Use CMake with target-based configurations (`target_include_directories`, `target_link_libraries`).
- Avoid raw pointers for ownership; use `std::unique_ptr` and `std::shared_ptr`.
- Enable compiler warnings: `-Wall -Wextra -Wpedantic` and treat warnings as errors.
