export function formatDate(date: string | null, locale = 'fr'): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString(locale, { year: 'numeric', month: 'long' });
}

export function relativeTime(date: string, locale = 'fr'): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (mins < 1) return locale === 'fr' ? 'À l\'instant' : 'Just now';
  if (mins < 60) return locale === 'fr' ? `il y a ${mins} min` : `${mins}m ago`;
  if (hours < 24) return locale === 'fr' ? `il y a ${hours}h` : `${hours}h ago`;
  return locale === 'fr' ? `il y a ${days}j` : `${days}d ago`;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: unknown[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function parseTechnologies(tech: string | null): string[] {
  if (!tech) return [];
  try { return JSON.parse(tech); } catch { return tech.split(',').map(t => t.trim()).filter(Boolean); }
}

export function initials(name: string | null): string {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}
