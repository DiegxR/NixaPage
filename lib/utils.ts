/**
 * Combina clases CSS (estilo clsx/tailwind-merge simplificado).
 */
export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
