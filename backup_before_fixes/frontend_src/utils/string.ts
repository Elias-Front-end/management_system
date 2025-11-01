/**
 * Safely checks if `source` includes `term`, ignoring case.
 * Prevents runtime errors when source or term are undefined/null.
 */
export function includesIgnoreCase(source: unknown, term: string): boolean {
  const src = typeof source === 'string'
    ? source
    : source == null
      ? ''
      : String(source);
  const t = typeof term === 'string'
    ? term
    : term == null
      ? ''
      : String(term);
  return src.toLowerCase().includes(t.toLowerCase());
}

/**
 * Converts any value to a lowercase string safely.
 */
export function toLowerSafe(value: unknown): string {
  if (typeof value === 'string') return value.toLowerCase();
  if (value == null) return '';
  try {
    return String(value).toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Validates if a string is a valid UUID (v4 format).
 */
export function isValidUUID(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(value);
}

/**
 * Validates if an ID is valid (either a positive number or a valid UUID).
 */
export function isValidId(value: unknown): boolean {
  // Check if it's a valid UUID
  if (isValidUUID(value)) return true;
  
  // Check if it's a valid positive number
  if (typeof value === 'number') return value > 0;
  if (typeof value === 'string') {
    const num = Number(value);
    return !isNaN(num) && num > 0;
  }
  
  return false;
}