# Spring Boot Backend Guidelines

- Target Java 21 LTS with modern record classes and pattern matching.
- Rely on constructor injection instead of field injection (`@Autowired`).
- Enforce transactional boundaries explicitly with `@Transactional(readOnly = true)` on read operations.
- Map domain exceptions to standard RFC 7807 Problem Details responses.
