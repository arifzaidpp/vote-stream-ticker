/**
 * Simplified utility function to generate Prisma where clauses for search and filters
 * @param search - The search string to look for
 * @param searchableFields - Simple array of field names to search in
 * @param filter - Optional filter object with exact match conditions
 * @returns A Prisma-compatible where clause object
 */
export function generateWhereClause(
  search?: string,
  searchableFields: string[] = [],
  filter?: Record<string, any>,
): Record<string, any> {
  const where: Record<string, any> = {};

  // Add search conditions if search string is provided and searchable fields are defined
  if (search && searchableFields.length > 0) {
    where.OR = searchableFields.map((field) => {
      // Check if field name ends with "s" to assume it might be an array field
      if (field.endsWith('s') && field !== 'status') {
        return { [field]: { has: search } };
      }

      // For regular string fields - always use contains with insensitive mode
      return { [field]: { contains: search, mode: 'insensitive' } };
    });
  }

  // Add filter conditions for exact matches and handle date ranges
  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Special handling for date range filters
        if (key.endsWith('From')) {
          const actualField = key.replace('From', '');
          where[actualField] = {
            ...where[actualField],
            gte: value,
          };
        } else if (key.endsWith('To')) {
          const actualField = key.replace('To', '');
          where[actualField] = {
            ...where[actualField],
            lte: value,
          };
        } else {
          // Standard equals filter for non-date fields
          where[key] = { equals: value };
        }
      }
    });
  }

  return where;
}
