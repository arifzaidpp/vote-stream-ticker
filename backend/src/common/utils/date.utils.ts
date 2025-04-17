/**
 * Transforms date strings in an object to Date objects recursively , useful for json data 
 * @param data 
 * @returns 
 */
export function transformDates<T>(data: T): T {
  if (Array.isArray(data)) {
    return data.map(transformDates) as T;
  } else if (typeof data === 'object' && data !== null) {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (typeof value === 'string' && Date.parse(value)) {
          return [key, new Date(value)]; // Convert to Date
        } else if (Array.isArray(value) || typeof value === 'object') {
          return [key, transformDates(value)]; // Recursively transform
        }
        return [key, value];
      }),
    ) as T;
  }
  return data;
}