/*
 * rbac.ts
 * Role-based access control and resource ownership assertions.
 * Enforces server-side authorization boundaries across roles and tenancy contexts.
 */

import { ForbiddenError, UnauthorizedError } from "../api/errors";

export type Role = "admin" | "member" | "guest";

export type Permission =
  | "projects:read"
  | "projects:create"
  | "projects:update"
  | "projects:delete"
  | "billing:read"
  | "billing:manage"
  | "team:read"
  | "team:invite"
  | "team:remove"
  | "settings:manage";

const ROLE_PERMISSIONS: Record<Role, Set<Permission>> = {
  admin: new Set([
    "projects:read",
    "projects:create",
    "projects:update",
    "projects:delete",
    "billing:read",
    "billing:manage",
    "team:read",
    "team:invite",
    "team:remove",
    "settings:manage",
  ]),
  member: new Set([
    "projects:read",
    "projects:create",
    "projects:update",
    "billing:read",
    "team:read",
  ]),
  guest: new Set(["projects:read"]),
};

export interface UserAuthContext {
  id?: string;
  userId?: string;
  role?: string;
  email?: string;
  [key: string]: unknown;
}

export function hasPermission(role: Role | string, permission: Permission): boolean {
  const normalizedRole = (role as Role) in ROLE_PERMISSIONS ? (role as Role) : "guest";
  return ROLE_PERMISSIONS[normalizedRole]?.has(permission) ?? false;
}

export function requirePermission<T extends UserAuthContext>(
  user: T | null | undefined,
  permission: Permission,
): T {
  if (!user) {
    throw new UnauthorizedError("Authentication required.");
  }
  const role = (user.role as Role) || "guest";
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(
      `Access denied. Role "${role}" lacks required permission "${permission}".`,
    );
  }
  return user;
}

export function assertOwnership(
  resourceOwnerId: string,
  user: UserAuthContext | null | undefined,
): void {
  if (!user) {
    throw new UnauthorizedError("Authentication required.");
  }
  // Administrators bypass individual resource ownership restrictions
  if (user.role === "admin") {
    return;
  }
  const userId = user.userId || user.id;
  if (!userId || resourceOwnerId !== userId) {
    throw new ForbiddenError("You do not have permission to access or modify this resource.");
  }
}
