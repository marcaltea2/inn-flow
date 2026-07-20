import { TRPCError } from "@trpc/server";
import type { Role } from "@prisma/client";
import { permissions, type Resource, type Action } from "~/lib/premissions";
import { protectedProcedure } from "./trpc";

/**
 * Checks a role against the permissions table.
 * ASP.NET analogy: this is your IAuthorizationHandler.HandleRequirementAsync —
 * the actual policy evaluation logic, decoupled from where it's invoked.
 */
export function hasPermission<R extends Resource>(
  role: Role,
  resource: R,
  action: Action<R>,
): boolean {
  const allowedRoles = permissions[resource][action] as readonly Role[];
  return allowedRoles.includes(role);
}

/**
 * Procedure factory driven entirely by the permissions table.
 * ASP.NET analogy: [Authorize(Policy = "staff.manage")] — except resource/action
 * pairs are checked at compile time instead of being loosely-typed policy strings,
 * so a typo like permissionProcedure("staf", "manage") fails to build rather than
 * silently falling through to "policy not found" at runtime.
 */
export function permissionProcedure<R extends Resource>(resource: R, action: Action<R>) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!hasPermission(ctx.session.user.role, resource, action)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You don't have permission to perform this action.`,
      });
    }
    return next({ ctx });
  });
}