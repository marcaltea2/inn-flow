export function formatString(category?: string) {
  if (!category) return "";

  return category
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}