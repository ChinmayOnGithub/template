# Performance Standards and Budgets (PERFORMANCE.md)

This document establishes the methodology for setting, measuring, and enforcing performance budgets tailored to the specific requirements of this project.

---

## 1. The Performance Budget Methodology

Performance constraints must be established based on project purpose and user expectations, rather than applying arbitrary universal numbers:

1. **Identify Critical User Journeys**:
   What actions do users perform most frequently? (e.g. Page load, search filtering, document saving, background sync, CLI startup).
2. **Define User-Visible Metrics**:
   Determine what metric reflects perceived speed for those journeys:
   - Web: Time to Interactive (TTI), First Contentful Paint (FCP), Cumulative Layout Shift (CLS), Interaction to Next Paint (INP).
   - API / Backend: p95 and p99 response latency, throughput (requests/sec).
   - CLI / Native: Cold startup time, memory footprint (RSS), CPU utilization.
3. **Establish Concrete Budgets**:
   Define acceptable thresholds for each metric and document the measurement tool.
4. **Measure Before Optimizing**:
   Never implement speculative optimizations without profiling data confirming a real bottleneck.

---

## 2. Project Performance Budget Table

*(To be customized during project initialization based on project requirements)*

| Dimension | Metric | Budget Target | Measurement Tool / Method |
| :--- | :--- | :--- | :--- |
| **Initial Load** | FCP / Cold Start | Project defined (e.g. < 1.5s web, < 50ms CLI) | Lighthouse / `time` command |
| **Interaction** | Latency on primary action | Project defined (e.g. < 100ms optimistic update) | Chrome DevTools Performance panel |
| **Bundle Size** | Total uncompressed / gzip JS | Project defined (e.g. < 250KB gzipped) | Next.js bundle analyzer / esbuild |
| **API Latency** | p95 Response Time | Project defined (e.g. < 150ms) | Autocannon / k6 / Datadog |
| **Database** | Query execution time | Project defined (e.g. < 20ms on indexed filters) | Postgres `EXPLAIN ANALYZE` |

---

## 3. Universal Anti-Bottleneck Guidelines

1. **Avoid N+1 Database Queries**:
   Always batch or join relational queries instead of querying inside iteration loops.
2. **Index Access Patterns**:
   Add database indexes on all columns used in `WHERE`, `JOIN`, `ORDER BY`, or foreign key constraints.
3. **Prevent Unnecessary UI Re-renders**:
   Memoize expensive calculations and avoid passing newly constructed object literals into optimized child components.
4. **Pagination and Virtualization**:
   Paginate or virtualize any list or table that can grow beyond 100 items. Never load unbounded collections into memory.
5. **Debounce User Input**:
   Debounce rapid inputs (search keystrokes, window resizing, scroll listeners) to prevent thrashing compute and network channels.
