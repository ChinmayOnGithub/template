# Database Architecture and Operations (DATABASE.md)

This document provides architectural standards, connection lifecycle management, and operational procedures for PostgreSQL and Prisma ORM within this template.

---

## 1. Connection Lifecycle and Serverless Pooling

During Next.js hot module reloading in development, creating new database client instances on every file change will quickly exhaust the PostgreSQL connection pool.

### Singleton Pattern

The database client in `lib/db/client.ts` uses the global object to cache the client singleton across rebuilds:

```typescript
import { db } from "@/lib/db";

// Global singleton with connection safeguards
await db.$connect();
```

### Connection Pool Configuration

When deploying to serverless platforms (e.g., Vercel, AWS Lambda) or container environments:

- **Pooled URL (`DATABASE_URL`)**: Points to a connection pooler (e.g. PgBouncer, Supabase Pooler, Neon Pooler) using transaction mode.
- **Direct URL (`DIRECT_URL`)**: Connects directly to PostgreSQL without pooling, used exclusively by Prisma CLI for migrations.

---

## 2. Reusable Core Schemas

The Prisma schema (`prisma/schema.prisma`) defines the standard SaaS data foundation:

| Model                | Purpose                                    | Constraints and Indexes                            |
| :------------------- | :----------------------------------------- | :------------------------------------------------- |
| `User`               | User identity, password hash, role, status | Unique email, indexed status and deletedAt         |
| `Session`            | Active authentication sessions             | Unique sessionToken, indexed userId and expiresAt  |
| `Account`            | OAuth third-party account linkages         | Unique `[provider, providerAccountId]`             |
| `VerificationToken`  | Single-use email verification tokens       | Unique tokenHash, indexed identifier and expiresAt |
| `PasswordResetToken` | Secure single-use password recovery        | Unique tokenHash, indexed email and expiresAt      |
| `Organization`       | Multi-tenant workspaces                    | Unique slug                                        |
| `OrganizationMember` | Workspace membership and roles             | Unique `[organizationId, userId]`                  |
| `Subscription`       | Product billing status and limits          | Indexed userId and status                          |
| `AuditLog`           | Security and administrative mutation log   | Indexed userId, entity, and createdAt              |
| `WebhookEvent`       | Deduplicated incoming webhook events       | Unique `[provider, eventId]`                       |
| `IdempotencyRecord`  | API mutation idempotency lock              | Primary key on idempotency key, indexed expiresAt  |

---

## 3. Local Development Setup

To run a local PostgreSQL instance using Docker:

```bash
docker run --name local-postgres \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_dev \
  -p 5432:5432 \
  -d postgres:16-alpine
```

Set the database connection in `.env.local`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_dev?schema=public
```

---

## 4. Migrations and Schema Updates

### Creating and Applying Migrations (Development)

When updating `prisma/schema.prisma`:

```bash
# Generate a new migration and apply locally
bunx prisma migrate dev --name <migration_name>

# Regenerate Prisma Client types
bunx prisma generate
```

### Applying Migrations (Production CI/CD)

Never run `prisma migrate dev` in production. Always run:

```bash
bunx prisma migrate deploy
```

### Seed Data Execution

To seed baseline admin credentials and default tiers for development:

```bash
bun run db:seed
```

---

## 5. Backup, Restore, and Disaster Recovery

### Creating a Dump

```bash
pg_dump -h <host> -U <user> -d <dbname> -F c -b -v -f backup_$(date +%Y%m%d).dump
```

### Restoring from Backup

```bash
pg_restore -h <host> -U <user> -d <dbname> -v backup_<date>.dump
```
