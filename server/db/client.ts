/*
 * client.ts
 * Real Prisma database client singleton and connection management.
 * Provides typed access, genuine transactions, and prevents pool exhaustion during HMR.
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaInstance: PrismaClient | undefined;
};

export class DatabaseNotConfiguredError extends Error {
  constructor(
    message = "DATABASE_URL is not configured. Set DATABASE_URL in your .env.local file to use database features.",
  ) {
    super(message);
    this.name = "DatabaseNotConfiguredError";
  }
}

export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  return Boolean(url && url.trim().length > 0);
}

export function createDatabaseClient(): PrismaClient {
  const databaseUrl = process.env.DATABASE_URL;

  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
  });

  return client;
}

export const db: PrismaClient = globalForPrisma.prismaInstance ?? createDatabaseClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaInstance = db;
}

export async function withTransaction<T>(
  action: (tx: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]) => Promise<T>,
): Promise<T> {
  if (!isDatabaseConfigured()) {
    throw new DatabaseNotConfiguredError();
  }
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
