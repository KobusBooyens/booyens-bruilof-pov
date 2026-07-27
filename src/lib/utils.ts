/** Trim + collapse whitespace so "  Jan   Botha " becomes "Jan Botha". */
export function cleanName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, 80);
}

/** Class name joiner. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
