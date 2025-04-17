export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with dashes
    .replace(/[^\w-]+/g, '') // Remove non-word characters (except dashes)
    .replace(/--+/g, '-') // Replace multiple dashes with a single dash
    .replace(/^-+|-+$/g, ''); // Trim dashes from start and end
}
