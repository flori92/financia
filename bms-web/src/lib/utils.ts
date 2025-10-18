// Fonction utilitaire simple pour combiner les classes CSS
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
