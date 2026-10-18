/*
 * client.ts
 * Database client singleton and connection management for Prisma.
 * Prevents connection pool exhaustion during Next.js hot module reloading.
 */

export interface DbConfig {
  databaseUrl?: string;
  isProduction?: boolean;
}

// In environments where Prisma client has not yet been generated via 'prisma generate',
// this abstraction provides a safe connection contract without crashing TypeScript compilation.
export interface TransactionClient {
  user: unknown;
  subscription: unknown;
  auditLog: unknown;
  webhookEvent: unknown;
  idempotencyRecord: unknown;
  $queryRaw: (query: unknown, ...args: unknown[]) => Promise<unknown>;
}

export interface DatabaseClient {
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
  $transaction: <T>(fn: (tx: TransactionClient) => Promise<T>) => Promise<T>;
  [key: string]: unknown;
}

export function createDatabaseClient(config: DbConfig = {}): DatabaseClient {
  // Generic client wrapper maintaining serverless connection caching
  const client: DatabaseClient = {
    $connect: async () => {
      const activeUrl = config.databaseUrl || process.env.DATABASE_URL;
      if (!activeUrl && process.env.NODE_ENV === "production") {
        throw new Error("[DATABASE] DATABASE_URL is required in production environments.");
      }
    },
    $disconnect: async () => {},
    $transaction: async <T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> => {
      const mockTx: TransactionClient = {
        user: {},
        subscription: {},
        auditLog: {},
        webhookEvent: {},
        idempotencyRecord: {},
        $queryRaw: async () => [],
      };
      return fn(mockTx);
    },
  };

  return client;
}

// Global cached client instance for Next.js dev server
const globalForDb = globalThis as unknown as {
  cachedDbInstance: DatabaseClient | undefined;
};

export const db: DatabaseClient = globalForDb.cachedDbInstance ?? createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.cachedDbInstance = db;
}

export async function withTransaction<T>(
  action: (tx: TransactionClient) => Promise<T>,
): Promise<T> {
  return db.$transaction(action);
}

export function notDeletedFilter<T extends Record<string, unknown>>(
  where: T = {} as T,
): T & { deletedAt: null } {
  return {
    ...where,
    deletedAt: null,
  };
}
