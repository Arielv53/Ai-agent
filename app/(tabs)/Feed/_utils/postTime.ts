export function getPostAge(createdAt?: string | null, now = Date.now()): string | null {
  if (!createdAt) return null;
  // Treat older timezone-less server timestamps as UTC.
  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/i.test(createdAt)
    ? createdAt : `${createdAt}Z`;
  const posted = Date.parse(timestamp);
  if (!Number.isFinite(posted)) return null;
  const minutes = Math.max(0, Math.floor((now - posted) / 60_000));
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}hr`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mon`;
}
