# Feature Planning Prompt

Use this prompt before implementing a non-trivial feature or modifying existing core flows.

## Task
Formulate an explicit, modular implementation plan with risk and dependency analysis.

## Required Output
1. **Scope and User Value**:
   - What user goal does this feature satisfy?
   - What are the non-goals for this slice?
2. **Impacted Components and Files**:
   - List files to create, modify, or deprecate.
   - What interfaces or data models change?
3. **Architecture and Data Flow**:
   - Identify state ownership and mutation pipeline.
   - Are any invariants affected?
4. **Security and Performance Review**:
   - Authentication/authorization requirements.
   - Query efficiency and render cost considerations.
5. **Step-by-Step Execution Plan**:
   - Broken down into small, verifiable increments.
   - Specific tests to write before or alongside implementation.
