export function formatRole(role?: string) {
  if (!role) return "";

  return role
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}