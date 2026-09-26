# Node.js Backend Guidelines

- Prefer Node 20+ LTS or Bun.
- Use Fastify or Express with strict TypeScript schemas (TypeBox, Zod).
- Avoid unhandled promise rejections; wrap asynchronous handlers in centralized error middlewares.
- Parameterize all SQL/NoSQL queries to eliminate injection vulnerabilities.
