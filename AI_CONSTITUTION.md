# Universal AI Constitution

**Version**: 2.0
**Scope**: All AI agents and engineers working on this codebase. These 20 non-negotiable laws govern every planning decision, code mutation, review, and verification.

---

### LAW 1  -  UNDERSTAND BEFORE IMPLEMENTING
Never begin writing code without first understanding the requirement, existing codebase patterns, and edge cases. Ask clarifying questions when user intent or scope is ambiguous.

### LAW 2  -  REQUIREMENTS COME BEFORE LARGE IMPLEMENTATION
Substantial implementation must be preceded by an explicit product brief, scope boundary, and architecture review. No large speculative features without alignment.

### LAW 3  -  EXISTING PROJECT DECISIONS ARE THE SOURCE OF TRUTH
Existing architectural decisions, schemas, and established patterns take precedence over generic AI habits. Never overwrite project-level conventions with third-party defaults.

### LAW 4  -  KEEP RESPONSIBILITIES SEPARATED
Every layer must maintain strict separation of concerns:
- Presentation renders UI and captures user input.
- Controllers/Actions validate schemas and authorize sessions.
- Domain services execute pure business rules.
- Data layer handles persistence.
Never place business logic in UI components or controllers.

### LAW 5  -  PREFER SIMPLE SOLUTIONS
Implement the simplest robust design that solves the immediate problem. Avoid premature abstractions, unnecessary design patterns, and speculative flexibility.

### LAW 6  -  DO NOT DUPLICATE LOGIC
Extract shared logic into single, canonical functions or services. Never copy-paste business logic across endpoints, components, or modules.

### LAW 7  -  DO NOT ADD DEPENDENCIES WITHOUT JUSTIFICATION
Never install an external package if the standard library, platform APIs, or existing project dependencies can reasonably solve the problem. Every new dependency requires evaluating maintenance, bundle weight, and security.

### LAW 8  -  CONSIDER SECURITY DURING DESIGN
Security is not a post-launch cleanup phase. Enforce tenant isolation, input validation, output sanitization, least privilege, and secret protection at the moment of design.

### LAW 9  -  CONSIDER PERFORMANCE DURING DESIGN
Identify potential bottlenecks early: query count, network payloads, bundle footprint, rendering frequency, and memory footprint. Eliminate N+1 queries and expensive loops before shipping.

### LAW 10  -  TEST BEHAVIOR
Write tests that assert user-facing contracts and business invariants. Test state outcomes, error responses, and edge conditions rather than internal implementation details.

### LAW 11  -  VERIFY BEFORE CLAIMING COMPLETION
A task is never complete because code was generated. Verification requires concrete proof: passing automated tests, clean typecheck, successful linting, and visual confirmation for UI.

### LAW 12  -  KEEP DOCUMENTATION CONSISTENT
When modifying public interfaces, schemas, workflows, or project behavior, update the corresponding documentation files immediately to prevent documentation drift.

### LAW 13  -  NEVER HIDE FAILURES
Never swallow exceptions silently. Log failures with actionable context, return typed error results, and roll back optimistic updates when operations fail.

### LAW 14  -  NEVER INVENT FACTS ABOUT THE PROJECT
State technical facts, test results, and dependencies truthfully. If an external service cannot be reached or a test was not executed, report that explicitly instead of fabricating success.

### LAW 15  -  DO NOT USE EMOJIS IN TECHNICAL OUTPUT
Avoid emojis in commit messages, code comments, file headers, and technical documentation. Maintain a clean, professional standard.

### LAW 16  -  DO NOT USE EM DASHES
Do not use em dashes anywhere in technical documentation, code comments, or agent responses. Use standard hyphens, colons, or parentheses.

### LAW 17  -  FOLLOW THE FILE HEADER RULE
For every human-maintained source file where comments are valid, start the file with the standard header format:
```text
/*
 * filename.extension
 * What this file does.
 * Why this file matters.
 */
```
Explain what the file does and why it exists. Keep it short, factual, and free of emojis and em dashes.

### LAW 18  -  KEEP COMMENTS SHORT AND USEFUL
Write comments only to explain non-obvious decisions, critical constraints, or external workarounds. Never write comments that merely translate obvious code into English.

### LAW 19  -  USE APPROPRIATE ABSTRACTIONS
Apply object-oriented or functional patterns suited to the runtime and language. Do not force classes onto functional frameworks, and do not create empty interfaces for one-line helpers.

### LAW 20  -  DO NOT FORCE A TECHNOLOGY-SPECIFIC PATTERN ONTO ANOTHER TECHNOLOGY
Respect platform-native idioms. What is standard in Next.js does not belong in a C++ utility, and what is idiomatic in Rust does not belong in a browser extension.
