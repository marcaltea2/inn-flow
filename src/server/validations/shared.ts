import type { z } from "zod";

export function optionalString<T extends z.ZodString>(schema: T) {
  return schema
    .optional()
    .transform((val) => (val === "" ? undefined : val));
}