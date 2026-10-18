/*
 * rbac.ts
 * Role-based access control and resource ownership assertions.
 * Enforces server-side authorization boundaries across roles and tenancy contexts.
 */

import { ForbiddenError, UnauthorizedError } from "../api/errors";
import { SessionUser } from "./session";

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

export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.has(permission) ?? false;
}

export function requirePermission(
  user: SessionUser | null | undefined,
  permission: Permission,
): SessionUser {
  if (!user) {
    throw new UnauthorizedError("Authentication required.");
  }
  if (!hasPermission(user.role, permission)) {
    throw new ForbiddenError(
      `Access denied. Role "${user.role}" lacks required permission "${permission}".`,
    );
  }
  return user;
}

export function assertOwnership(
  resourceOwnerId: string,
  user: SessionUser | null | undefined,
): void {
  if (!user) {
    throw new UnauthorizedError("Authentication required.");
  }
  // Administrators bypass individual resource ownership restrictions
  if (user.role === "admin") {
    return;
  }
  if (resourceOwnerId !== user.userId) {
    throw new ForbiddenError("You do not have permission to access or modify this resource.");
  }
}
